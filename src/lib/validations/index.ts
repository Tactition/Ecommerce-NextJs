import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full Name must be at least 2 characters."),
    email: z.string().email("Please provide a valid email address."),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const serviceSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug is required and must be URL friendly.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens."),
  short_description: z.string().min(10, "Short description must be at least 10 characters."),
  description: z.string().min(20, "Detailed description is required."),
  image: z.string().min(1, "An image URL is required."),
  price_range: z.string().default("Starts from ₹1,500 / sq.ft"),
  is_published: z.coerce.number().default(1),
  sort_order: z.coerce.number().default(0),
});

export const brandSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, "Brand name is required."),
  logo: z.string().min(1, "Brand logo URL is required."),
  website_url: z.string().url("Must be a valid URL.").or(z.literal("#")).default("#"),
  is_active: z.coerce.number().default(1),
  sort_order: z.coerce.number().default(0),
});

export const gallerySchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
  image: z.string().min(1, "Image path is required."),
  category: z.string().min(2, "Category is required."),
  is_published: z.coerce.number().default(1),
  sort_order: z.coerce.number().default(0),
});

export const testimonialSchema = z.object({
  id: z.coerce.number().optional(),
  customer_name: z.string().min(2, "Customer name is required."),
  customer_role: z.string().optional().default(""),
  avatar: z.string().optional().default(""),
  content: z.string().min(10, "Review content must be at least 10 characters."),
  rating: z.coerce.number().min(1).max(5).default(5),
  is_published: z.coerce.number().default(1),
  sort_order: z.coerce.number().default(0),
});

export const faqSchema = z.object({
  id: z.coerce.number().optional(),
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
  is_published: z.coerce.number().default(1),
  sort_order: z.coerce.number().default(0),
});

export const blogSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  slug: z.string().min(3, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(30, "Article content must be at least 30 characters."),
  featured_image: z.string().min(1, "Featured image is required."),
  author: z.string().default("Wall Street Editorial Team"),
  author_avatar: z.string().optional(),
  category: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(["draft", "published"]).default("published"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(7, "Valid phone number is required."),
  subject: z.string().min(3, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export const homepageSettingsSchema = z.object({
  hero_badge: z.string().optional().default(""),
  hero_title: z.string().min(2, "Hero title is required."),
  hero_subtitle: z.string().min(5, "Hero subtitle is required."),
  hero_price: z.string().default("₹45,500"),
  hero_colors: z.string().default("#770215,#E9CF10,#35424B"),
  hero_video_url: z.string().default("https://www.youtube.com/watch?v=Cn4G2lZ_g2I"),
  hero_video_thumb: z.string().optional().default("/assets/images/video/drone.png?v=2"),
  hero_button_text: z.string().default("Add To Cart"),
  hero_button_link: z.string().default("/shop"),
  hero_secondary_button_text: z.string().default("View Now"),
  hero_secondary_button_link: z.string().default("/shop"),
  hero_image: z.string().min(1, "Hero image is required."),
  hero_image_2: z.string().optional().default("/assets/images/intro/introThumb1_2.png"),
  hero_image_3: z.string().optional().default("/assets/images/intro/introThumb1_3.png"),
  years_experience: z.coerce.number().default(18),
  repairs_completed: z.string().default("28,500+"),
  satisfaction_rate: z.string().default("99.6%"),
  about_heading: z.string().min(5, "About heading is required."),
  about_text: z.string().min(20, "About text is required."),
  about_image: z.string().min(1, "About image is required."),
  features_enabled: z.coerce.number().default(1),
  features_json: z.string().optional().default("[]"),
});

export const productSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens."),
  category_slug: z.string().min(1, "Category slug is required."),
  category_name: z.string().min(1, "Category name is required."),
  subcategory_slug: z.string().optional().nullable(),
  subcategory_name: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be non-negative."),
  original_price: z.coerce.number().optional().nullable(),
  discount_percent: z.coerce.number().default(0),
  rating: z.coerce.number().min(1).max(5).default(5),
  reviews_count: z.coerce.number().default(0),
  image: z.string().min(1, "Product image is required."),
  gallery_images: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  badge: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  is_best_seller: z.coerce.number().default(0),
  is_featured: z.coerce.number().default(0),
  is_popular: z.coerce.number().default(0),
  is_on_sale: z.coerce.number().default(0),
  has_variations: z.coerce.number().default(0),
  allow_custom_sizing: z.coerce.number().default(0),
  custom_size_rate: z.coerce.number().default(0),
  custom_size_unit: z.enum(["sq_ft", "linear_ft"]).default("sq_ft"),
  custom_size_min_price: z.coerce.number().default(0),
  custom_size_linear_mode: z.enum(["length_plus_width", "single_length"]).default("length_plus_width"),
  stock: z.coerce.number().default(10),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const categorySchema = z.object({
  id: z.coerce.number().optional(),
  parent_id: z.coerce.number().optional().nullable(),
  name: z.string().min(2, "Category name is required."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens."),
  icon_type: z.string().default("fa-solid fa-shapes"),
  image: z.string().optional().nullable(),
  item_count: z.coerce.number().default(0),
  is_active: z.coerce.number().default(1),
});

export const menuItemSchema = z.object({
  id: z.coerce.number().optional(),
  label: z.string().min(1, "Menu label is required."),
  url: z.string().min(1, "Menu URL is required."),
  target: z.string().default("_self"),
  parent_id: z.coerce.number().optional().nullable(),
  menu_location: z.enum(["header", "categories", "footer"]).default("header"),
  sort_order: z.coerce.number().default(0),
  is_active: z.coerce.number().default(1),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Valid email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.string().min(2, "Valid role is required."),
});

export const userUpdateSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Valid email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")),
  role: z.string().min(2, "Valid role is required."),
});

export const roleCreateSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Role slug must be at least 2 characters.")
    .regex(/^[a-z0-9_-]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores."),
  description: z.string().max(255).optional().or(z.literal("")),
  permissions: z.array(z.string()).default([]),
});

export const roleUpdateSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(2, "Role name must be at least 2 characters."),
  description: z.string().max(255).optional().or(z.literal("")),
  permissions: z.array(z.string()).default([]),
});



