"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Testimonial } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { getAllTestimonials, deleteTestimonialAction } from "@/lib/actions/testimonials";
import { Plus, Edit2, Trash2, Star, CheckCircle2, AlertCircle } from "lucide-react";

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllTestimonials();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteTestimonialAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Testimonial removed successfully." });
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Delete failed" });
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Client Testimonials &amp; Endorsements
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Manage client reviews, star ratings, and luxury interior design feedback displayed on the homepage
          </p>
        </div>

        <Link
          href="/dashboard/testimonials/create"
          prefetch={true}
          className="abid-btn abid-btn-primary"
          style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
        >
          <Plus size={18} />
          <span>Add Testimonial</span>
        </Link>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: feedback.success ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: feedback.success ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.9rem",
            marginBottom: "20px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Designation / Location</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Order</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading client reviews...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No testimonials found. Click &quot;Add Testimonial&quot; to publish your first client review.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          backgroundColor: "#F1F5F9",
                          flexShrink: 0,
                          border: "1.5px solid #CBD5E1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.customer_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)" }}>
                            {item.customer_name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-secondary)" }}>
                          {item.customer_name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-text-muted)",
                            maxWidth: "340px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          &ldquo;{item.content}&rdquo;
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{item.customer_role}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#F59E0B" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < item.rating ? "#F59E0B" : "none"}
                          color={i < item.rating ? "#F59E0B" : "#CBD5E1"}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={item.is_published ? "published" : "draft"} type="published" />
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      {item.sort_order}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Link
                        href={`/dashboard/testimonials/${item.id}/edit`}
                        prefetch={true}
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.82rem", textDecoration: "none" }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteTargetId(item.id)}
                        className="abid-btn"
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "var(--color-danger)",
                          border: "1px solid #FECACA",
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                        }}
                        title="Delete Testimonial"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Testimonial?"
        message="Are you sure you want to permanently delete this testimonial? It will be removed from the storefront."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
