"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Testimonial } from "@/types";
import { saveTestimonialAction } from "@/lib/actions/testimonials";
import ImageUploader from "@/components/dashboard/ImageUploader";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Star,
  User,
  Quote,
  Save,
  Check,
} from "lucide-react";

interface TestimonialFormProps {
  initialData?: Testimonial | null;
}

export default function TestimonialForm({ initialData }: TestimonialFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(initialData?.id);

  // Form states
  const [customerName, setCustomerName] = useState(initialData?.customer_name || "");
  const [customerRole, setCustomerRole] = useState(
    initialData?.customer_role || ""
  );
  const [content, setContent] = useState(initialData?.content || "");
  const [rating, setRating] = useState<number>(initialData?.rating ?? 5);
  const [avatar, setAvatar] = useState(
    initialData?.avatar || ""
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData ? Boolean(initialData.is_published) : true
  );
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? 0);

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!customerName.trim()) {
      setFormError("Client name is required.");
      return;
    }
    if (!content.trim()) {
      setFormError("Testimonial review text is required.");
      return;
    }

    const formData = new FormData();
    if (initialData?.id) {
      formData.append("id", initialData.id.toString());
    }
    formData.append("customer_name", customerName.trim());
    formData.append("customer_role", customerRole.trim());
    formData.append("avatar", avatar.trim());
    formData.append("content", content.trim());
    formData.append("rating", rating.toString());
    formData.append("is_published", isPublished ? "1" : "0");
    formData.append("sort_order", sortOrder.toString());

    startTransition(async () => {
      try {
        const result = await saveTestimonialAction(formData);
        if (result.success) {
          setSuccessMsg(isEdit ? "Testimonial updated successfully!" : "Testimonial created successfully!");
          setTimeout(() => {
            router.push("/dashboard/testimonials");
            router.refresh();
          }, 600);
        } else {
          setFormError(result.error || "Failed to save testimonial. Please check your input.");
        }
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px" }}>
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
            href="/dashboard/testimonials"
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
              {isEdit ? "Edit Client Testimonial" : "Add Client Testimonial"}
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: "4px 0 0" }}>
              Manage client endorsements, ratings, and design project feedback
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/dashboard/testimonials"
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
            {isPending ? "Saving..." : isEdit ? "Update Testimonial" : "Publish Testimonial"}
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
            {/* Card 1: Review Content */}
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
                <Quote size={18} color="var(--theme)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Client Review & Feedback
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    Client / Customer Name <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Farooq Mir"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    Designation / Project Context
                  </label>
                  <input
                    type="text"
                    value={customerRole}
                    onChange={(e) => setCustomerRole(e.target.value)}
                    placeholder="e.g. Luxury Villa, Rajbagh"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Star Rating (1 - 5)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: starVal <= rating ? "#F59E0B" : "#CBD5E1",
                        transition: "transform 0.1s ease",
                      }}
                      title={`${starVal} Stars`}
                    >
                      <Star size={24} fill={starVal <= rating ? "#F59E0B" : "none"} />
                    </button>
                  ))}
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#334155", marginLeft: "8px" }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Testimonial Review Text <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Client feedback praising Wall Street Interiors' craftsmanship, acoustic paneling, or custom furniture..."
                  className="form-textarea"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Card 2: Status & Display Order */}
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
                    border: isPublished ? "2px solid #10B981" : "1px solid #E2E8F0",
                    backgroundColor: isPublished ? "#F0FDF4" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="isPublished"
                    checked={isPublished}
                    onChange={() => setIsPublished(true)}
                    style={{ accentColor: "#10B981" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#166534" }}>Published</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Visible on storefront testimonial carousel</div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: !isPublished ? "2px solid #F59E0B" : "1px solid #E2E8F0",
                    backgroundColor: !isPublished ? "#FFFBEB" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="isPublished"
                    checked={!isPublished}
                    onChange={() => setIsPublished(false)}
                    style={{ accentColor: "#F59E0B" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#92400E" }}>Draft / Hidden</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Hidden from public website</div>
                  </div>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="0"
                  className="form-input"
                />
                <span style={{ fontSize: "0.76rem", color: "#64748B" }}>Lower numbers appear first</span>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="abid-btn abid-btn-primary"
                style={{ width: "100%", padding: "10px", fontSize: "0.9rem", justifyContent: "center" }}
              >
                {isPending ? "Saving..." : isEdit ? "Update Testimonial" : "Publish Testimonial"}
              </button>
            </div>

            {/* Card 3: Client Photograph */}
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
                <User size={18} color="var(--theme)" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-secondary)" }}>
                  Client Avatar / Photo
                </h3>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <ImageUploader
                  value={avatar}
                  onChange={setAvatar}
                  label="Upload or select avatar"
                  name="avatar"
                />
              </div>

              <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                A professional client photo enhances authenticity. If left empty, default portrait is used.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
