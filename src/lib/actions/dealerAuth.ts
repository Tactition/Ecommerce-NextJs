"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  createDealerSession,
  destroyDealerSession,
  getDealerSession,
  DealerStatus,
} from "@/lib/auth/dealer";
import { sendDealerApplicationReceivedEmail } from "@/lib/mail";

const DealerRegistrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  taxNumber: z.string().min(5, "GST/Tax number is required"),
  businessType: z.enum(["retailer", "contractor", "designer", "wholesaler", "other"]),
  address: z.string().min(5, "Business address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal/ZIP code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function registerDealerAction(formData: FormData) {
  try {
    const rawData = {
      businessName: formData.get("businessName"),
      contactPerson: formData.get("contactPerson"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      taxNumber: formData.get("taxNumber"),
      businessType: formData.get("businessType"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validated = DealerRegistrationSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input data",
      };
    }

    const {
      businessName,
      contactPerson,
      email,
      phone,
      taxNumber,
      businessType,
      address,
      city,
      state,
      postalCode,
      password,
    } = validated.data;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedTax = taxNumber.trim().toUpperCase();

    // Check duplicate in isolated dealers table
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM dealers WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "A trade dealer account with this email address already exists.",
      };
    }

    const [existingTax] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM dealers WHERE gst_number = ? LIMIT 1`,
      [normalizedTax]
    );

    if (existingTax && existingTax.length > 0) {
      return {
        success: false,
        error: "A dealer profile with this GST/Tax identification number is already registered.",
      };
    }

    // Default tier: bronze (or first tier)
    const [tierRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM dealer_tiers ORDER BY discount_percent ASC LIMIT 1`
    );
    const defaultTierId = tierRows.length > 0 ? tierRows[0].id : null;

    const passwordHash = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert directly into isolated dealers table
      const [dealerResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO dealers (
          company_name, contact_name, email, phone, password_hash, gst_number,
          business_type, address, city, state, postal_code, country, approval_status,
          allow_credit_terms, credit_limit, credit_days, tier_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', 'PENDING', 0, 0, 0, ?, NOW())`,
        [
          businessName,
          contactPerson,
          normalizedEmail,
          phone,
          passwordHash,
          normalizedTax,
          businessType,
          address,
          city,
          state,
          postalCode,
          defaultTierId,
        ]
      );

      const dealerId = dealerResult.insertId;

      // Primary shipping address
      await connection.execute(
        `INSERT INTO dealer_addresses (
          dealer_id, label, recipient_name, phone, address_line1, city, state, postal_code, country, is_default, created_at
        ) VALUES (?, 'Primary Trade Address', ?, ?, ?, ?, ?, ?, 'India', 1, NOW())`,
        [dealerId, contactPerson, phone, address, city, state, postalCode]
      );

      // Audit log
      try {
        await connection.execute(
          `INSERT INTO b2b_audit_logs (action, actor_id, actor_email, target_type, target_id, details, created_at)
           VALUES ('DEALER_REGISTRATION', ?, ?, 'dealer', ?, ?, NOW())`,
          [dealerId, normalizedEmail, dealerId, JSON.stringify({ status: "PENDING", note: "Dealer self-registered" })]
        );
      } catch (logErr) {
        // Non-critical audit log
      }

      await connection.commit();

      // Send email
      try {
        await sendDealerApplicationReceivedEmail(normalizedEmail, businessName, contactPerson);
      } catch (mailErr) {
        console.error("Failed to send welcome email:", mailErr);
      }

      // Automatically sign in into isolated dealer_session with PENDING status
      await createDealerSession({
        id: dealerId,
        email: normalizedEmail,
        companyName: businessName,
        contactName: contactPerson,
        gstNumber: normalizedTax,
        approvalStatus: "PENDING",
        tierId: defaultTierId,
        creditLimit: 0,
      });

      return {
        success: true,
        redirect: "/dealer/pending",
      };
    } catch (err: any) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("Dealer registration error:", error);
    return {
      success: false,
      error: error.message || "Registration failed. Please try again.",
    };
  }
}

export async function loginDealerAction(formData: FormData) {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return { success: false, error: "Please enter your email and password." };
    }

    // Query strictly isolated dealers table
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, company_name, contact_name, email, phone, password_hash, gst_number,
              approval_status, tier_id, credit_limit, is_active, failed_login_attempts, locked_until
       FROM dealers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: "Invalid email or password." };
    }

    const dealer = rows[0];

    // Check active status
    if (dealer.is_active === 0) {
      return {
        success: false,
        error: "Dealer account is deactivated. Please contact our B2B trade desk.",
      };
    }

    // Check lockout
    if (dealer.locked_until && new Date(dealer.locked_until) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(dealer.locked_until).getTime() - Date.now()) / (1000 * 60)
      );
      return {
        success: false,
        error: `Account temporarily locked due to failed attempts. Try again in ${waitMinutes} minutes.`,
      };
    }

    const isMatch = await bcrypt.compare(password, dealer.password_hash);
    if (!isMatch) {
      const attempts = (dealer.failed_login_attempts || 0) + 1;
      let lockSql = `UPDATE dealers SET failed_login_attempts = ? WHERE id = ?`;
      let lockParams: any[] = [attempts, dealer.id];

      if (attempts >= 5) {
        lockSql = `UPDATE dealers SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`;
      }
      await pool.execute(lockSql, lockParams);

      return { success: false, error: "Invalid email or password." };
    }

    // Reset failed attempts & record login
    await pool.execute(
      `UPDATE dealers SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?`,
      [dealer.id]
    );

    // Create isolated dealer_session cookie
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

    // Enforce gate redirects based on approval status
    if (dealer.approval_status === "PENDING") {
      return { success: true, redirect: "/dealer/pending" };
    } else if (dealer.approval_status === "REJECTED") {
      return { success: true, redirect: "/dealer/rejected" };
    } else if (dealer.approval_status === "SUSPENDED") {
      return { success: true, redirect: "/dealer/suspended" };
    }

    return { success: true, redirect: "/dealer" };
  } catch (error: any) {
    console.error("Dealer login error:", error);
    return { success: false, error: "Authentication failed. Please try again." };
  }
}

export async function logoutDealerAction(): Promise<void> {
  await destroyDealerSession();
}
