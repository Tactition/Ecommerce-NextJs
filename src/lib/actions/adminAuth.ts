"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RowDataPacket } from "mysql2";
import {
  createAdminSession,
  destroyAdminSession,
  getAdminSession,
  AdminRole,
} from "@/lib/auth/admin";

const AdminLoginSchema = z.object({
  email: z.string().email("Valid administrator email required."),
  password: z.string().min(1, "Password is required."),
});

export async function loginAdminAction(prevState: unknown, formData: FormData) {
  try {
    const raw = {
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
    };

    const parsed = AdminLoginSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid input data.",
      };
    }

    const { email, password } = parsed.data;

    // Check account in isolated admin_users table
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, password_hash, role, permissions, is_active, failed_login_attempts, locked_until
       FROM admin_users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        error: "Invalid administrator credentials.",
      };
    }

    const admin = rows[0];

    // Check account active state
    if (admin.is_active === 0) {
      return {
        success: false,
        error: "Staff account suspended. Please contact the administrator.",
      };
    }

    // Check lockout (stricter for admins: 3 failed attempts = 15 min lock)
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(admin.locked_until).getTime() - Date.now()) / (1000 * 60)
      );
      return {
        success: false,
        error: `Security Lockout: Too many failed administrative login attempts. Please wait ${waitMinutes} minutes.`,
      };
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      const attempts = (admin.failed_login_attempts || 0) + 1;
      let lockSql = `UPDATE admin_users SET failed_login_attempts = ? WHERE id = ?`;
      let lockParams: any[] = [attempts, admin.id];

      if (attempts >= 3) {
        lockSql = `UPDATE admin_users SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`;
      }
      await pool.execute(lockSql, lockParams);

      return {
        success: false,
        error: "Invalid administrator credentials.",
      };
    }

    // Reset failed attempts & update last login
    await pool.execute(
      `UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?`,
      [admin.id]
    );

    let permissions: string[] = [];
    if (admin.permissions) {
      try {
        permissions = typeof admin.permissions === "string"
          ? JSON.parse(admin.permissions)
          : admin.permissions;
      } catch {
        permissions = [];
      }
    }

    // Create isolated admin_session cookie (2h expiry, sameSite=strict)
    await createAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
      permissions,
    });

    // Sanitize redirect target (strictly keep inside admin console)
    const rawRedirect = formData.get("redirectTo");
    let safeRedirect = "/dashboard";

    if (
      typeof rawRedirect === "string" &&
      (rawRedirect.startsWith("/admin") || rawRedirect.startsWith("/dashboard")) &&
      !rawRedirect.startsWith("//")
    ) {
      safeRedirect = rawRedirect;
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return {
      success: false,
      error: "Authentication failed. Access denied.",
    };
  }
}

export async function logoutAdminAction(): Promise<void> {
  await destroyAdminSession();
}

