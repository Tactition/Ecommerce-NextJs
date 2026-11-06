"use server";

import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getCustomerSession } from "@/lib/auth/customer";
import { getDealerSession } from "@/lib/auth/dealer";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export interface OrderItemInput {
  productId: number;
  variationId?: number | null;
  name: string;
  slug: string;
  image?: string;
  sku?: string | null;
  price: number;
  quantity: number;
  attributes?: Record<string, string>;
  customDetails?: any;
}

export interface CreateOrderInput {
  firstName: string;
  lastName: string;
  companyName?: string;
  gstin?: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  shipToDifferent?: boolean;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  orderNotes?: string;
  paymentMethod: "cod" | "upi" | "card" | "bank_transfer" | "credit_terms";
  couponCode?: string;
  discountPercent?: number;
  items: OrderItemInput[];
  purchaseOrderNumber?: string;
}

export interface PlacedOrder {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  gstin: string | null;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  ship_to_different: boolean;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  order_notes: string | null;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    variation_id: number | null;
    product_name: string;
    product_slug: string;
    product_image: string | null;
    sku: string | null;
    price: number;
    quantity: number;
    total_price: number;
    attributes: Record<string, string> | null;
    custom_details: any | null;
  }[];
}

export async function createOrderAction(data: CreateOrderInput): Promise<{
  success: boolean;
  orderNumber?: string;
  orderId?: number;
  error?: string;
}> {
  try {
    // 0. Enforce authenticated checkout
    const customer = await getCustomerSession();
    const dealer = await getDealerSession();

    if (!customer && !dealer) {
      return { success: false, error: "Please sign in to complete your purchase." };
    }

    // Check if dealer order
    let isB2B = 0;
    let dealerId: number | null = null;
    let customerId: number | null = customer?.customerId || null;
    let invoiceTerms: string | null = null;

    if (dealer && dealer.approvalStatus === "APPROVED") {
      isB2B = 1;
      dealerId = dealer.dealerId;
      if (data.paymentMethod === "credit_terms") {
        invoiceTerms = "Net 30 Days";
      }
    }

    // 1. Validation
    if (!data.firstName || !data.firstName.trim()) {
      return { success: false, error: "First Name is required." };
    }
    if (!data.lastName || !data.lastName.trim()) {
      return { success: false, error: "Last Name is required." };
    }
    if (!data.email || !data.email.trim() || !data.email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    const cleanPhone = (data.phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "A valid 10-digit contact phone number is required." };
    }
    if (!data.addressLine1 || !data.addressLine1.trim()) {
      return { success: false, error: "Street address is required." };
    }
    if (!data.city || !data.city.trim()) {
      return { success: false, error: "Town / City is required." };
    }
    if (!data.state || !data.state.trim()) {
      return { success: false, error: "State is required." };
    }
    if (!data.postalCode || !data.postalCode.trim() || data.postalCode.trim().length < 5) {
      return { success: false, error: "A valid PIN / Postal code is required." };
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Your cart is empty. Please add items before checking out." };
    }

    // 1b. Server-side B2B Minimum Order Quantity (MOQ) validation
    if (isB2B === 1) {
      for (const item of data.items) {
        const [prodRows] = await pool.query<RowDataPacket[]>(
          "SELECT id, name, min_order_quantity FROM products WHERE id = ? LIMIT 1",
          [item.productId]
        );
        if (prodRows && prodRows.length > 0) {
          const reqMoq = Math.max(1, Number(prodRows[0].min_order_quantity) || 1);
          if (item.quantity < reqMoq) {
            return {
              success: false,
              error: `Minimum order requirement not met: "${prodRows[0].name}" requires at least ${reqMoq} units for B2B trade orders (received ${item.quantity}).`,
            };
          }
        }
      }
    }

    // 2. Financial calculation
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = data.discountPercent && data.discountPercent > 0
      ? (subtotal * data.discountPercent) / 100
      : 0;
    const shippingFee = 0; // White-Glove delivery included
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 3. Generate unique branded order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `WSI-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 4. Insert into orders table
    const [orderRes] = await pool.execute<ResultSetHeader>(
      `INSERT INTO orders (
        order_number, user_id, is_b2b, dealer_id, first_name, last_name, company_name, gstin,
        email, phone, address_line1, address_line2, city, state, postal_code, country,
        ship_to_different, shipping_first_name, shipping_last_name, shipping_address_line1,
        shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country,
        order_notes, subtotal, discount_amount, coupon_code, shipping_fee, total_amount,
        payment_method, invoice_terms, purchase_order_number, payment_status, order_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`,
      [
        orderNumber,
        customerId,
        isB2B,
        dealerId,
        data.firstName.trim(),
        data.lastName.trim(),
        data.companyName?.trim() || null,
        data.gstin?.trim() || null,
        data.email.trim(),
        data.phone.trim(),
        data.addressLine1.trim(),
        data.addressLine2?.trim() || null,
        data.city.trim(),
        data.state.trim(),
        data.postalCode.trim(),
        data.country?.trim() || "India",
        data.shipToDifferent ? 1 : 0,
        data.shipToDifferent ? (data.shippingFirstName?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingLastName?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingAddressLine1?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingAddressLine2?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingCity?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingState?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingPostalCode?.trim() || null) : null,
        data.shipToDifferent ? (data.shippingCountry?.trim() || "India") : null,
        data.orderNotes?.trim() || null,
        subtotal,
        discountAmount,
        data.couponCode?.trim() || null,
        shippingFee,
        totalAmount,
        data.paymentMethod || "cod",
        invoiceTerms,
        data.purchaseOrderNumber?.trim() || null,
        data.paymentMethod === "credit_terms" ? "pending" : (data.paymentMethod === "cod" ? "pending" : "pending"),
        "confirmed",
      ]
    );

    const orderId = orderRes.insertId;

    // 5. Insert order items
    for (const item of data.items) {
      const itemTotal = item.price * item.quantity;
      await pool.execute<ResultSetHeader>(
        `INSERT INTO order_items (
          order_id, product_id, variation_id, product_name, product_slug,
          product_image, sku, price, quantity, total_price, attributes_json, custom_details_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.variationId || null,
          item.name,
          item.slug,
          item.image || null,
          item.sku || null,
          item.price,
          item.quantity,
          itemTotal,
          item.attributes ? JSON.stringify(item.attributes) : null,
          item.customDetails ? JSON.stringify(item.customDetails) : null,
        ]
      );
    }

    return {
      success: true,
      orderNumber,
      orderId,
    };
  } catch (err: unknown) {
    console.error("Error creating order:", err);
    const msg = err instanceof Error ? err.message : "Database error while processing your order.";
    return { success: false, error: msg };
  }
}

export async function getOrderByNumberAction(orderNumber: string): Promise<PlacedOrder | null> {
  if (!orderNumber || !orderNumber.trim()) return null;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE order_number = ? LIMIT 1`,
      [orderNumber.trim()]
    );

    if (!rows || rows.length === 0) return null;
    const r = rows[0];

    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [r.id]
    );

    const items = itemRows.map((it: RowDataPacket) => {
      let attrs = null;
      let custom = null;
      try {
        if (it.attributes_json) attrs = JSON.parse(it.attributes_json);
      } catch (e) {}
      try {
        if (it.custom_details_json) custom = JSON.parse(it.custom_details_json);
      } catch (e) {}

      return {
        id: it.id,
        product_id: it.product_id,
        variation_id: it.variation_id,
        product_name: it.product_name,
        product_slug: it.product_slug,
        product_image: it.product_image,
        sku: it.sku,
        price: Number(it.price),
        quantity: Number(it.quantity),
        total_price: Number(it.total_price),
        attributes: attrs,
        custom_details: custom,
      };
    });

    return {
      id: r.id,
      order_number: r.order_number,
      first_name: r.first_name,
      last_name: r.last_name,
      company_name: r.company_name,
      gstin: r.gstin,
      email: r.email,
      phone: r.phone,
      address_line1: r.address_line1,
      address_line2: r.address_line2,
      city: r.city,
      state: r.state,
      postal_code: r.postal_code,
      country: r.country,
      ship_to_different: Boolean(r.ship_to_different),
      shipping_first_name: r.shipping_first_name,
      shipping_last_name: r.shipping_last_name,
      shipping_address_line1: r.shipping_address_line1,
      shipping_address_line2: r.shipping_address_line2,
      shipping_city: r.shipping_city,
      shipping_state: r.shipping_state,
      shipping_postal_code: r.shipping_postal_code,
      shipping_country: r.shipping_country,
      order_notes: r.order_notes,
      subtotal: Number(r.subtotal),
      discount_amount: Number(r.discount_amount || 0),
      coupon_code: r.coupon_code,
      shipping_fee: Number(r.shipping_fee || 0),
      total_amount: Number(r.total_amount),
      payment_method: r.payment_method,
      payment_status: r.payment_status,
      order_status: r.order_status,
      created_at: new Date(r.created_at).toISOString(),
      items,
    };
  } catch (err: unknown) {
    console.error("Error fetching order by number:", err);
    return null;
  }
}

export interface AdminOrderSummary {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  gstin: string | null;
  email: string;
  phone: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  item_preview: {
    name: string;
    image: string | null;
    quantity: number;
  }[];
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  todayOrders: number;
  todayRevenue: number;
}

export async function getOrderStatsAdminAction(): Promise<AdminOrderStats> {
  await requireAdmin();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmedCount,
        COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processingCount,
        COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shippedCount,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as deliveredCount,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelledCount,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as todayOrders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as todayRevenue
      FROM orders
    `);

    const r = rows[0] || {};
    return {
      totalOrders: Number(r.totalOrders || 0),
      totalRevenue: Number(r.totalRevenue || 0),
      pendingCount: Number(r.pendingCount || 0),
      confirmedCount: Number(r.confirmedCount || 0),
      processingCount: Number(r.processingCount || 0),
      shippedCount: Number(r.shippedCount || 0),
      deliveredCount: Number(r.deliveredCount || 0),
      cancelledCount: Number(r.cancelledCount || 0),
      todayOrders: Number(r.todayOrders || 0),
      todayRevenue: Number(r.todayRevenue || 0),
    };
  } catch (err) {
    console.error("Error fetching order stats:", err);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingCount: 0,
      confirmedCount: 0,
      processingCount: 0,
      shippedCount: 0,
      deliveredCount: 0,
      cancelledCount: 0,
      todayOrders: 0,
      todayRevenue: 0,
    };
  }
}

export async function getAllOrdersAdminAction(options?: {
  status?: string;
  search?: string;
}): Promise<{
  orders: AdminOrderSummary[];
  stats: AdminOrderStats;
}> {
  await requireAdmin();

  try {
    const stats = await getOrderStatsAdminAction();

    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.first_name,
        o.last_name,
        o.company_name,
        o.gstin,
        o.email,
        o.phone,
        o.city,
        o.state,
        o.postal_code,
        o.country,
        o.subtotal,
        o.discount_amount,
        o.coupon_code,
        o.shipping_fee,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (options?.status && options.status !== "all") {
      whereClauses.push("o.order_status = ?");
      params.push(options.status);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      whereClauses.push(`(
        o.order_number LIKE ? OR
        o.first_name LIKE ? OR
        o.last_name LIKE ? OR
        CONCAT(o.first_name, ' ', o.last_name) LIKE ? OR
        o.email LIKE ? OR
        o.phone LIKE ? OR
        o.company_name LIKE ? OR
        o.gstin LIKE ?
      )`);
      params.push(term, term, term, term, term, term, term, term);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` GROUP BY o.id ORDER BY o.id DESC LIMIT 250`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    if (!rows || rows.length === 0) {
      return { orders: [], stats };
    }

    const orderIds = rows.map((r) => r.id);

    // Fetch preview items
    let previewMap: Record<number, { name: string; image: string | null; quantity: number }[]> = {};
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => "?").join(",");
      const [itemRows] = await pool.query<RowDataPacket[]>(
        `SELECT order_id, product_name, product_image, quantity 
         FROM order_items 
         WHERE order_id IN (${placeholders})
         ORDER BY id ASC`,
        orderIds
      );

      itemRows.forEach((it) => {
        if (!previewMap[it.order_id]) previewMap[it.order_id] = [];
        if (previewMap[it.order_id].length < 3) {
          previewMap[it.order_id].push({
            name: it.product_name,
            image: it.product_image,
            quantity: Number(it.quantity),
          });
        }
      });
    }

    const orders: AdminOrderSummary[] = rows.map((r) => ({
      id: r.id,
      order_number: r.order_number,
      first_name: r.first_name,
      last_name: r.last_name,
      company_name: r.company_name,
      gstin: r.gstin,
      email: r.email,
      phone: r.phone,
      city: r.city,
      state: r.state,
      postal_code: r.postal_code,
      country: r.country,
      subtotal: Number(r.subtotal),
      discount_amount: Number(r.discount_amount || 0),
      coupon_code: r.coupon_code,
      shipping_fee: Number(r.shipping_fee || 0),
      total_amount: Number(r.total_amount),
      payment_method: r.payment_method,
      payment_status: r.payment_status,
      order_status: r.order_status,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at || r.created_at).toISOString(),
      item_count: Number(r.item_count || 0),
      item_preview: previewMap[r.id] || [],
    }));

    return { orders, stats };
  } catch (err) {
    console.error("Error fetching orders for admin:", err);
    return {
      orders: [],
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        pendingCount: 0,
        confirmedCount: 0,
        processingCount: 0,
        shippedCount: 0,
        deliveredCount: 0,
        cancelledCount: 0,
        todayOrders: 0,
        todayRevenue: 0,
      },
    };
  }
}

export async function getOrderDetailsAdminAction(orderId: number): Promise<PlacedOrder | null> {
  await requireAdmin();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE id = ? LIMIT 1`,
      [orderId]
    );

    if (!rows || rows.length === 0) return null;
    const r = rows[0];

    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [r.id]
    );

    const items = itemRows.map((it: RowDataPacket) => {
      let attrs = null;
      let custom = null;
      try {
        if (it.attributes_json) attrs = JSON.parse(it.attributes_json);
      } catch (e) {}
      try {
        if (it.custom_details_json) custom = JSON.parse(it.custom_details_json);
      } catch (e) {}

      return {
        id: it.id,
        product_id: it.product_id,
        variation_id: it.variation_id,
        product_name: it.product_name,
        product_slug: it.product_slug,
        product_image: it.product_image,
        sku: it.sku,
        price: Number(it.price),
        quantity: Number(it.quantity),
        total_price: Number(it.total_price),
        attributes: attrs,
        custom_details: custom,
      };
    });

    return {
      id: r.id,
      order_number: r.order_number,
      first_name: r.first_name,
      last_name: r.last_name,
      company_name: r.company_name,
      gstin: r.gstin,
      email: r.email,
      phone: r.phone,
      address_line1: r.address_line1,
      address_line2: r.address_line2,
      city: r.city,
      state: r.state,
      postal_code: r.postal_code,
      country: r.country,
      ship_to_different: Boolean(r.ship_to_different),
      shipping_first_name: r.shipping_first_name,
      shipping_last_name: r.shipping_last_name,
      shipping_address_line1: r.shipping_address_line1,
      shipping_address_line2: r.shipping_address_line2,
      shipping_city: r.shipping_city,
      shipping_state: r.shipping_state,
      shipping_postal_code: r.shipping_postal_code,
      shipping_country: r.shipping_country,
      order_notes: r.order_notes,
      subtotal: Number(r.subtotal),
      discount_amount: Number(r.discount_amount || 0),
      coupon_code: r.coupon_code,
      shipping_fee: Number(r.shipping_fee || 0),
      total_amount: Number(r.total_amount),
      payment_method: r.payment_method,
      payment_status: r.payment_status,
      order_status: r.order_status,
      created_at: new Date(r.created_at).toISOString(),
      items,
    };
  } catch (err) {
    console.error("Error fetching order details for admin:", err);
    return null;
  }
}

export async function updateOrderStatusAction(
  orderId: number,
  status: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return { success: false, error: `Invalid order status "${status}".` };
  }

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?`,
      [status, orderId]
    );

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error updating order status:", err);
    const msg = err instanceof Error ? err.message : "Database error updating order status.";
    return { success: false, error: msg };
  }
}

export async function updateOrderPaymentStatusAction(
  orderId: number,
  paymentStatus: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];
  if (!allowedPaymentStatuses.includes(paymentStatus)) {
    return { success: false, error: `Invalid payment status "${paymentStatus}".` };
  }

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?`,
      [paymentStatus, orderId]
    );

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error updating order payment status:", err);
    const msg = err instanceof Error ? err.message : "Database error updating payment status.";
    return { success: false, error: msg };
  }
}

export async function deleteOrderAction(orderId: number): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await pool.execute<ResultSetHeader>(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
    await pool.execute<ResultSetHeader>(`DELETE FROM orders WHERE id = ?`, [orderId]);

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error deleting order:", err);
    const msg = err instanceof Error ? err.message : "Database error deleting order.";
    return { success: false, error: msg };
  }
}
