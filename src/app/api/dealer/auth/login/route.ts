import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { createDealerSession, DealerStatus } from "@/lib/auth/dealer";

const DealerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DealerLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid dealer credentials format." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, company_name, contact_name, email, gst_number, password_hash, approval_status, tier_id, credit_limit, is_active
       FROM dealers WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const dealer = rows[0];
    const isMatch = await bcrypt.compare(password, dealer.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createDealerSession({
      id: dealer.id,
      email: dealer.email,
      companyName: dealer.company_name,
      contactName: dealer.contact_name,
      gstNumber: dealer.gst_number,
      approvalStatus: dealer.approval_status as DealerStatus,
      tierId: dealer.tier_id ? Number(dealer.tier_id) : undefined,
      creditLimit: dealer.credit_limit ? Number(dealer.credit_limit) : undefined,
    });

    return NextResponse.json({
      success: true,
      dealer: {
        id: dealer.id,
        companyName: dealer.company_name,
        contactName: dealer.contact_name,
        email: dealer.email,
        approvalStatus: dealer.approval_status,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Dealer authentication service error." }, { status: 500 });
  }
}

