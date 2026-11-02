"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export interface HomepagePromo {
  id: number;
  card_key: string;
  badge: string;
  title: string;
  description: string | null;
  image: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
}

const fetchHomepagePromosUncached = async (): Promise<HomepagePromo[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM homepage_promos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    );
    return rows.map((r) => ({
      id: r.id,
      card_key: r.card_key,
      badge: r.badge,
      title: r.title,
      description: r.description || null,
      image: r.image,
      button_text: r.button_text || "View All",
      button_link: r.button_link || "/shop",
      is_active: Boolean(r.is_active),
      sort_order: Number(r.sort_order || 0),
    }));
  } catch (error) {
    console.error("Error fetching homepage promos:", error);
    return [];
  }
};

export async function getHomepagePromos(): Promise<HomepagePromo[]> {
  return fetchHomepagePromosUncached();
}

export async function getAllHomepagePromosAdmin(): Promise<HomepagePromo[]> {
  await requireAuth();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM homepage_promos ORDER BY sort_order ASC, id ASC"
    );
    return rows.map((r) => ({
      id: r.id,
      card_key: r.card_key,
      badge: r.badge,
      title: r.title,
      description: r.description || null,
      image: r.image,
      button_text: r.button_text || "View All",
      button_link: r.button_link || "/shop",
      is_active: Boolean(r.is_active),
      sort_order: Number(r.sort_order || 0),
    }));
  } catch (error) {
    console.error("Error fetching admin promos:", error);
    return [];
  }
}

export async function saveHomepagePromoAction(formData: FormData) {
  await requireAuth();

  const idVal = formData.get("id");
  const id = idVal ? Number(idVal) : undefined;
  const card_key = (formData.get("card_key") as string) || `promo_${Date.now()}`;
  const badge = ((formData.get("badge") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const image = ((formData.get("image") as string) || "").trim() || "/assets/images/offer/promo1.png?v=2";
  const button_text = ((formData.get("button_text") as string) || "View All").trim();
  const button_link = ((formData.get("button_link") as string) || "/shop").trim();
  const is_active = formData.get("is_active") === "0" ? 0 : 1;
  const sort_order = Number(formData.get("sort_order") || 0);

  if (!title) {
    return { success: false, error: "Banner title is required" };
  }

  try {
    if (id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE homepage_promos
         SET badge = ?, title = ?, description = ?, image = ?, button_text = ?, button_link = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [badge, title, description || null, image, button_text, button_link, is_active, sort_order, id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO homepage_promos (card_key, badge, title, description, image, button_text, button_link, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [card_key, badge, title, description || null, image, button_text, button_link, is_active, sort_order]
      );
    }

    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    revalidateTag("promos");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save promo";
    return { success: false, error: msg };
  }
}

export async function deleteHomepagePromoAction(id: number) {
  await requireAuth();
  try {
    await pool.execute<ResultSetHeader>("DELETE FROM homepage_promos WHERE id = ?", [id]);
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    revalidateTag("promos");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete promo";
    return { success: false, error: msg };
  }
}
