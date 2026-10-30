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

  return (
    <main>
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

                    <div className="single-blog-post__thumb" style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "30px" }}>
                      <img
                        src={post.featured_image || "/assets/images/blog/blog-details-thumb1_1.jpg"}
                        alt={post.title}
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

                      {/* Supporting Detail Images */}
                      <div className="row g-4 mb-30">
                        <div className="col-lg-6">
                          <div className="single-blog-post__blog-details-content--details-image" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            <img
                              src="/assets/images/blog/blog-details-thumb1_2.jpg"
                              alt="Diagnostic Lab"
                              style={{ width: "100%", height: "260px", objectFit: "cover" }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="single-blog-post__blog-details-content--details-image" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            <img
                              src="/assets/images/blog/blog-details-thumb1_3.jpg"
                              alt="Circuit Diagnostics"
                              style={{ width: "100%", height: "260px", objectFit: "cover" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Highlight Quote Box */}
                      <div className="single-blog-post__blog-details-content--hilight-text">
                        <div className="icon">
                          <svg width="44" height="38" viewBox="0 0 44 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M21.0461 11.5684C20.88 17.7542 19.6607 23.6642 16.5492 29.1016C14.3984 32.8589 11.1807 35.4877 7.58794 37.7346C7.36019 37.8767 7.06736 38.1405 6.81905 37.9076C6.53992 37.6455 6.78138 37.3082 6.92351 37.0462C8.22326 34.6708 9.60864 32.34 10.7406 29.874C11.9804 27.1715 12.9616 24.3818 13.6055 21.4721C13.7768 20.6998 13.6038 20.6141 12.8743 20.7717C6.90296 22.0664 1.34948 18.3895 0.181585 12.399C-0.926371 6.71842 3.0568 1.04984 8.79865 0.138763C15.2906 -0.8922 20.9947 3.95263 21.0461 10.5409C21.0478 10.8834 21.0461 11.2259 21.0461 11.5684Z"
                              fill="#FF4035"
                            />
                            <path
                              d="M44 11.6231C43.827 18.0794 42.5256 24.2258 39.0767 29.8002C36.9755 33.1945 33.9411 35.5681 30.6497 37.6746C30.3877 37.8424 30.0401 38.19 29.749 37.8681C29.4853 37.5769 29.7986 37.2276 29.9545 36.9347C31.2388 34.5508 32.6413 32.2303 33.7561 29.7557C34.9668 27.0704 35.9361 24.308 36.568 21.4258C36.7324 20.6757 36.5491 20.6038 35.8659 20.7647C29.8483 22.1776 23.9147 18.1223 23.031 11.8406C22.2639 6.3878 26.2933 0.943569 31.7252 0.14209C38.3883 -0.837494 43.9658 3.95254 44 10.6829C44 10.9963 44 11.3097 44 11.6231Z"
                              fill="#FF4035"
                            />
                          </svg>
                        </div>
                        <p>
                          &ldquo;Bespoke architectural woodworking and acoustic timber paneling not only elevate aesthetic luxury but also create tranquil, acoustically balanced sanctuaries designed to endure for generations.&rdquo;
                        </p>
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

                  {/* Comments Area */}
                  <div className="blog-post-details__comments-area">
                    <div className="blog-post-details__comments-area__comments-heading">
                      <h3 className="blog-post-details__comments-area__comments-heading--title">
                        02 Customer Comments
                      </h3>
                    </div>
                    <div className="blog-post-details__comments-area__blog-single-comment">
                      <div className="blog-post-details__comments-area__blog-single-comment--thumb">
                        <img src="/assets/images/blog/blog-details-autho1.jpg" alt="Tariq Manzoor" />
                      </div>
                      <div className="blog-post-details__comments-area__blog-single-comment--content">
                        <div className="head">
                          <div className="con">
                            <h5>Tariq Manzoor</h5>
                            <span>June 18, 2024 at 11:20 am</span>
                          </div>
                          <div className="star">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                          </div>
                        </div>
                        <p>
                          Outstanding analysis. The acoustic slat wood panel installation guide gave our hotel lobby project in Srinagar the exact sound dampening and luxury warmth we envisioned. Highly appreciate the detailed material specifications!
                        </p>
                      </div>
                    </div>

                    <div className="blog-post-details__comments-area__blog-single-comment">
                      <div className="blog-post-details__comments-area__blog-single-comment--thumb">
                        <img src="/assets/images/blog/blog-details-autho2.jpg" alt="Sarah Jenkins" />
                      </div>
                      <div className="blog-post-details__comments-area__blog-single-comment--content">
                        <div className="head">
                          <div className="con">
                            <h5>Sarah Jenkins</h5>
                            <span>July 04, 2024 at 3:45 pm</span>
                          </div>
                          <div className="star">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                          </div>
                        </div>
                        <p>
                          Wall Street Interiors is by far the most knowledgeable team in modern architectural finishes. Booked an on-site design consultation right after reading this article.
                        </p>
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
                  <div className="single-sidebar-widget">
                    <div className="single-sidebar-widget__wid-title">
                      <h3 className="single-sidebar-widget__wid-title--title">Recent Articles</h3>
                    </div>
                    <div className="single-sidebar-widget__recent-post-area">
                      {recentPosts.map((rPost) => (
                        <div key={rPost.id} className="single-sidebar-widget__recent-post-area__recent-items">
                          <div className="single-sidebar-widget__recent-post-area__recent-items--recent-thumb" style={{ width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                            <Link href={`/blog/${rPost.slug}`}>
                              <img
                                src={rPost.featured_image || "/assets/images/blog/blog-recent-thumb1_1.jpg"}
                                alt={rPost.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
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
                        <Link href="/blog">Hardware & Finishes</Link>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Banner */}
                  <div className="single-sidebar-widget">
                    <div className="single-sidebar-widget__blog-thumb" style={{ borderRadius: "12px", overflow: "hidden" }}>
                      <Link href="/contact">
                        <img
                          src="/assets/images/blog/blog-sidebar-thumb.jpg"
                          alt="Book Diagnostic Inspection"
                          style={{ width: "100%", objectFit: "cover" }}
                        />
                      </Link>
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
