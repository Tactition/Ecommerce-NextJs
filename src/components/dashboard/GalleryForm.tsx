"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WorkGallery } from "@/types";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { saveGalleryAction } from "@/lib/actions/gallery";
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Eye, Save } from "lucide-react";

interface GalleryFormProps {
  initialData?: WorkGallery | null;
}

const COMMON_CATEGORIES = [
  "Curtains & Drapes",
  "Living Room",
  "Modular Kitchen",
  "Acoustic Walls",
  "Luxury Furniture",
  "Bedroom Suite",
  "Turnkey Residence",
  "Commercial Setup",
];

export default function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "Curtains & Drapes");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPublished, setIsPublished] = useState(initialData ? String(initialData.is_published) : "1");
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const formData = new FormData();
    if (initialData?.id) {
      formData.set("id", String(initialData.id));
    }
    formData.set("title", title);
    formData.set("category", category);
    formData.set("description", description);
    formData.set("image", imageUrl);
    formData.set("is_published", isPublished);
    formData.set("sort_order", String(sortOrder));

    try {
      const res = await saveGalleryAction(formData);
      setIsLoading(false);

      if (res.success) {
        setFeedback({ success: true, message: "Gallery entry saved successfully!" });
        // Redirect back to gallery list page
        setTimeout(() => {
          router.push("/dashboard/gallery");
          router.refresh();
        }, 600);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to save gallery item." });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Error saving gallery item";
      setFeedback({ success: false, message: msg });
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href="/dashboard/gallery"
            className="abid-btn abid-btn-outline"
            style={{ padding: "8px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={16} />
            <span>Back to Gallery</span>
          </Link>
          <div>
            <h1 style={{ fontSize: "1.75rem", color: "var(--color-secondary, #0A111E)", margin: 0 }}>
              {initialData ? "Edit Gallery Project" : "New Gallery Project"}
            </h1>
            <p style={{ color: "var(--color-text-muted, #64748B)", fontSize: "0.88rem", margin: "4px 0 0 0" }}>
              {initialData
                ? `Update details and photograph for #${initialData.id}`
                : "Add high-resolution project photography and portfolio specifications"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/dashboard/gallery" className="abid-btn abid-btn-outline" style={{ padding: "10px 20px" }}>
            Cancel
          </Link>
          <button
            type="submit"
            form="gallery-form"
            disabled={isLoading}
            className="abid-btn abid-btn-primary"
            style={{ padding: "10px 24px", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Save size={16} />
            <span>{isLoading ? "Saving..." : initialData ? "Save Changes" : "Publish Project"}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "var(--radius-md, 10px)",
            backgroundColor: feedback.success ? "var(--color-success-bg, #ECFDF5)" : "var(--color-danger-bg, #FEF2F2)",
            color: feedback.success ? "var(--color-success, #10B981)" : "var(--color-danger, #EF4444)",
            fontSize: "0.92rem",
            marginBottom: "24px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Form Layout (2 columns) */}
      <form id="gallery-form" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>
          {/* Left Column: Core Specifications */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl, 16px)",
              padding: "32px",
              border: "1px solid var(--color-surface-border, #E2E8F0)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Sparkles size={18} style={{ color: "var(--color-primary, #FF4035)" }} />
              <h2 style={{ fontSize: "1.2rem", color: "var(--color-secondary, #0A111E)", margin: 0 }}>
                Project Details
              </h2>
            </div>

            <div className="form-group mb-4">
              <label className="form-label" htmlFor="title" style={{ fontWeight: 600 }}>
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sheer Velvet Curtains in Luxury Srinagar Villa"
                className="form-input"
                style={{ fontSize: "0.95rem" }}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label" htmlFor="category" style={{ fontWeight: 600 }}>
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Curtains & Drapes"
                className="form-input"
                style={{ marginBottom: "10px", fontSize: "0.95rem" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {COMMON_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      border: "1px solid var(--color-surface-border, #E2E8F0)",
                      backgroundColor: category === cat ? "var(--color-primary-light, #FFEBEA)" : "#F8FAFC",
                      color: category === cat ? "var(--color-primary, #FF4035)" : "var(--color-text-muted, #64748B)",
                      fontWeight: category === cat ? 700 : 500,
                      fontSize: "0.78rem",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label" htmlFor="description" style={{ fontWeight: 600 }}>
                Short Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the interior transformation, craftsmanship, or architectural setup..."
                className="form-textarea"
                style={{ fontSize: "0.95rem", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="is_published" style={{ fontWeight: 600 }}>
                  Publication Status
                </label>
                <select
                  id="is_published"
                  name="is_published"
                  value={isPublished}
                  onChange={(e) => setIsPublished(e.target.value)}
                  className="form-select"
                >
                  <option value="1">Published (Visible on site)</option>
                  <option value="0">Draft (Hidden)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sort_order" style={{ fontWeight: 600 }}>
                  Display Order
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Photography & Live Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl, 16px)",
                padding: "32px",
                border: "1px solid var(--color-surface-border, #E2E8F0)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              }}
            >
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="Project Photograph *"
                name="image"
              />
            </div>

            {/* Live Portfolio Card Preview */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl, 16px)",
                padding: "24px",
                border: "1px solid var(--color-surface-border, #E2E8F0)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Eye size={16} style={{ color: "var(--color-primary, #FF4035)" }} />
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary, #0A111E)" }}>
                  Live Card Preview
                </span>
              </div>

              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--color-surface-border, #E2E8F0)",
                  backgroundColor: "#0A111E",
                }}
              >
                <div style={{ height: "200px", position: "relative" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94A3B8",
                        fontSize: "0.9rem",
                      }}
                    >
                      Attach an image to preview
                    </div>
                  )}
                  {category && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "var(--color-primary, #FF4035)",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {category}
                    </div>
                  )}
                </div>

                <div style={{ padding: "18px", backgroundColor: "#FFFFFF" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--color-secondary, #0A111E)" }}>
                    {title || "Untitled Project"}
                  </h3>
                  <p style={{ color: "var(--color-text-muted, #64748B)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
                    {description || "Short description will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
