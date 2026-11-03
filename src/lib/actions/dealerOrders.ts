"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { requireApprovedDealer } from "@/lib/auth/dealer";

export async function getDealerOrdersAction(page: number = 1, status?: string) {
  const session = await requireApprovedDealer();
  const dealerId = session.dealerId;

  const limit = 10;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, order_number, total_amount as total, subtotal, discount_amount as discount, payment_method, payment_status, order_status as status, 
           purchase_order_number, invoice_terms, created_at
    FROM orders
    WHERE dealer_id = ?
  `;
  const params: any[] = [dealerId];

  if (status && status !== "ALL") {
    query += ` AND order_status = ?`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [orders] = await pool.execute<RowDataPacket[]>(query, params);

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM orders WHERE dealer_id = ? ${status && status !== "ALL" ? "AND order_status = ?" : ""}`,
    status && status !== "ALL" ? [dealerId, status] : [dealerId]
  );

  const total = countRows[0]?.total || 0;

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDealerOrderDetailAction(orderId: number) {
  const session = await requireApprovedDealer();
  const dealerId = session.dealerId;

  const [dealers] = await pool.execute<RowDataPacket[]>(
    `SELECT id, company_name as business_name, gst_number as tax_number, phone as business_phone, email as business_email, address as business_address 
     FROM dealers WHERE id = ? LIMIT 1`,
    [dealerId]
  );

  if (!dealers || dealers.length === 0) {
    throw new Error("Dealer profile not found.");
  }

  const dealer = dealers[0];

  // Strict IDOR Protection: WHERE id = ? AND dealer_id = ?
  const [orders] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM orders WHERE id = ? AND dealer_id = ?`,
    [orderId, dealerId]
  );

  if (!orders || orders.length === 0) {
    throw new Error("Order not found or you are not authorized to view it.");
  }

  const order = orders[0];

  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.*, p.slug as current_slug
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return {
    order,
    items,
    dealer,
  };
}
