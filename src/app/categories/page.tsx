import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Window Blinds & Custom Shading Collections | Wall Street Interiors",
  description: "Browse luxury Zebra, Roller, Roman, Vertical, and Motorized Blinds custom crafted for refined residential and commercial spaces in Srinagar.",
};

export const revalidate = 3600;

export interface CategoryListItem {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  image_alt?: string | null;
  blur_data_url?: string | null;
  short_description?: string | null;
}

async function getAllCategories(): Promise<CategoryListItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, slug, image, image_alt, blur_data_url, short_description FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
  );
  return rows as unknown as CategoryListItem[];
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="categories-directory bg-light">
      <Breadcrumb
        title="Window Treatment Collections"
        category="Categories"
        items={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: "680px", margin: "0 auto" }}>
            <span
              className="badge px-3 py-2 text-uppercase fw-bold mb-2"
              style={{ backgroundColor: "var(--theme, #FF4035)", color: "#fff" }}
            >
              Bespoke Atelier
            </span>
            <h1 className="display-6 fw-bold">Architectural Window Blinds &amp; Tracks</h1>
            <p className="text-muted">
              Select a specialized category below to explore technical specifications, fabric weave options,
              and motorized automation controls.
            </p>
          </div>

          <div className="row g-4">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  <div className="position-relative w-100 bg-light" style={{ aspectRatio: "4 / 3" }}>
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.image_alt || cat.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={idx === 0}
                        loading={idx === 0 ? "eager" : "lazy"}
                        style={{ objectFit: "cover" }}
                        placeholder={cat.blur_data_url ? "blur" : "empty"}
                        blurDataURL={cat.blur_data_url || undefined}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i className="fa-light fa-image fa-2x" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <h3 className="h5 fw-bold mb-2">
                        <Link href={`/category/${cat.slug}`} className="text-decoration-none text-dark">
                          {cat.name}
                        </Link>
                      </h3>
                      <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                        {cat.short_description || "Bespoke architectural blinds custom fitted for discerning properties."}
                      </p>
                    </div>

                    <Link
                      href={`/category/${cat.slug}`}
                      className="btn btn-outline-danger btn-sm rounded-pill fw-bold py-2 mt-2 w-100"
                    >
                      <span>Explore {cat.name}</span>
                      <i className="fa-solid fa-arrow-right-long ms-2" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

