const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('--- Seeding Authentication Demo Accounts ---');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3308,
    user: 'root',
    password: '',
    database: 'ecommerce',
  });

  try {
    const customerPw = await bcrypt.hash('Customer123!', 10);
    const adminPw = await bcrypt.hash('Admin123!', 10);
    const dealerPw = await bcrypt.hash('Dealer123!', 10);

    // 1. Customer
    await conn.query(`
      INSERT INTO customers (name, email, password_hash, phone, address_line1, city, state, postal_code)
      VALUES ('Demo Customer', 'customer@example.com', ?, '+91 98765 00001', 'Flat 4A, Green Park', 'New Delhi', 'Delhi', '110016')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)
    `, [customerPw]);

    // 2. Admin (superadmin)
    await conn.query(`
      INSERT INTO admin_users (name, email, password_hash, role, permissions)
      VALUES ('Super Admin', 'admin@example.com', ?, 'superadmin', JSON_ARRAY('*'))
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), permissions = VALUES(permissions)
    `, [adminPw]);

    // 3. Approved Dealer
    const [tiers] = await conn.query(`SELECT id FROM dealer_tiers ORDER BY discount_percent ASC LIMIT 1`);
    const tierId = tiers.length > 0 ? tiers[0].id : null;
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

    // 4. Pending Dealer
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

    console.log('✓ Seeding complete:');
    console.log('  Customer: customer@example.com / Customer123!');
    console.log('  Admin:    admin@example.com    / Admin123! (superadmin)');
    console.log('  Dealer:   dealer@example.com   / Dealer123! (APPROVED)');
    console.log('  Pending:  pending@example.com  / Dealer123! (PENDING)');
  } finally {
    await conn.end();
  }
}

seed().catch(console.error);

