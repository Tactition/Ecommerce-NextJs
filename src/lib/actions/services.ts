"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations";
import { Service } from "@/types";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchPublishedServicesUncached = async (): Promise<Service[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, short_description, description, image, price_range, is_published, sort_order, created_at, updated_at
       FROM services
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as Service[];
  } catch (error) {
    console.error("Error fetching published services:", error);
    return [];
  }
};

export async function getPublishedServices(): Promise<Service[]> {
  return fetchPublishedServicesUncached();
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, short_description, description, image, price_range, is_published, sort_order, created_at, updated_at
       FROM services
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as Service[];
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
}

const fetchServiceBySlugUncached = async (slug: string): Promise<Service | null> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, short_description, description, image, price_range, is_published, sort_order, created_at, updated_at
       FROM services
       WHERE slug = ? AND is_published = 1
       LIMIT 1`,
      [slug]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as Service;
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
};

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return fetchServiceBySlugUncached(slug);
}

export async function saveServiceAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    image: formData.get("image"),
    price_range: formData.get("price_range") || "Starts from ₹1,500 / sq.ft",
    is_published: formData.get("is_published") === "1" || formData.get("is_published") === "true" ? 1 : 0,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, title, slug, short_description, description, image, price_range, is_published, sort_order } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE services
         SET title = ?, slug = ?, short_description = ?, description = ?, image = ?, price_range = ?, is_published = ?, sort_order = ?
         WHERE id = ?`,
        [title, slug, short_description, description, image, price_range, is_published, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO services (title, slug, short_description, description, image, price_range, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, short_description, description, image, price_range, is_published, sort_order]
      );
    }

    revalidateTag("services");
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${slug}`);
    revalidatePath("/dashboard/services");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteServiceAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM services WHERE id = ?", [id]);
    revalidateTag("services");
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
