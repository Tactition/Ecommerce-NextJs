"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getDealerSession } from "@/lib/auth/dealer";
import { calculateWholesalePrice } from "@/lib/b2b/pricing";

export interface RepricedCartItem {
  id: string;
  productId: number;
  variationId?: number | null;
  name: string;
  originalPrice: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  moq: number;
  moqSatisfied: boolean;
  isWholesale: boolean;
  ruleApplied: string;
}

export interface CartRepriceResponse {
  isDealer: boolean;
  dealerStatus?: string;
  tierName?: string;
  allowCreditTerms: boolean;
  creditLimit: number;
  creditDays: number;
  items: RepricedCartItem[];
  subtotal: number;
  hasMoqViolations: boolean;
}

/**
 * Validates and reprices a cart strictly on the server based on the user's dealer status.
 * Prevents client-side tampering of prices or bypassing of MOQs.
 */
export async function repriceCartServer(cartItems: { productId: number; quantity: number; id: string }[]): Promise<CartRepriceResponse> {
  const dealerSession = await getDealerSession();

  let isDealer = false;
  let dealerProfile: any = null;
  let tierName = "";

  if (dealerSession && dealerSession.approvalStatus === "APPROVED") {
    isDealer = true;
    const [dealers] = await pool.execute<RowDataPacket[]>(
      `SELECT d.*, dt.name as tier_name 
       FROM dealers d 
       LEFT JOIN dealer_tiers dt ON dt.id = d.tier_id 
       WHERE d.id = ?`,
      [dealerSession.dealerId]
    );
    if (dealers && dealers.length > 0) {
      dealerProfile = dealers[0];
      tierName = dealerProfile.tier_name || "";
    }
  }

  const repricedItems: RepricedCartItem[] = [];
  let subtotal = 0;
  let hasMoqViolations = false;

  for (const item of cartItems) {
    const [prodRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, price, default_wholesale_price, min_order_quantity FROM products WHERE id = ?`,
      [item.productId]
    );

    if (!prodRows || prodRows.length === 0) continue;

    const prod = prodRows[0];
    const qty = Math.max(1, item.quantity);

    // Call server-side pricing engine
    const priceResult = await calculateWholesalePrice(
      prod as any,
      dealerProfile ? {
        dealerId: dealerProfile.id,
        dealerStatus: dealerProfile.approval_status || dealerProfile.status,
        tierId: dealerProfile.tier_id,
      } : null,
      qty
    );

    const moq = priceResult.minQuantity;
    const moqSatisfied = isDealer ? qty >= moq : true;
    if (!moqSatisfied) hasMoqViolations = true;

    const finalUnit = priceResult.finalPrice;
    const lineTotal = finalUnit * qty;
    subtotal += lineTotal;

    repricedItems.push({
      id: item.id,
      productId: prod.id,
      name: prod.name,
      originalPrice: priceResult.retailPrice,
      unitPrice: finalUnit,
      quantity: qty,
      totalPrice: lineTotal,
      moq,
      moqSatisfied,
      isWholesale: priceResult.isWholesale,
      ruleApplied: priceResult.ruleApplied,
    });
  }

  return {
    isDealer,
    dealerStatus: dealerProfile?.status,
    tierName,
    allowCreditTerms: Boolean(dealerProfile?.allow_credit_terms),
    creditLimit: Number(dealerProfile?.credit_limit || 0),
    creditDays: Number(dealerProfile?.credit_days || 0),
    items: repricedItems,
    subtotal,
    hasMoqViolations,
  };
}
