export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_name?: string;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image: string;
  price_range: string;
  is_published: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Career {
  id: number;
  title: string;
  slug: string;
  department: string;
  category_id: string;
  job_type: string;
  salary: string;
  location?: string;
  description: string;
  requirements?: string;
  posted_at?: string;
  is_published: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CareerApplication {
  id: number;
  career_id?: number | null;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  portfolio_url?: string;
  resume_url?: string;
  cover_note?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  created_at?: string;
}

export interface PartnerBrand {
  id: number;
  name: string;
  logo: string;
  website_url: string;
  is_active: number;
  sort_order: number;
  created_at?: string;
}

export interface WorkGallery {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  is_published: number;
  sort_order: number;
  created_at?: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  customer_role: string;
  avatar?: string;
  content: string;
  rating: number;
  is_published: number;
  sort_order: number;
  created_at?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_published: number;
  sort_order: number;
  created_at?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  author_avatar?: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactNumberItem {
  id: string;
  number: string;
  label: string;
  is_primary?: boolean;
}

export interface ContactEmailItem {
  id: string;
  email: string;
  label: string;
  is_primary?: boolean;
}

export interface SiteSettings {
  site_name?: string;
  tagline?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_author?: string;
  site_logo?: string;
  site_logo_white?: string;
  site_favicon?: string;
  company_address?: string;
  company_address_secondary?: string;
  company_phone?: string;
  company_email?: string;
  phone_numbers?: string; // JSON string of ContactNumberItem[]
  email_addresses?: string; // JSON string of ContactEmailItem[]
  working_hours?: string;
  footer_about?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  emergency_contact?: string;
  [key: string]: string | undefined;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomepageSettings {
  id: number;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_price?: string;
  hero_colors?: string;
  hero_video_url?: string;
  hero_video_thumb?: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_secondary_button_text: string;
  hero_secondary_button_link: string;
  hero_image: string;
  hero_image_2?: string;
  hero_image_3?: string;
  years_experience: number;
  repairs_completed: string;
  satisfaction_rate: string;
  about_heading: string;
  about_text: string;
  about_image: string;
  weekly_deal_enabled?: number | boolean;
  weekly_deal_title?: string;
  weekly_deal_subtitle?: string;
  weekly_deal_end_date?: string | Date;
  weekly_deal_timezone?: string;
  weekly_deal_product_ids?: string;
  bundle_offer_enabled?: number | boolean;
  bundle_offer_title?: string;
  bundle_offer_subtitle?: string;
  bundle_offer_button_text?: string;
  bundle_offer_button_link?: string;
  bundle_offer_badge?: string;
  bundle_offer_image?: string;
  bundle_offer_bg_image?: string;
  features_enabled?: number | boolean;
  features_json?: string;
  newsletter_modal_enabled?: number | boolean;
  newsletter_modal_image?: string;
  newsletter_modal_title?: string;
  newsletter_modal_subtitle?: string;
  newsletter_modal_code?: string;
  updated_at?: string;
}

export type { ProductVariation } from "@/lib/actions/variations";
export type { HomepagePromo } from "@/lib/actions/promos";

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  source: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
}

export interface DashboardStats {
  servicesCount: number;
  brandsCount: number;
  galleryCount: number;
  faqsCount: number;
  testimonialsCount: number;
  blogCount: number;
  unreadSubmissionsCount: number;
  totalSubmissionsCount: number;
  productsCount: number;
  categoriesCount: number;
  menusCount: number;
  careersCount?: number;
  careerApplicationsCount?: number;
  ordersCount?: number;
  pendingOrdersCount?: number;
  totalRevenue?: number;
}

