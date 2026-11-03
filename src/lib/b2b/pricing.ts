import "server-only";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { PriceCalculationResult } from "@/types/b2b";

interface ProductPriceInfo {
  id: number;
  price: number | string;
  default_wholesale_price?: number | string | null;
  min_order_quantity?: number | null;
}

interface DealerContext {
  userId?: number;
  dealerId?: number;
  dealerStatus?: string;
  tierId?: number;
}

/**
 * Calculates the exact price for a product based on dealer status, tier, and quantity.
 * 
 * Strict resolution order:
 * 1. Product-specific dealer price (wholesale_prices WHERE product_id = ? AND dealer_id = ? AND min_quantity <= ?)
 * 2. Product-specific tier price (wholesale_prices WHERE product_id = ? AND tier_id = ? AND min_quantity <= ?)
 * 3. Tier % discount off retail price (dealer_tiers.discount_percent)
 * 4. Default product wholesale price (products.default_wholesale_price)
 * 5. Fallback to retail price (products.price)
 * 
 * SERVER-SIDE ONLY: Never exposes raw wholesale margins to untrusted contexts.
 */
export async function calculateWholesalePrice(
  product: ProductPriceInfo,
  dealer?: DealerContext | null,
  quantity: number = 1
): Promise<PriceCalculationResult> {
  const retailPrice = Number(product.price) || 0;
  const defaultMoq = product.min_order_quantity ? Number(product.min_order_quantity) : 1;

  // If no dealer or dealer is not approved, return normal retail price
  if (!dealer || dealer.dealerStatus !== "APPROVED") {
    return {
      finalPrice: retailPrice,
      retailPrice,
      discountPercent: 0,
      minQuantity: 1,
      ruleApplied: "RETAIL_FALLBACK",
      isWholesale: false,
    };
  }

  const effectiveMoq = defaultMoq;

  // 1. Check Product-Specific Dealer Price (Priority 1)
  if (dealer.dealerId) {
    const [dealerOverrideRows] = await pool.execute<RowDataPacket[]>(
      `SELECT wholesale_price, min_quantity 
       FROM wholesale_prices 
       WHERE product_id = ? AND dealer_id = ? AND is_active = 1 AND min_quantity <= ?
       ORDER BY min_quantity DESC, wholesale_price ASC 
       LIMIT 1`,
      [product.id, dealer.dealerId, quantity]
    );

    if (dealerOverrideRows && dealerOverrideRows.length > 0) {
      const wp = Number(dealerOverrideRows[0].wholesale_price);
      const discount = retailPrice > 0 ? Math.round(((retailPrice - wp) / retailPrice) * 100) : 0;
      return {
        finalPrice: wp,
        retailPrice,
        discountPercent: Math.max(0, discount),
        minQuantity: Math.max(effectiveMoq, dealerOverrideRows[0].min_quantity || 1),
        ruleApplied: "DEALER_OVERRIDE",
        isWholesale: true,
      };
    }
  }

  // 2. Check Product-Specific Tier Price (Priority 2)
  if (dealer.tierId) {
    const [tierOverrideRows] = await pool.execute<RowDataPacket[]>(
      `SELECT wholesale_price, min_quantity 
       FROM wholesale_prices 
       WHERE product_id = ? AND tier_id = ? AND is_active = 1 AND min_quantity <= ?
       ORDER BY min_quantity DESC, wholesale_price ASC 
       LIMIT 1`,
      [product.id, dealer.tierId, quantity]
    );

    if (tierOverrideRows && tierOverrideRows.length > 0) {
      const wp = Number(tierOverrideRows[0].wholesale_price);
      const discount = retailPrice > 0 ? Math.round(((retailPrice - wp) / retailPrice) * 100) : 0;
      return {
        finalPrice: wp,
        retailPrice,
        discountPercent: Math.max(0, discount),
        minQuantity: Math.max(effectiveMoq, tierOverrideRows[0].min_quantity || 1),
        ruleApplied: "TIER_PRODUCT_OVERRIDE",
        isWholesale: true,
      };
    }
  }

  // 3. Tier % Discount off Retail (Priority 3)
  if (dealer.tierId) {
    const [tierRows] = await pool.execute<RowDataPacket[]>(
      `SELECT discount_percent FROM dealer_tiers WHERE id = ? AND is_active = 1`,
      [dealer.tierId]
    );

    if (tierRows && tierRows.length > 0 && Number(tierRows[0].discount_percent) > 0) {
      const pct = Number(tierRows[0].discount_percent);
      const discounted = Math.round(retailPrice * (1 - pct / 100));
      return {
        finalPrice: discounted,
        retailPrice,
        discountPercent: pct,
        minQuantity: effectiveMoq,
        ruleApplied: "TIER_PERCENT_DISCOUNT",
        isWholesale: true,
      };
    }
  }

  // 4. Default Product Wholesale Price (Priority 4)
  if (product.default_wholesale_price && Number(product.default_wholesale_price) > 0) {
    const wp = Number(product.default_wholesale_price);
    const discount = retailPrice > 0 ? Math.round(((retailPrice - wp) / retailPrice) * 100) : 0;
    return {
      finalPrice: wp,
      retailPrice,
      discountPercent: Math.max(0, discount),
      minQuantity: effectiveMoq,
      ruleApplied: "DEFAULT_WHOLESALE",
      isWholesale: true,
    };
  }

  // 5. Fallback to retail price (Priority 5)
  return {
    finalPrice: retailPrice,
    retailPrice,
    discountPercent: 0,
    minQuantity: effectiveMoq,
    ruleApplied: "RETAIL_FALLBACK",
    isWholesale: true, // Dealer is approved, but product had no wholesale discount
  };
}
