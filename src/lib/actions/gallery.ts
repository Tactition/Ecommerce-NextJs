"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { gallerySchema } from "@/lib/validations";
import { WorkGallery } from "@/types";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchPublishedGalleryUncached = async (): Promise<WorkGallery[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, description, image, category, is_published, sort_order, created_at
       FROM work_gallery
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as WorkGallery[];
  } catch (error) {
    console.error("Error fetching published gallery:", error);
    return [];
  }
};

export async function getPublishedGallery(): Promise<WorkGallery[]> {
  return fetchPublishedGalleryUncached();
}

export async function getAllGallery(): Promise<WorkGallery[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, description, image, category, is_published, sort_order, created_at
       FROM work_gallery
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as WorkGallery[];
  } catch (error) {
    console.error("Error fetching all gallery items:", error);
    return [];
  }
}

export async function getGalleryById(id: number): Promise<WorkGallery | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, description, image, category, is_published, sort_order, created_at
       FROM work_gallery
       WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as WorkGallery;
  } catch (error) {
    console.error("Error fetching gallery by id:", error);
    return null;
  }
}

export async function saveGalleryAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    image: formData.get("image"),
    category: formData.get("category") || "General",
    is_published: formData.get("is_published") === "1" || formData.get("is_published") === "true" ? 1 : 0,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, title, description, image, category, is_published, sort_order } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE work_gallery
         SET title = ?, description = ?, image = ?, category = ?, is_published = ?, sort_order = ?
         WHERE id = ?`,
        [title, description, image, category, is_published, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO work_gallery (title, description, image, category, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, image, category, is_published, sort_order]
      );
    }

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/dashboard/gallery");
    revalidateTag("gallery");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteGalleryAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM work_gallery WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/dashboard/gallery");
    revalidateTag("gallery");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
