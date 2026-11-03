"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  createCustomerSession,
  destroyCustomerSession,
  getCustomerSession,
} from "@/lib/auth/customer";

const CustomerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const CustomerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional(),
});

export async function loginCustomerAction(prevState: unknown, formData: FormData) {
  try {
    const raw = {
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
    };

    const parsed = CustomerLoginSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid input data.",
      };
    }

    const { email, password } = parsed.data;

    // Check account in isolated customers table
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, email, phone, password_hash, is_active, failed_login_attempts, locked_until
       FROM customers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const customer = rows[0];

    // Check account active state
    if (customer.is_active === 0) {
      return {
        success: false,
        error: "Your customer account has been deactivated. Please contact support.",
      };
    }

    // Check lockout
    if (customer.locked_until && new Date(customer.locked_until) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(customer.locked_until).getTime() - Date.now()) / (1000 * 60)
      );
      return {
        success: false,
        error: `Account temporarily locked due to too many failed attempts. Try again in ${waitMinutes} minutes.`,
      };
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      const attempts = (customer.failed_login_attempts || 0) + 1;
      let lockSql = `UPDATE customers SET failed_login_attempts = ? WHERE id = ?`;
      let lockParams: any[] = [attempts, customer.id];

      if (attempts >= 5) {
        lockSql = `UPDATE customers SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`;
      }
      await pool.execute(lockSql, lockParams);

      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    // Reset failed attempts & update last login
    await pool.execute(
      `UPDATE customers SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?`,
      [customer.id]
    );

    // Create isolated customer_session cookie
    await createCustomerSession({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    // Sanitize redirect target (strictly prevent jumping to admin or dealer areas)
    const rawRedirect = formData.get("redirectTo");
    let safeRedirect = "/profile";

    if (
      typeof rawRedirect === "string" &&
      rawRedirect.startsWith("/") &&
      !rawRedirect.startsWith("//") &&
      !rawRedirect.startsWith("/admin") &&
      !rawRedirect.startsWith("/dashboard") &&
      !rawRedirect.startsWith("/dealer")
    ) {
      safeRedirect = rawRedirect;
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    };
  } catch (err: unknown) {
    console.error("Customer login error:", err);
    return {
      success: false,
      error: "Authentication failed. Please try again.",
    };
  }
}

export async function registerCustomerAction(prevState: unknown, formData: FormData) {
  try {
    const raw = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
      phone: String(formData.get("phone") || "").trim(),
    };

    const parsed = CustomerRegisterSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid registration data.",
      };
    }

    const { name, email, password, phone } = parsed.data;

    // Check duplicate email in customers table
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM customers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO customers (name, email, password_hash, phone, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, passwordHash, phone || null]
    );

    await createCustomerSession({
      id: result.insertId,
      name,
      email,
      phone,
    });

    return {
      success: true,
      redirectTo: "/profile",
      customer: {
        id: result.insertId,
        name,
        email,
      },
    };
  } catch (err: unknown) {
    console.error("Customer registration error:", err);
    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}

export async function logoutCustomerAction(): Promise<void> {
  await destroyCustomerSession();
}

