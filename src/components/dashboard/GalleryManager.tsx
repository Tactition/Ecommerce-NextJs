"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkGallery } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { getAllGallery, deleteGalleryAction } from "@/lib/actions/gallery";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Camera, ExternalLink } from "lucide-react";

interface GalleryManagerProps {
  initialGallery: WorkGallery[];
}

export default function GalleryManager({ initialGallery }: GalleryManagerProps) {
  const [items, setItems] = useState<WorkGallery[]>(initialGallery);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllGallery();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteGalleryAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Gallery project deleted successfully." });
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Delete failed" });
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary, #0A111E)", margin: 0 }}>
              Work Gallery Portfolio
            </h1>
            <span
              style={{
                backgroundColor: "var(--color-primary-light, #FFEBEA)",
                color: "var(--color-primary, #FF4035)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {items.length} Projects
            </span>
          </div>
          <p style={{ color: "var(--color-text-muted, #64748B)", fontSize: "0.92rem", margin: 0 }}>
            Manage luxury interior projects displayed on the homepage WebGL showcase and the public gallery page.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/gallery"
            target="_blank"
            className="abid-btn abid-btn-outline"
            style={{ padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ExternalLink size={15} />
            <span>View Public Gallery</span>
          </Link>
          <Link
            href="/dashboard/gallery/create"
            className="abid-btn abid-btn-primary"
            style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
          >
            <Plus size={18} />
            <span>Add Gallery Entry</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md, 10px)",
            backgroundColor: feedback.success ? "var(--color-success-bg, #ECFDF5)" : "var(--color-danger-bg, #FEF2F2)",
            color: feedback.success ? "var(--color-success, #10B981)" : "var(--color-danger, #EF4444)",
            fontSize: "0.9rem",
            marginBottom: "20px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Gallery Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Photograph & Project</th>
              <th>Category</th>
              <th>Status</th>
              <th>Sort Order</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted, #64748B)" }}>
                  Loading gallery entries...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted, #64748B)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                      <Camera size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--color-secondary, #0A111E)" }}>
                      No gallery entries yet
                    </div>
                    <p style={{ fontSize: "0.88rem", maxWidth: "400px", margin: 0 }}>
                      Start by adding completed interior residences, custom joinery, or acoustic wall projects.
                    </p>
                    <Link href="/dashboard/gallery/create" className="abid-btn abid-btn-primary" style={{ marginTop: "8px" }}>
                      <Plus size={16} />
                      <span>Add First Project</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: "72px",
                          height: "54px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          backgroundColor: "#0A111E",
                          flexShrink: 0,
                          border: "1px solid var(--color-surface-border, #E2E8F0)",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-secondary, #0A111E)", fontSize: "0.95rem" }}>
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--color-text-muted, #64748B)",
                            maxWidth: "400px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: "2px",
                          }}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        backgroundColor: "#F1F5F9",
                        color: "var(--color-secondary, #0A111E)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.is_published} type="published" />
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-muted, #64748B)" }}>
                    #{item.sort_order}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Link
                        href={`/dashboard/gallery/${item.id}`}
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
                          color: "var(--color-danger, #EF4444)",
                          border: "1px solid #FECACA",
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                        title="Delete project"
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
        title="Delete Gallery Item?"
        message="Are you sure you want to delete this gallery entry? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
