"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { CategoryAdmin, deleteCategoryAction, toggleCategoryStatusAction } from "@/lib/actions/categories";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FolderTree, CornerDownRight } from "lucide-react";

interface CategoriesManagerProps {
  initialCategories: CategoryAdmin[];
}

function formatFaClass(str: string): string {
  if (!str) return "fa-solid fa-shapes";
  const trimmed = str.trim();
  if (trimmed.includes("fa-") || trimmed.startsWith("fa")) {
    if (
      trimmed.startsWith("fa-") &&
      !trimmed.includes("fa-solid") &&
      !trimmed.includes("fa-regular") &&
      !trimmed.includes("fa-brands")
    ) {
      return `fa-solid ${trimmed}`;
    }
    return trimmed;
  }
  const t = trimmed.toLowerCase();
  if (t.includes("sofa") || t.includes("furniture")) return "fa-solid fa-couch";
  if (t.includes("wall") || t.includes("panel")) return "fa-solid fa-border-all";
  if (t.includes("light") || t.includes("lamp")) return "fa-solid fa-lightbulb";
  if (t.includes("kitchen") || t.includes("wardrobe")) return "fa-solid fa-kitchen-set";
  if (t.includes("decor") || t.includes("furnishing")) return "fa-solid fa-palette";
  if (t.includes("hardware") || t.includes("wholesale")) return "fa-solid fa-screwdriver-wrench";
  return "fa-solid fa-shapes";
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<CategoryAdmin[]>(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    startTransition(async () => {
      const res = await deleteCategoryAction(targetId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== targetId));
      }
      setDeleteConfirmId(null);
    });
  };

  const handleToggleStatus = (c: CategoryAdmin) => {
    startTransition(async () => {
      const res = await toggleCategoryStatusAction(c.id, c.is_active);
      if (res.success && typeof res.is_active === "boolean") {
        const nextActive = res.is_active;
        setCategories((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, is_active: nextActive } : item))
        );
      }
    });
  };

  // Find parent category name
  const getParentName = (parentId: number | null | undefined) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : null;
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>
            Store Category & Sub-category Master
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", margin: 0 }}>
            Organize products into categories and nested sub-categories with Font Awesome icons and storefront visibility.
          </p>
        </div>

        <Link
          href="/dashboard/categories/create"
          prefetch={true}
          className="abid-btn abid-btn-primary"
          style={{
            padding: "10px 20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 700,
            borderRadius: "8px",
          }}
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="data-table-wrapper" style={{ padding: "20px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category / Hierarchy</th>
              <th>Slug</th>
              <th>Font Awesome Icon</th>
              <th>Items</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const isSub = Boolean(c.parent_id);
              const parentName = getParentName(c.parent_id);
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: isSub ? "28px" : "0" }}>
                      {isSub && (
                        <div
                          style={{
                            color: "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CornerDownRight size={16} />
                        </div>
                      )}
                      {c.image ? (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #E2E8F0",
                            flexShrink: 0,
                            backgroundColor: "#F1F5F9",
                          }}
                        >
                          <img
                            src={c.image}
                            alt={c.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ) : isSub ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#94A3B8",
                            flexShrink: 0,
                          }}
                        >
                          <CornerDownRight size={16} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FF4035",
                            flexShrink: 0,
                          }}
                        >
                          <FolderTree size={18} />
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontWeight: isSub ? 600 : 700,
                              color: isSub ? "#334155" : "#0F172A",
                              fontSize: isSub ? "0.9rem" : "0.95rem",
                            }}
                          >
                            {c.name}
                          </span>
                          {isSub && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                backgroundColor: "#FEF3C7",
                                color: "#B45309",
                                fontWeight: 700,
                              }}
                            >
                              Sub-category {parentName ? `of ${parentName}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: "#64748B", fontSize: "0.85rem", fontFamily: "monospace" }}>
                      /{c.slug}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <i className={formatFaClass(c.icon_type)} style={{ color: "#FF4035", fontSize: "0.95rem" }} />
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontFamily: "monospace",
                          color: "#475569",
                        }}
                      >
                        {c.icon_type}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.88rem" }}>
                      {c.item_count} items
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => handleToggleStatus(c)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        color: c.is_active ? "#10B981" : "#94A3B8",
                      }}
                      title="Click to toggle status"
                    >
                      {c.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>{c.is_active ? "Active" : "Inactive"}</span>
                    </button>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <Link
                        href={`/dashboard/categories/${c.id}/edit`}
                        prefetch={true}
                        className="abid-btn abid-btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(c.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #FCA5A5",
                          background: "#FEF2F2",
                          color: "#EF4444",
                          cursor: "pointer",
                        }}
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation (Rendered via Viewport Portal) */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products assigned to it may need to be updated."
        confirmLabel="Delete Category"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
