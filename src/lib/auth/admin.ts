import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import {
  ADMIN_COOKIE,
  ADMIN_AUDIENCE,
  AdminRole,
  AdminSessionPayload,
  signAdminToken,
  verifyAdminToken,
} from "./tokens/adminToken";

export { ADMIN_COOKIE, ADMIN_AUDIENCE, signAdminToken, verifyAdminToken };
export type { AdminRole, AdminSessionPayload };

const MAX_AGE = 60 * 60 * 2; // Strict 2 hours session expiry

/**
 * Creates and sets the admin_session HTTP-only cookie.
 */
export async function createAdminSession(admin: {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  permissions?: string[];
}): Promise<string> {
  const token = await signAdminToken({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Strict CSRF protection for internal admin panel
    path: "/",
    maxAge: MAX_AGE,
  });

  return token;
}

/**
 * Retrieves and validates the current admin session from request cookies.
 * React cache() deduplicates reads during a single render pass.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyAdminToken(token);
    if (!payload || !payload.adminId) return null;

    // Database verification: verify admin account is active and fetch fresh permissions
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, role, permissions, is_active FROM admin_users WHERE id = ? LIMIT 1`,
      [payload.adminId]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return null;
    }

    let permissions: string[] = [];
    if (rows[0].permissions) {
      try {
        permissions = typeof rows[0].permissions === "string"
          ? JSON.parse(rows[0].permissions)
          : rows[0].permissions;
      } catch {
        permissions = [];
      }
    }

    return {
      adminId: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      role: rows[0].role as AdminRole,
      permissions,
      aud: ADMIN_AUDIENCE,
    };
  } catch {
    return null;
  }
});

/**
 * Destroys ONLY the admin_session cookie without touching customer or dealer cookies.
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

/**
 * Enforces authenticated admin session. Redirects to /admin/login if unauthenticated.
 */
export async function requireAdmin(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?error=admin_required");
  }
  return session;
}

/**
 * Enforces admin session and checks specific module permission.
 */
export async function requireAdminPermission(permission: string): Promise<AdminSessionPayload> {
  const session = await requireAdmin();
  if (session.role === "superadmin") return session;

  const hasPerm =
    session.permissions.includes("*") ||
    session.permissions.includes(permission) ||
    session.permissions.includes(permission.split(":")[0] + ":*");

  if (!hasPerm) {
    redirect("/admin?error=forbidden_permission");
  }

  return session;
}
