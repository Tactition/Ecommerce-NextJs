import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { createAdminSession, AdminRole } from "@/lib/auth/admin";

const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AdminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid administrator credentials format." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, password_hash, role, permissions, is_active FROM admin_users WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0 || rows[0].is_active === 0) {
      return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
    }

    let permissions: string[] = [];
    if (admin.permissions) {
      try {
        permissions = typeof admin.permissions === "string" ? JSON.parse(admin.permissions) : admin.permissions;
      } catch {
        permissions = [];
      }
    }

    await createAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
      permissions,
    });

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    return NextResponse.json({ error: "Admin authentication service error." }, { status: 500 });
  }
}

