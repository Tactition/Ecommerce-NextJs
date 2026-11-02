import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const term = `%${q}%`;
    const [products] = await pool.query(
      `SELECT id, name, slug, price, original_price, image, category_name 
       FROM products 
       WHERE status = 'active' AND (name LIKE ? OR category_name LIKE ? OR brand LIKE ?) 
       ORDER BY id DESC LIMIT 6`,
      [term, term, term]
    );

    const [categories] = await pool.query(
      `SELECT id, name, slug, image 
       FROM product_categories 
       WHERE is_active = 1 AND (name LIKE ? OR slug LIKE ?) 
       ORDER BY id ASC LIMIT 4`,
      [term, term]
    );

    return NextResponse.json(
      { products, categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
