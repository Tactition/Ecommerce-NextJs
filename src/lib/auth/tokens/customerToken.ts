import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const CUSTOMER_COOKIE = "customer_session";

const SECRET =
  process.env.CUSTOMER_JWT_SECRET ||
  "wallstreet_customer_jwt_secret_key_7d_2026_x87y21z99_super_secure";

const key = new TextEncoder().encode(SECRET);
export const CUSTOMER_AUDIENCE = "wallstreet:customer";

export interface CustomerSessionPayload {
  customerId: number;
  email: string;
  name: string;
  phone?: string;
  role: "customer";
  aud: string;
}

export async function signCustomerToken(
  data: { customerId: number; email: string; name: string; phone?: string }
): Promise<string> {
  return await new SignJWT({
    customerId: data.customerId,
    email: data.email,
    name: data.name,
    phone: data.phone || "",
    role: "customer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(CUSTOMER_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyCustomerToken(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      audience: CUSTOMER_AUDIENCE,
    });

    if (!payload.customerId || payload.role !== "customer") {
      return null;
    }

    return {
      customerId: Number(payload.customerId),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      phone: payload.phone ? String(payload.phone) : undefined,
      role: "customer",
      aud: CUSTOMER_AUDIENCE,
    };
  } catch {
    return null;
  }
}

