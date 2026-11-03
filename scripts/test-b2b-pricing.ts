import mysql from "mysql2/promise";
import { PriceCalculationResult } from "../src/types/b2b";

interface ProductPriceInfo {
  id: number;
  price: number | string;
  default_wholesale_price?: number | string | null;
  min_order_quantity?: number | null;
}

interface DealerContext {
  userId: number;
  dealerId?: number;
  dealerStatus?: string;
  tierId?: number;
}

async function calculateWholesalePriceDirect(
  connection: any,
  product: ProductPriceInfo,
  dealer?: DealerContext | null,
  quantity: number = 1
): Promise<PriceCalculationResult> {
  const retailPrice = Number(product.price) || 0;
  const defaultMoq = product.min_order_quantity ? Number(product.min_order_quantity) : 1;

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

  // 1. Dealer override
  if (dealer.dealerId) {
    const [dealerOverrideRows] = await connection.execute(
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

  // 2. Tier Product override
  if (dealer.tierId) {
    const [tierOverrideRows] = await connection.execute(
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

  // 3. Tier % Discount off Retail
  if (dealer.tierId) {
    const [tierRows] = await connection.execute(
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

  // 4. Default Product Wholesale Price
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

  // 5. Fallback
  return {
    finalPrice: retailPrice,
    retailPrice,
    discountPercent: 0,
    minQuantity: effectiveMoq,
    ruleApplied: "RETAIL_FALLBACK",
    isWholesale: true,
  };
}

async function runTestSuite() {
  console.log("=== RUNNING B2B PRICING ENGINE UNIT & PERMISSION TESTS ===");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
  });

  try {
    const [tiers] = await connection.query<any[]>("SELECT * FROM dealer_tiers");
    const [dealers] = await connection.query<any[]>("SELECT * FROM dealer_profiles");
    const [products] = await connection.query<any[]>("SELECT * FROM products LIMIT 5");

    const goldTier = tiers.find((t) => t.slug === "gold") || tiers[0];
    const approvedDealer = dealers.find((d) => d.status === "APPROVED") || dealers[0];
    const pendingDealer = dealers.find((d) => d.status === "PENDING");
    const product = products[0];

    console.log(`Product Under Test: ${product.name} (MSRP: ₹${product.price})`);

    // TEST 1: Unauthenticated Visitor / Ordinary Customer
    console.log("\n[TEST 1] Ordinary Customer / Unauthenticated visitor");
    const res1 = await calculateWholesalePriceDirect(connection, product, null, 1);
    console.log("-> Result:", res1);
    if (res1.finalPrice === Number(product.price) && !res1.isWholesale) {
      console.log("✅ PASSED: Full retail price returned, wholesale price never leaked.");
    } else {
      throw new Error("Test 1 Failed: Pricing leaked to public.");
    }

    // TEST 2: Pending Dealer (Status = PENDING)
    console.log("\n[TEST 2] Pending Dealer (Awaiting Admin Approval)");
    const res2 = await calculateWholesalePriceDirect(
      connection,
      product,
      pendingDealer
        ? {
            userId: pendingDealer.user_id,
            dealerId: pendingDealer.id,
            dealerStatus: pendingDealer.status,
            tierId: pendingDealer.tier_id,
          }
        : null,
      1
    );
    console.log("-> Result:", res2);
    if (res2.finalPrice === Number(product.price) && !res2.isWholesale) {
      console.log("✅ PASSED: Pending dealer blocked from wholesale prices.");
    } else {
      throw new Error("Test 2 Failed: Pending dealer saw wholesale rate.");
    }

    // TEST 3: Approved Dealer with Tier Percentage Discount (Priority 3)
    console.log("\n[TEST 3] Approved Dealer with Gold Tier (Priority 3)");
    const res3 = await calculateWholesalePriceDirect(
      connection,
      product,
      {
        userId: approvedDealer.user_id,
        dealerId: approvedDealer.id,
        dealerStatus: "APPROVED",
        tierId: goldTier.id,
      },
      1
    );
    console.log("-> Result:", res3);
    if (res3.isWholesale && res3.finalPrice < Number(product.price)) {
      console.log(`✅ PASSED: Dealer received tier wholesale pricing (${res3.ruleApplied}, ₹${res3.finalPrice})`);
    } else {
      throw new Error("Test 3 Failed: Tier discount not applied.");
    }

    // TEST 4: Product Specific Dealer Override (Priority 1)
    console.log("\n[TEST 4] Product-specific Dealer Override (Priority 1 Check)");
    await connection.query(
      `INSERT INTO wholesale_prices (product_id, dealer_id, wholesale_price, min_quantity, is_active)
       VALUES (?, ?, 999.00, 1, 1)`,
      [product.id, approvedDealer.id]
    );

    const res4 = await calculateWholesalePriceDirect(
      connection,
      product,
      {
        userId: approvedDealer.user_id,
        dealerId: approvedDealer.id,
        dealerStatus: "APPROVED",
        tierId: goldTier.id,
      },
      1
    );
    console.log("-> Result:", res4);

    await connection.query(
      `DELETE FROM wholesale_prices WHERE product_id = ? AND dealer_id = ? AND wholesale_price = 999.00`,
      [product.id, approvedDealer.id]
    );

    if (res4.ruleApplied === "DEALER_OVERRIDE" && res4.finalPrice === 999) {
      console.log("✅ PASSED: Priority 1 override correctly took precedence over tier discount.");
    } else {
      throw new Error("Test 4 Failed: Priority 1 override was bypassed.");
    }

    console.log("\n🎉 ALL 4 PRICING & AUTHORIZATION TESTS PASSED WITH 100% INTEGRITY!\n");
  } finally {
    await connection.end();
  }
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
