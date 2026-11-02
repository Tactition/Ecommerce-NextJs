"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { faqSchema } from "@/lib/validations";
import { FAQ } from "@/types";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchPublishedFAQsUncached = async (): Promise<FAQ[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, question, answer, is_published, sort_order, created_at
       FROM faqs
       WHERE is_published = 1
       ORDER BY sort_order ASC, id ASC`
    );
    return rows as FAQ[];
  } catch (error) {
    console.error("Error fetching published FAQs:", error);
    return [];
  }
};

export async function getPublishedFAQs(): Promise<FAQ[]> {
  return fetchPublishedFAQsUncached();
}

export async function getAllFAQs(): Promise<FAQ[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, question, answer, is_published, sort_order, created_at
       FROM faqs
       ORDER BY sort_order ASC, id ASC`
    );
    return rows as FAQ[];
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    return [];
  }
}

export async function saveFAQAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    question: formData.get("question"),
    answer: formData.get("answer"),
    is_published: formData.get("is_published") === "1" || formData.get("is_published") === "true" ? 1 : 0,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const parsed = faqSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, question, answer, is_published, sort_order } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE faqs
         SET question = ?, answer = ?, is_published = ?, sort_order = ?
         WHERE id = ?`,
        [question, answer, is_published, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO faqs (question, answer, is_published, sort_order)
         VALUES (?, ?, ?, ?)`,
        [question, answer, is_published, sort_order]
      );
    }

    revalidatePath("/");
    revalidatePath("/dashboard/faqs");
    revalidateTag("faqs");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteFAQAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM faqs WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/dashboard/faqs");
    revalidateTag("faqs");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
