import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { createCustomerSession } from "@/lib/auth/customer";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input data." }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM customers WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "An account with this email address already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO customers (name, email, password_hash, phone, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [name, normalizedEmail, passwordHash, phone || null]
    );

    await createCustomerSession({
      id: result.insertId,
      name,
      email: normalizedEmail,
      phone,
    });

    return NextResponse.json({
      success: true,
      customer: { id: result.insertId, name, email: normalizedEmail },
    });
  } catch (error) {
    return NextResponse.json({ error: "Registration service error." }, { status: 500 });
  }
}

