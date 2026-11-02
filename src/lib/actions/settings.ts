"use server";

import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { homepageSettingsSchema } from "@/lib/validations";
import { HomepageSettings, SiteSettings, DashboardStats, ContactNumberItem, ContactEmailItem } from "@/types";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";
import { RowDataPacket, ResultSetHeader } from "mysql2";

import { parsePhoneNumbers, parseEmailAddresses } from "@/lib/settingsUtils";

const fetchHomepageSettingsUncached = async (): Promise<HomepageSettings> => {
  const fallback: HomepageSettings = {
    id: 1,
    hero_badge: "",
    hero_title: "Bespoke Italian Leather Recliner Lounge",
    hero_subtitle:
      "Transforming residential and commercial sanctuaries with precision interior craftsmanship, handcrafted furnishings, and direct B2B wholesale supply.",
    hero_price: "₹45,500",
    hero_colors: "#770215,#E9CF10,#35424B",
    hero_video_url: "https://www.youtube.com/watch?v=Cn4G2lZ_g2I",
    hero_video_thumb: "/assets/images/video/drone.png?v=2",
    hero_button_text: "Add To Cart",
    hero_button_link: "/shop",
    hero_secondary_button_text: "View Now",
    hero_secondary_button_link: "/shop",
    hero_image: "/assets/images/intro/introThumb1_1.png",
    hero_image_2: "/assets/images/intro/introThumb1_2.png",
    hero_image_3: "/assets/images/intro/introThumb1_3.png",
    years_experience: 12,
    repairs_completed: "1,850+ Projects",
    satisfaction_rate: "99.8%",
    about_heading: "Wall Street Interiors — Redefining Living Spaces with Timeless Craftsmanship",
    about_text:
      "Wall Street Interiors is Srinagar's premier studio for high-end interior architecture, bespoke handcrafted furniture, architectural wall paneling, and B2B wholesale trade supplies. We collaborate closely with architects, developers, and discerning homeowners across Kashmir to curate refined, timeless spaces.",
    about_image: "/assets/images/about-us/aboutThumb1_2.jpg",
    features_enabled: 1,
    features_json: JSON.stringify([
      { id: "f1", icon: "fa-solid fa-warehouse", title: "Importer-Direct Value", description: "Direct import: global designs at wholesale prices" },
      { id: "f2", icon: "fa-solid fa-snowflake", title: "Built for Kashmir", description: "Insulation & moisture-resistant winter materials" },
      { id: "f3", icon: "fa-solid fa-store", title: "Showroom & Godown Stock", description: "Touch live samples at Habba & Fateh Kadal" },
      { id: "f4", icon: "fa-solid fa-headset", title: "WhatsApp Room Quotes", description: "Send room photos for fast quotes & advice" },
    ]),
  };

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM homepage_settings WHERE id = 1 LIMIT 1"
    );
    if (!rows || rows.length === 0) return fallback;
    const r = rows[0];
    let formattedEndDate: string | undefined = undefined;
    if (r.weekly_deal_end_date) {
      if (r.weekly_deal_end_date instanceof Date) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const y = r.weekly_deal_end_date.getFullYear();
        const m = pad(r.weekly_deal_end_date.getMonth() + 1);
        const d = pad(r.weekly_deal_end_date.getDate());
        const h = pad(r.weekly_deal_end_date.getHours());
        const min = pad(r.weekly_deal_end_date.getMinutes());
        const s = pad(r.weekly_deal_end_date.getSeconds());
        formattedEndDate = `${y}-${m}-${d} ${h}:${min}:${s}`;
      } else {
        formattedEndDate = String(r.weekly_deal_end_date);
      }
    }
    return {
      ...(r as unknown as HomepageSettings),
      weekly_deal_end_date: formattedEndDate,
    };
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    return fallback;
  }
};

const getCachedHomepageSettings = unstable_cache(
  fetchHomepageSettingsUncached,
  ["homepage-settings"],
  { tags: ["homepage-settings"], revalidate: 300 }
);

export const getHomepageSettings = cache(async (): Promise<HomepageSettings> => {
  return getCachedHomepageSettings();
});

const fetchSiteSettingsUncached = async (): Promise<SiteSettings> => {
  const defaults: SiteSettings = {
    site_name: "Wall Street Interiors",
    tagline: "Imported Finishes for Kashmir Homes | Importer-Direct Interior Materials House",
    meta_title: "Wall Street Interiors | Srinagar's Importer-Direct Interior Materials House",
    meta_description: "Srinagar's importer-direct source for wallpapers, wooden flooring, PVC panels, faux tin ceilings & blinds at wholesale & retail rates. Showroom at Habba Kadal & Godown at Fateh Kadal. WhatsApp +919018454526.",
    meta_keywords: "wallpaper shop in Srinagar, wooden flooring Srinagar, PVC panels Srinagar, window blinds Srinagar, faux tin ceiling Kashmir, interior shop in Srinagar, wholesale interior material Kashmir, Wall Street Interiors Habba Kadal",
    meta_author: "Wall Street Interiors",
    site_logo: "",
    site_logo_white: "",
    site_favicon: "",
    company_address: "Showroom: Near New Habba Kadal Bridge, Habba Kadal, Srinagar, Jammu & Kashmir 190001",
    company_address_secondary: "Central Godown & Wholesale Depot: Near Syed Ali Akbar Mosque, Fateh Kadal, Srinagar, Jammu & Kashmir 190002",
    company_phone: "+91 9018454526",
    company_email: "contact@wallstreetinteriors.com",
    phone_numbers: JSON.stringify([
      { id: "p1", number: "+91 9018454526", label: "Habba Kadal Showroom & WhatsApp", is_primary: true },
      { id: "p2", number: "+91 7889804942", label: "Fateh Kadal Godown & Wholesale Desk", is_primary: false },
    ]),
    email_addresses: JSON.stringify([
      { id: "e1", email: "contact@wallstreetinteriors.com", label: "Client Inquiries & Orders", is_primary: true },
      { id: "e2", email: "wholesale@wallstreetinteriors.com", label: "B2B Trade & Contractor Desk", is_primary: false },
      { id: "e3", email: "projects@wallstreetinteriors.com", label: "Commercial & Hotel Fit-outs", is_primary: false },
    ]),
    working_hours: "Monday – Saturday: 9:30 AM – 7:30 PM | Sunday: By Appointment",
    footer_about: "Wall Street Interiors is Srinagar’s importer-direct interior materials house, where you can see it, touch it, and get it installed. We import directly from global manufacturers to supply homeowners, builders, and interior designers across Kashmir with wallpapers, wooden flooring, PVC panels, faux tin ceilings, and custom blinds at genuine wholesale-friendly prices.",
    facebook_url: "https://facebook.com/wallstreetinteriors",
    twitter_url: "https://x.com/wallstreetinteriors",
    youtube_url: "https://youtube.com/wallstreetinteriors",
    instagram_url: "https://instagram.com/wallstreetinteriors",
    linkedin_url: "https://linkedin.com/company/wallstreetinteriors",
    whatsapp_number: "+919018454526",
    emergency_contact: "+91 9018454526",
  };

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM site_settings"
    );
    const settings = { ...defaults };
    if (rows && rows.length > 0) {
      for (const row of rows) {
        settings[row.setting_key] = row.setting_value;
      }
    }
    return settings;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return defaults;
  }
};

const getCachedSiteSettings = unstable_cache(
  fetchSiteSettingsUncached,
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 300 }
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return getCachedSiteSettings();
});


export async function updateHomepageSettingsAction(formData: FormData) {
  await requirePermission("settings", "edit");

  const raw = {
    hero_badge: (formData.get("hero_badge") as string) || "",
    hero_title: formData.get("hero_title"),
    hero_subtitle: formData.get("hero_subtitle"),
    hero_price: formData.get("hero_price") || "",
    hero_colors: formData.get("hero_colors") || "",
    hero_video_url: formData.get("hero_video_url") || "",
    hero_video_thumb: formData.get("hero_video_thumb") || "",
    hero_button_text: formData.get("hero_button_text") || "Explore Collection",
    hero_button_link: formData.get("hero_button_link") || "/shop",
    hero_secondary_button_text: formData.get("hero_secondary_button_text") || "",
    hero_secondary_button_link: formData.get("hero_secondary_button_link") || "",
    hero_image: formData.get("hero_image"),
    hero_image_2: formData.get("hero_image_2") || "",
    hero_image_3: formData.get("hero_image_3") || "",
    years_experience: Number(formData.get("years_experience") || 0),
    repairs_completed: (formData.get("repairs_completed") as string) || "",
    satisfaction_rate: (formData.get("satisfaction_rate") as string) || "",
    about_heading: formData.get("about_heading"),
    about_text: formData.get("about_text"),
    about_image: formData.get("about_image"),
    features_enabled: formData.get("features_enabled") === "1" || formData.get("features_enabled") === "true" ? 1 : 0,
    features_json: (formData.get("features_json") as string) || "[]",
  };

  const parsed = homepageSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validation error" };
  }

  const d = parsed.data;

  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO homepage_settings (
        id, hero_badge, hero_title, hero_subtitle, hero_price, hero_colors,
        hero_video_url, hero_video_thumb, hero_button_text, hero_button_link,
        hero_secondary_button_text, hero_secondary_button_link,
        hero_image, hero_image_2, hero_image_3,
        years_experience, repairs_completed, satisfaction_rate, about_heading, about_text, about_image,
        features_enabled, features_json
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        hero_badge=VALUES(hero_badge), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle),
        hero_price=VALUES(hero_price), hero_colors=VALUES(hero_colors),
        hero_video_url=VALUES(hero_video_url), hero_video_thumb=VALUES(hero_video_thumb),
        hero_button_text=VALUES(hero_button_text), hero_button_link=VALUES(hero_button_link),
        hero_secondary_button_text=VALUES(hero_secondary_button_text), hero_secondary_button_link=VALUES(hero_secondary_button_link),
        hero_image=VALUES(hero_image), hero_image_2=VALUES(hero_image_2), hero_image_3=VALUES(hero_image_3),
        years_experience=VALUES(years_experience), repairs_completed=VALUES(repairs_completed),
        satisfaction_rate=VALUES(satisfaction_rate), about_heading=VALUES(about_heading), about_text=VALUES(about_text),
        about_image=VALUES(about_image),
        features_enabled=VALUES(features_enabled), features_json=VALUES(features_json)`,
      [
        d.hero_badge, d.hero_title, d.hero_subtitle, d.hero_price, d.hero_colors,
        d.hero_video_url, d.hero_video_thumb, d.hero_button_text, d.hero_button_link,
        d.hero_secondary_button_text, d.hero_secondary_button_link,
        d.hero_image, d.hero_image_2, d.hero_image_3,
        d.years_experience, d.repairs_completed, d.satisfaction_rate, d.about_heading, d.about_text, d.about_image,
        d.features_enabled, d.features_json
      ]
    );

    revalidateTag("homepage-settings");
    revalidatePath("/");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, error: message };
  }
}

export async function updateWeeklyDealsSettingsAction(formData: FormData) {
  await requirePermission("settings", "edit");

  const enabled = formData.get("weekly_deal_enabled") === "1" ? 1 : 0;
  const title = ((formData.get("weekly_deal_title") as string) || "Products Of The Week").trim();
  const subtitle = ((formData.get("weekly_deal_subtitle") as string) || "Hot Sell").trim();
  const endDate = ((formData.get("weekly_deal_end_date") as string) || "2026-12-31 23:59:59").trim();
  const timezone = ((formData.get("weekly_deal_timezone") as string) || "Asia/Kolkata").trim();
  const productIds = ((formData.get("weekly_deal_product_ids") as string) || "[]").trim();

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE homepage_settings
       SET weekly_deal_enabled = ?, weekly_deal_title = ?, weekly_deal_subtitle = ?,
           weekly_deal_end_date = ?, weekly_deal_timezone = ?, weekly_deal_product_ids = ?
       WHERE id = 1`,
      [enabled, title, subtitle, endDate, timezone, productIds]
    );

    revalidateTag("homepage-settings");
    revalidatePath("/");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return { success: false, error: message };
  }
}

export async function updateNewsletterModalSettingsAction(formData: FormData) {
  await requirePermission("settings", "edit");

  const enabled = formData.get("newsletter_modal_enabled") === "1" ? 1 : 0;
  const image = ((formData.get("newsletter_modal_image") as string) || "/assets/images/modal/common-modal.jpg").trim();
  const title = ((formData.get("newsletter_modal_title") as string) || "Subcribe to Our Newsletter").trim();
  const subtitle = ((formData.get("newsletter_modal_subtitle") as string) || "Subscribe to our newsletter and Save your 20% money with discount code today.").trim();
  const code = ((formData.get("newsletter_modal_code") as string) || "WALLSTREET20").trim();

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE homepage_settings
       SET newsletter_modal_enabled = ?,
           newsletter_modal_image = ?,
           newsletter_modal_title = ?,
           newsletter_modal_subtitle = ?,
           newsletter_modal_code = ?
       WHERE id = 1`,
      [enabled, image, title, subtitle, code]
    );

    revalidateTag("homepage-settings");
    revalidatePath("/");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return { success: false, error: message };
  }
}

export async function updateBundleOfferSettingsAction(formData: FormData) {
  await requirePermission("settings", "edit");

  const enabled = formData.get("bundle_offer_enabled") === "1" ? 1 : 0;
  const title = ((formData.get("bundle_offer_title") as string) || "").trim();
  const subtitle = ((formData.get("bundle_offer_subtitle") as string) || "").trim();
  const badge = ((formData.get("bundle_offer_badge") as string) || "").trim();
  const buttonText = ((formData.get("bundle_offer_button_text") as string) || "View All").trim();
  const buttonLink = ((formData.get("bundle_offer_button_link") as string) || "/shop").trim();
  const image = ((formData.get("bundle_offer_image") as string) || "").trim();
  const bgImage = ((formData.get("bundle_offer_bg_image") as string) || "").trim();

  try {
    await pool.execute<ResultSetHeader>(
      `UPDATE homepage_settings
       SET bundle_offer_enabled = ?,
           bundle_offer_title = ?,
           bundle_offer_subtitle = ?,
           bundle_offer_badge = ?,
           bundle_offer_button_text = ?,
           bundle_offer_button_link = ?,
           bundle_offer_image = ?,
           bundle_offer_bg_image = ?
       WHERE id = 1`,
      [enabled, title, subtitle, badge, buttonText, buttonLink, image, bgImage]
    );

    revalidateTag("homepage-settings");
    revalidatePath("/");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return { success: false, error: message };
  }
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requirePermission("settings", "edit");

  const keys = [
    "site_name",
    "tagline",
    "meta_title",
    "meta_description",
    "meta_keywords",
    "meta_author",
    "site_logo",
    "site_logo_white",
    "site_favicon",
    "company_address",
    "company_address_secondary",
    "company_phone",
    "company_email",
    "phone_numbers",
    "email_addresses",
    "working_hours",
    "footer_about",
    "facebook_url",
    "twitter_url",
    "youtube_url",
    "instagram_url",
    "linkedin_url",
    "whatsapp_number",
    "emergency_contact",
  ];

  try {
    for (const key of keys) {
      const val = formData.get(key);
      if (val !== null && typeof val === "string") {
        await pool.execute<ResultSetHeader>(
          `INSERT INTO site_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, val]
        );
      }
    }

    // Sync primary phone and email if phone_numbers and email_addresses were supplied
    const phoneNumbersRaw = formData.get("phone_numbers");
    if (phoneNumbersRaw && typeof phoneNumbersRaw === "string") {
      try {
        const parsedPhones = JSON.parse(phoneNumbersRaw);
        if (Array.isArray(parsedPhones) && parsedPhones.length > 0) {
          const primaryPhone = parsedPhones.find((p) => p.is_primary)?.number || parsedPhones[0].number;
          if (primaryPhone) {
            await pool.execute<ResultSetHeader>(
              `INSERT INTO site_settings (setting_key, setting_value) VALUES ('company_phone', ?)
               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
              [primaryPhone]
            );
          }
        }
      } catch (e) {
        console.error("Failed to sync primary phone:", e);
      }
    }

    const emailAddressesRaw = formData.get("email_addresses");
    if (emailAddressesRaw && typeof emailAddressesRaw === "string") {
      try {
        const parsedEmails = JSON.parse(emailAddressesRaw);
        if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
          const primaryEmail = parsedEmails.find((e) => e.is_primary)?.email || parsedEmails[0].email;
          if (primaryEmail) {
            await pool.execute<ResultSetHeader>(
              `INSERT INTO site_settings (setting_key, setting_value) VALUES ('company_email', ?)
               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
              [primaryEmail]
            );
          }
        }
      } catch (e) {
        console.error("Failed to sync primary email:", e);
      }
    }

    revalidateTag("site-settings");
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/contact");
    revalidatePath("/about");
    revalidatePath("/shop");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return { success: false, error: message };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM services) as servicesCount,
        (SELECT COUNT(*) FROM partner_brands) as brandsCount,
        (SELECT COUNT(*) FROM work_gallery) as galleryCount,
        (SELECT COUNT(*) FROM faqs) as faqsCount,
        (SELECT COUNT(*) FROM testimonials) as testimonialsCount,
        (SELECT COUNT(*) FROM blog_posts) as blogCount,
        (SELECT COUNT(*) FROM contact_submissions WHERE status = 'unread') as unreadSubmissionsCount,
        (SELECT COUNT(*) FROM contact_submissions) as totalSubmissionsCount,
        (SELECT COUNT(*) FROM products) as productsCount,
        (SELECT COUNT(*) FROM product_categories) as categoriesCount,
        (SELECT COUNT(*) FROM nav_menu_items) as menusCount,
        (SELECT COUNT(*) FROM careers) as careersCount,
        (SELECT COUNT(*) FROM career_applications) as careerApplicationsCount,
        (SELECT COUNT(*) FROM orders) as ordersCount,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'pending') as pendingOrdersCount,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders) as totalRevenue
    `);

    const s = rows[0] || {};
    return {
      servicesCount: Number(s.servicesCount || 0),
      brandsCount: Number(s.brandsCount || 0),
      galleryCount: Number(s.galleryCount || 0),
      faqsCount: Number(s.faqsCount || 0),
      testimonialsCount: Number(s.testimonialsCount || 0),
      blogCount: Number(s.blogCount || 0),
      unreadSubmissionsCount: Number(s.unreadSubmissionsCount || 0),
      totalSubmissionsCount: Number(s.totalSubmissionsCount || 0),
      productsCount: Number(s.productsCount || 0),
      categoriesCount: Number(s.categoriesCount || 0),
      menusCount: Number(s.menusCount || 0),
      careersCount: Number(s.careersCount || 0),
      careerApplicationsCount: Number(s.careerApplicationsCount || 0),
      ordersCount: Number(s.ordersCount || 0),
      pendingOrdersCount: Number(s.pendingOrdersCount || 0),
      totalRevenue: Number(s.totalRevenue || 0),
    };
  } catch (error) {
    console.error("Error calculating dashboard stats:", error);
    return {
      servicesCount: 0,
      brandsCount: 0,
      galleryCount: 0,
      faqsCount: 0,
      testimonialsCount: 0,
      blogCount: 0,
      unreadSubmissionsCount: 0,
      totalSubmissionsCount: 0,
      productsCount: 0,
      categoriesCount: 0,
      menusCount: 0,
    };
  }
}
