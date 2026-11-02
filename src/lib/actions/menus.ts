"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { menuItemSchema } from "@/lib/validations";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface NavMenuItem {
  id: number;
  label: string;
  url: string;
  target: string;
  parent_id: number | null;
  menu_location: "header" | "categories" | "footer";
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

const fetchNavMenuItemsUncached = async (location: "header" | "categories" | "footer"): Promise<NavMenuItem[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM nav_menu_items WHERE menu_location = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC`,
      [location]
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      target: r.target || "_self",
      parent_id: r.parent_id,
      menu_location: r.menu_location,
      sort_order: Number(r.sort_order || 0),
      is_active: Boolean(r.is_active),
    }));
  } catch (error) {
    console.error("Error fetching nav menu items:", error);
    return [];
  }
};

export async function getNavMenuItems(location: "header" | "categories" | "footer" = "header"): Promise<NavMenuItem[]> {
  return fetchNavMenuItemsUncached(location);
}


export async function getAllNavMenuItemsAdmin(): Promise<NavMenuItem[]> {
  await requireAuth();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM nav_menu_items ORDER BY menu_location ASC, sort_order ASC, id ASC`
    );
    return rows.map((r: RowDataPacket) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      target: r.target || "_self",
      parent_id: r.parent_id,
      menu_location: r.menu_location,
      sort_order: Number(r.sort_order || 0),
      is_active: Boolean(r.is_active),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));
  } catch (error) {
    console.error("Error fetching all nav menu items for admin:", error);
    return [];
  }
}

export async function getNavMenuItemById(id: number): Promise<NavMenuItem | null> {
  await requireAuth();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM nav_menu_items WHERE id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      label: r.label,
      url: r.url,
      target: r.target || "_self",
      parent_id: r.parent_id,
      menu_location: r.menu_location,
      sort_order: Number(r.sort_order || 0),
      is_active: Boolean(r.is_active),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    };
  } catch (error) {
    console.error("Error fetching nav menu item by id:", error);
    return null;
  }
}

export async function saveNavMenuItemAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const parentVal = formData.get("parent_id");
  const parsedParentId =
    parentVal && parentVal !== "" && parentVal !== "0" && parentVal !== "none" && parentVal !== "null"
      ? Number(parentVal)
      : null;

  const isActiveVal = formData.get("is_active");
  const isActiveNum =
    isActiveVal === "1" || isActiveVal === "on" || isActiveVal === "true"
      ? 1
      : 0;

  const raw = {
    id: idVal ? Number(idVal) : undefined,
    label: formData.get("label"),
    url: formData.get("url"),
    target: formData.get("target") || "_self",
    parent_id: parsedParentId,
    menu_location: formData.get("menu_location") || "header",
    sort_order: formData.get("sort_order") || 0,
    is_active: isActiveNum,
  };

  const parsed = menuItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
  }

  const m = parsed.data;

  try {
    if (m.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE nav_menu_items SET label = ?, url = ?, target = ?, parent_id = ?, menu_location = ?, sort_order = ?, is_active = ? WHERE id = ?`,
        [m.label, m.url, m.target, m.parent_id ?? null, m.menu_location, m.sort_order, m.is_active, m.id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO nav_menu_items (label, url, target, parent_id, menu_location, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [m.label, m.url, m.target, m.parent_id ?? null, m.menu_location, m.sort_order, m.is_active]
      );
    }

    // Synchronize to product_categories if location is 'categories'
    if (m.menu_location === "categories") {
      try {
        const itemSlug = m.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        if (m.parent_id) {
          // Subcategory item
          const [parentRows] = await pool.query<RowDataPacket[]>(
            `SELECT label FROM nav_menu_items WHERE id = ? LIMIT 1`,
            [m.parent_id]
          );
          if (parentRows.length > 0) {
            const parentLabel = parentRows[0].label;
            const parentSlug = parentLabel
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            const [catParents] = await pool.query<RowDataPacket[]>(
              `SELECT id FROM product_categories WHERE slug = ? OR LOWER(name) = LOWER(?) LIMIT 1`,
              [parentSlug, parentLabel]
            );

            if (catParents.length > 0) {
              const catParentId = catParents[0].id;
              const [existingSub] = await pool.query<RowDataPacket[]>(
                `SELECT id FROM product_categories WHERE (slug = ? OR LOWER(name) = LOWER(?)) AND parent_id = ? LIMIT 1`,
                [itemSlug, m.label, catParentId]
              );
              if (existingSub.length === 0) {
                await pool.execute<ResultSetHeader>(
                  `INSERT INTO product_categories (parent_id, name, slug, icon_type, item_count, is_active) VALUES (?, ?, ?, 'fa-solid fa-shapes', 0, ?)`,
                  [catParentId, m.label, itemSlug, m.is_active]
                );
              } else {
                await pool.execute<ResultSetHeader>(
                  `UPDATE product_categories SET name = ?, slug = ?, is_active = ? WHERE id = ?`,
                  [m.label, itemSlug, m.is_active, existingSub[0].id]
                );
              }
            }
          }
        } else {
          // Top-level category item
          const [existingCat] = await pool.query<RowDataPacket[]>(
            `SELECT id FROM product_categories WHERE slug = ? OR LOWER(name) = LOWER(?) LIMIT 1`,
            [itemSlug, m.label]
          );
          if (existingCat.length === 0) {
            await pool.execute<ResultSetHeader>(
              `INSERT INTO product_categories (parent_id, name, slug, icon_type, item_count, is_active) VALUES (NULL, ?, ?, 'fa-solid fa-shapes', 0, ?)`,
              [m.label, itemSlug, m.is_active]
            );
          } else {
            await pool.execute<ResultSetHeader>(
              `UPDATE product_categories SET name = ?, slug = ?, is_active = ? WHERE id = ?`,
              [m.label, itemSlug, m.is_active, existingCat[0].id]
            );
          }
        }
      } catch (syncErr) {
        console.error("Auto-sync to product_categories failed:", syncErr);
      }
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/blog");
    revalidatePath("/contact");
    revalidatePath("/cart");
    revalidatePath("/shop");
    revalidatePath("/dashboard/menus");
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/create");
    revalidateTag("menus");
    revalidateTag("categories");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function deleteNavMenuItemAction(id: number) {
  await requireAuth();
  try {
    // Delete any nested children of this item first
    await pool.execute<ResultSetHeader>("DELETE FROM nav_menu_items WHERE parent_id = ?", [id]);
    await pool.execute<ResultSetHeader>("DELETE FROM nav_menu_items WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/dashboard/menus");
    revalidateTag("menus");
    revalidateTag("categories");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete menu item";
    return { success: false, error: msg };
  }
}

export async function toggleNavMenuItemStatusAction(id: number, currentActive: boolean) {
  await requireAuth();
  const nextActive = currentActive ? 0 : 1;
  try {
    await pool.execute<ResultSetHeader>("UPDATE nav_menu_items SET is_active = ? WHERE id = ?", [nextActive, id]);
    revalidatePath("/");
    revalidatePath("/dashboard/menus");
    revalidateTag("menus");
    revalidateTag("categories");
    return { success: true, is_active: Boolean(nextActive) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle status";
    return { success: false, error: msg };
  }
}
