import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const ADMIN_COOKIE = "admin_session";

const SECRET =
  process.env.ADMIN_JWT_SECRET ||
  "wallstreet_admin_jwt_secret_key_2h_2026_k49p12w88_super_secure";

const key = new TextEncoder().encode(SECRET);
export const ADMIN_AUDIENCE = "wallstreet:admin";

export type AdminRole = "superadmin" | "manager" | "editor" | "support";

export interface AdminSessionPayload {
  adminId: number;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  aud: string;
}

export async function signAdminToken(data: {
  adminId: number;
  email: string;
  name: string;
  role: AdminRole;
  permissions?: string[];
}): Promise<string> {
  return await new SignJWT({
    adminId: data.adminId,
    email: data.email,
    name: data.name,
    role: data.role,
    permissions: data.permissions || [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(ADMIN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      audience: ADMIN_AUDIENCE,
    });

    if (!payload.adminId || !payload.role) {
      return null;
    }

    const rawPerms = payload.permissions;
    const permissions: string[] = Array.isArray(rawPerms)
      ? rawPerms.map(String)
      : [];

    return {
      adminId: Number(payload.adminId),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role: payload.role as AdminRole,
      permissions,
      aud: ADMIN_AUDIENCE,
    };
  } catch {
    return null;
  }
}

