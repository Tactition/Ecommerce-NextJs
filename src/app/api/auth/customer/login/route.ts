import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { createCustomerSession } from "@/lib/auth/customer";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, phone, password_hash, is_active FROM customers WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createCustomerSession({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    return NextResponse.json({
      success: true,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}

