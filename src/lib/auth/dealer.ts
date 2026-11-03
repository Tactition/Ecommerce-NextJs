import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import {
  DEALER_COOKIE,
  DEALER_AUDIENCE,
  DealerStatus,
  DealerSessionPayload,
  signDealerToken,
  verifyDealerToken,
} from "./tokens/dealerToken";

export { DEALER_COOKIE, DEALER_AUDIENCE, signDealerToken, verifyDealerToken };
export type { DealerStatus, DealerSessionPayload };

const MAX_AGE = 60 * 60 * 24; // 1 day session expiry

/**
 * Creates and sets the dealer_session HTTP-only cookie.
 */
export async function createDealerSession(dealer: {
  id: number;
  email: string;
  companyName: string;
  contactName: string;
  gstNumber: string;
  approvalStatus: DealerStatus;
  tierId?: number;
  creditLimit?: number;
}): Promise<string> {
  const token = await signDealerToken({
    dealerId: dealer.id,
    email: dealer.email,
    companyName: dealer.companyName,
    contactName: dealer.contactName,
    gstNumber: dealer.gstNumber,
    approvalStatus: dealer.approvalStatus,
    tierId: dealer.tierId,
    creditLimit: dealer.creditLimit,
  });

  const cookieStore = await cookies();
  cookieStore.set(DEALER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return token;
}

/**
 * Retrieves and validates the current dealer session from request cookies.
 * React cache() deduplicates reads during a single render pass.
 */
export const getDealerSession = cache(async (): Promise<DealerSessionPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyDealerToken(token);
    if (!payload || !payload.dealerId) return null;

    // Database verification: verify dealer account is active and fetch fresh status & tier
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, company_name, contact_name, email, gst_number, approval_status, tier_id, credit_limit, is_active
       FROM dealers WHERE id = ? LIMIT 1`,
      [payload.dealerId]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return null;
    }

    return {
      dealerId: rows[0].id,
      email: rows[0].email,
      companyName: rows[0].company_name,
      contactName: rows[0].contact_name,
      gstNumber: rows[0].gst_number,
      approvalStatus: rows[0].approval_status as DealerStatus,
      tierId: rows[0].tier_id ? Number(rows[0].tier_id) : undefined,
      creditLimit: rows[0].credit_limit ? Number(rows[0].credit_limit) : undefined,
      role: "dealer",
      aud: DEALER_AUDIENCE,
    };
  } catch {
    return null;
  }
});

/**
 * Destroys ONLY the dealer_session cookie without touching customer or admin cookies.
 */
export async function destroyDealerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEALER_COOKIE);
}

/**
 * Enforces authenticated dealer session regardless of status.
 */
export async function requireDealer(): Promise<DealerSessionPayload> {
  const session = await getDealerSession();
  if (!session) {
    redirect("/dealer/login");
  }
  return session;
}

/**
 * Enforces authenticated dealer with APPROVED status.
 * If status is PENDING, REJECTED, or SUSPENDED, safely redirects to gate screens.
 */
export async function requireApprovedDealer(): Promise<DealerSessionPayload> {
  const session = await requireDealer();

  if (session.approvalStatus !== "APPROVED") {
    if (session.approvalStatus === "PENDING") {
      redirect("/dealer/pending");
    }
    if (session.approvalStatus === "REJECTED") {
      redirect("/dealer/rejected");
    }
    if (session.approvalStatus === "SUSPENDED") {
      redirect("/dealer/suspended");
    }
    redirect("/dealer/login");
  }

  return session;
}
