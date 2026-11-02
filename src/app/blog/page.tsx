import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TextType from "@/components/common/TextType";
import { getPublishedBlogPosts } from "@/lib/actions/blog";

export const metadata: Metadata = {
  title: "Interior Design Journal & Architectural Insights | Wall Street Interiors",
  description:
    "Explore luxury interior design guides, acoustic paneling trends, modular kitchen innovations, and architectural surface treatments by Wall Street Interiors Srinagar.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main>
      <Breadcrumb title="Interior Journal" category="Design Articles" />

      <section className="blog-section section-padding fix">
        <div className="container">
          <div className="section-title text-center mb-50">
            <span
              className="subtitle style2"
              style={{
                color: "var(--theme)",
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.88rem",
              }}
            >
              Latest Insights
            </span>
            <TextType
              as="h2"
              className="title"
              text={["Architectural Trends & Interior Guides", "Living Space Design Stories", "Material & Finish Comparisons"]}
              typingSpeed={60}
              pauseDuration={2400}
              deletingSpeed={35}
              deleteMode="backspace"
              typeEffect="fade"
              cursorStyle="bar"
              cursorColor="var(--color-primary, #FF4035)"
              cursorGlide
              showCursor
              style={{ fontSize: "2.4rem", fontWeight: 800, marginTop: "8px" }}
            />
          </div>

          <div className="row g-4">
            {posts.length === 0 ? (
              <div className="col-12 text-center py-5">
                <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 20px" }}>
                  <i className="fa-regular fa-newspaper" style={{ fontSize: "3rem", color: "#94A3B8", marginBottom: "16px", display: "block" }}></i>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                    No Articles Published Yet
                  </h3>
                  <p style={{ color: "#64748B", fontSize: "0.95rem" }}>
                    Our architectural journal and interior design guides will be published here soon. Check back shortly.
                  </p>
                </div>
              </div>
            ) : (
              posts.map((post) => {
                const formattedDate = post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div key={post.id} className="col-xl-4 col-lg-6 col-md-6">
                    <div
                      className="single-blog-post"
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: "16px",
                        overflow: "hidden",
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
                        <Link href={`/blog/${post.slug}`}>
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.4s ease",
                              }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
                              <i className="fa-solid fa-newspaper" style={{ fontSize: "2.5rem" }}></i>
                            </div>
                          )}
                        </Link>
                      </div>

                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          fontSize: "0.85rem",
                          color: "#64748B",
                          marginBottom: "12px",
                        }}
                      >
                        <span>
                          <i className="fa-regular fa-user" style={{ color: "var(--theme)", marginRight: "6px" }}></i>
                          {post.author || "Admin"}
                        </span>
                        <span>
                          <i className="fa-solid fa-calendar-days" style={{ color: "var(--theme)", marginRight: "6px" }}></i>
                          {formattedDate}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.4, marginBottom: "12px", color: "var(--title)" }}>
                        <Link href={`/blog/${post.slug}`} style={{ color: "inherit" }}>
                          {post.title}
                        </Link>
                      </h4>

                      <p style={{ color: "#64748B", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>
                        {post.excerpt}
                      </p>

                      <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
                        <Link
                          href={`/blog/${post.slug}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "var(--theme)",
                            fontWeight: 700,
                            fontSize: "0.92rem",
                          }}
                        >
                          <span>Read Full Article</span>
                          <i className="fa-solid fa-arrow-right-long"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </section>
    </main>
  );
}
