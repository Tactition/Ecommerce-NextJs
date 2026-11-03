"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { requireApprovedDealer } from "@/lib/auth/dealer";

export async function getDealerProfileData() {
  const session = await requireApprovedDealer();

  const [dealerRows] = await pool.execute<RowDataPacket[]>(
    `SELECT d.*, 
            d.company_name as business_name, 
            d.contact_name as contact_person, 
            d.phone as business_phone, 
            d.email as business_email, 
            d.gst_number as tax_number, 
            dt.name as tier_name, 
            dt.discount_percent as tier_discount_percent
     FROM dealers d
     LEFT JOIN dealer_tiers dt ON dt.id = d.tier_id
     WHERE d.id = ?`,
    [session.dealerId]
  );

  if (!dealerRows || dealerRows.length === 0) {
    throw new Error("Dealer profile not found");
  }

  const dealer = dealerRows[0];

  const [addresses] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM dealer_addresses WHERE dealer_id = ? ORDER BY is_default DESC, id DESC`,
    [dealer.id]
  );

  return {
    dealer,
    addresses,
  };
}

export async function updateDealerContactAction(formData: FormData) {
  const session = await requireApprovedDealer();

  const contactPerson = String(formData.get("contactPerson") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!contactPerson || !phone) {
    return { success: false, error: "Contact name and phone number are required." };
  }

  await pool.execute(
    `UPDATE dealers SET contact_name = ?, phone = ?, updated_at = NOW() WHERE id = ?`,
    [contactPerson, phone, session.dealerId]
  );

  revalidatePath("/dealer/account");
  return { success: true };
}

export async function changeDealerPasswordAction(formData: FormData) {
  const session = await requireApprovedDealer();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  const [dealers] = await pool.execute<RowDataPacket[]>(
    `SELECT password_hash FROM dealers WHERE id = ? LIMIT 1`,
    [session.dealerId]
  );

  if (!dealers || dealers.length === 0) {
    return { success: false, error: "Dealer account not found." };
  }

  const match = await bcrypt.compare(currentPassword, dealers[0].password_hash);
  if (!match) {
    return { success: false, error: "Current password is incorrect." };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.execute(`UPDATE dealers SET password_hash = ? WHERE id = ?`, [newHash, session.dealerId]);

  return { success: true };
}

export async function addDealerAddressAction(formData: FormData) {
  const session = await requireApprovedDealer();
  const dealerId = session.dealerId;

  const label = String(formData.get("label") || "Site Delivery").trim();
  const recipientName = String(formData.get("recipientName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const addressLine2 = String(formData.get("addressLine2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const postalCode = String(formData.get("postalCode") || "").trim();
  const isDefault = formData.get("isDefault") === "on" ? 1 : 0;

  if (!recipientName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return { success: false, error: "Please fill in all required address fields." };
  }

  if (isDefault) {
    await pool.execute(`UPDATE dealer_addresses SET is_default = 0 WHERE dealer_id = ?`, [dealerId]);
  }

  await pool.execute(
    `INSERT INTO dealer_addresses (
      dealer_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, NOW())`,
    [dealerId, label, recipientName, phone, addressLine1, addressLine2 || null, city, state, postalCode, isDefault]
  );

  revalidatePath("/dealer/account");
  return { success: true };
}

export async function deleteDealerAddressAction(addressId: number) {
  const session = await requireApprovedDealer();

  // IDOR protection: delete only if address belongs to this verified dealer
  await pool.execute(
    `DELETE FROM dealer_addresses WHERE id = ? AND dealer_id = ?`,
    [addressId, session.dealerId]
  );

  revalidatePath("/dealer/account");
  return { success: true };
}
