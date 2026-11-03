import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_AUDIENCE,
  CustomerSessionPayload,
  signCustomerToken,
  verifyCustomerToken,
} from "./tokens/customerToken";

export { CUSTOMER_COOKIE, CUSTOMER_AUDIENCE, signCustomerToken, verifyCustomerToken };
export type { CustomerSessionPayload };

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Creates and sets the customer_session HTTP-only cookie.
 */
export async function createCustomerSession(customer: {
  id: number;
  email: string;
  name: string;
  phone?: string;
}): Promise<string> {
  const token = await signCustomerToken({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
  });

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return token;
}

/**
 * Retrieves and validates the current customer session from request cookies.
 * React cache() deduplicates reads during a single render pass.
 */
export const getCustomerSession = cache(async (): Promise<CustomerSessionPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyCustomerToken(token);
    if (!payload || !payload.customerId) return null;

    // Database validity check: verify customer exists and is active
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, phone, is_active FROM customers WHERE id = ? LIMIT 1`,
      [payload.customerId]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return null;
    }

    return {
      customerId: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      phone: rows[0].phone || undefined,
      role: "customer",
      aud: CUSTOMER_AUDIENCE,
    };
  } catch {
    return null;
  }
});

/**
 * Destroys ONLY the customer_session cookie without touching admin or dealer cookies.
 */
export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

/**
 * Enforces authenticated customer session. Redirects to /login if unauthenticated.
 */
export async function requireCustomer(): Promise<CustomerSessionPayload> {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
