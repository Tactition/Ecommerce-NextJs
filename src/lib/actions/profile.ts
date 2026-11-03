"use server";

import pool from "@/lib/db";
import { getCustomerSession, createCustomerSession } from "@/lib/auth/customer";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
}

export interface UserOrderItem {
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
}

export interface UserOrder {
  id: number;
  order_number: string;
  created_at: string;
  updated_at?: string;
  order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  payment_status: "pending" | "paid" | "failed" | "refunded" | string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total_amount: number;
  first_name: string;
  last_name: string;
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
  items: UserOrderItem[];
}

export interface UserProfileStats {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
  completedOrders: number;
}

/**
 * Fetch profile data for the authenticated customer
 */
export async function getUserProfileAction(): Promise<{
  profile: UserProfileData | null;
  error?: string;
}> {
  try {
    const session = await getCustomerSession();
    if (!session || !session.customerId) {
      return { profile: null, error: "Please sign in to view your profile." };
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, created_at, address_line1, city, state, postal_code 
       FROM customers WHERE id = ? LIMIT 1`,
      [session.customerId]
    );

    if (!rows || rows.length === 0) {
      return { profile: null, error: "Customer account not found." };
    }

    const u = rows[0];
    const profile: UserProfileData = {
      id: Number(u.id),
      name: String(u.name || ""),
      email: String(u.email || ""),
      phone: u.phone ? String(u.phone) : null,
      role: "customer",
      created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      address_line1: u.address_line1 ? String(u.address_line1) : null,
      city: u.city ? String(u.city) : null,
      state: u.state ? String(u.state) : null,
      postal_code: u.postal_code ? String(u.postal_code) : null,
    };

    // If profile has no address, check if customer has placed an order previously
    if (!profile.address_line1) {
      const [lastOrders] = await pool.query<RowDataPacket[]>(
        `SELECT address_line1, city, state, postal_code, phone 
         FROM orders 
         WHERE user_id = ? OR LOWER(email) = LOWER(?) 
         ORDER BY id DESC LIMIT 1`,
        [session.customerId, session.email]
      );

      if (lastOrders && lastOrders.length > 0) {
        profile.address_line1 = lastOrders[0].address_line1 || null;
        profile.city = lastOrders[0].city || null;
        profile.state = lastOrders[0].state || null;
        profile.postal_code = lastOrders[0].postal_code || null;
        if (!profile.phone && lastOrders[0].phone) {
          profile.phone = lastOrders[0].phone;
        }
      }
    }

    return { profile };
  } catch (err: unknown) {
    console.error("Error in getUserProfileAction:", err);
    return { profile: null, error: "Database error fetching profile." };
  }
}

/**
 * Fetch all orders and stats for the authenticated customer
 */
export async function getUserOrdersAction(): Promise<{
  orders: UserOrder[];
  stats: UserProfileStats;
  error?: string;
}> {
  try {
    const session = await getCustomerSession();
    if (!session || !session.customerId) {
      return {
        orders: [],
        stats: { totalOrders: 0, totalSpent: 0, activeOrders: 0, completedOrders: 0 },
        error: "Please sign in to view your orders.",
      };
    }

    // 1. Fetch user orders
    const [orderRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM orders 
       WHERE user_id = ? OR LOWER(email) = LOWER(?)
       ORDER BY id DESC`,
      [session.customerId, session.email]
    );

    if (!orderRows || orderRows.length === 0) {
      return {
        orders: [],
        stats: { totalOrders: 0, totalSpent: 0, activeOrders: 0, completedOrders: 0 },
      };
    }

    const orderIds = orderRows.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(",");

    // 2. Fetch items for all these orders in 1 query
    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM order_items 
       WHERE order_id IN (${placeholders}) 
       ORDER BY id ASC`,
      orderIds
    );

    const itemsMap: Record<number, UserOrderItem[]> = {};
    for (const it of itemRows) {
      let attrs = null;
      let custom = null;
      try {
        if (it.attributes_json) attrs = JSON.parse(it.attributes_json);
      } catch (_) {}
      try {
        if (it.custom_details_json) custom = JSON.parse(it.custom_details_json);
      } catch (_) {}

      const item: UserOrderItem = {
        id: Number(it.id),
        product_id: Number(it.product_id),
        variation_id: it.variation_id ? Number(it.variation_id) : null,
        product_name: String(it.product_name),
        product_slug: String(it.product_slug),
        product_image: it.product_image ? String(it.product_image) : null,
        sku: it.sku ? String(it.sku) : null,
        price: Number(it.price),
        quantity: Number(it.quantity),
        total_price: Number(it.total_price),
        attributes: attrs,
        custom_details: custom,
      };

      if (!itemsMap[it.order_id]) {
        itemsMap[it.order_id] = [];
      }
      itemsMap[it.order_id].push(item);
    }

    let totalSpent = 0;
    let activeOrders = 0;
    let completedOrders = 0;

    const orders: UserOrder[] = orderRows.map((r) => {
      const totalAmount = Number(r.total_amount || 0);
      const status = String(r.order_status || "pending").toLowerCase();

      if (status !== "cancelled") {
        totalSpent += totalAmount;
      }
      if (status === "delivered") {
        completedOrders += 1;
      } else if (status !== "cancelled") {
        activeOrders += 1;
      }

      return {
        id: Number(r.id),
        order_number: String(r.order_number),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
        order_status: r.order_status,
        payment_status: r.payment_status,
        payment_method: r.payment_method,
        subtotal: Number(r.subtotal || 0),
        discount_amount: Number(r.discount_amount || 0),
        coupon_code: r.coupon_code ? String(r.coupon_code) : null,
        shipping_fee: Number(r.shipping_fee || 0),
        total_amount: totalAmount,
        first_name: String(r.first_name || ""),
        last_name: String(r.last_name || ""),
        email: String(r.email || ""),
        phone: String(r.phone || ""),
        address_line1: String(r.address_line1 || ""),
        address_line2: r.address_line2 ? String(r.address_line2) : null,
        city: String(r.city || ""),
        state: String(r.state || ""),
        postal_code: String(r.postal_code || ""),
        country: String(r.country || "India"),
        ship_to_different: Boolean(r.ship_to_different),
        shipping_first_name: r.shipping_first_name ? String(r.shipping_first_name) : null,
        shipping_last_name: r.shipping_last_name ? String(r.shipping_last_name) : null,
        shipping_address_line1: r.shipping_address_line1 ? String(r.shipping_address_line1) : null,
        shipping_address_line2: r.shipping_address_line2 ? String(r.shipping_address_line2) : null,
        shipping_city: r.shipping_city ? String(r.shipping_city) : null,
        shipping_state: r.shipping_state ? String(r.shipping_state) : null,
        shipping_postal_code: r.shipping_postal_code ? String(r.shipping_postal_code) : null,
        shipping_country: r.shipping_country ? String(r.shipping_country) : null,
        order_notes: r.order_notes ? String(r.order_notes) : null,
        items: itemsMap[r.id] || [],
      };
    });

    return {
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent,
        activeOrders,
        completedOrders,
      },
    };
  } catch (err: unknown) {
    console.error("Error in getUserOrdersAction:", err);
    return {
      orders: [],
      stats: { totalOrders: 0, totalSpent: 0, activeOrders: 0, completedOrders: 0 },
      error: "Database error fetching order history.",
    };
  }
}

/**
 * Update customer profile details
 */
export async function updateUserProfileAction(data: {
  name: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await getCustomerSession();
    if (!session || !session.customerId) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const cleanName = data.name.trim();
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }

    const cleanPhone = data.phone ? data.phone.trim() : null;
    const cleanAddress = data.addressLine1 ? data.addressLine1.trim() : null;
    const cleanCity = data.city ? data.city.trim() : null;
    const cleanState = data.state ? data.state.trim() : null;
    const cleanPostal = data.postalCode ? data.postalCode.trim() : null;

    await pool.execute<ResultSetHeader>(
      `UPDATE customers 
       SET name = ?, phone = ?, address_line1 = ?, city = ?, state = ?, postal_code = ? 
       WHERE id = ?`,
      [cleanName, cleanPhone, cleanAddress, cleanCity, cleanState, cleanPostal, session.customerId]
    );

    // Refresh customer session cookie if name changed
    if (cleanName !== session.name) {
      await createCustomerSession({
        id: session.customerId,
        email: session.email,
        name: cleanName,
        phone: cleanPhone || session.phone,
      });
    }

    revalidatePath("/profile");
    revalidatePath("/account");
    return { success: true, message: "Profile updated successfully." };
  } catch (err: unknown) {
    console.error("Error in updateUserProfileAction:", err);
    return { success: false, error: "Failed to update profile details. Please try again." };
  }
}

/**
 * Change customer account password
 */
export async function changeUserPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await getCustomerSession();
    if (!session || !session.customerId) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!data.currentPassword) {
      return { success: false, error: "Please provide your current password." };
    }
    if (!data.newPassword || data.newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }
    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT password_hash FROM customers WHERE id = ? LIMIT 1`,
      [session.customerId]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: "Account not found." };
    }

    const currentHash = rows[0].password_hash;
    const isCurrentValid = await bcrypt.compare(data.currentPassword, currentHash);
    if (!isCurrentValid) {
      return { success: false, error: "The current password you entered is incorrect." };
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await pool.execute<ResultSetHeader>(
      `UPDATE customers SET password_hash = ? WHERE id = ?`,
      [newHash, session.customerId]
    );

    return { success: true, message: "Your password has been changed securely." };
  } catch (err: unknown) {
    console.error("Error in changeUserPasswordAction:", err);
    return { success: false, error: "Failed to update password. Please try again." };
  }
}

/**
 * Customer order cancellation request (only if pending or confirmed)
 */
export async function cancelUserOrderAction(
  orderId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCustomerSession();
    if (!session || !session.customerId) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, order_status, order_notes, user_id, email 
       FROM orders WHERE id = ? LIMIT 1`,
      [orderId]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: "Order not found." };
    }

    const order = rows[0];
    const isOwner =
      order.user_id === session.customerId ||
      (order.email && order.email.toLowerCase() === session.email.toLowerCase());

    if (!isOwner) {
      return { success: false, error: "Forbidden: You do not own this order." };
    }

    const status = String(order.order_status).toLowerCase();
    if (status !== "pending" && status !== "confirmed") {
      return {
        success: false,
        error: `Order cannot be cancelled as it is already ${order.order_status}. Please contact our support team.`,
      };
    }

    const cancellationNote = `[Cancelled by customer on ${new Date().toLocaleDateString()}${
      reason ? `: ${reason}` : ""
    }]`;
    const updatedNotes = order.order_notes
      ? `${order.order_notes}\n${cancellationNote}`
      : cancellationNote;

    await pool.execute<ResultSetHeader>(
      `UPDATE orders SET order_status = 'cancelled', order_notes = ?, updated_at = NOW() WHERE id = ?`,
      [updatedNotes, orderId]
    );

    revalidatePath("/profile");
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in cancelUserOrderAction:", err);
    return { success: false, error: "Failed to cancel order." };
  }
}
