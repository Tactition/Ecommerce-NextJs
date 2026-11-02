"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { brandSchema } from "@/lib/validations";
import { PartnerBrand } from "@/types";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchActiveBrandsUncached = async (): Promise<PartnerBrand[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, logo, website_url, is_active, sort_order, created_at
       FROM partner_brands
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`
    );
    return rows as PartnerBrand[];
  } catch (error) {
    console.error("Error fetching active brands:", error);
    return [];
  }
};

export async function getActiveBrands(): Promise<PartnerBrand[]> {
  return fetchActiveBrandsUncached();
}

export async function getAllBrands(): Promise<PartnerBrand[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, logo, website_url, is_active, sort_order, created_at
       FROM partner_brands
       ORDER BY sort_order ASC, id ASC`
    );
    return rows as PartnerBrand[];
  } catch (error) {
    console.error("Error fetching all brands:", error);
    return [];
  }
}

export async function saveBrandAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    name: formData.get("name"),
    logo: formData.get("logo"),
    website_url: formData.get("website_url") || "#",
    is_active: formData.get("is_active") === "1" || formData.get("is_active") === "true" ? 1 : 0,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, name, logo, website_url, is_active, sort_order } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE partner_brands
         SET name = ?, logo = ?, website_url = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [name, logo, website_url, is_active, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO partner_brands (name, logo, website_url, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [name, logo, website_url, is_active, sort_order]
      );
    }

    revalidatePath("/");
    revalidatePath("/brands");
    revalidatePath("/dashboard/brands");
    revalidateTag("brands");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteBrandAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM partner_brands WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/brands");
    revalidatePath("/dashboard/brands");
    revalidateTag("brands");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
