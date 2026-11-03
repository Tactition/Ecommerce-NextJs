import mysql from "mysql2/promise";

export async function runB2BMigrations() {
  console.log("Starting B2B Database Migrations (additive & backward-compatible)...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
  });

  const queries = [
    // 1. Dealer Tiers (e.g. Tier A, Tier B, Tier C with default discount percentages)
    `CREATE TABLE IF NOT EXISTS dealer_tiers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      discount_percent DECIMAL(5, 2) DEFAULT 0.00,
      description TEXT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 2. Dealer Profiles linked to users table
    `CREATE TABLE IF NOT EXISTS dealer_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      business_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255) NOT NULL,
      business_phone VARCHAR(50) NOT NULL,
      business_email VARCHAR(255) NOT NULL,
      tax_number VARCHAR(100) NOT NULL,
      business_type VARCHAR(100) DEFAULT 'retailer',
      business_address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      document_url VARCHAR(500) NULL,
      status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
      tier_id INT NULL,
      rejection_reason TEXT NULL,
      internal_notes TEXT NULL,
      allow_credit_terms TINYINT(1) DEFAULT 0,
      credit_limit DECIMAL(12, 2) DEFAULT 0.00,
      credit_days INT DEFAULT 30,
      approved_at TIMESTAMP NULL,
      approved_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_dealer_status (status),
      INDEX idx_dealer_tier (tier_id),
      CONSTRAINT fk_dealer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_dealer_tier FOREIGN KEY (tier_id) REFERENCES dealer_tiers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 3. Wholesale Prices (per-product, optional tier, optional dealer override, MOQ, price breaks)
    `CREATE TABLE IF NOT EXISTS wholesale_prices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      variation_id INT NULL,
      tier_id INT NULL,
      dealer_id INT NULL,
      wholesale_price DECIMAL(10, 2) NOT NULL,
      min_quantity INT DEFAULT 1,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_wp_product (product_id),
      INDEX idx_wp_variation (variation_id),
      INDEX idx_wp_tier (tier_id),
      INDEX idx_wp_dealer (dealer_id),
      INDEX idx_wp_lookup (product_id, tier_id, dealer_id, min_quantity),
      CONSTRAINT fk_wp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_wp_tier FOREIGN KEY (tier_id) REFERENCES dealer_tiers(id) ON DELETE CASCADE,
      CONSTRAINT fk_wp_dealer FOREIGN KEY (dealer_id) REFERENCES dealer_profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 4. Dealer Multiple Shipping Addresses
    `CREATE TABLE IF NOT EXISTS dealer_addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dealer_id INT NOT NULL,
      label VARCHAR(100) DEFAULT 'Warehouse / Site',
      recipient_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255) NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      is_default TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_dealer_addr (dealer_id),
      CONSTRAINT fk_addr_dealer FOREIGN KEY (dealer_id) REFERENCES dealer_profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 5. B2B Audit Logs (tracking admin actions, status changes, sensitive field edits)
    `CREATE TABLE IF NOT EXISTS b2b_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      actor_id INT NULL,
      actor_email VARCHAR(255) NULL,
      target_type VARCHAR(50) NOT NULL,
      target_id INT NOT NULL,
      details JSON NULL,
      ip_address VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_target (target_type, target_id),
      INDEX idx_audit_action (action)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const q of queries) {
    await connection.query(q);
  }

  // 6. Additive modifications to orders table for B2B snapshot
  try {
    const [cols] = await connection.query<any[]>("SHOW COLUMNS FROM orders LIKE 'is_b2b'");
    if (cols.length === 0) {
      await connection.query(`ALTER TABLE orders 
        ADD COLUMN is_b2b TINYINT(1) DEFAULT 0 AFTER user_id,
        ADD COLUMN dealer_id INT NULL AFTER is_b2b,
        ADD COLUMN invoice_terms VARCHAR(100) NULL AFTER payment_method,
        ADD COLUMN purchase_order_number VARCHAR(100) NULL AFTER invoice_terms,
        ADD INDEX idx_orders_b2b (is_b2b),
        ADD INDEX idx_orders_dealer (dealer_id);`);
      console.log("Added B2B columns to orders table.");
    }
  } catch (e: any) {
    console.log("Notice on orders B2B columns:", e.message);
  }

  // 7. Add default_wholesale_price & moq to products table if missing
  try {
    const [cols] = await connection.query<any[]>("SHOW COLUMNS FROM products LIKE 'default_wholesale_price'");
    if (cols.length === 0) {
      await connection.query(`ALTER TABLE products 
        ADD COLUMN default_wholesale_price DECIMAL(10, 2) NULL AFTER price,
        ADD COLUMN min_order_quantity INT DEFAULT 1 AFTER stock;`);
      console.log("Added default_wholesale_price and min_order_quantity to products table.");
    }
  } catch (e: any) {
    console.log("Notice on products wholesale columns:", e.message);
  }

  await connection.end();
  console.log("B2B Database Migrations completed successfully!");
}

if (require.main === module) {
  runB2BMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
