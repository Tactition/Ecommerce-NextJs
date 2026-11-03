"use server";

import pool from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { requireAuth } from "@/lib/auth";
import { createAdminSession, AdminRole } from "@/lib/auth/admin";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations";
import { User } from "@/types";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Fetches all users from the MySQL users table.
 * Restricted to administrators only.
 */
export async function getAvailableRoles(): Promise<{ slug: string; name: string }[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT slug, name FROM roles ORDER BY is_system DESC, name ASC"
    );
    return rows.map((r) => ({ slug: String(r.slug), name: String(r.name) }));
  } catch (error) {
    console.error("Error fetching available roles:", error);
    return [
      { slug: "admin", name: "Super Administrator" },
      { slug: "editor", name: "Content Editor" },
    ];
  }
}

/**
 * Fetches all users from the MySQL users table.
 * Requires users:view permission.
 */
export async function getAllUsers(): Promise<User[]> {
  await requirePermission("users", "view");

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, r.name as role_name
       FROM admin_users u
       LEFT JOIN roles r ON r.slug = u.role
       ORDER BY u.id ASC`
    );

    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      role: String(r.role),
      role_name: r.role_name ? String(r.role_name) : String(r.role).toUpperCase(),
      created_at: String(r.created_at || ""),
    }));
  } catch (error) {
    console.error("Error fetching users list:", error);
    return [];
  }
}

/**
 * Creates a new user in the database with role and hashed password.
 * Requires users:create permission.
 */
export async function createUserAction(formData: FormData) {
  await requirePermission("users", "create");


  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "editor",
  };

  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed",
    };
  }

  const { name, email, password, role } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Check if email already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "A staff account with this email address already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), cleanEmail, passwordHash, role]
    );

    revalidatePath("/dashboard/users");
    return {
      success: true,
      userId: result.insertId,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing user's name, email, role, and optionally password.
 * Restricted to administrators only.
 */
export async function updateUserAction(formData: FormData) {
  const adminSession = await requirePermission("users", "edit");

  const raw = {
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "editor",
  };

  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed",
    };
  }

  const { id, name, email, password, role } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Check if user exists
    const [currentRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, role FROM admin_users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!currentRows || currentRows.length === 0) {
      return { success: false, error: "Staff account not found." };
    }

    const currentRole = currentRows[0].role;

    // 2. Prevent removing the last admin
    if (currentRole === "superadmin" && role !== "superadmin") {
      const [adminCountRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM admin_users WHERE role = 'superadmin'"
      );
      const adminCount = Number(adminCountRows[0]?.count || 0);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot change role: The system must have at least one active Super Administrator.",
        };
      }
    }

    // 3. Check duplicate email with another user
    const [emailCheck] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1",
      [cleanEmail, id]
    );

    if (emailCheck && emailCheck.length > 0) {
      return {
        success: false,
        error: "This email address is already in use by another staff account.",
      };
    }

    // 4. Update with or without new password
    if (password && password.trim().length >= 6) {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      await pool.execute<ResultSetHeader>(
        "UPDATE admin_users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?",
        [name.trim(), cleanEmail, passwordHash, role, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        "UPDATE admin_users SET name = ?, email = ?, role = ? WHERE id = ?",
        [name.trim(), cleanEmail, role, id]
      );
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user.";
    return { success: false, error: message };
  }
}

/**
 * Deletes a user by ID.
 * Requires users:delete permission.
 * Prevents self-deletion and deleting the last admin.
 */
export async function deleteUserAction(targetUserId: number) {
  const currentSession = await requirePermission("users", "delete");


  if (currentSession.userId === targetUserId) {
    return {
      success: false,
      error: "You cannot delete your own active account while signed in.",
    };
  }

  try {
    const [targetRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, role FROM admin_users WHERE id = ? LIMIT 1",
      [targetUserId]
    );

    if (!targetRows || targetRows.length === 0) {
      return { success: false, error: "Staff member not found." };
    }

    const targetUser = targetRows[0];

    // If target is superadmin, check that another admin exists
    if (targetUser.role === "superadmin") {
      const [adminCountRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM admin_users WHERE role = 'superadmin'"
      );
      const adminCount = Number(adminCountRows[0]?.count || 0);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot delete user: The system must retain at least one Super Administrator account.",
        };
      }
    }

    await pool.execute<ResultSetHeader>("DELETE FROM admin_users WHERE id = ?", [targetUserId]);

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user.";
    return { success: false, error: message };
  }
}

/**
 * Allows the currently authenticated administrator to update their own
 * display name, admin email address, and optionally their console access password.
 */
export async function updateAdminCredentialsAction(formData: FormData) {
  const session = await requireAuth();

  const isStaff =
    session.role === "admin" ||
    session.role === "editor" ||
    session.role === "manager";

  if (!isStaff) {
    return {
      success: false,
      error: "Only staff or administrative accounts can update admin console credentials.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || name.length < 2) {
    return { success: false, error: "Full name must be at least 2 characters long." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    // 1. Check if email is already taken by another account
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1",
      [email, session.userId]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "This email address is already in use by another staff account.",
      };
    }

    // 2. If password change is requested
    if (newPassword || currentPassword) {
      if (!currentPassword) {
        return {
          success: false,
          error: "Current password is required to authorize a password change.",
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: "New password must be at least 6 characters long.",
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: "New password and password confirmation do not match.",
        };
      }

      // Verify current password against database
      const [userRows] = await pool.execute<RowDataPacket[]>(
        "SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1",
        [session.userId]
      );

      if (!userRows || userRows.length === 0) {
        return { success: false, error: "Staff account not found." };
      }

      const isCurrentValid = await bcrypt.compare(
        currentPassword,
        userRows[0].password_hash
      );

      if (!isCurrentValid) {
        return {
          success: false,
          error: "The current password you entered is incorrect.",
        };
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.execute<ResultSetHeader>(
        "UPDATE admin_users SET name = ?, email = ?, password_hash = ? WHERE id = ?",
        [name, email, newHash, session.userId]
      );
    } else {
      // Just update name and email
      await pool.execute<ResultSetHeader>(
        "UPDATE admin_users SET name = ?, email = ? WHERE id = ?",
        [name, email, session.userId]
      );
    }

    // 3. Refresh session cookie with updated name/email
    try {
      await createAdminSession({
        id: session.userId,
        email,
        name,
        role: session.role as AdminRole,
        permissions: session.permissions,
      });
    } catch (cookieErr) {
      console.warn("Could not rewrite cookie in server action:", cookieErr);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "Admin credentials successfully updated! Your session has been refreshed.",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update admin account.";
    return { success: false, error: message };
  }
}
