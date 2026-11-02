import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { SEED_CATEGORIES } from "./category-seed-data";
import { processCategoryImages } from "./generate-category-images";
import { runCategoriesMigration } from "./migrate-categories-schema";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log("\n=======================================================");
  console.log("  WALL STREET INTERIORS: CATEGORY SEED RUNNER");
  console.log("=======================================================\n");

  await runCategoriesMigration();
  const images = await processCategoryImages(force);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
  });

  let createdCount = 0;
  let updatedCount = 0;
  let placeholderCount = 0;

  const slugToIdMap: Record<string, number> = {};

  const [existingRows] = await connection.query<RowDataPacket[]>(
    "SELECT id, slug FROM product_categories"
  );
  for (const row of existingRows) {
    slugToIdMap[row.slug] = row.id;
  }

  for (const cat of SEED_CATEGORIES) {
    const imgData = images[cat.slug];
    if (imgData?.isPlaceholder) {
      placeholderCount++;
    }

    const parentId = cat.parentSlug ? (slugToIdMap[cat.parentSlug] || null) : null;

    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM product_categories WHERE slug = ?",
      [cat.slug]
    );

    const query = `
      INSERT INTO product_categories (
        parent_id, name, slug, icon_type, image, item_count, is_active,
        sort_order, is_featured, short_description, description,
        key_features, best_for, materials, control_types,
        seo_title, meta_description, focus_keywords,
        thumbnail, image_alt, blur_data_url, faq_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        parent_id = VALUES(parent_id),
        name = VALUES(name),
        icon_type = VALUES(icon_type),
        image = VALUES(image),
        is_active = VALUES(is_active),
        sort_order = VALUES(sort_order),
        is_featured = VALUES(is_featured),
        short_description = VALUES(short_description),
        description = VALUES(description),
        key_features = VALUES(key_features),
        best_for = VALUES(best_for),
        materials = VALUES(materials),
        control_types = VALUES(control_types),
        seo_title = VALUES(seo_title),
        meta_description = VALUES(meta_description),
        focus_keywords = VALUES(focus_keywords),
        thumbnail = VALUES(thumbnail),
        image_alt = VALUES(image_alt),
        blur_data_url = VALUES(blur_data_url),
        faq_json = VALUES(faq_json)
    `;

    const values = [
      parentId,
      cat.name,
      cat.slug,
      cat.iconType,
      imgData?.heroPath || `/images/categories/${cat.slug}.webp`,
      0,
      cat.isActive ? 1 : 0,
      cat.sortOrder,
      cat.isFeatured ? 1 : 0,
      cat.shortDescription,
      cat.longDescription,
      JSON.stringify(cat.keyFeatures),
      JSON.stringify(cat.bestFor),
      JSON.stringify(cat.materials),
      JSON.stringify(cat.controlTypes),
      cat.seoTitle,
      cat.metaDescription,
      cat.focusKeywords.join(", "),
      imgData?.thumbPath || `/images/categories/${cat.slug}-thumb.webp`,
      cat.imageAlt,
      imgData?.blurDataURL || null,
      JSON.stringify(cat.faqs),
    ];

    const [res] = await connection.query<ResultSetHeader>(query, values);

    if (existing.length === 0) {
      createdCount++;
      slugToIdMap[cat.slug] = res.insertId;
      console.log(`  [CREATED] ${cat.name} (ID: ${res.insertId}, Slug: ${cat.slug})`);
    } else {
      updatedCount++;
      slugToIdMap[cat.slug] = existing[0].id;
      console.log(`  [UPDATED] ${cat.name} (ID: ${existing[0].id}, Slug: ${cat.slug})`);
    }

    // Synchronize to nav_menu_items under 'categories' location
    await connection.query(
      `INSERT INTO nav_menu_items (label, url, parent_id, menu_location, sort_order, is_active)
       VALUES (?, ?, ?, 'categories', ?, 1)
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         url = VALUES(url),
         sort_order = VALUES(sort_order),
         is_active = 1`,
      [cat.name, `/category/${cat.slug}`, parentId, cat.sortOrder]
    );
  }

  await connection.end();

  console.log("\n=======================================================");
  console.log("  SEED SUMMARY");
  console.log("=======================================================");
  console.log(`  Categories Created:      ${createdCount}`);
  console.log(`  Categories Updated:      ${updatedCount}`);
  console.log(`  Total Categories:        ${SEED_CATEGORIES.length}`);
  console.log(`  Placeholder Images Used: ${placeholderCount}`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});

