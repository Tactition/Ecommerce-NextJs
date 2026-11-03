import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const DEALER_COOKIE = "dealer_session";

const SECRET =
  process.env.DEALER_JWT_SECRET ||
  "wallstreet_dealer_jwt_secret_key_1d_2026_m33q71v55_super_secure";

const key = new TextEncoder().encode(SECRET);
export const DEALER_AUDIENCE = "wallstreet:dealer";

export type DealerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface DealerSessionPayload {
  dealerId: number;
  email: string;
  companyName: string;
  contactName: string;
  gstNumber: string;
  approvalStatus: DealerStatus;
  tierId?: number;
  creditLimit?: number;
  role: "dealer";
  aud: string;
}

export async function signDealerToken(data: {
  dealerId: number;
  email: string;
  companyName: string;
  contactName: string;
  gstNumber: string;
  approvalStatus: DealerStatus;
  tierId?: number;
  creditLimit?: number;
}): Promise<string> {
  return await new SignJWT({
    dealerId: data.dealerId,
    email: data.email,
    companyName: data.companyName,
    contactName: data.contactName,
    gstNumber: data.gstNumber,
    approvalStatus: data.approvalStatus,
    tierId: data.tierId,
    creditLimit: data.creditLimit,
    role: "dealer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(DEALER_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);
}

export async function verifyDealerToken(token: string): Promise<DealerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      audience: DEALER_AUDIENCE,
    });

    if (!payload.dealerId || payload.role !== "dealer") {
      return null;
    }

    return {
      dealerId: Number(payload.dealerId),
      email: String(payload.email || ""),
      companyName: String(payload.companyName || ""),
      contactName: String(payload.contactName || ""),
      gstNumber: String(payload.gstNumber || ""),
      approvalStatus: (payload.approvalStatus as DealerStatus) || "PENDING",
      tierId: payload.tierId ? Number(payload.tierId) : undefined,
      creditLimit: payload.creditLimit ? Number(payload.creditLimit) : undefined,
      role: "dealer",
      aud: DEALER_AUDIENCE,
    };
  } catch {
    return null;
  }
}

