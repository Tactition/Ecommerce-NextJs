import "server-only";
import { cache } from "react";
import {
  getAdminSession,
  requireAdmin as requireAdminAuth,
  destroyAdminSession,
  ADMIN_COOKIE,
  AdminSessionPayload,
} from "@/lib/auth/admin";

export const COOKIE_NAME = ADMIN_COOKIE;

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Retrieves the current admin session, mapped for dashboard compatibility.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const admin = await getAdminSession();
  if (!admin) return null;
  return {
    userId: admin.adminId,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
  };
});

/**
 * Enforces admin session for protected admin actions.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const admin = await requireAdminAuth();
  return {
    userId: admin.adminId,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
  };
}

export async function requireAdmin(): Promise<SessionPayload> {
  return await requireAuth();
}

export async function destroySession(): Promise<void> {
  await destroyAdminSession();
}

export function hasRole(session: SessionPayload | null, allowedRoles: string[]): boolean {
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
