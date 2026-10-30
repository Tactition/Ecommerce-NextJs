"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { contactSchema } from "@/lib/validations";
import { ContactSubmission } from "@/types";
import { revalidatePath } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function submitContactFormAction(prevState: unknown, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid contact form inputs.",
    };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'unread')`,
      [name, email, phone, subject, message]
    );

    revalidatePath("/dashboard/submissions");

    return {
      success: true,
      message: "Thank you for reaching out! Our service engineering team will contact you within 2 hours.",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record message";
    return {
      success: false,
      error: msg,
    };
  }
}

export async function getRecentContactSubmissions(limit = 5): Promise<ContactSubmission[]> {
  await requireAuth();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, subject, message, status, created_at
       FROM contact_submissions
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
    return rows as ContactSubmission[];
  } catch (error) {
    console.error("Error fetching recent contact submissions:", error);
    return [];
  }
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  await requireAuth();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, subject, message, status, created_at
       FROM contact_submissions
       ORDER BY id DESC`
    );
    return rows as ContactSubmission[];
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }
}

export async function updateSubmissionStatusAction(id: number, status: "unread" | "read" | "archived") {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>(
      "UPDATE contact_submissions SET status = ? WHERE id = ?",
      [status, id]
    );
    revalidatePath("/dashboard/submissions");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function deleteSubmissionAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>(
      "DELETE FROM contact_submissions WHERE id = ?",
      [id]
    );
    revalidatePath("/dashboard/submissions");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: msg };
  }
}
