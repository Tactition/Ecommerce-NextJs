import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const COOKIE_NAME = "wallstreet_session";

const SECRET_KEY =
  process.env.AUTH_SECRET ||
  "wallstreet_interiors_super_secure_jwt_token_secret_key_2026_987654321";

const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  permissions?: string[]; // e.g. ["products:view", "products:create", ...] or ["*"]
  dealerId?: number;
  dealerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  tierId?: number;
  [key: string]: unknown;
}

/**
 * Signs a cryptographic JWT session token (7 days validity).
 * Completely edge-runtime and node-runtime compatible.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    permissions: payload.permissions || [],
    dealerId: payload.dealerId,
    dealerStatus: payload.dealerStatus,
    tierId: payload.tierId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verifies a JWT session token and returns the typed payload or null if invalid/expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const rawPerms = payload.permissions;
    const permissions: string[] = Array.isArray(rawPerms)
      ? rawPerms.map(String)
      : [];

    return {
      userId: Number(payload.userId),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role: String(payload.role || "customer"),
      permissions,
      dealerId: payload.dealerId ? Number(payload.dealerId) : undefined,
      dealerStatus: payload.dealerStatus as any,
      tierId: payload.tierId ? Number(payload.tierId) : undefined,
    };
  } catch {
    return null;
  }
}
