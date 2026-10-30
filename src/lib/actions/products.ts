"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { productSchema } from "@/lib/validations";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Product {
  id: number;
  name: string;
  slug: string;
  category_slug: string;
  category_name: string;
  subcategory_slug?: string | null;
  subcategory_name?: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number;
  rating: number;
  reviews_count: number;
  image: string;
  gallery_images?: string[];
  badge: string | null;
  brand: string | null;
  is_best_seller: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_on_sale: boolean;
  has_variations?: boolean;
  allow_custom_sizing?: boolean;
  custom_size_rate?: number;
  custom_size_unit?: "sq_ft" | "linear_ft" | string;
  custom_size_min_price?: number;
  custom_size_linear_mode?: "length_plus_width" | "single_length" | string;
  stock: number;
  status?: string;
  created_at?: string;
}

export interface ProductCategory {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  icon_type: string;
  image?: string | null;
  item_count: number;
  is_active?: boolean;
}

function parseGalleryImages(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((x): x is string => typeof x === "string");
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      return [];
    }
  }
  return [];
}

const fetchBestSellerProductsUncached = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE is_best_seller = 1 AND status = 'active' ORDER BY id DESC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    return [];
  }
};

const fetchBestSellerProductsCached = unstable_cache(
  fetchBestSellerProductsUncached,
  ["best-seller-products"],
  { tags: ["products"], revalidate: 3600 }
);

export async function getBestSellerProducts(): Promise<Product[]> {
  return fetchBestSellerProductsCached();
}

const fetchFeaturedProductsUncached = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE is_featured = 1 AND status = 'active' ORDER BY id DESC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

const getCachedFeaturedProducts = unstable_cache(
  fetchFeaturedProductsUncached,
  ["featured-products"],
  { tags: ["products"], revalidate: 3600 }
);

export async function getFeaturedProducts(categorySlug?: string): Promise<Product[]> {
  if (!categorySlug || categorySlug === "all") {
    return getCachedFeaturedProducts();
  }
  const all = await getCachedFeaturedProducts();
  return all.filter((p) => p.category_slug === categorySlug);
}

const fetchPopularProductsUncached = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE is_popular = 1 AND status = 'active' ORDER BY id DESC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      subcategory_slug: r.subcategory_slug || null,
      subcategory_name: r.subcategory_name || null,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return [];
  }
};

const fetchPopularProductsCached = unstable_cache(
  fetchPopularProductsUncached,
  ["popular-products"],
  { tags: ["products"], revalidate: 3600 }
);

export async function getPopularProducts(): Promise<Product[]> {
  return fetchPopularProductsCached();
}

const fetchOnSaleProductsUncached = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE (is_on_sale = 1 OR discount_percent > 0) AND status = 'active' ORDER BY id DESC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      subcategory_slug: r.subcategory_slug || null,
      subcategory_name: r.subcategory_name || null,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching on sale products:", error);
    return [];
  }
};

const fetchOnSaleProductsCached = unstable_cache(
  fetchOnSaleProductsUncached,
  ["on-sale-products"],
  { tags: ["products"], revalidate: 3600 }
);

export async function getOnSaleProducts(): Promise<Product[]> {
  return fetchOnSaleProductsCached();
}

const fetchProductCategoriesUncached = async (): Promise<ProductCategory[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM product_categories WHERE is_active = 1 ORDER BY COALESCE(parent_id, id) ASC, parent_id ASC, id ASC`
    );
    const cats: ProductCategory[] = rows.map((r: RowDataPacket) => ({
      id: r.id,
      parent_id: r.parent_id ? Number(r.parent_id) : null,
      name: r.name,
      slug: r.slug,
      icon_type: r.icon_type,
      image: r.image || null,
      item_count: Number(r.item_count),
      is_active: Boolean(r.is_active),
    }));

    // Also merge any subcategories from nav_menu_items (under 'categories') if not already in cats
    try {
      const [menuRows] = await pool.query<RowDataPacket[]>(`
        SELECT child.id as menu_id, child.label, child.url, parent.label as parent_label
        FROM nav_menu_items child
        JOIN nav_menu_items parent ON child.parent_id = parent.id
        WHERE child.menu_location = 'categories' AND child.parent_id IS NOT NULL AND child.is_active = 1
      `);

      for (const m of menuRows) {
        const matchingParent = cats.find(
          (c) =>
            !c.parent_id &&
            (c.name.toLowerCase() === m.parent_label.toLowerCase() ||
              c.slug === m.parent_label.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
        );
        if (matchingParent) {
          const subSlug = m.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const alreadyExists = cats.some(
            (c) => c.slug === subSlug || c.name.toLowerCase() === m.label.toLowerCase()
          );
          if (!alreadyExists) {
            cats.push({
              id: 10000 + m.menu_id,
              parent_id: matchingParent.id,
              name: m.label,
              slug: subSlug,
              icon_type: "fa-solid fa-shapes",
              item_count: 5,
              is_active: true,
            });
          }
        }
      }
    } catch (e) {
      // nav_menu_items optional merge fallback
    }

    return cats;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const fetchProductCategoriesCached = unstable_cache(
  fetchProductCategoriesUncached,
  ["product-categories-cache"],
  { tags: ["categories", "menus"], revalidate: 3600 }
);

export async function getProductCategories(): Promise<ProductCategory[]> {
  return fetchProductCategoriesCached();
}

const fetchProductBySlugUncached = async (slug: string): Promise<Product | null> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE slug = ? AND status = 'active' LIMIT 1`,
      [slug]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      has_variations: Boolean(r.has_variations),
      allow_custom_sizing: Boolean(r.allow_custom_sizing),
      custom_size_rate: Number(r.custom_size_rate || 0),
      custom_size_unit: r.custom_size_unit || "sq_ft",
      custom_size_min_price: Number(r.custom_size_min_price || 0),
      custom_size_linear_mode: r.custom_size_linear_mode || "length_plus_width",
      stock: Number(r.stock || 0),
      status: r.status,
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (process.env.NODE_ENV === "development") {
    return fetchProductBySlugUncached(slug);
  }
  const cachedFn = unstable_cache(
    fetchProductBySlugUncached,
    [`product-slug-${slug}`],
    { tags: ["products", `product-${slug}`], revalidate: 3600 }
  );
  return cachedFn(slug);
}

const fetchProductsByIdsUncached = async (ids: number[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) return [];
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE id IN (?) AND status = 'active'`,
      [ids]
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      subcategory_slug: r.subcategory_slug || null,
      subcategory_name: r.subcategory_name || null,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      has_variations: Boolean(r.has_variations),
      allow_custom_sizing: Boolean(r.allow_custom_sizing),
      custom_size_rate: Number(r.custom_size_rate || 0),
      custom_size_unit: r.custom_size_unit || "sq_ft",
      custom_size_min_price: Number(r.custom_size_min_price || 0),
      custom_size_linear_mode: r.custom_size_linear_mode || "length_plus_width",
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    return [];
  }
};

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  const sortedIdsKey = [...ids].sort().join("-");
  const cachedFn = unstable_cache(
    () => fetchProductsByIdsUncached(ids),
    [`products-by-ids-${sortedIdsKey}`],
    { tags: ["products"], revalidate: 3600 }
  );
  return cachedFn();
}

const fetchAllProductsUncached = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE status = 'active' ORDER BY id ASC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

const getCachedAllProducts = unstable_cache(
  fetchAllProductsUncached,
  ["all-products-catalog"],
  { tags: ["products"], revalidate: 3600 }
);

export async function getAllProducts(filters?: {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
}): Promise<Product[]> {
  // Fast path for initial Shop page load
  if (
    !filters ||
    (!filters.categorySlug &&
      !filters.search &&
      filters.minPrice === undefined &&
      filters.maxPrice === undefined &&
      !filters.minRating &&
      !filters.inStockOnly &&
      !filters.onSaleOnly)
  ) {
    return getCachedAllProducts();
  }

  try {
    let query = `SELECT * FROM products WHERE status = 'active'`;
    const params: (string | number)[] = [];

    if (filters?.categorySlug && filters.categorySlug !== "all") {
      query += ` AND category_slug = ?`;
      params.push(filters.categorySlug);
    }

    if (filters?.search && filters.search.trim()) {
      query += ` AND (name LIKE ? OR category_name LIKE ? OR brand LIKE ?)`;
      const term = `%${filters.search.trim()}%`;
      params.push(term, term, term);
    }

    if (filters?.minPrice !== undefined) {
      query += ` AND price >= ?`;
      params.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query += ` AND price <= ?`;
      params.push(filters.maxPrice);
    }

    if (filters?.minRating !== undefined && filters.minRating > 0) {
      query += ` AND rating >= ?`;
      params.push(filters.minRating);
    }

    if (filters?.inStockOnly) {
      query += ` AND stock > 0`;
    }

    if (filters?.onSaleOnly) {
      query += ` AND is_on_sale = 1`;
    }

    query += ` ORDER BY id ASC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      has_variations: Boolean(r.has_variations),
      allow_custom_sizing: Boolean(r.allow_custom_sizing),
      custom_size_rate: Number(r.custom_size_rate || 0),
      custom_size_unit: r.custom_size_unit || "sq_ft",
      custom_size_min_price: Number(r.custom_size_min_price || 0),
      custom_size_linear_mode: r.custom_size_linear_mode || "length_plus_width",
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

const fetchRelatedProductsUncached = async (categorySlug: string, currentProductId: number, limit = 4): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE category_slug = ? AND id != ? AND status = 'active' LIMIT ?`,
      [categorySlug, currentProductId, limit]
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      stock: Number(r.stock || 0),
      status: r.status,
    }));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};

export async function getRelatedProducts(categorySlug: string, currentProductId: number, limit = 4): Promise<Product[]> {
  const cachedFn = unstable_cache(
    () => fetchRelatedProductsUncached(categorySlug, currentProductId, limit),
    [`related-products-${categorySlug}-${currentProductId}-${limit}`],
    { tags: ["products"], revalidate: 3600 }
  );
  return cachedFn();
}

// ---------------- Admin Actions ----------------

export async function getRecentProductsAdmin(limit = 5): Promise<Product[]> {
  await requireAuth();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, slug, price, category_name, image, stock, status 
       FROM products 
       ORDER BY id DESC 
       LIMIT ?`,
      [limit]
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: "",
      category_name: r.category_name || "General",
      short_description: null,
      description: null,
      price: Number(r.price || 0),
      original_price: null,
      discount_percent: 0,
      rating: 5,
      reviews_count: 0,
      image: r.image || "",
      badge: null,
      brand: null,
      is_best_seller: false,
      is_featured: false,
      is_popular: false,
      is_on_sale: false,
      has_variations: false,
      stock: Number(r.stock || 0),
      status: r.status || "active",
    }));
  } catch (error) {
    console.error("Error fetching recent products for admin:", error);
    return [];
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  await requirePermission("products", "view");
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products ORDER BY id DESC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      subcategory_slug: r.subcategory_slug || null,
      subcategory_name: r.subcategory_name || null,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      has_variations: Boolean(r.has_variations),
      allow_custom_sizing: Boolean(r.allow_custom_sizing),
      custom_size_rate: Number(r.custom_size_rate || 0),
      custom_size_unit: r.custom_size_unit || "sq_ft",
      custom_size_min_price: Number(r.custom_size_min_price || 0),
      custom_size_linear_mode: r.custom_size_linear_mode || "length_plus_width",
      stock: Number(r.stock || 0),
      status: r.status || "active",
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));
  } catch (error) {
    console.error("Error fetching products for admin:", error);
    return [];
  }
}

export async function getProductByIdAdmin(id: number): Promise<Product | null> {
  await requirePermission("products", "view");
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM products WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_slug: r.category_slug,
      category_name: r.category_name,
      subcategory_slug: r.subcategory_slug || null,
      subcategory_name: r.subcategory_name || null,
      short_description: r.short_description,
      description: r.description,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 5),
      reviews_count: Number(r.reviews_count || 0),
      image: r.image,
      gallery_images: parseGalleryImages(r.gallery_images),
      badge: r.badge,
      brand: r.brand,
      is_best_seller: Boolean(r.is_best_seller),
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_on_sale: Boolean(r.is_on_sale),
      has_variations: Boolean(r.has_variations),
      allow_custom_sizing: Boolean(r.allow_custom_sizing),
      custom_size_rate: Number(r.custom_size_rate || 0),
      custom_size_unit: r.custom_size_unit || "sq_ft",
      custom_size_min_price: Number(r.custom_size_min_price || 0),
      custom_size_linear_mode: r.custom_size_linear_mode || "length_plus_width",
      stock: Number(r.stock || 0),
      status: r.status || "active",
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    };
  } catch (error) {
    console.error("Error fetching product by ID for admin:", error);
    return null;
  }
}

export async function saveProductAction(formData: FormData) {
  const idVal = formData.get("id");
  if (idVal && Number(idVal) > 0) {
    await requirePermission("products", "edit");
  } else {
    await requirePermission("products", "create");
  }
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_slug: formData.get("category_slug"),
    category_name: formData.get("category_name"),
    subcategory_slug: formData.get("subcategory_slug") || null,
    subcategory_name: formData.get("subcategory_name") || null,
    short_description: formData.get("short_description") || null,
    description: formData.get("description") || null,
    price: formData.get("price"),
    original_price: formData.get("original_price") || null,
    discount_percent: formData.get("discount_percent") || 0,
    rating: formData.get("rating") || 5,
    reviews_count: formData.get("reviews_count") || 0,
    image: formData.get("image") || "",
    gallery_images: formData.get("gallery_images") || null,
    badge: formData.get("badge") || null,
    brand: formData.get("brand") || null,
    is_best_seller: formData.get("is_best_seller") === "1" ? 1 : 0,
    is_featured: formData.get("is_featured") === "1" ? 1 : 0,
    is_popular: formData.get("is_popular") === "1" ? 1 : 0,
    is_on_sale: formData.get("is_on_sale") === "1" ? 1 : 0,
    has_variations: formData.get("has_variations") === "1" ? 1 : 0,
    allow_custom_sizing: formData.get("allow_custom_sizing") === "1" ? 1 : 0,
    custom_size_rate: formData.get("custom_size_rate") || 0,
    custom_size_unit: (formData.get("custom_size_unit") as "sq_ft" | "linear_ft") || "sq_ft",
    custom_size_min_price: formData.get("custom_size_min_price") || 0,
    custom_size_linear_mode: (formData.get("custom_size_linear_mode") as "length_plus_width" | "single_length") || "length_plus_width",
    stock: formData.get("stock") || 10,
    status: (formData.get("status") as "active" | "inactive") || "active",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
  }

  const p = parsed.data;
  let savedId = p.id;

  const galleryImagesJson = (() => {
    if (!p.gallery_images) return null;
    if (typeof p.gallery_images === "string") {
      try {
        const parsedArr = JSON.parse(p.gallery_images);
        return Array.isArray(parsedArr) && parsedArr.length > 0 ? JSON.stringify(parsedArr) : null;
      } catch {
        return null;
      }
    }
    if (Array.isArray(p.gallery_images)) {
      return p.gallery_images.length > 0 ? JSON.stringify(p.gallery_images) : null;
    }
    return null;
  })();

  try {
    if (p.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE products SET
          name = ?, slug = ?, category_slug = ?, category_name = ?,
          subcategory_slug = ?, subcategory_name = ?,
          short_description = ?, description = ?, price = ?, original_price = ?,
          discount_percent = ?, rating = ?, reviews_count = ?, image = ?, gallery_images = ?,
          badge = ?, brand = ?, is_best_seller = ?, is_featured = ?,
          is_popular = ?, is_on_sale = ?, has_variations = ?,
          allow_custom_sizing = ?, custom_size_rate = ?, custom_size_unit = ?,
          custom_size_min_price = ?, custom_size_linear_mode = ?,
          stock = ?, status = ?
         WHERE id = ?`,
        [
          p.name, p.slug, p.category_slug, p.category_name,
          p.subcategory_slug || null, p.subcategory_name || null,
          p.short_description || null, p.description || null, p.price, p.original_price || null,
          p.discount_percent, p.rating, p.reviews_count, p.image, galleryImagesJson,
          p.badge || null, p.brand || null, p.is_best_seller, p.is_featured,
          p.is_popular, p.is_on_sale, p.has_variations ? 1 : 0,
          p.allow_custom_sizing ? 1 : 0, p.custom_size_rate || 0, p.custom_size_unit || "sq_ft",
          p.custom_size_min_price || 0, p.custom_size_linear_mode || "length_plus_width",
          p.stock, p.status, p.id
        ]
      );
    } else {
      const [insertRes] = await pool.execute<ResultSetHeader>(
        `INSERT INTO products (
          name, slug, category_slug, category_name, subcategory_slug, subcategory_name,
          short_description, description, price, original_price, discount_percent, rating,
          reviews_count, image, gallery_images, badge, brand, is_best_seller, is_featured,
          is_popular, is_on_sale, has_variations, allow_custom_sizing, custom_size_rate, custom_size_unit,
          custom_size_min_price, custom_size_linear_mode, stock, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name, p.slug, p.category_slug, p.category_name,
          p.subcategory_slug || null, p.subcategory_name || null,
          p.short_description || null, p.description || null, p.price, p.original_price || null,
          p.discount_percent, p.rating, p.reviews_count, p.image, galleryImagesJson,
          p.badge || null, p.brand || null, p.is_best_seller, p.is_featured,
          p.is_popular, p.is_on_sale, p.has_variations ? 1 : 0,
          p.allow_custom_sizing ? 1 : 0, p.custom_size_rate || 0, p.custom_size_unit || "sq_ft",
          p.custom_size_min_price || 0, p.custom_size_linear_mode || "length_plus_width",
          p.stock, p.status
        ]
      );
      savedId = insertRes.insertId;
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/cart");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    revalidatePath("/product/[slug]", "page");
    revalidatePath("/dashboard/products/[id]/edit", "page");

    return { success: true, id: savedId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function deleteProductAction(id: number) {
  await requirePermission("products", "delete");
  try {
    await pool.execute<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete product";
    return { success: false, error: msg };
  }
}

export async function toggleProductStatusAction(id: number, currentStatus: string) {
  await requirePermission("products", "edit");
  const nextStatus = currentStatus === "active" ? "inactive" : "active";
  try {
    await pool.execute<ResultSetHeader>("UPDATE products SET status = ? WHERE id = ?", [nextStatus, id]);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    return { success: true, status: nextStatus };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle status";
    return { success: false, error: msg };
  }
}

export async function validateCustomPriceAction(params: {
  productId: number;
  lengthFeet: number;
  lengthInches?: number;
  widthFeet?: number;
  widthInches?: number;
}): Promise<{
  valid: boolean;
  rate: number;
  unit: string;
  linearMode: string;
  minPrice: number;
  minPriceApplied: boolean;
  billableMeasurement: number;
  calculatedPrice: number;
  error?: string;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, allow_custom_sizing, custom_size_rate, custom_size_unit, custom_size_min_price, custom_size_linear_mode FROM products WHERE id = ? LIMIT 1`,
      [params.productId]
    );
    if (!rows || rows.length === 0) {
      return {
        valid: false,
        rate: 0,
        unit: "sq_ft",
        linearMode: "length_plus_width",
        minPrice: 0,
        minPriceApplied: false,
        billableMeasurement: 0,
        calculatedPrice: 0,
        error: "Product not found",
      };
    }
    const product = rows[0];
    if (!product.allow_custom_sizing && Number(product.custom_size_rate || 0) <= 0) {
      return {
        valid: false,
        rate: 0,
        unit: "sq_ft",
        linearMode: "length_plus_width",
        minPrice: 0,
        minPriceApplied: false,
        billableMeasurement: 0,
        calculatedPrice: 0,
        error: "Custom sizing not enabled for product",
      };
    }

    const rate = Number(product.custom_size_rate || 10);
    const unit = product.custom_size_unit || "sq_ft";
    const minPrice = Number(product.custom_size_min_price || 0);
    const linearMode = product.custom_size_linear_mode || "length_plus_width";

    const lFt = Math.max(0, (Number(params.lengthFeet) || 0) + (Number(params.lengthInches) || 0) / 12);
    const wFt = Math.max(0, (Number(params.widthFeet) || 0) + (Number(params.widthInches) || 0) / 12);

    let billableMeasurement = 0;
    if (unit === "sq_ft") {
      billableMeasurement = Number((lFt * wFt).toFixed(2));
    } else {
      if (linearMode === "single_length") {
        billableMeasurement = Number(lFt.toFixed(2));
      } else {
        billableMeasurement = Number((lFt + wFt).toFixed(2));
      }
    }

    const rawTotal = Number((billableMeasurement * rate).toFixed(2));
    const calculatedPrice = minPrice > 0 ? Math.max(minPrice, rawTotal) : rawTotal;
    const minPriceApplied = minPrice > 0 && rawTotal < minPrice;

    return {
      valid: true,
      rate,
      unit,
      linearMode,
      minPrice,
      minPriceApplied,
      billableMeasurement,
      calculatedPrice,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to validate custom price";
    return {
      valid: false,
      rate: 0,
      unit: "sq_ft",
      linearMode: "length_plus_width",
      minPrice: 0,
      minPriceApplied: false,
      billableMeasurement: 0,
      calculatedPrice: 0,
      error: msg,
    };
  }
}

