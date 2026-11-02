"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Career, CareerApplication } from "@/types";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Format relative time (e.g., "2 hours ago", "5 days ago")
 */
function getRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
}

/**
 * Fetch all published careers for the frontend
 */
const fetchPublishedCareersUncached = async (): Promise<Career[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order, created_at, updated_at
       FROM careers
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return (rows as Career[]).map((row) => ({
      ...row,
      posted_at: getRelativeTime(row.created_at),
    }));
  } catch (error) {
    console.error("Error fetching published careers:", error);
    return [];
  }
};

export async function getPublishedCareers(): Promise<Career[]> {
  return fetchPublishedCareersUncached();
}

/**
 * Fetch all careers for Admin dashboard
 */
export async function getAllCareers(): Promise<Career[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order, created_at, updated_at
       FROM careers
       ORDER BY sort_order ASC, id DESC`
    );
    return (rows as Career[]).map((row) => ({
      ...row,
      posted_at: getRelativeTime(row.created_at),
    }));
  } catch (error) {
    console.error("Error fetching all careers:", error);
    return [];
  }
}

/**
 * Fetch single career by ID
 */
export async function getCareerById(id: number): Promise<Career | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order, created_at, updated_at
       FROM careers
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as Career;
  } catch (error) {
    console.error("Error fetching career by id:", error);
    return null;
  }
}

/**
 * Helper to generate slug from title
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Admin action: Save or Update a Career
 */
export async function saveCareerAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const id = idVal ? Number(idVal) : undefined;
  const title = (formData.get("title") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const job_type = (formData.get("job_type") as string)?.trim() || "Full-time";
  const salary = (formData.get("salary") as string)?.trim() || "Competitive";
  const location = (formData.get("location") as string)?.trim() || "Srinagar / On-site";
  const description = (formData.get("description") as string)?.trim();
  const requirements = (formData.get("requirements") as string)?.trim() || "";
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_published =
    formData.get("is_published") === "1" ||
    formData.get("is_published") === "true" ||
    formData.get("is_published") === "on"
      ? 1
      : 0;

  if (!title || !department || !description) {
    return { success: false, error: "Title, Department, and Description are required." };
  }

  // Generate category_id from department
  const category_id = slugify(department);
  let slug = (formData.get("slug") as string)?.trim();
  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE careers
         SET title = ?, slug = ?, department = ?, category_id = ?, job_type = ?, salary = ?, location = ?, description = ?, requirements = ?, is_published = ?, sort_order = ?
         WHERE id = ?`,
        [title, slug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order, id]
      );
    } else {
      // Ensure slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const [existing] = await pool.execute<RowDataPacket[]>(
          `SELECT id FROM careers WHERE slug = ? LIMIT 1`,
          [finalSlug]
        );
        if (existing.length === 0) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await pool.execute<ResultSetHeader>(
        `INSERT INTO careers (title, slug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, finalSlug, department, category_id, job_type, salary, location, description, requirements, is_published, sort_order]
      );
    }

    revalidateTag("careers");
    revalidatePath("/careers");
    revalidatePath("/dashboard/careers");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving career:", error);
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

/**
 * Admin action: Toggle career publication status
 */
export async function toggleCareerStatusAction(id: number, is_published: boolean) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE careers SET is_published = ? WHERE id = ?`,
      [is_published ? 1 : 0, id]
    );

    revalidateTag("careers");
    revalidatePath("/careers");
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle status";
    return { success: false, error: message };
  }
}

/**
 * Admin action: Delete career
 */
export async function deleteCareerAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM careers WHERE id = ?", [id]);
    revalidateTag("careers");
    revalidatePath("/careers");
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}

/**
 * Public action: Submit Career Application
 */
export async function submitCareerApplicationAction(formData: FormData) {
  try {
    const careerIdVal = formData.get("career_id");
    const career_id = careerIdVal && Number(careerIdVal) > 0 ? Number(careerIdVal) : null;
    const job_title = (formData.get("job_title") as string)?.trim() || "General Resume Submission";
    const applicant_name = (formData.get("applicant_name") as string)?.trim();
    const applicant_email = (formData.get("applicant_email") as string)?.trim();
    const applicant_phone = (formData.get("applicant_phone") as string)?.trim();
    const portfolio_url = (formData.get("portfolio_url") as string)?.trim() || null;
    let resume_url = (formData.get("resume_url") as string)?.trim() || null;
    const cover_note = (formData.get("cover_note") as string)?.trim() || null;

    if (!applicant_name || !applicant_email || !applicant_phone) {
      return { success: false, error: "Full Name, Email Address, and Phone Number are required." };
    }

    // Handle resume file upload if provided
    const resumeFile = formData.get("resume_file") as File | null;
    if (resumeFile && resumeFile.size > 0) {
      // 20MB max
      if (resumeFile.size > 20 * 1024 * 1024) {
        return { success: false, error: "Resume file size must not exceed 20MB." };
      }

      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(resumeFile.name) || ".pdf";
      const randomHash = crypto.randomBytes(6).toString("hex");
      const cleanBase = path.basename(resumeFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      const fileName = `${Date.now()}_${cleanBase}_${randomHash}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
      resume_url = `/uploads/resumes/${fileName}`;
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO career_applications (career_id, job_title, applicant_name, applicant_email, applicant_phone, portfolio_url, resume_url, cover_note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [career_id, job_title, applicant_name, applicant_email, applicant_phone, portfolio_url, resume_url, cover_note]
    );

    revalidatePath("/dashboard/careers");
    return {
      success: true,
      message: "Thank you! Your application has been successfully submitted to our recruitment team.",
    };
  } catch (error: unknown) {
    console.error("Error submitting career application:", error);
    const message = error instanceof Error ? error.message : "Failed to submit application. Please try again.";
    return { success: false, error: message };
  }
}

/**
 * Admin action: Fetch candidate applications
 */
export async function getCareerApplications(careerId?: number): Promise<CareerApplication[]> {
  await requireAuth();

  try {
    let query = `
      SELECT id, career_id, job_title, applicant_name, applicant_email, applicant_phone, portfolio_url, resume_url, cover_note, status, created_at
      FROM career_applications
    `;
    const params: (number | string)[] = [];

    if (careerId && careerId > 0) {
      query += ` WHERE career_id = ?`;
      params.push(careerId);
    }

    query += ` ORDER BY created_at DESC, id DESC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as CareerApplication[];
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return [];
  }
}

/**
 * Admin action: Update application status
 */
export async function updateApplicationStatusAction(id: number, status: string) {
  await requireAuth();

  const validStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE career_applications SET status = ? WHERE id = ?`,
      [status, id]
    );
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return { success: false, error: message };
  }
}

/**
 * Admin action: Delete application
 */
export async function deleteApplicationAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM career_applications WHERE id = ?", [id]);
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
