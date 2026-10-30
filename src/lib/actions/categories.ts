"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { categorySchema } from "@/lib/validations";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface CategoryAdmin {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  icon_type: string;
  image?: string | null;
  item_count: number;
  is_active: boolean;
  created_at?: string;
}

export async function getAllCategoriesAdmin(): Promise<CategoryAdmin[]> {
  await requirePermission("categories", "view");
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        (
          SELECT COUNT(*) 
          FROM products p 
          WHERE p.status = 'active' 
            AND (
              p.category_slug = c.slug 
              OR p.subcategory_slug = c.slug
              OR (c.parent_id IS NULL AND p.category_slug IN (SELECT sub.slug FROM product_categories sub WHERE sub.parent_id = c.id))
            )
        ) AS proper_item_count
      FROM product_categories c
      ORDER BY COALESCE(c.parent_id, c.id) ASC, c.parent_id ASC, c.id ASC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      parent_id: r.parent_id ? Number(r.parent_id) : null,
      name: r.name,
      slug: r.slug,
      icon_type: r.icon_type,
      image: r.image || null,
      item_count: Number(r.proper_item_count !== undefined ? r.proper_item_count : (r.item_count || 0)),
      is_active: Boolean(r.is_active),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));
  } catch (error) {
    console.error("Error fetching categories for admin:", error);
    return [];
  }
}

export async function getCategoryByIdAdmin(id: number): Promise<CategoryAdmin | null> {
  await requirePermission("categories", "view");
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        (
          SELECT COUNT(*) 
          FROM products p 
          WHERE p.status = 'active' 
            AND (
              p.category_slug = c.slug 
              OR p.subcategory_slug = c.slug
              OR (c.parent_id IS NULL AND p.category_slug IN (SELECT sub.slug FROM product_categories sub WHERE sub.parent_id = c.id))
            )
        ) AS proper_item_count
      FROM product_categories c
      WHERE c.id = ? 
      LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      parent_id: r.parent_id ? Number(r.parent_id) : null,
      name: r.name,
      slug: r.slug,
      icon_type: r.icon_type,
      image: r.image || null,
      item_count: Number(r.proper_item_count !== undefined ? r.proper_item_count : (r.item_count || 0)),
      is_active: Boolean(r.is_active),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    };
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
}

const fetchActiveCategoriesUncached = async (): Promise<CategoryAdmin[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        (
          SELECT COUNT(*) 
          FROM products p 
          WHERE p.status = 'active' 
            AND (
              p.category_slug = c.slug 
              OR p.subcategory_slug = c.slug
              OR (c.parent_id IS NULL AND p.category_slug IN (SELECT sub.slug FROM product_categories sub WHERE sub.parent_id = c.id))
            )
        ) AS proper_item_count
      FROM product_categories c
      WHERE c.is_active = 1 
      ORDER BY COALESCE(c.parent_id, c.id) ASC, c.parent_id ASC, c.id ASC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      parent_id: r.parent_id ? Number(r.parent_id) : null,
      name: r.name,
      slug: r.slug,
      icon_type: r.icon_type,
      image: r.image || null,
      item_count: Number(r.proper_item_count !== undefined ? r.proper_item_count : (r.item_count || 0)),
      is_active: Boolean(r.is_active),
    }));
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return [];
  }
};

const fetchActiveCategoriesCached = unstable_cache(
  fetchActiveCategoriesUncached,
  ["active-categories-cache"],
  { tags: ["categories"], revalidate: 3600 }
);

export async function getActiveCategories(): Promise<CategoryAdmin[]> {
  return fetchActiveCategoriesCached();
}

export async function saveCategoryAction(formData: FormData) {
  const idVal = formData.get("id");
  if (idVal && Number(idVal) > 0) {
    await requirePermission("categories", "edit");
  } else {
    await requirePermission("categories", "create");
  }

  const parentIdVal = formData.get("parent_id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    parent_id: parentIdVal && parentIdVal !== "" && parentIdVal !== "none" ? Number(parentIdVal) : null,
    name: formData.get("name"),
    slug: formData.get("slug"),
    icon_type: formData.get("icon_type") || "fa-solid fa-shapes",
    image: formData.get("image") || null,
    item_count: formData.get("item_count") || 0,
    is_active: formData.get("is_active") === "0" ? 0 : 1,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
  }

  const c = parsed.data;

  try {
    if (c.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE product_categories SET parent_id = ?, name = ?, slug = ?, icon_type = ?, image = ?, item_count = ?, is_active = ? WHERE id = ?`,
        [c.parent_id || null, c.name, c.slug, c.icon_type, c.image || null, c.item_count, c.is_active, c.id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO product_categories (parent_id, name, slug, icon_type, image, item_count, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [c.parent_id || null, c.name, c.slug, c.icon_type, c.image || null, c.item_count, c.is_active]
      );
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    revalidateTag("categories");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function deleteCategoryAction(id: number) {
  await requirePermission("categories", "delete");
  try {
    await pool.execute<ResultSetHeader>("DELETE FROM product_categories WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    revalidateTag("categories");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete category";
    return { success: false, error: msg };
  }
}

export async function toggleCategoryStatusAction(id: number, currentActive: boolean) {
  await requirePermission("categories", "edit");
  const nextActive = currentActive ? 0 : 1;
  try {
    await pool.execute<ResultSetHeader>("UPDATE product_categories SET is_active = ? WHERE id = ?", [nextActive, id]);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    revalidateTag("categories");
    return { success: true, is_active: Boolean(nextActive) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle category";
    return { success: false, error: msg };
  }
}
