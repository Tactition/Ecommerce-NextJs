"use client";

import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types";
import TextType from "@/components/common/TextType";

interface BlogNewsSectionProps {
  posts?: BlogPost[];
}

interface FormattedPost {
  id: number | string;
  title: string;
  slug: string;
  category: string;
  image: string;
  publishedDate: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
  };
}

function calculateReadTime(content?: string, excerpt?: string): string {
  const text = (content || excerpt || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.min(12, Math.ceil(words / 160) || 5));
  return `${minutes} min read`;
}

function deriveCategory(title: string, excerpt?: string, index = 0): string {
  const t = (title + " " + (excerpt || "")).toLowerCase();
  if (t.includes("trend") || t.includes("luxury") || t.includes("living")) return "Interior Trends";
  if (t.includes("acoustic") || t.includes("slat") || t.includes("panel") || t.includes("wall")) return "Wall Treatments";
  if (t.includes("kitchen") || t.includes("acrylic") || t.includes("pu") || t.includes("modular")) return "Modular Living";
  if (t.includes("furniture") || t.includes("hardwood") || t.includes("craft") || t.includes("oak")) return "Bespoke Furniture";
  if (t.includes("lighting") || t.includes("fixture") || t.includes("lamp")) return "Architectural Lighting";
  const defaults = ["Architecture & Design", "Interior Trends", "Craftsmanship", "Material Innovations"];
  return defaults[index % defaults.length];
}

const fallbackBlogs: FormattedPost[] = [
  {
    id: 1,
    title: "Top Interior Design Trends Defining Luxury Homes in 2026",
    slug: "luxury-interior-design-trends-2026",
    category: "Interior Trends",
    image: "/assets/images/blog/blogThumb2_1.jpg",
    publishedDate: "March 16, 2025",
    readTime: "5 min read",
    author: {
      name: "Wall Street Editorial",
      avatar: "/assets/images/team/team-thumb1_1.jpg",
    },
  },
  {
    id: 2,
    title: "Acoustic Slat Wood Panels: Blending Sound Dampening with High Aesthetics",
    slug: "acoustic-slat-wood-panels-guide",
    category: "Wall Treatments",
    image: "/assets/images/blog/blogThumb2_2.jpg",
    publishedDate: "March 16, 2025",
    readTime: "5 min read",
    author: {
      name: "Wall Street Editorial",
      avatar: "/assets/images/team/team-thumb1_2.jpg",
    },
  },
  {
    id: 3,
    title: "Veneer vs. Acrylic vs. PU Finish: Choosing the Perfect Modular Kitchen Surface",
    slug: "veneer-acrylic-pu-modular-kitchen-guide",
    category: "Modular Living",
    image: "/assets/images/blog/blogThumb2_3.jpg",
    publishedDate: "March 16, 2025",
    readTime: "5 min read",
    author: {
      name: "Wall Street Editorial",
      avatar: "/assets/images/team/team-thumb1_3.jpg",
    },
  },
  {
    id: 4,
    title: "Bespoke Hardwood Furniture: Craftsmanship & Timeless Living Spaces",
    slug: "bespoke-hardwood-furniture-craftsmanship-guide",
    category: "Bespoke Furniture",
    image: "/assets/images/blog/blogThumb2_4.jpg",
    publishedDate: "March 16, 2025",
    readTime: "5 min read",
    author: {
      name: "Wall Street Editorial",
      avatar: "/assets/images/team/team-thumb1_4.jpg",
    },
  },
];

export default function BlogNewsSection({ posts }: BlogNewsSectionProps) {
  const authorAvatars = [
    "/assets/images/team/team-thumb1_1.jpg",
    "/assets/images/team/team-thumb1_2.jpg",
    "/assets/images/team/team-thumb1_3.jpg",
    "/assets/images/team/team-thumb1_4.jpg",
  ];

  const fallbackImages = [
    "/assets/images/blog/blogThumb2_1.jpg",
    "/assets/images/blog/blogThumb2_2.jpg",
    "/assets/images/blog/blogThumb2_3.jpg",
    "/assets/images/blog/blogThumb2_4.jpg",
  ];

  let formattedPosts: FormattedPost[] = [];

  if (posts && posts.length > 0) {
    formattedPosts = posts.slice(0, 4).map((post, idx) => {
      const postDate = post.published_at || post.created_at;
      const formattedDate = postDate
        ? new Date(postDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        : "March 16, 2025";

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category?.trim() || deriveCategory(post.title, post.excerpt, idx),
        image: post.featured_image || fallbackImages[idx % fallbackImages.length],
        publishedDate: formattedDate,
        readTime: calculateReadTime(post.content, post.excerpt),
        author: {
          name: post.author?.trim() || "Wall Street Editorial",
          avatar: post.author_avatar?.trim() || authorAvatars[idx % authorAvatars.length],
        },
      };
    });

    // If there are fewer than 4 posts from DB, fill remaining slots from fallbackBlogs
    if (formattedPosts.length < 4) {
      const needed = 4 - formattedPosts.length;
      formattedPosts = [...formattedPosts, ...fallbackBlogs.slice(4 - needed)];
    }
  } else {
    formattedPosts = fallbackBlogs;
  }

  const featuredPost = formattedPosts[0];
  const secondaryPosts = formattedPosts.slice(1, 4);

  return (
    <section className="w-full v4-blog-section gsap-scroll-section" id="blog">
      <div className="container v4-blog-container">

        {/* Editorial Section Header */}
        <div className="wsi-section-header-split">
          <div className="wsi-section-title-wrap">
            <div className="wsi-section-subtitle">
              <i className="fa-solid fa-book-open"></i>
              <span>Journal &amp; Insights</span>
            </div>
            <TextType
              as="h2"
              className="wsi-section-title"
              text={["Design Stories & Architectural Guides", "Latest Interior Trends", "Living Space Inspirations"]}
              typingSpeed={60}
              pauseDuration={2400}
              deletingSpeed={35}
              deleteMode="backspace"
              typeEffect="fade"
              cursorStyle="bar"
              cursorColor="var(--color-primary, #FF4035)"
              cursorGlide
              showCursor
            />
          </div>
          <div className="wsi-section-header-right">
            <Link href="/blog" className="v4-view-all-link font-onest">
              <span>Explore All Articles</span>
              <i className="fa-solid fa-arrow-right-long" style={{ fontSize: "0.85rem" }}></i>
            </Link>
          </div>
        </div>

        {/* Featured Top Article (2 columns) */}
        <article className="v4-featured-article">
          <div className="v4-featured-left">
            <div className="v4-author-box">
              <div className="v4-author-avatar-wrap">
                <img
                  alt={featuredPost.author.name}
                  className="v4-author-avatar-img"
                  src={featuredPost.author.avatar}
                />
              </div>

              <div className="v4-author-text">
                <p className="v4-author-label">Article by</p>
                <p className="v4-author-name font-onest">
                  {featuredPost.author.name}
                </p>
              </div>
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="v4-category-link font-onest"
            >
              {featuredPost.category}
            </Link>

            <h2 className="v4-featured-heading font-onest">
              <Link href={`/blog/${featuredPost.slug}`}>
                {featuredPost.title}
              </Link>
            </h2>

            <p className="v4-published-text font-onest">
              Published on {featuredPost.publishedDate}
            </p>

            <div className="v4-featured-footer">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="v4-read-more-button font-onest"
              >
                Read More
              </Link>

              <span className="v4-read-time-span font-onest">
                {featuredPost.readTime}
              </span>
            </div>
          </div>

          <div className="v4-featured-image-container">
            <Link href={`/blog/${featuredPost.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
              <img
                alt={featuredPost.title}
                src={featuredPost.image}
              />
            </Link>

            <span className="v4-corner-tag font-onest">
              {featuredPost.readTime}
              <div className="v4-cutout-top-left">
                <svg
                  fill="none"
                  height="8"
                  viewBox="0 0 8 8"
                  width="8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 0H0C4.41828 0 8 3.58172 8 8V0Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <div className="v4-cutout-bottom-right">
                <svg
                  fill="none"
                  height="8"
                  viewBox="0 0 8 8"
                  width="8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 0H0C4.41828 0 8 3.58172 8 8V0Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            </span>
          </div>
        </article>

        {/* Secondary 3-Column Posts Grid */}
        <div className="v4-posts-grid">
          {secondaryPosts.map((post) => (
            <article
              className="v4-grid-article"
              key={post.title}
            >
              <div className="v4-thumb-wrapper">
                <div className="v4-thumb-aspect">
                  <Link href={`/blog/${post.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    <img
                      alt={post.title}
                      src={post.image}
                    />
                  </Link>
                </div>

                <span className="v4-corner-tag font-onest">
                  {post.readTime}
                  <div className="v4-cutout-top-left">
                    <svg
                      fill="none"
                      height="8"
                      viewBox="0 0 8 8"
                      width="8"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M8 0H0C4.41828 0 8 3.58172 8 8V0Z"
                        fill="white"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="v4-cutout-bottom-right">
                    <svg
                      fill="none"
                      height="8"
                      viewBox="0 0 8 8"
                      width="8"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M8 0H0C4.41828 0 8 3.58172 8 8V0Z"
                        fill="white"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                </span>
              </div>

              <div className="v4-grid-body">
                <Link
                  className="v4-grid-category font-onest"
                  href={`/blog/${post.slug}`}
                >
                  <span style={{ position: "absolute", inset: 0, zIndex: 1 }} />
                  {post.category}
                </Link>

                <h3 className="v4-grid-heading font-onest">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="v4-grid-published font-onest">
                  Published on {post.publishedDate}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
