"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavMenuItem, saveNavMenuItemAction } from "@/lib/actions/menus";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, AlertCircle, Sparkles, FolderTree, Compass, Info } from "lucide-react";

interface MenuFormProps {
  initialData?: NavMenuItem | null;
  allMenuItems: NavMenuItem[];
}

export default function MenuForm({ initialData, allMenuItems }: MenuFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(initialData?.id);

  // Form State
  const [label, setLabel] = useState(initialData?.label || "");
  const [url, setUrl] = useState(initialData?.url || "/");
  const [target, setTarget] = useState(initialData?.target || "_self");
  const [menuLocation, setMenuLocation] = useState<"header" | "categories" | "footer">(
    initialData?.menu_location || "categories"
  );
  const [parentId, setParentId] = useState<string>(
    initialData?.parent_id ? initialData.parent_id.toString() : ""
  );
  const [sortOrder, setSortOrder] = useState<string>(
    initialData ? initialData.sort_order.toString() : "1"
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData ? initialData.is_active : true
  );

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Top-level parents available for selected location
  const availableParents = allMenuItems.filter(
    (m) =>
      m.menu_location === menuLocation &&
      !m.parent_id &&
      (!initialData || m.id !== initialData.id)
  );

  const handleQuickUrl = (quickUrl: string) => {
    setUrl(quickUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const formData = new FormData();
    if (initialData?.id) {
      formData.append("id", initialData.id.toString());
    }
    formData.append("label", label.trim());
    formData.append("url", url.trim());
    formData.append("target", target);
    formData.append("menu_location", menuLocation);
    formData.append("parent_id", parentId);
    formData.append("sort_order", sortOrder);
    formData.append("is_active", isActive ? "1" : "0");

    startTransition(async () => {
      const res = await saveNavMenuItemAction(formData);
      if (res.success) {
        setSuccessMsg(
          isEdit
            ? `Successfully updated "${label}"!`
            : `Successfully created "${label}"!`
        );
        setTimeout(() => {
          router.push("/dashboard/menus");
          router.refresh();
        }, 800);
      } else {
        setFormError(res.error || "Failed to save menu item. Please check the fields.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header bar with Back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/dashboard/menus"
            className="abid-btn abid-btn-secondary"
            style={{
              padding: "8px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Menus</span>
          </Link>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-secondary)", margin: 0 }}>
              {isEdit ? `Edit Menu Item: ${initialData?.label}` : "Add New Menu or Category Link"}
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: "4px 0 0" }}>
              Configure storefront navigation, category dropdowns, and sub-category hierarchies.
            </p>
          </div>
        </div>

        {initialData?.created_at && (
          <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
            Created: {new Date(initialData.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {formError && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#B91C1C",
            marginBottom: "20px",
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "#ECFDF5",
            border: "1px solid #6EE7B7",
            color: "#047857",
            marginBottom: "20px",
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg} Redirecting to menu list...</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-surface-border)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Section 1: Label and URL */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Compass size={18} style={{ color: "var(--theme)" }} />
              Basic Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Luxury Furniture, Acoustic Slat Panels, European Kitchens"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                    transition: "border 0.2s ease",
                  }}
                />
                <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  This is the exact title displayed on the website navigation or category dropdown.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Target Route / URL *
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /shop?category=luxury-furniture or /about"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                    fontFamily: "monospace",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Quick Presets:</span>
                  {[
                    { label: "Shop All", url: "/shop" },
                    { label: "Luxury Furniture", url: "/shop?category=luxury-furniture" },
                    { label: "Wall Treatments", url: "/shop?category=wall-treatments-panels" },
                    { label: "Lighting", url: "/shop?category=architectural-lighting" },
                    { label: "Modular Kitchen", url: "/shop?category=modular-kitchen-wardrobes" },
                    { label: "About Us", url: "/about" },
                    { label: "Careers", url: "/careers" },
                    { label: "Contact", url: "/contact" },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleQuickUrl(preset.url)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.74rem",
                        borderRadius: "6px",
                        background: "#F1F5F9",
                        border: "1px solid #E2E8F0",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #F1F5F9", margin: "8px 0" }} />

          {/* Section 2: Placement & Hierarchy (Sub-categories) */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderTree size={18} style={{ color: "var(--theme)" }} />
              Placement & Hierarchy (Sub-Categories)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Menu Placement *
                </label>
                <select
                  value={menuLocation}
                  onChange={(e) => {
                    const nextLoc = e.target.value as "header" | "categories" | "footer";
                    setMenuLocation(nextLoc);
                    setParentId("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="categories">Categories Dropdown (Header "All Categories" flyout)</option>
                  <option value="header">Main Header Navigation</option>
                  <option value="footer">Footer Navigation Links</option>
                </select>
                <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  Select "Categories Dropdown" to manage categories and sub-categories in the website header.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="1"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                  }}
                />
                <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  Lower numbers display first (e.g. 1, 2, 3).
                </span>
              </div>
            </div>

            {/* Parent Category / Item selector */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "8px" }}>
                Parent Item / Category (Select to Create a Sub-Category)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.95rem",
                  background: "#FFFFFF",
                }}
              >
                <option value="">None — This is a Top-Level Main Category</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id.toString()}>
                    ↳ Parent: {parent.label}
                  </option>
                ))}
              </select>

              <div
                style={{
                  marginTop: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <Info size={18} style={{ color: "var(--theme)", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                  <strong>How Sub-Categories work:</strong> Choosing a parent above (for example, choosing <em>"Luxury Furniture"</em> for <em>"Recliners & Lounge Sofas"</em>) creates a nested sub-category. On the website, hovering over <em>"Luxury Furniture"</em> in the "All Categories" menu will reveal this sub-category in the flyout menu.
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #F1F5F9", margin: "8px 0" }} />

          {/* Section 3: Status & Behavior (Enhanced Checkboxes) */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--theme)" }} />
              Status & Storefront Visibility
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Active Toggle Card */}
              <label
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: isActive ? "2px solid #10B981" : "2px solid #E2E8F0",
                  backgroundColor: isActive ? "#F0FDF4" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      accentColor: "#10B981",
                      cursor: "pointer",
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-secondary)", fontSize: "0.95rem", display: "block" }}>
                      Active Status
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                      Published on website navigation
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#10B981",
                      color: "#FFFFFF",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#94A3B8",
                      color: "#FFFFFF",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                    }}
                  >
                    <XCircle size={14} /> Inactive
                  </span>
                )}
              </label>

              {/* Open in New Tab Card */}
              <label
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: target === "_blank" ? "2px solid var(--theme)" : "2px solid #E2E8F0",
                  backgroundColor: target === "_blank" ? "#FFF9F0" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="checkbox"
                    checked={target === "_blank"}
                    onChange={(e) => setTarget(e.target.checked ? "_blank" : "_self")}
                    style={{
                      width: "20px",
                      height: "20px",
                      accentColor: "var(--theme)",
                      cursor: "pointer",
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-secondary)", fontSize: "0.95rem", display: "block" }}>
                      Open in New Tab
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                      target="_blank" for external links
                    </span>
                  </div>
                </div>

                <ExternalLink size={18} style={{ color: target === "_blank" ? "var(--theme)" : "#94A3B8" }} />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <Link
              href="/dashboard/menus"
              className="abid-btn abid-btn-secondary"
              style={{ padding: "12px 24px", fontWeight: 600 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="abid-btn abid-btn-primary"
              style={{
                padding: "12px 32px",
                fontWeight: 700,
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              {isPending
                ? "Saving..."
                : isEdit
                ? "Update Menu / Category Item"
                : "Create Menu / Category Item"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
