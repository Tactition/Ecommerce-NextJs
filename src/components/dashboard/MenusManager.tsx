"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { NavMenuItem, deleteNavMenuItemAction, toggleNavMenuItemStatusAction } from "@/lib/actions/menus";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Compass, Link2, ExternalLink, CornerDownRight, FolderTree } from "lucide-react";

interface MenusManagerProps {
  initialMenuItems: NavMenuItem[];
}

export default function MenusManager({ initialMenuItems }: MenusManagerProps) {
  const [menuItems, setMenuItems] = useState<NavMenuItem[]>(initialMenuItems);
  const [selectedLocation, setSelectedLocation] = useState<"all" | "header" | "categories" | "footer">("all");
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    startTransition(async () => {
      const res = await deleteNavMenuItemAction(targetId);
      if (res.success) {
        setMenuItems((prev) => prev.filter((m) => m.id !== targetId && m.parent_id !== targetId));
      }
      setDeleteConfirmId(null);
    });
  };

  const handleToggleStatus = (item: NavMenuItem) => {
    startTransition(async () => {
      const res = await toggleNavMenuItemStatusAction(item.id, item.is_active);
      if (res.success && typeof res.is_active === "boolean") {
        const nextActive = res.is_active;
        setMenuItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, is_active: nextActive } : m))
        );
      }
    });
  };

  // Build hierarchical structure for the table
  const childMap = new Map<number, NavMenuItem[]>();
  menuItems.forEach((m) => {
    if (m.parent_id) {
      const arr = childMap.get(m.parent_id) || [];
      arr.push(m);
      childMap.set(m.parent_id, arr);
    }
  });

  const filteredItems = menuItems.filter(
    (item) => selectedLocation === "all" || item.menu_location === selectedLocation
  );

  const hierarchicalItems: Array<{ item: NavMenuItem; isChild: boolean; parentLabel?: string }> = [];
  const topLevels = filteredItems.filter((i) => !i.parent_id);

  topLevels.forEach((parent) => {
    hierarchicalItems.push({ item: parent, isChild: false });
    const children = childMap.get(parent.id) || [];
    children.forEach((child) => {
      if (selectedLocation === "all" || child.menu_location === selectedLocation) {
        hierarchicalItems.push({ item: child, isChild: true, parentLabel: parent.label });
      }
    });
  });

  // Any orphaned children whose parent might not be in topLevels
  filteredItems
    .filter((i) => i.parent_id && !topLevels.some((p) => p.id === i.parent_id))
    .forEach((orphan) => {
      const parent = menuItems.find((p) => p.id === orphan.parent_id);
      hierarchicalItems.push({ item: orphan, isChild: true, parentLabel: parent?.label });
    });

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Navigation & Categories Menu Master
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Manage header menus, product categories, and nested sub-categories with dedicated create & edit pages.
          </p>
        </div>

        <Link
          href="/dashboard/menus/create"
          prefetch={true}
          className="abid-btn abid-btn-primary"
          style={{
            padding: "11px 22px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <Plus size={18} />
          <span>Add New Menu / Category Item</span>
        </Link>
      </div>

      {/* Location Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--color-surface-border)",
          paddingBottom: "12px",
        }}
      >
        {(
          [
            { key: "all", label: `All Menus (${menuItems.length})` },
            { key: "header", label: "Main Header" },
            {
              key: "categories",
              label: `Categories & Sub-categories (${menuItems.filter((m) => m.menu_location === "categories").length})`,
            },
            { key: "footer", label: "Footer Navigation" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedLocation(tab.key)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: selectedLocation === tab.key ? "var(--color-primary)" : "#F1F5F9",
              color: selectedLocation === tab.key ? "#FFFFFF" : "var(--color-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hierarchical Table */}
      <div className="data-table-wrapper" style={{ padding: "20px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Label / Hierarchy</th>
              <th>Destination URL</th>
              <th>Placement</th>
              <th>Sort Order</th>
              <th>Status (Storefront Visibility)</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hierarchicalItems.map(({ item, isChild, parentLabel }) => {
              const subCount = childMap.get(item.id)?.length || 0;
              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: isChild ? "#FBFDFB" : undefined,
                    borderLeft: isChild ? "3px solid var(--theme)" : undefined,
                  }}
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isChild ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "24px" }}>
                          <CornerDownRight size={16} style={{ color: "var(--theme)", flexShrink: 0 }} />
                          <div>
                            <span style={{ fontWeight: 700, color: "var(--color-secondary)", fontSize: "0.94rem" }}>
                              {item.label}
                            </span>
                            {parentLabel && (
                              <div style={{ marginTop: "2px" }}>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "#4F46E5",
                                    backgroundColor: "#EEF2FF",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontWeight: 600,
                                    display: "inline-block",
                                  }}
                                >
                                  Sub-category of: {parentLabel}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              backgroundColor: "#F8FAFC",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-primary)",
                            }}
                          >
                            {subCount > 0 ? <FolderTree size={16} /> : <Compass size={16} />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: "var(--color-secondary)", fontSize: "0.95rem" }}>
                              {item.label}
                            </span>
                            {subCount > 0 && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "0.72rem",
                                  color: "#059669",
                                  backgroundColor: "#ECFDF5",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontWeight: 600,
                                }}
                              >
                                {subCount} sub-{subCount === 1 ? "category" : "categories"}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  <td>
                    <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.88rem", fontFamily: "monospace" }}>
                      {item.url}
                    </span>
                    {item.target === "_blank" && (
                      <span
                        title="Opens in new tab"
                        style={{
                          marginLeft: "6px",
                          fontSize: "0.72rem",
                          backgroundColor: "#F1F5F9",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "#64748B",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <ExternalLink size={10} /> new tab
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor:
                          item.menu_location === "header"
                            ? "#E0E7FF"
                            : item.menu_location === "categories"
                            ? "#FEF3C7"
                            : "#F3E8FF",
                        color:
                          item.menu_location === "header"
                            ? "#4338CA"
                            : item.menu_location === "categories"
                            ? "#B45309"
                            : "#7E22CE",
                      }}
                    >
                      {item.menu_location} {isChild ? "(Sub)" : ""}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>#{item.sort_order}</span>
                  </td>

                  {/* Interactive Status Toggle */}
                  <td>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      title="Click to toggle Active / Inactive on storefront"
                      style={{
                        border: item.is_active ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                        background: item.is_active ? "#ECFDF5" : "#F1F5F9",
                        color: item.is_active ? "#065F46" : "#64748B",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.is_active ? (
                        <>
                          <CheckCircle size={14} style={{ color: "#10B981" }} />
                          <span>Active (Published)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} style={{ color: "#94A3B8" }} />
                          <span>Inactive (Hidden)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions linking to dedicated Edit page */}
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <Link
                        href={`/dashboard/menus/${item.id}/edit`}
                        prefetch={true}
                        className="abid-btn abid-btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          textDecoration: "none",
                        }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #FCA5A5",
                          background: "#FEF2F2",
                          color: "#EF4444",
                          cursor: "pointer",
                        }}
                        title="Delete item"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Menu / Category Item"
        message="Are you sure you want to remove this navigation item and its nested sub-items from the live website?"
        confirmLabel="Delete Item"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
