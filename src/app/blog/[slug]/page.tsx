import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import BlogCommentForm from "@/components/blog/BlogCommentForm";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/actions/blog";

interface BlogSlugProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogSlugProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Wall Street Interiors",
    };
  }

  return {
    title: `${post.meta_title || post.title} | Wall Street Interiors`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image],
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: BlogSlugProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getPublishedBlogPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const recentPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.meta_description,
    "image": post.featured_image ? (post.featured_image.startsWith("http") ? post.featured_image : `https://wallstreetinteriors.com${post.featured_image}`) : undefined,
    "author": {
      "@type": "Organization",
      "name": post.author || "Wall Street Interiors",
      "url": "https://wallstreetinteriors.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wall Street Interiors",
      "url": "https://wallstreetinteriors.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wallstreetinteriors.com/assets/images/logo/logo.png"
      }
    },
    "datePublished": post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString(),
    "dateModified": post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
    "mainEntityOfPage": `https://wallstreetinteriors.com/blog/${post.slug}`
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {/* Breadcrumb matching blog-details.html */}
      <Breadcrumb
        title={post.title}
        category="Blog"
        items={[
          { label: "Blog", href: "/blog" },
          { label: "Blog Details" },
        ]}
      />

      {/* Blog Details Section */}
      <section className="blog-details fix section-padding">
        <div className="container">
          <div className="blog-details-area">
            <div className="row g-5">
              {/* Left Column: Post Details */}
              <div className="col-lg-9">
                <div className="blog-post-details">
                  <div className="single-blog-post">
                    <h3 className="single-blog-post__title">
                      <span style={{ color: "inherit" }}>{post.title}</span>
                    </h3>

                    {post.featured_image && (
                      <div className="single-blog-post__thumb" style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "30px" }}>
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          fetchPriority="high"
                          decoding="async"
                          style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
                        />
                        <div className="single-blog-post__thumb--post-date">
                          <ul>
                            <li>
                              <i className="fa-regular fa-user"></i>
                              By {post.author || "Admin"}
                            </li>
                            <li>
                              <i className="fa-solid fa-calendar-days"></i>
                              {formattedDate}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="single-blog-post__blog-details-content">
                      {/* Excerpt / Lead paragraph */}
                      {post.excerpt && (
                        <p className="single-blog-post__blog-details-content--subtitle" style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--title)" }}>
                          {post.excerpt}
                        </p>
                      )}

                      {/* Main Dynamic Post Content from Database */}
                      <div
                        className="blog-content-html"
                        style={{ fontSize: "1.02rem", lineHeight: 1.85, color: "var(--text)", marginBottom: "30px" }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {/* WhatsApp Consultation & Showroom CTA Card */}
                      <div
                        style={{
                          margin: "30px 0",
                          padding: "24px 28px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "20px",
                          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
                        }}
                      >
                        <div style={{ maxWidth: "560px" }}>
                          <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Srinagar Interior Consultation
                          </span>
                          <h4 style={{ color: "#FFFFFF", fontWeight: 700, marginTop: "4px", marginBottom: "8px", fontSize: "1.25rem" }}>
                            Planning a Renovation or Wedding Makeover in Kashmir?
                          </h4>
                          <p style={{ color: "#94A3B8", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                            Send photos or dimensions of your room directly to our Srinagar design desk. Get instant estimates, sample videos, and contractor wholesale pricing.
                          </p>
                        </div>
                        <a
                          href="https://wa.me/919018454526?text=Hi%20Wall%20Street%20Interiors,%20I%20just%20read%20your%20article%20and%20would%20like%20guidance%20on%20interior%20materials%20for%20my%20home%20in%20Kashmir."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-btn"
                          style={{
                            backgroundColor: "#25D366",
                            borderColor: "#25D366",
                            color: "#FFFFFF",
                            padding: "12px 24px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 600,
                            borderRadius: "50px",
                          }}
                        >
                          <i className="fa-brands fa-whatsapp fs-5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tag and Social Share Wrap */}
                  <div className="row tag-share-wrap mt-4 mb-5">
                    <div className="col-lg-8 col-12">
                      <div className="tagcloud">
                        <Link href="/blog">Interior Design</Link>
                        <Link href="/blog">Acoustics</Link>
                        <Link href="/blog">Luxury Furniture</Link>
                        <Link href="/blog">Architecture</Link>
                        <Link href="/blog">Woodwork</Link>
                      </div>
                    </div>
                    <div className="col-lg-4 col-12 mt-3 mt-lg-0 text-lg-end">
                      <div className="social-share">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Comment Form with Instant Client Feedback */}
                  <BlogCommentForm />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-lg-3">
                <div className="main-sidebar-2">
                  {/* Search Widget */}
                  <div className="single-sidebar-widget">
                    <div className="single-sidebar-widget__search-widget">
                      <form action="/blog" method="GET">
                        <input type="text" name="q" placeholder="Search articles..." />
                        <button type="submit" aria-label="Search">
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Dynamic Recent Posts from Database */}
                  {recentPosts.length > 0 && (
                    <div className="single-sidebar-widget">
                      <div className="single-sidebar-widget__wid-title">
                        <h3 className="single-sidebar-widget__wid-title--title">Recent Articles</h3>
                      </div>
                      <div className="single-sidebar-widget__recent-post-area">
                        {recentPosts.map((rPost) => (
                          <div key={rPost.id} className="single-sidebar-widget__recent-post-area__recent-items">
                            <div className="single-sidebar-widget__recent-post-area__recent-items--recent-thumb" style={{ width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                              <Link href={`/blog/${rPost.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                                {rPost.featured_image ? (
                                  <img
                                    src={rPost.featured_image}
                                    alt={rPost.title}
                                    loading="lazy"
                                    decoding="async"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
                                    <i className="fa-solid fa-newspaper" style={{ fontSize: "1.2rem" }}></i>
                                  </div>
                                )}
                              </Link>
                            </div>
                            <div className="single-sidebar-widget__recent-post-area__recent-items--recent-content">
                              <ul>
                                <li>
                                  <i className="fa-solid fa-calendar-days"></i>
                                  {rPost.published_at ? new Date(rPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                                </li>
                              </ul>
                              <h6>
                                <Link href={`/blog/${rPost.slug}`}>{rPost.title}</Link>
                              </h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Topics */}
                  <div className="single-sidebar-widget">
                    <div className="single-sidebar-widget__wid-title">
                      <h3 className="single-sidebar-widget__wid-title--title">Recommended Topics</h3>
                    </div>
                    <div className="single-sidebar-widget__blog-widget-categories">
                      <div className="single-sidebar-widget__blog-widget-categories--tagcloud">
                        <Link href="/blog">Luxury Furniture</Link>
                        <Link href="/blog">Acoustic Paneling</Link>
                        <Link href="/blog">Modular Kitchens</Link>
                        <Link href="/blog">Architectural Lighting</Link>
                        <Link href="/blog">Hardware &amp; Finishes</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
