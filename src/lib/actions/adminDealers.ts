"use server";

import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { sendDealerApprovedEmail, sendDealerRejectedEmail } from "@/lib/mail";

export async function getAdminDealersAction(filterStatus?: string) {
  const admin = await requireAdmin();

  let query = `
    SELECT d.*, 
           d.company_name as business_name, 
           d.contact_name as contact_person, 
           d.phone as business_phone, 
           d.email as business_email, 
           d.gst_number as tax_number, 
           d.approval_status as status,
           dt.name as tier_name, 
           dt.discount_percent as tier_discount
    FROM dealers d
    LEFT JOIN dealer_tiers dt ON dt.id = d.tier_id
  `;

  const params: any[] = [];
  if (filterStatus && filterStatus !== "ALL") {
    query += ` WHERE d.approval_status = ?`;
    params.push(filterStatus);
  }

  query += ` ORDER BY d.created_at DESC`;

  const [dealers] = await pool.execute<RowDataPacket[]>(query, params);
  const [tiers] = await pool.execute<RowDataPacket[]>(`SELECT * FROM dealer_tiers WHERE is_active = 1`);

  return {
    dealers,
    tiers,
  };
}

export async function updateDealerStatusAction(
  dealerId: number,
  status: "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING",
  reason?: string,
  tierId?: number,
  allowCredit?: boolean,
  creditLimit?: number,
  creditDays?: number,
  internalNotes?: string
) {
  const admin = await requireAdmin();

  // Get current dealer record
  const [current] = await pool.execute<RowDataPacket[]>(
    `SELECT d.*, dt.name as current_tier_name FROM dealers d LEFT JOIN dealer_tiers dt ON dt.id = d.tier_id WHERE d.id = ?`,
    [dealerId]
  );

  if (!current || current.length === 0) {
    throw new Error("Dealer not found");
  }

  const old = current[0];

  await pool.execute(
    `UPDATE dealers 
     SET approval_status = ?, 
         rejection_reason = ?, 
         tier_id = COALESCE(?, tier_id),
         allow_credit_terms = ?,
         credit_limit = ?,
         credit_days = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [
      status,
      reason || null,
      tierId || null,
      allowCredit ? 1 : 0,
      creditLimit || 0,
      creditDays || 30,
      dealerId,
    ]
  );

  // Audit log
  try {
    await pool.execute(
      `INSERT INTO b2b_audit_logs (action, actor_id, actor_email, target_type, target_id, details, created_at)
       VALUES ('STATUS_CHANGE', ?, ?, 'dealer', ?, ?, NOW())`,
      [
        admin.adminId,
        admin.email,
        dealerId,
        JSON.stringify({
          old_status: old.approval_status,
          new_status: status,
          notes: internalNotes || reason || "Status update",
        }),
      ]
    );
  } catch (logErr) {
    // Non-critical audit log
  }

  // Email notifications
  if (status === "APPROVED" && old.approval_status !== "APPROVED") {
    const [tierRows] = await pool.execute<RowDataPacket[]>(
      `SELECT name FROM dealer_tiers WHERE id = ?`,
      [tierId || old.tier_id]
    );
    const tierName = tierRows[0]?.name || "Trade Partner";
    await sendDealerApprovedEmail(old.email, old.company_name, tierName).catch(() => {});
  } else if (status === "REJECTED" && old.approval_status !== "REJECTED") {
    await sendDealerRejectedEmail(old.email, old.company_name, reason).catch(() => {});
  }

  revalidatePath("/dashboard/dealers");
  return { success: true };
}

export async function getAdminWholesalePricesAction() {
  await requireAdmin();

  const [products] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, price, default_wholesale_price, min_order_quantity, image, category_slug FROM products ORDER BY id DESC LIMIT 50`
  );

  const [tiers] = await pool.execute<RowDataPacket[]>(`SELECT * FROM dealer_tiers WHERE is_active = 1`);

  const [overrides] = await pool.execute<RowDataPacket[]>(
    `SELECT wp.*, p.name as product_name, dt.name as tier_name, d.company_name as dealer_name
     FROM wholesale_prices wp
     LEFT JOIN products p ON p.id = wp.product_id
     LEFT JOIN dealer_tiers dt ON dt.id = wp.tier_id
     LEFT JOIN dealers d ON d.id = wp.dealer_id
     ORDER BY wp.id DESC`
  );

  return {
    products,
    tiers,
    overrides,
  };
}

export async function saveProductWholesaleDefaultsAction(
  productId: number,
  defaultWholesalePrice: number,
  minOrderQuantity: number,
  retailPrice?: number
) {
  await requireAdmin();

  if (retailPrice !== undefined && retailPrice !== null && !isNaN(retailPrice)) {
    await pool.execute(
      `UPDATE products 
       SET default_wholesale_price = ?, min_order_quantity = ?, price = ? 
       WHERE id = ?`,
      [defaultWholesalePrice || null, minOrderQuantity || 1, retailPrice, productId]
    );
  } else {
    await pool.execute(
      `UPDATE products 
       SET default_wholesale_price = ?, min_order_quantity = ? 
       WHERE id = ?`,
      [defaultWholesalePrice || null, minOrderQuantity || 1, productId]
    );
  }

  revalidatePath("/dashboard/pricing/wholesale");
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function addWholesalePriceOverrideAction(
  productId: number,
  tierId: number | null,
  dealerId: number | null,
  wholesalePrice: number,
  minQuantity: number
) {
  await requireAdmin();

  await pool.execute(
    `INSERT INTO wholesale_prices (product_id, tier_id, dealer_id, wholesale_price, min_quantity, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
    [productId, tierId || null, dealerId || null, wholesalePrice, minQuantity || 1]
  );

  revalidatePath("/dashboard/pricing/wholesale");
  return { success: true };
}

export async function deleteWholesalePriceOverrideAction(id: number) {
  await requireAdmin();

  await pool.execute(`DELETE FROM wholesale_prices WHERE id = ?`, [id]);
  revalidatePath("/dashboard/pricing/wholesale");
  return { success: true };
}
