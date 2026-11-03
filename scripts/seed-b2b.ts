import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seedB2B() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3308', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce',
  });

  try {
    console.log('--- Starting B2B Seeding ---');

    // 1. Seed Dealer Tiers
    console.log('Seeding Dealer Tiers...');
    const [tierRows] = await connection.query('SELECT COUNT(*) as cnt FROM dealer_tiers') as any;
    if (tierRows[0].cnt === 0) {
      await connection.query(`
        INSERT INTO dealer_tiers (name, slug, discount_percent, description)
        VALUES 
          ('Gold Dealer', 'gold', 20.00, 'Top volume dealers with 20% default discount and 30-day net terms'),
          ('Silver Dealer', 'silver', 15.00, 'High volume dealers with 15% default discount and 15-day net terms'),
          ('Bronze Dealer', 'bronze', 10.00, 'Standard registered dealers with 10% default discount')
      `);
      console.log('Created 3 dealer tiers.');
    } else {
      console.log('Dealer tiers already exist, skipping.');
    }

    const [tiers] = await connection.query('SELECT id, slug FROM dealer_tiers') as any;
    const tierMap: Record<string, number> = {};
    for (const t of tiers) {
      tierMap[t.slug] = t.id;
    }

    // 2. Seed Sample Users & Dealer Profiles
    console.log('Seeding Dealer Users...');
    const hashedPassword = await bcrypt.hash('dealer123', 10);

    const dealersToSeed = [
      {
        email: 'approved_dealer@wallstreet.com',
        name: 'Kashmir Decorators (Farooq)',
        business_name: 'Kashmir Decorators & Co.',
        tax_number: '01AAAAA0000A1Z5',
        phone: '+91 9419012345',
        business_type: 'contractor',
        status: 'APPROVED',
        tier_id: tierMap['gold'],
        allow_credit_terms: 1,
        credit_limit: 500000,
        credit_days: 30
      },
      {
        email: 'silver_dealer@wallstreet.com',
        name: 'Valley Interiors (Altaf)',
        business_name: 'Valley Luxury Interiors LLP',
        tax_number: '01BBBBB1111B2Z6',
        phone: '+91 9419054321',
        business_type: 'retailer',
        status: 'APPROVED',
        tier_id: tierMap['silver'],
        allow_credit_terms: 1,
        credit_limit: 250000,
        credit_days: 15
      },
      {
        email: 'pending_dealer@wallstreet.com',
        name: 'Chinar Woodcrafts (Bilal)',
        business_name: 'Chinar Woodcrafts & Designs',
        tax_number: '01CCCCC2222C3Z7',
        phone: '+91 9906011223',
        business_type: 'designer',
        status: 'PENDING',
        tier_id: tierMap['bronze'],
        allow_credit_terms: 0,
        credit_limit: 0,
        credit_days: 0
      },
      {
        email: 'suspended_dealer@wallstreet.com',
        name: 'Bad Payer Interiors (Tariq)',
        business_name: 'Overdue Finishes Ltd',
        tax_number: '01DDDDD3333D4Z8',
        phone: '+91 9876543210',
        business_type: 'wholesaler',
        status: 'SUSPENDED',
        tier_id: tierMap['bronze'],
        allow_credit_terms: 0,
        credit_limit: 0,
        credit_days: 0
      }
    ];

    for (const d of dealersToSeed) {
      const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [d.email]) as any;
      let userId: number;

      if (existingUser.length === 0) {
        const [userResult] = await connection.query(`
          INSERT INTO users (name, email, password_hash, role, phone, created_at)
          VALUES (?, ?, ?, 'dealer', ?, NOW())
        `, [d.name, d.email, hashedPassword, d.phone]) as any;
        userId = userResult.insertId;
        console.log(`Created user ${d.email} (ID: ${userId})`);
      } else {
        userId = existingUser[0].id;
        await connection.query('UPDATE users SET role = "dealer" WHERE id = ?', [userId]);
        console.log(`User ${d.email} already exists (ID: ${userId}), updated role to dealer.`);
      }

      // Check or insert dealer profile
      const [existingProfile] = await connection.query('SELECT id FROM dealer_profiles WHERE user_id = ?', [userId]) as any;
      let profileId: number;

      if (existingProfile.length === 0) {
        const [profResult] = await connection.query(`
          INSERT INTO dealer_profiles (
            user_id, business_name, contact_person, business_phone, business_email, tax_number, business_type, 
            status, tier_id, allow_credit_terms, credit_limit, credit_days,
            business_address, city, state, postal_code, country,
            approved_at, approved_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId, d.business_name, d.name, d.phone, d.email, d.tax_number, d.business_type,
          d.status, d.tier_id, d.allow_credit_terms, d.credit_limit, d.credit_days,
          '123 Residency Road', 'Srinagar', 'Jammu and Kashmir', '190001', 'India',
          d.status === 'APPROVED' ? new Date() : null, d.status === 'APPROVED' ? 1 : null
        ]) as any;
        profileId = profResult.insertId;
        console.log(`Created dealer profile for ${d.business_name} (ID: ${profileId})`);

        // Also add a sample shipping address
        await connection.query(`
          INSERT INTO dealer_addresses (
            dealer_id, label, recipient_name, phone, address_line1, city, state, postal_code, country, is_default
          ) VALUES (?, 'Main Godown', ?, ?, 'Residency Road Near Lal Chowk', 'Srinagar', 'Jammu and Kashmir', '190001', 'India', 1)
        `, [profileId, d.name, d.phone]);
      } else {
        profileId = existingProfile[0].id;
      }
    }

    // 3. Update sample products with default_wholesale_price and min_order_quantity
    console.log('Updating sample products with wholesale parameters...');
    const [products] = await connection.query('SELECT id, name, price FROM products LIMIT 10') as any;

    if (products.length > 0) {
      for (const p of products) {
        // e.g. default wholesale price is ~75% of retail price, MOQ = 5
        const defaultWholesale = Math.round(Number(p.price) * 0.75);
        await connection.query(`
          UPDATE products 
          SET default_wholesale_price = ?, min_order_quantity = 5
          WHERE id = ? AND (default_wholesale_price IS NULL OR default_wholesale_price = 0)
        `, [defaultWholesale, p.id]);
      }
      console.log(`Updated up to ${products.length} products with default wholesale prices.`);

      // Seed a few product-specific overrides in wholesale_prices
      const firstProduct = products[0];
      const secondProduct = products[1] || products[0];

      // Clean existing test wholesale prices
      await connection.query('DELETE FROM wholesale_prices WHERE notes LIKE "SEED_TEST%"').catch(() => {});

      // Add a Tier Gold specific override on product 1
      if (tierMap['gold']) {
        await connection.query(`
          INSERT INTO wholesale_prices (product_id, tier_id, wholesale_price, min_quantity)
          VALUES (?, ?, ?, 10)
        `, [firstProduct.id, tierMap['gold'], Math.round(Number(firstProduct.price) * 0.65)]);
      }

      // Add a dealer-specific override for our approved dealer on product 2
      const [approvedProfiles] = await connection.query('SELECT id FROM dealer_profiles WHERE business_email = "approved_dealer@wallstreet.com"') as any;
      if (approvedProfiles.length > 0) {
        await connection.query(`
          INSERT INTO wholesale_prices (product_id, dealer_id, wholesale_price, min_quantity)
          VALUES (?, ?, ?, 1)
        `, [secondProduct.id, approvedProfiles[0].id, Math.round(Number(secondProduct.price) * 0.60)]);
      }
      console.log('Seeded sample wholesale price overrides.');
    }

    console.log('--- B2B Seeding Completed Successfully! ---');
  } catch (error) {
    console.error('Error during B2B seeding:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedB2B();
