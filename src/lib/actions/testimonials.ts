"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validations";
import { Testimonial } from "@/types";
export type { Testimonial };
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchPublishedTestimonialsUncached = async (): Promise<Testimonial[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, customer_name, customer_role, avatar, content, rating, is_published, sort_order, created_at
       FROM testimonials
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as Testimonial[];
  } catch (error) {
    console.error("Error fetching published testimonials:", error);
    return [];
  }
};

const fetchPublishedTestimonialsCached = unstable_cache(
  fetchPublishedTestimonialsUncached,
  ["published-testimonials-cache"],
  { tags: ["testimonials"], revalidate: 3600 }
);

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  return fetchPublishedTestimonialsCached();
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, customer_name, customer_role, avatar, content, rating, is_published, sort_order, created_at
       FROM testimonials
       ORDER BY sort_order ASC, id DESC`
    );
    return rows as Testimonial[];
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    return [];
  }
}

export async function getTestimonialById(id: number): Promise<Testimonial | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, customer_name, customer_role, avatar, content, rating, is_published, sort_order, created_at
       FROM testimonials
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as Testimonial;
  } catch (error) {
    console.error("Error fetching testimonial by id:", error);
    return null;
  }
}

export async function saveTestimonialAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    customer_name: formData.get("customer_name"),
    customer_role: formData.get("customer_role") || "",
    avatar: formData.get("avatar") || "",
    content: formData.get("content"),
    rating: Number(formData.get("rating") || 5),
    is_published: formData.get("is_published") === "1" || formData.get("is_published") === "true" ? 1 : 0,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const parsed = testimonialSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, customer_name, customer_role, avatar, content, rating, is_published, sort_order } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE testimonials
         SET customer_name = ?, customer_role = ?, avatar = ?, content = ?, rating = ?, is_published = ?, sort_order = ?
         WHERE id = ?`,
        [customer_name, customer_role, avatar, content, rating, is_published, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO testimonials (customer_name, customer_role, avatar, content, rating, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, customer_role, avatar, content, rating, is_published, sort_order]
      );
    }

    revalidatePath("/");
    revalidatePath("/dashboard/testimonials");
    revalidateTag("testimonials");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteTestimonialAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM testimonials WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/dashboard/testimonials");
    revalidateTag("testimonials");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
