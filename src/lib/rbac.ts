import "server-only";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getSession } from "@/lib/auth";
import { SessionPayload } from "@/lib/token";
import { RBAC_MODULES, RbacModuleId, RbacAction, hasPermission } from "@/types/rbac";
export { hasPermission };

/**
 * In-memory cache for role permissions with a 60-second TTL to avoid redundant DB queries.
 */
interface CacheEntry {
  permissions: string[];
  expiresAt: number;
}
const rolePermsCache = new Map<string, CacheEntry>();

/**
 * Clears the in-memory permissions cache for a specific role or all roles.
 */
export function invalidateRoleCache(roleSlug?: string) {
  if (roleSlug) {
    rolePermsCache.delete(roleSlug);
  } else {
    rolePermsCache.clear();
  }
}

/**
 * Fetches all granted permission strings (e.g. "products:view", "products:create") for a given role slug.
 */
export async function getRolePermissions(roleSlug: string): Promise<string[]> {
  const normalizedSlug = roleSlug.trim().toLowerCase();

  // Super Administrator always has unrestricted wildcard access
  if (normalizedSlug === "admin") {
    return ["*"];
  }

  const cached = rolePermsCache.get(normalizedSlug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT rp.module, rp.action
       FROM role_permissions rp
       JOIN roles r ON r.id = rp.role_id
       WHERE r.slug = ?`,
      [normalizedSlug]
    );

    const permissions: string[] = rows.map((r) => `${r.module}:${r.action}`);

    rolePermsCache.set(normalizedSlug, {
      permissions,
      expiresAt: Date.now() + 60 * 1000,
    });

    return permissions;
  } catch (error) {
    console.error(`Failed to fetch permissions for role '${normalizedSlug}':`, error);
    return [];
  }
}

/**
 * Checks if a session has permission for a specific module and action.
 */
export function canUser(
  session: SessionPayload | null,
  module: string,
  action: string
): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;

  return hasPermission(session.permissions, module, action);
}

/**
 * Server-side guard: enforces that the authenticated user possesses the specified module:action permission.
 * Throws a detailed Error if unauthorized.
 */
export async function requirePermission(
  module: RbacModuleId | string,
  action: RbacAction | string
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }

  // Super Administrator bypass
  if (session.role === "admin") {
    return session;
  }

  // Check session token permissions first
  if (hasPermission(session.permissions, module, action)) {
    return session;
  }

  // Double check fresh database permissions in case session token was minted before permissions changed
  const freshPerms = await getRolePermissions(session.role);
  if (hasPermission(freshPerms, module, action)) {
    return session;
  }

  throw new Error(
    `Forbidden: You do not have permission to ${action} ${module}. Contact an administrator for access.`
  );
}
