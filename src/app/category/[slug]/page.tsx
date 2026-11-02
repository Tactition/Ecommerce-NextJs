import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Breadcrumb from "@/components/common/Breadcrumb";
import { getAllProducts } from "@/lib/actions/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export interface CategoryDetail {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  icon_type: string;
  image?: string | null;
  item_count: number;
  sort_order: number;
  is_featured: boolean;
  short_description?: string | null;
  description?: string | null;
  key_features: string[];
  best_for: string[];
  materials: string[];
  control_types: string[];
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keywords?: string | null;
  thumbnail?: string | null;
  image_alt?: string | null;
  blur_data_url?: string | null;
  faq_json: { question: string; answer: string }[];
  is_active: boolean;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT slug FROM product_categories WHERE is_active = 1"
  );
  return rows.map((r) => ({ slug: r.slug }));
}

async function getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM product_categories WHERE slug = ? AND is_active = 1 LIMIT 1",
    [slug]
  );
  if (rows.length === 0) return null;
  const r = rows[0] as any;

  const parseJsonField = (val: unknown) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  return {
    id: r.id,
    parent_id: r.parent_id,
    name: r.name,
    slug: r.slug,
    icon_type: r.icon_type,
    image: r.image,
    item_count: r.item_count,
    sort_order: r.sort_order,
    is_featured: Boolean(r.is_featured),
    short_description: r.short_description,
    description: r.description,
    key_features: parseJsonField(r.key_features),
    best_for: parseJsonField(r.best_for),
    materials: parseJsonField(r.materials),
    control_types: parseJsonField(r.control_types),
    seo_title: r.seo_title,
    meta_description: r.meta_description,
    focus_keywords: r.focus_keywords,
    thumbnail: r.thumbnail,
    image_alt: r.image_alt,
    blur_data_url: r.blur_data_url,
    faq_json: parseJsonField(r.faq_json),
    is_active: Boolean(r.is_active),
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | Wall Street Interiors" };
  }

  const title = category.seo_title || `${category.name} in Srinagar, Kashmir | Wall Street Interiors`;
  const description =
    category.meta_description ||
    category.description ||
    category.short_description ||
    `Explore ${category.name} in Srinagar, Kashmir. Importer-direct wholesale and retail pricing with real showroom samples at Wall Street Interiors.`;

  return {
    title,
    description,
    keywords: category.focus_keywords
      ? category.focus_keywords.split(", ")
      : [
          `${category.name} Srinagar`,
          `${category.name} Kashmir`,
          "interior materials Srinagar",
          "wholesale interior material Kashmir",
          "Wall Street Interiors Habba Kadal",
        ],
    openGraph: {
      title,
      description,
      images: category.image ? [{ url: category.image, alt: category.image_alt || category.name }] : undefined,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allProducts = await getAllProducts();
  const categoryProducts = allProducts.filter(
    (p) => p.category_slug === slug || p.subcategory_slug === slug
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wallstreetinteriors.com" },
          { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://wallstreetinteriors.com/categories" },
          { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://wallstreetinteriors.com/category/${slug}` },
        ],
      },
      category.faq_json && category.faq_json.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": category.faq_json.map((faq: { question: string; answer: string }) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      } : null,
    ].filter(Boolean),
  };

  return (
    <main className="category-detail-page bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        title={category.name}
        category="Window Treatments"
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {/* Hero Section with Sole LCP Priority Image */}
      <section className="category-hero-section py-5 bg-light border-bottom">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span
                className="badge mb-3 px-3 py-2 text-uppercase fw-bold"
                style={{ backgroundColor: "#0F172A", color: "#D4AF37", letterSpacing: "1px" }}
              >
                Importer-Direct • Srinagar, Kashmir
              </span>
              <h1 className="display-5 fw-bold mb-3" style={{ color: "var(--title, #0F172A)" }}>
                {category.name} in Srinagar
              </h1>
              <p className="lead text-secondary mb-4" style={{ lineHeight: 1.7, fontSize: "1.05rem" }}>
                {category.description || category.short_description}
              </p>

              {/* Best For Badges */}
              {category.best_for && category.best_for.length > 0 && (
                <div className="mb-4">
                  <span className="fw-bold d-block text-uppercase small text-muted mb-2">Ideal Kashmir Rooms &amp; Spaces:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {category.best_for.map((room: string) => (
                      <span key={room} className="badge bg-white text-dark border px-3 py-2 shadow-sm rounded-pill">
                        <i className="fa-solid fa-house-chimney text-danger me-2" aria-hidden="true" />
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex gap-3 pt-2 flex-wrap">
                <a
                  href={`https://wa.me/919018454526?text=${encodeURIComponent(
                    `Hi Wall Street Interiors, I am interested in ${category.name} options and wholesale/retail pricing for my home in Kashmir.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn"
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "#FFFFFF" }}
                >
                  <i className="fa-brands fa-whatsapp me-2" />
                  <span>Get WhatsApp Quote</span>
                </a>
                <Link href="#products-grid" className="btn btn-outline-dark rounded-pill px-4 py-3 fw-semibold">
                  Browse {category.name} Catalog
                </Link>
                <Link href="/contact" className="btn btn-light rounded-pill px-4 py-3 fw-semibold border">
                  Visit Showroom
                </Link>
              </div>
            </div>

            {/* Zero-CLS Hero Image Container */}
            <div className="col-lg-6">
              <div
                className="position-relative overflow-hidden rounded-4 shadow-lg bg-light"
                style={{ aspectRatio: "12 / 8", width: "100%" }}
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.image_alt || category.name}
                    fill
                    priority={true}
                    sizes="(max-width: 992px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    placeholder={category.blur_data_url ? "blur" : "empty"}
                    blurDataURL={category.blur_data_url || undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Architectural Features Grid */}
      {category.key_features && category.key_features.length > 0 && (
        <section className="features-section py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-danger fw-bold text-uppercase small">Engineering &amp; Aesthetics</span>
              <h2 className="fw-bold mt-1">Key Performance Features</h2>
            </div>
            <div className="row g-4">
              {category.key_features.map((feature: string, idx: number) => (
                <div key={idx} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm p-4 rounded-3 bg-light">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                        style={{ width: "36px", height: "36px", backgroundColor: "var(--theme, #FF4035)" }}
                      >
                        <i className="fa-solid fa-check" aria-hidden="true" />
                      </div>
                      <p className="mb-0 fw-semibold text-dark" style={{ lineHeight: 1.5 }}>
                        {feature}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Catalog Grid */}
      <section id="products-grid" className="products-section py-5 bg-light border-top">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-danger fw-bold text-uppercase small">Made to Measure</span>
              <h2 className="fw-bold mt-1">{category.name} Catalog</h2>
            </div>
            <span className="text-muted small fw-semibold">
              Showing {categoryProducts.length} models
            </span>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="row g-4">
              {categoryProducts.map((p) => (
                <div key={p.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3">
                    <div className="position-relative w-100 overflow-hidden rounded bg-light mb-3" style={{ aspectRatio: "1 / 1" }}>
                      <Link href={`/product/${p.slug}`}>
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} sizes="25vw" loading="lazy" />
                        ) : null}
                      </Link>
                    </div>
                    <h5 className="h6 fw-bold mb-1">
                      <Link href={`/product/${p.slug}`} className="text-dark text-decoration-none">
                        {p.name}
                      </Link>
                    </h5>
                    <span className="fw-bold text-danger">₹{Number(p.price).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-white rounded-3 shadow-sm p-5">
              <i className="fa-solid fa-store fa-3x text-muted mb-3" aria-hidden="true" />
              <h4 className="fw-bold">Importer-Direct Stock Available at Showroom</h4>
              <p className="text-muted mb-4" style={{ maxWidth: "560px", margin: "0 auto" }}>
                We stock hundreds of imported {category.name} options live at our Srinagar showroom near New Habba Kadal Bridge and central godown at Fateh Kadal. Contact our trade desk for physical swatch books, sample boards, or WhatsApp delivery.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <a
                  href={`https://wa.me/919018454526?text=${encodeURIComponent(
                    `Hi Wall Street Interiors, please send available catalog options and pricing for ${category.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn"
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "#FFFFFF" }}
                >
                  <i className="fa-brands fa-whatsapp me-2" />
                  <span>Request WhatsApp Catalog</span>
                </a>
                <Link href="/contact" className="btn btn-outline-dark rounded-pill px-4 py-3 fw-semibold">
                  Visit Srinagar Showroom
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Structured SEO FAQ Accordion */}
      {category.faq_json && category.faq_json.length > 0 && (
        <section className="faq-section py-5">
          <div className="container" style={{ maxWidth: "860px" }}>
            <div className="text-center mb-5">
              <span className="text-danger fw-bold text-uppercase small">Technical Guidance</span>
              <h2 className="fw-bold mt-1">Frequently Asked Questions</h2>
            </div>

            <div className="accordion" id="categoryFaqAccordion">
              {category.faq_json.map((faq: { question: string; answer: string }, idx: number) => (
                <div key={idx} className="accordion-item mb-3 border rounded-3 shadow-sm overflow-hidden">
                  <h3 className="accordion-header" id={`heading-${idx}`}>
                    <button
                      className={`accordion-button fw-bold py-3 ${idx !== 0 ? "collapsed" : ""}`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${idx}`}
                      aria-expanded={idx === 0}
                      aria-controls={`collapse-${idx}`}
                    >
                      {faq.question}
                    </button>
                  </h3>
                  <div
                    id={`collapse-${idx}`}
                    className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                    aria-labelledby={`heading-${idx}`}
                    data-bs-parent="#categoryFaqAccordion"
                  >
                    <div className="accordion-body text-secondary" style={{ lineHeight: 1.7 }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

