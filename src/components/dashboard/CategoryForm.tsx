"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CategoryAdmin, saveCategoryAction } from "@/lib/actions/categories";
import ImageUploader from "@/components/dashboard/ImageUploader";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Sparkles,
  FolderTree,
  AlertCircle,
  Info,
} from "lucide-react";

interface CategoryFormProps {
  initialCategory?: CategoryAdmin | null;
  parentCategories: CategoryAdmin[];
}

const POPULAR_FA_ICONS = [
  { label: "Sofa / Living", icon: "fa-solid fa-couch" },
  { label: "Chair / Dining", icon: "fa-solid fa-chair" },
  { label: "Table / Desks", icon: "fa-solid fa-table" },
  { label: "Bed / Bedroom", icon: "fa-solid fa-bed" },
  { label: "Bath / Sanitary", icon: "fa-solid fa-bath" },
  { label: "Kitchen / Cabinets", icon: "fa-solid fa-kitchen-set" },
  { label: "Lighting / Lamps", icon: "fa-solid fa-lightbulb" },
  { label: "Wall Panels / Slat", icon: "fa-solid fa-border-all" },
  { label: "Decor / Art", icon: "fa-solid fa-palette" },
  { label: "Hardware / Tools", icon: "fa-solid fa-screwdriver-wrench" },
  { label: "Doors / Wardrobe", icon: "fa-solid fa-door-closed" },
  { label: "Luxury / Premium", icon: "fa-solid fa-gem" },
  { label: "General / Shapes", icon: "fa-solid fa-shapes" },
];

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
  // Keyword fallback
  const t = trimmed.toLowerCase();
  if (t.includes("sofa") || t.includes("furniture")) return "fa-solid fa-couch";
  if (t.includes("wall") || t.includes("panel")) return "fa-solid fa-border-all";
  if (t.includes("light") || t.includes("lamp")) return "fa-solid fa-lightbulb";
  if (t.includes("kitchen") || t.includes("wardrobe")) return "fa-solid fa-kitchen-set";
  if (t.includes("decor") || t.includes("furnishing")) return "fa-solid fa-palette";
  if (t.includes("hardware") || t.includes("wholesale")) return "fa-solid fa-screwdriver-wrench";
  return "fa-solid fa-shapes";
}

export default function CategoryForm({ initialCategory, parentCategories }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialCategory?.id);

  const [name, setName] = useState(initialCategory?.name || "");
  const [slug, setSlug] = useState(initialCategory?.slug || "");
  const [parentId, setParentId] = useState<string>(
    initialCategory?.parent_id ? String(initialCategory.parent_id) : ""
  );
  const [iconType, setIconType] = useState(
    initialCategory?.icon_type || "fa-solid fa-couch"
  );
  const [image, setImage] = useState(initialCategory?.image || "");
  const [itemCount, setItemCount] = useState(
    initialCategory?.item_count !== undefined ? String(initialCategory.item_count) : "0"
  );
  const [isActive, setIsActive] = useState(
    initialCategory?.is_active !== undefined ? initialCategory.is_active : true
  );

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Category Name is required.");
      return;
    }
    if (!slug.trim()) {
      setFormError("URL Slug is required.");
      return;
    }

    const formData = new FormData();
    if (initialCategory?.id) {
      formData.append("id", String(initialCategory.id));
    }
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("parent_id", parentId);
    formData.append("icon_type", iconType.trim() || "fa-solid fa-shapes");
    formData.append("image", image.trim());
    formData.append("item_count", itemCount);
    formData.append("is_active", isActive ? "1" : "0");

    startTransition(async () => {
      const res = await saveCategoryAction(formData);
      if (res.success) {
        router.push("/dashboard/categories");
        router.refresh();
      } else {
        setFormError(res.error || "Failed to save category. Please check your inputs.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "48px" }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/dashboard/categories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#64748B",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FF4035")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
        >
          <ArrowLeft size={16} />
          <span>Back to Category Master</span>
        </Link>
      </div>

      {/* Main Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {isEditing ? `Edit Category: ${initialCategory?.name}` : "Create New Category / Subcategory"}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.86rem" }}>
            Configure category labels, hierarchy, Font Awesome icons, and storefront visibility.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/dashboard/categories"
            className="abid-btn abid-btn-outline"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="category-master-form"
            disabled={isPending}
            className="abid-btn abid-btn-primary"
            style={{
              padding: "8px 20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
            }}
          >
            <Save size={16} />
            <span>{isPending ? "Saving..." : isEditing ? "Update Category" : "Save Category"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#B91C1C",
            fontSize: "0.86rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        id="category-master-form"
        onSubmit={handleSubmit}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Name and Slug Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Luxury Furniture or Recliners"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. luxury-furniture or recliners"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>
        </div>

        {/* Category Cover Image (Image Based Category) */}
        <div>
          <ImageUploader
            value={image}
            onChange={setImage}
            label="Category Cover Photo (For Image-Based Storefront Display)"
            name="category_image"
          />
          <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#64748B" }}>
            This photo will be displayed full-bleed in the storefront category carousel with the category title and product count overlayed on top.
          </p>
        </div>

        {/* Hierarchy: Parent Category & Item Count Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Parent Category (For Sub-categories)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "0.88rem",
                backgroundColor: "#FFFFFF",
                outline: "none",
              }}
            >
              <option value="">-- Main Category (Top Level / No Parent) --</option>
              {parentCategories
                .filter((p) => !initialCategory || p.id !== initialCategory.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Under: {p.name}
                  </option>
                ))}
            </select>
            <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#64748B" }}>
              Select a parent category if this is a subcategory (e.g. Recliners under Luxury Furniture).
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Initial Item Count
            </label>
            <input
              type="number"
              min="0"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Font Awesome Icon Section */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Font Awesome Icon *
            </label>
            <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
              Accepts any Font Awesome class (e.g. <code>fa-solid fa-couch</code>)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            {/* Live Icon Preview Badge */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#0F172A",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
              title="Live Font Awesome Preview"
            >
              <i className={formatFaClass(iconType)} />
            </div>

            <div style={{ flex: 1 }}>
              <input
                type="text"
                required
                value={iconType}
                onChange={(e) => setIconType(e.target.value)}
                placeholder="fa-solid fa-couch"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.88rem",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Quick Select Preset Icons */}
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", marginBottom: "6px" }}>
              Quick Pick Preset Icons:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {POPULAR_FA_ICONS.map((p) => {
                const isSelected = iconType.trim() === p.icon;
                return (
                  <button
                    key={p.icon}
                    type="button"
                    onClick={() => setIconType(p.icon)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 9px",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #FF4035" : "1px solid #E2E8F0",
                      background: isSelected ? "#FEF2F2" : "#FFFFFF",
                      color: isSelected ? "#FF4035" : "#334155",
                      fontSize: "0.78rem",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <i className={p.icon} style={{ fontSize: "0.82rem" }} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prominent Active Status Checkbox Card */}
        <div
          onClick={() => setIsActive(!isActive)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderRadius: "10px",
            border: isActive ? "1.5px solid #10B981" : "1.5px solid #CBD5E1",
            backgroundColor: isActive ? "#F0FDF4" : "#F8FAFC",
            cursor: "pointer",
            transition: "all 0.2s ease",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "18px",
                height: "18px",
                accentColor: "#10B981",
                cursor: "pointer",
              }}
            />
            <div>
              <label
                htmlFor="is_active_checkbox"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  cursor: "pointer",
                }}
              >
                Active Status & Visibility
              </label>
              <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                When checked, this category/subcategory is published and shown on the website and menus.
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              backgroundColor: isActive ? "#DCFCE7" : "#E2E8F0",
              color: isActive ? "#15803D" : "#64748B",
            }}
          >
            {isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
            <span>{isActive ? "Active (Live on Site)" : "Inactive (Draft)"}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid #E2E8F0",
            paddingTop: "16px",
            marginTop: "6px",
          }}
        >
          <Link
            href="/dashboard/categories"
            className="abid-btn abid-btn-outline"
            style={{
              padding: "9px 20px",
              fontSize: "0.86rem",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="abid-btn abid-btn-primary"
            style={{
              padding: "9px 24px",
              fontSize: "0.86rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
            }}
          >
            <Save size={16} />
            <span>{isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
