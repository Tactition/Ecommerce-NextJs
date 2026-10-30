"use server";

import pool from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
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
       FROM users u
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
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "A user with this email address already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
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
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!currentRows || currentRows.length === 0) {
      return { success: false, error: "User not found." };
    }

    const currentRole = currentRows[0].role;

    // 2. Prevent removing the last admin
    if (currentRole === "admin" && role !== "admin") {
      const [adminCountRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
      );
      const adminCount = Number(adminCountRows[0]?.count || 0);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot change role: The system must have at least one active Administrator.",
        };
      }
    }

    // 3. Check duplicate email with another user
    const [emailCheck] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      [cleanEmail, id]
    );

    if (emailCheck && emailCheck.length > 0) {
      return {
        success: false,
        error: "This email address is already in use by another user.",
      };
    }

    // 4. Update with or without new password
    if (password && password.trim().length >= 6) {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      await pool.execute<ResultSetHeader>(
        "UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?",
        [name.trim(), cleanEmail, passwordHash, role, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
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
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [targetUserId]
    );

    if (!targetRows || targetRows.length === 0) {
      return { success: false, error: "User not found." };
    }

    const targetUser = targetRows[0];

    // If target is an admin, check that another admin exists
    if (targetUser.role === "admin") {
      const [adminCountRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
      );
      const adminCount = Number(adminCountRows[0]?.count || 0);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot delete user: The system must retain at least one Administrator account.",
        };
      }
    }

    await pool.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [targetUserId]);

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user.";
    return { success: false, error: message };
  }
}
