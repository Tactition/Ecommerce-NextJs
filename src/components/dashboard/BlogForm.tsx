"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/types";
import { saveBlogPostAction } from "@/lib/actions/blog";
import ImageUploader from "@/components/dashboard/ImageUploader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Globe,
  Image as ImageIcon,
  Check,
} from "lucide-react";

interface BlogFormProps {
  initialData?: BlogPost | null;
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(initialData?.id);

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [author, setAuthor] = useState(initialData?.author || "Wall Street Editorial Team");
  const [authorAvatar, setAuthorAvatar] = useState(
    initialData?.author_avatar || "/assets/images/team/team-thumb1_1.jpg"
  );
  const [category, setCategory] = useState(initialData?.category || "Interior Trends");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featured_image || "/assets/images/blog/blogThumb2_1.jpg"
  );
  const [status, setStatus] = useState<"published" | "draft">(
    initialData?.status || "published"
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!title.trim()) {
      setFormError("Article title is required.");
      return;
    }
    if (!slug.trim()) {
      setFormError("URL slug is required.");
      return;
    }
    if (!excerpt.trim()) {
      setFormError("Excerpt summary is required.");
      return;
    }
    if (!content.trim()) {
      setFormError("Article content is required.");
      return;
    }

    const formData = new FormData();
    if (initialData?.id) {
      formData.append("id", initialData.id.toString());
    }
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("author", author.trim());
    formData.append("author_avatar", authorAvatar.trim());
    formData.append("category", category.trim());
    formData.append("excerpt", excerpt.trim());
    formData.append("content", content.trim());
    formData.append("featured_image", featuredImage.trim());
    formData.append("status", status);
    if (metaTitle) formData.append("meta_title", metaTitle.trim());
    if (metaDescription) formData.append("meta_description", metaDescription.trim());

    startTransition(async () => {
      try {
        const result = await saveBlogPostAction(formData);
        if (result.success) {
          setSuccessMsg(isEdit ? "Article updated successfully!" : "Article published successfully!");
          setTimeout(() => {
            router.push("/dashboard/blog");
            router.refresh();
          }, 600);
        } else {
          setFormError(result.error || "Failed to save article. Please check input.");
        }
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/dashboard/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-secondary)", margin: 0 }}>
              {isEdit ? "Edit Journal Article" : "Create New Journal Article"}
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: "4px 0 0" }}>
              Publish architectural design insights, materials guides, and project case studies
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/dashboard/blog"
            className="abid-btn abid-btn-outline"
            style={{ padding: "8px 16px", fontSize: "0.88rem" }}
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="abid-btn abid-btn-primary"
            style={{ padding: "8px 22px", fontSize: "0.88rem" }}
          >
            {isPending ? "Saving..." : isEdit ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {formError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            color: "#991B1B",
            fontSize: "0.9rem",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "8px",
            color: "#166534",
            fontSize: "0.9rem",
            marginBottom: "20px",
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Main content column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Card 1: Article Content */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <BookOpen size={18} color="var(--theme)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Article Details
                </h2>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Article Title <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Modern Slat Wood Paneling Trends for Srinagar Residences"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    URL Slug <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. modern-slat-wood-paneling-trends"
                    className="form-input"
                    required
                  />
                  <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: "4px" }}>
                    Public URL: /blog/{slug || "slug-preview"}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Wall Street Editorial Team"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    Article Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Interior Trends, Wall Treatments, Modular Living"
                    className="form-input"
                  />
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {["Interior Trends", "Wall Treatments", "Modular Living", "Bespoke Furniture", "Architecture"].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: category === cat ? "1px solid var(--color-primary)" : "1px solid #E2E8F0",
                          backgroundColor: category === cat ? "var(--color-primary-light)" : "#F8FAFC",
                          color: category === cat ? "var(--color-primary)" : "#64748B",
                          cursor: "pointer",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    Author Avatar URL
                  </label>
                  <input
                    type="text"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="/assets/images/team/team-thumb1_1.jpg"
                    className="form-input"
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
                    {["team-thumb1_1.jpg", "team-thumb1_2.jpg", "team-thumb1_3.jpg", "team-thumb1_4.jpg"].map((thumb, idx) => (
                      <img
                        key={thumb}
                        src={`/assets/images/team/${thumb}`}
                        alt={`Avatar ${idx + 1}`}
                        onClick={() => setAuthorAvatar(`/assets/images/team/${thumb}`)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: authorAvatar.includes(thumb) ? "2px solid var(--color-primary)" : "1px solid #E2E8F0",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <RichTextEditor
                label="Excerpt Summary"
                value={excerpt}
                onChange={setExcerpt}
                placeholder="Short introductory summary displayed on listing cards and social previews..."
                minHeight={90}
                required
              />

              <RichTextEditor
                label="Full Article Content"
                value={content}
                onChange={setContent}
                placeholder="Write full blog article with formatted headings, images, bullet lists, and paragraphs..."
                minHeight={280}
                required
              />
            </div>

            {/* Card 2: SEO Settings */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <Globe size={18} color="var(--theme)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Search Engine Optimization (SEO)
                </h2>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  SEO Meta Title (Optional)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom page title for search engines (default: Article Title)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  SEO Meta Description (Optional)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Meta description for Google snippets (default: Excerpt)"
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Card 3: Publishing Status */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px", color: "var(--color-secondary)" }}>
                Publication Status
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: status === "published" ? "2px solid #10B981" : "1px solid #E2E8F0",
                    backgroundColor: status === "published" ? "#F0FDF4" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                    style={{ accentColor: "#10B981" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#166534" }}>Published</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Visible on storefront and journal</div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: status === "draft" ? "2px solid #F59E0B" : "1px solid #E2E8F0",
                    backgroundColor: status === "draft" ? "#FFFBEB" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    style={{ accentColor: "#F59E0B" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#92400E" }}>Draft</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Hidden from public catalog</div>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="abid-btn abid-btn-primary"
                style={{ width: "100%", padding: "10px", fontSize: "0.9rem", justifyContent: "center" }}
              >
                {isPending ? "Saving..." : isEdit ? "Update Article" : "Publish Article"}
              </button>
            </div>

            {/* Card 4: Featured Image */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <ImageIcon size={18} color="var(--theme)" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Featured Image
                </h3>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <ImageUploader
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  label="Upload or select image"
                  name="featured_image"
                />
              </div>

              <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                Suggested dimensions: 1200x800px. High quality JPG or WebP recommended for luxury catalog presentation.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
