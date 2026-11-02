import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export async function runCategoriesMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    multipleStatements: true,
  });

  const sqlPath = path.join(process.cwd(), "database", "migrations", "001_add_category_seo_and_faq_fields.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  await connection.query(sql);
  await connection.end();
}

