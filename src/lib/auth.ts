import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  COOKIE_NAME,
  SessionPayload,
  signSessionToken,
  verifySessionToken,
} from "@/lib/token";

export type { SessionPayload };
export { COOKIE_NAME };

/**
 * Creates and sets an authenticated session cookie.
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await signSessionToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/**
 * Retrieves and validates the current session from request cookies.
 * Deduplicated per-render using React cache().
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    // Verify current role directly from database to ensure session is never stale
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [payload.userId]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const currentDbRole = rows[0].role || "customer";

    // If role in database differs from JWT payload, update payload and refresh cookie
    if (payload.role !== currentDbRole) {
      payload.role = currentDbRole;
      payload.name = rows[0].name;
      payload.email = rows[0].email;

      try {
        const freshToken = await signSessionToken(payload);
        cookieStore.set(COOKIE_NAME, freshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      } catch {
        // Ignore cookie write errors if headers already sent
      }
    }

    return payload;
  } catch {
    return null;
  }
});

/**
 * Destroys the current user session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Enforces that a valid authenticated session exists.
 * Throws an Error if unauthenticated.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }
  return session;
}

/**
 * Enforces Role-Based Access Control (RBAC).
 * Throws an Error if the authenticated user does not have one of the allowed roles.
 */
export async function requireRole(allowedRoles: string[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error(
      `Forbidden: Your role '${session.role}' is not authorized to perform this action. Required roles: ${allowedRoles.join(", ")}.`
    );
  }
  return session;
}

/**
 * Shortcut enforcing that the authenticated user is an 'admin'.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  return await requireRole(["admin"]);
}

/**
 * Helper to check role in UI/conditional logic.
 */
export function hasRole(session: SessionPayload | null, allowedRoles: string[]): boolean {
  if (!session) return false;
  return allowedRoles.includes(session.role);
}

/**
 * Verifies email & plain-text password against the MySQL users table.
 */
export async function verifyUserCredentials(email: string, passwordPlain: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const isValid = await bcrypt.compare(passwordPlain, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
    role: String(user.role),
  };
}

/**
 * Registers a new customer in the database.
 */
export async function registerUser({
  name,
  email,
  phone,
  passwordPlain,
}: {
  name: string;
  email: string;
  phone?: string;
  passwordPlain: string;
}) {
  const cleanEmail = email.trim().toLowerCase();

  const [existing] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [cleanEmail]
  );

  if (existing && existing.length > 0) {
    return {
      success: false as const,
      error: "An account with this email address already exists. Please sign in.",
    };
  }

  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  const cleanPhone = phone?.trim() || null;

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'customer', NOW())",
    [name.trim(), cleanEmail, cleanPhone, passwordHash]
  );

  return {
    success: true as const,
    user: {
      id: Number(result.insertId),
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: "customer",
    },
  };
}
