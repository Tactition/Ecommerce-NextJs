"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { blogSchema } from "@/lib/validations";
import { BlogPost } from "@/types";
export type { BlogPost };
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const fetchPublishedBlogPostsUncached = async (): Promise<BlogPost[]> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status, published_at, created_at, updated_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC, id DESC`
    );
    return rows as BlogPost[];
  } catch (error) {
    console.error("Error fetching published blog posts:", error);
    return [];
  }
};

const fetchPublishedBlogPostsCached = unstable_cache(
  fetchPublishedBlogPostsUncached,
  ["published-blog-posts-cache"],
  { tags: ["blogs"], revalidate: 3600 }
);

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return fetchPublishedBlogPostsCached();
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status, published_at, created_at, updated_at
       FROM blog_posts
       ORDER BY id DESC`
    );
    return rows as BlogPost[];
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }
}

const fetchBlogPostBySlugUncached = async (slug: string): Promise<BlogPost | null> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status, published_at, created_at, updated_at
       FROM blog_posts
       WHERE slug = ? AND status = 'published'
       LIMIT 1`,
      [slug]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }
};

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const cachedFn = unstable_cache(
    fetchBlogPostBySlugUncached,
    [`blog-post-${slug}`],
    { tags: ["blogs", `blog-${slug}`], revalidate: 3600 }
  );
  return cachedFn(slug);
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status, published_at, created_at, updated_at
       FROM blog_posts
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0] as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post by id:", error);
    return null;
  }
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const raw = {
    id: idVal ? Number(idVal) : undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    featured_image: formData.get("featured_image"),
    author: formData.get("author") || "Wall Street Editorial Team",
    author_avatar: formData.get("author_avatar") || undefined,
    category: formData.get("category") || undefined,
    meta_title: formData.get("meta_title") || undefined,
    meta_description: formData.get("meta_description") || undefined,
    status: (formData.get("status") as "draft" | "published") || "published",
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const { id, title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status } = parsed.data;

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE blog_posts
         SET title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?, author = ?, author_avatar = ?, category = ?, meta_title = ?, meta_description = ?, status = ?
         WHERE id = ?`,
        [title, slug, excerpt, content, featured_image, author, author_avatar || null, category || null, meta_title || null, meta_description || null, status, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author, author_avatar, category, meta_title, meta_description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, excerpt, content, featured_image, author, author_avatar || null, category || null, meta_title || null, meta_description || null, status]
      );
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/dashboard/blog");
    revalidateTag("blogs");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function deleteBlogPostAction(id: number) {
  await requireAuth();

  try {
    await pool.execute<ResultSetHeader>("DELETE FROM blog_posts WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog");
    revalidateTag("blogs");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}
