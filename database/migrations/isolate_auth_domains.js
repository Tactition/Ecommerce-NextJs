const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function runMigration() {
  console.log('--- Starting Authentication Isolation Migration ---');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3308,
    user: 'root',
    password: '',
    database: 'ecommerce',
  });

  try {
    // 1. BACKUP EXISTING TABLES FIRST
    console.log('1. Backing up existing users and dealer_profiles tables...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users_backup_pre_isolation AS SELECT * FROM users;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS dealer_profiles_backup_pre_isolation AS SELECT * FROM dealer_profiles;
    `);
    console.log('✓ Backups created safely.');

    // 2. CREATE CUSTOMERS TABLE
    console.log('2. Creating isolated `customers` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NULL,
        address_line1 VARCHAR(255) NULL,
        address_line2 VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        postal_code VARCHAR(20) NULL,
        country VARCHAR(100) DEFAULT 'India',
        is_active TINYINT(1) DEFAULT 1,
        email_verified TINYINT(1) DEFAULT 0,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customers_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ `customers` table ready.');

    // 3. CREATE ADMIN_USERS TABLE
    console.log('3. Creating isolated `admin_users` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('superadmin', 'manager', 'editor', 'support') NOT NULL DEFAULT 'editor',
        permissions JSON NULL,
        is_active TINYINT(1) DEFAULT 1,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admin_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ `admin_users` table ready.');

    // 4. CREATE DEALERS TABLE
    console.log('4. Creating isolated `dealers` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS dealers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(200) NOT NULL,
        contact_name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        phone VARCHAR(30) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        gst_number VARCHAR(50) NOT NULL UNIQUE,
        business_type ENUM('retailer', 'contractor', 'designer', 'wholesaler', 'other') DEFAULT 'retailer',
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        approval_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
        rejection_reason TEXT NULL,
        allow_credit_terms TINYINT(1) DEFAULT 0,
        credit_limit DECIMAL(12,2) DEFAULT 0.00,
        credit_days INT DEFAULT 0,
        tier_id INT NULL,
        is_active TINYINT(1) DEFAULT 1,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_dealers_email (email),
        INDEX idx_dealers_status (approval_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ `dealers` table ready.');

    // 5. MIGRATE EXISTING CUSTOMERS FROM users
    console.log('5. Migrating existing customers...');
    const [existingCustomers] = await conn.query(`
      SELECT * FROM users WHERE role = 'customer'
    `);
    for (const cust of existingCustomers) {
      await conn.query(`
        INSERT INTO customers (id, name, email, password_hash, phone, address_line1, city, state, postal_code, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)
      `, [
        cust.id, cust.name, cust.email, cust.password_hash, cust.phone,
        cust.address_line1, cust.city, cust.state, cust.postal_code, cust.created_at
      ]);
    }
    console.log(`✓ Migrated ${existingCustomers.length} existing customers.`);

    // 6. MIGRATE EXISTING ADMINS / EDITORS FROM users
    console.log('6. Migrating existing staff/admins...');
    const [existingStaff] = await conn.query(`
      SELECT * FROM users WHERE role IN ('admin', 'editor', 'manager')
    `);
    for (const staff of existingStaff) {
      const targetRole = staff.role === 'admin' ? 'superadmin' : (staff.role || 'editor');
      const perms = targetRole === 'superadmin' ? JSON.stringify(["*"]) : JSON.stringify(["products:*", "orders:view", "content:*"]);
      await conn.query(`
        INSERT INTO admin_users (id, name, email, password_hash, role, permissions, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE role = VALUES(role), permissions = VALUES(permissions)
      `, [
        staff.id, staff.name, staff.email, staff.password_hash, targetRole, perms, staff.created_at
      ]);
    }
    console.log(`✓ Migrated ${existingStaff.length} existing staff members.`);

    // 7. MIGRATE EXISTING DEALERS FROM users + dealer_profiles
    console.log('7. Migrating existing dealers...');
    const [existingDealers] = await conn.query(`
      SELECT dp.*, u.password_hash, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM dealer_profiles dp
      JOIN users u ON u.id = dp.user_id
    `);
    for (const d of existingDealers) {
      await conn.query(`
        INSERT INTO dealers (
          id, company_name, contact_name, email, phone, password_hash, gst_number,
          business_type, address, city, state, postal_code, country, approval_status,
          rejection_reason, allow_credit_terms, credit_limit, credit_days, tier_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          company_name = VALUES(company_name),
          approval_status = VALUES(approval_status),
          tier_id = VALUES(tier_id)
      `, [
        d.id, // Keeps exact dealer_profiles.id for orders & address FKs
        d.business_name,
        d.contact_person || d.user_name,
        d.business_email || d.user_email,
        d.business_phone || d.user_phone,
        d.password_hash,
        d.tax_number,
        d.business_type || 'retailer',
        d.business_address || 'Main Road',
        d.city || 'Srinagar',
        d.state || 'Jammu & Kashmir',
        d.postal_code || '190001',
        d.country || 'India',
        d.status || 'PENDING',
        d.rejection_reason || null,
        d.allow_credit_terms || 0,
        d.credit_limit || 0,
        d.credit_days || 0,
        d.tier_id || null,
        d.created_at
      ]);
    }
    console.log(`✓ Migrated ${existingDealers.length} existing dealers.`);

    // 8. SEED REQUESTED DEMO ACCOUNTS
    console.log('8. Seeding standard testing demo accounts...');
    const customerPw = await bcrypt.hash('Customer123!', 10);
    const adminPw = await bcrypt.hash('Admin123!', 10);
    const dealerPw = await bcrypt.hash('Dealer123!', 10);

    // 8a. Demo Customer: customer@example.com / Customer123!
    await conn.query(`
      INSERT INTO customers (name, email, password_hash, phone, address_line1, city, state, postal_code)
      VALUES ('Demo Customer', 'customer@example.com', ?, '+91 98765 00001', 'Flat 4A, Green Park', 'New Delhi', 'Delhi', '110016')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)
    `, [customerPw]);

    // 8b. Demo Admin: admin@example.com / Admin123! (superadmin)
    await conn.query(`
      INSERT INTO admin_users (name, email, password_hash, role, permissions)
      VALUES ('Super Admin', 'admin@example.com', ?, 'superadmin', JSON_ARRAY('*'))
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), permissions = VALUES(permissions)
    `, [adminPw]);

    // 8c. Demo Approved Dealer: dealer@example.com / Dealer123!
    const [bronzeTier] = await conn.query(`SELECT id FROM dealer_tiers ORDER BY discount_percent ASC LIMIT 1`);
    const tierId = bronzeTier.length > 0 ? bronzeTier[0].id : null;
    await conn.query(`
      INSERT INTO dealers (
        company_name, contact_name, email, phone, password_hash, gst_number,
        business_type, address, city, state, postal_code, approval_status,
        allow_credit_terms, credit_limit, credit_days, tier_id
      ) VALUES (
        'Prime Trade & Blinds Ltd', 'Approved Dealer Partner', 'dealer@example.com',
        '+91 98765 00002', ?, '07AAAAA9999A1Z9', 'wholesaler',
        'Plot 12, Industrial Area Ph 2', 'Srinagar', 'Jammu & Kashmir', '190005',
        'APPROVED', 1, 500000.00, 30, ?
      )
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), approval_status = 'APPROVED'
    `, [dealerPw, tierId]);

    // 8d. Demo Pending Dealer: pending@example.com / Dealer123!
    await conn.query(`
      INSERT INTO dealers (
        company_name, contact_name, email, phone, password_hash, gst_number,
        business_type, address, city, state, postal_code, approval_status,
        allow_credit_terms, credit_limit, credit_days, tier_id
      ) VALUES (
        'Sunrise Furnishings', 'Pending Verification Partner', 'pending@example.com',
        '+91 98765 00003', ?, '07BBBBB8888B2Z8', 'contractor',
        'Unit 3, Trade Center', 'Srinagar', 'Jammu & Kashmir', '190001',
        'PENDING', 0, 0.00, 0, ?
      )
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), approval_status = 'PENDING'
    `, [dealerPw, tierId]);

    console.log('✓ Demo accounts seeded successfully:');
    console.log('  - Customer: customer@example.com / Customer123!');
    console.log('  - Admin:    admin@example.com    / Admin123! (superadmin)');
    console.log('  - Dealer:   dealer@example.com   / Dealer123! (APPROVED)');
    console.log('  - Pending:  pending@example.com  / Dealer123! (PENDING gate)');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('Migration failed with error:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

runMigration().catch((e) => {
  console.error(e);
  process.exit(1);
});

