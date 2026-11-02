import React from "react";
import Link from "next/link";
import { ProductCategory } from "@/lib/actions/products";

interface CategorySectionProps {
  categories: ProductCategory[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="product-section section-padding fix" style={{ padding: "60px 0" }}>
      <div className="product-contianer-wrapper style1">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {categories.map((cat) => {
              const coverImage = cat.image?.trim() || "";
              return (
                <div key={cat.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <Link href={`/shop?category=${cat.slug}`} className="text-decoration-none d-block">
                    <div
                      className="wsi-category-image-card"
                      style={{
                        position: "relative",
                        height: "280px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                        border: "1.5px solid rgba(226, 232, 240, 0.8)",
                        backgroundColor: "#0F172A",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow = "0 20px 35px rgba(0, 0, 0, 0.22), 0 0 0 1px #D4AF37";
                        e.currentTarget.style.borderColor = "#D4AF37";
                        const img = e.currentTarget.querySelector("img");
                        if (img) img.style.transform = "scale(1.08)";
                        const pill = e.currentTarget.querySelector(".wsi-cat-pill") as HTMLElement;
                        if (pill) {
                          pill.style.backgroundColor = "rgba(212, 175, 55, 0.95)";
                          pill.style.borderColor = "#D4AF37";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(15, 23, 42, 0.08)";
                        e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
                        const img = e.currentTarget.querySelector("img");
                        if (img) img.style.transform = "scale(1)";
                        const pill = e.currentTarget.querySelector(".wsi-cat-pill") as HTMLElement;
                        if (pill) {
                          pill.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                          pill.style.borderColor = "rgba(255, 255, 255, 0.35)";
                        }
                      }}
                    >
                      {/* Full-bleed Category Image or Luxury Icon Pattern */}
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={cat.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            background: "radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 1) 75%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: "50px",
                          }}
                        >
                          <i className="fa-solid fa-shapes" style={{ fontSize: "36px", color: "#D4AF37" }}></i>
                        </div>
                      )}

                      {/* Vignette Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.84) 82%, rgba(15, 23, 42, 0.96) 100%)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Overlayed Title & Product Count */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "20px 18px",
                          zIndex: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <h5
                          style={{
                            fontSize: "1.08rem",
                            fontWeight: 800,
                            color: "#FFFFFF",
                            margin: 0,
                            lineHeight: 1.25,
                            textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {cat.name}
                        </h5>

                        <div
                          className="wsi-cat-pill"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.35)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            color: "#FFFFFF",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#D4AF37",
                            }}
                          ></span>
                          <span>
                            {cat.item_count ? `${cat.item_count} ${cat.item_count === 1 ? "Product" : "Products"}` : "0 Products"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
