"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product, ProductCategory, saveProductAction } from "@/lib/actions/products";
import {
  ProductAttribute,
  ProductVariation,
  saveDynamicProductVariationsAction,
} from "@/lib/actions/variations";
import ImageUploader from "@/components/dashboard/ImageUploader";
import ProductGalleryManager from "@/components/dashboard/ProductGalleryManager";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  FolderTree,
  Tag,
  IndianRupee,
  Package,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Plus,
  Trash2,
  Grid,
  X,
  Image as ImageIcon,
} from "lucide-react";

export interface DynamicCustomAttribute {
  id: string;
  name: string;
  values: string[];
  inputVal?: string;
}

export interface DynamicVariationRow {
  id?: number;
  sku: string;
  price: string;
  original_price: string;
  stock: string;
  image: string;
  is_active: boolean;
  combination: Record<string, string>;
}

interface ProductFormProps {
  initialProduct?: Product | null;
  categories: ProductCategory[];
  attributes?: ProductAttribute[];
  initialVariations?: ProductVariation[];
}

export default function ProductForm({
  initialProduct,
  categories,
  attributes = [],
  initialVariations = [],
}: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPage = searchParams.get("page") || "1";
  const isEditing = Boolean(initialProduct?.id);

  // Group categories into Main Parents and Sub-categories
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id);
  }, [categories]);

  const allSubcategories = useMemo(() => {
    return categories.filter((c) => Boolean(c.parent_id));
  }, [categories]);

  // Form State
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");

  // Initial Category Setup
  const defaultParent =
    mainCategories.find((c) => c.slug === initialProduct?.category_slug) ||
    mainCategories[0] || { id: 0, slug: "general", name: "General" };

  const [selectedParentSlug, setSelectedParentSlug] = useState<string>(
    initialProduct?.category_slug || defaultParent.slug
  );

  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>(
    initialProduct?.subcategory_slug || ""
  );

  const [customSubcategory, setCustomSubcategory] = useState("");

  // Available Subcategories based on selected parent (matching by id, slug, or parent object)
  const activeParent = useMemo(() => {
    return mainCategories.find((c) => c.slug === selectedParentSlug);
  }, [mainCategories, selectedParentSlug]);

  const availableSubcategories = useMemo(() => {
    if (!activeParent) return [];
    return allSubcategories.filter((s) => {
      if (s.parent_id === activeParent.id) return true;
      const parentObj = categories.find((c) => c.id === s.parent_id);
      if (
        parentObj &&
        (parentObj.slug === activeParent.slug ||
          parentObj.name.toLowerCase() === activeParent.name.toLowerCase())
      ) {
        return true;
      }
      return false;
    });
  }, [allSubcategories, activeParent, categories]);

  // Pricing & Stock
  const [price, setPrice] = useState(
    initialProduct?.price !== undefined ? String(initialProduct.price) : "25.00"
  );
  const [originalPrice, setOriginalPrice] = useState(
    initialProduct?.original_price ? String(initialProduct.original_price) : ""
  );
  const [discountPercent, setDiscountPercent] = useState(
    initialProduct?.discount_percent !== undefined ? String(initialProduct.discount_percent) : "0"
  );
  const [stock, setStock] = useState(
    initialProduct?.stock !== undefined ? String(initialProduct.stock) : "50"
  );

  // Media & Badging
  const [image, setImage] = useState(
    initialProduct?.image || ""
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (!initialProduct?.gallery_images) return [];
    if (Array.isArray(initialProduct.gallery_images)) return initialProduct.gallery_images;
    if (typeof initialProduct.gallery_images === "string") {
      try {
        const parsed = JSON.parse(initialProduct.gallery_images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [badge, setBadge] = useState(initialProduct?.badge || "");
  const [brand, setBrand] = useState(
    initialProduct?.brand || "Wall Street Interiors"
  );

  // Descriptions
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.short_description || ""
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );

  // Flags
  const [isBestSeller, setIsBestSeller] = useState(
    initialProduct?.is_best_seller || false
  );
  const [isFeatured, setIsFeatured] = useState(
    initialProduct?.is_featured !== undefined ? initialProduct.is_featured : true
  );
  const [isPopular, setIsPopular] = useState(
    initialProduct?.is_popular || false
  );
  const [isOnSale, setIsOnSale] = useState(
    initialProduct?.is_on_sale || false
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    initialProduct?.status === "inactive" ? "inactive" : "active"
  );

  // Variations State
  const [hasVariations, setHasVariations] = useState<boolean>(
    Boolean(initialProduct?.has_variations) || (initialVariations && initialVariations.length > 0) || false
  );

  // Custom Sizing State
  const [allowCustomSizing, setAllowCustomSizing] = useState<boolean>(
    Boolean(initialProduct?.allow_custom_sizing)
  );
  const [customSizeRate, setCustomSizeRate] = useState<string>(
    initialProduct?.custom_size_rate !== undefined ? String(initialProduct.custom_size_rate) : "10"
  );
  const [customSizeUnit, setCustomSizeUnit] = useState<string>(
    initialProduct?.custom_size_unit || "sq_ft"
  );
  const [customSizeMinPrice, setCustomSizeMinPrice] = useState<string>(
    initialProduct?.custom_size_min_price !== undefined ? String(initialProduct.custom_size_min_price) : "0"
  );
  const [customSizeLinearMode, setCustomSizeLinearMode] = useState<string>(
    initialProduct?.custom_size_linear_mode || "length_plus_width"
  );

  // Dynamic custom attributes extracted from initialVariations or seeded empty
  const [customAttributes, setCustomAttributes] = useState<DynamicCustomAttribute[]>(() => {
    if (initialVariations && initialVariations.length > 0) {
      const attrMap = new Map<string, Set<string>>();
      initialVariations.forEach((v) => {
        if (v.values && v.values.length > 0) {
          v.values.forEach((val) => {
            if (!attrMap.has(val.attribute_name)) {
              attrMap.set(val.attribute_name, new Set());
            }
            if (val.value_label) {
              attrMap.get(val.attribute_name)!.add(val.value_label);
            }
          });
        } else if (v.attribute_names) {
          Object.entries(v.attribute_names).forEach(([name, valLabel]) => {
            if (!attrMap.has(name)) {
              attrMap.set(name, new Set());
            }
            if (valLabel) {
              attrMap.get(name)!.add(valLabel);
            }
          });
        }
      });

      if (attrMap.size > 0) {
        return Array.from(attrMap.entries()).map(([name, vals], idx) => ({
          id: `attr_${idx + 1}_${Date.now()}`,
          name,
          values: Array.from(vals),
          inputVal: "",
        }));
      }
    }
    return [];
  });

  // Dynamic variation rows
  const [variationsList, setVariationsList] = useState<DynamicVariationRow[]>(() => {
    if (initialVariations && initialVariations.length > 0) {
      return initialVariations.map((v) => {
        const combo: Record<string, string> = {};
        if (v.values && v.values.length > 0) {
          v.values.forEach((val) => {
            combo[val.attribute_name] = val.value_label;
          });
        } else if (v.attribute_names) {
          Object.assign(combo, v.attribute_names);
        }
        return {
          id: v.id,
          sku: v.sku || "",
          price: String(v.price),
          original_price: v.original_price ? String(v.original_price) : "",
          stock: String(v.stock),
          image: v.image && v.image !== initialProduct?.image && !v.image.startsWith("/images/products/") ? v.image : "",
          is_active: Boolean(v.is_active),
          combination: combo,
        };
      });
    }
    return [];
  });

  const addCustomAttribute = (initialName: string = "") => {
    const newAttr: DynamicCustomAttribute = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: initialName,
      values: [],
      inputVal: "",
    };
    setCustomAttributes((prev) => [...prev, newAttr]);
  };

  const removeCustomAttribute = (attrId: string) => {
    setCustomAttributes((prev) => prev.filter((a) => a.id !== attrId));
  };

  const updateAttributeName = (attrId: string, newName: string) => {
    setCustomAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, name: newName } : a))
    );
  };

  const updateAttributeInputVal = (attrId: string, text: string) => {
    setCustomAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, inputVal: text } : a))
    );
  };

  const addAttributeValue = (attrId: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const valsToAdd = trimmed
      .split(",")
      .map((v) => v.trim())
      .filter((v) => Boolean(v));

    setCustomAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id !== attrId) return attr;
        const set = new Set(attr.values);
        valsToAdd.forEach((v) => set.add(v));
        return { ...attr, values: Array.from(set), inputVal: "" };
      })
    );
  };

  const removeAttributeValue = (attrId: string, valToRemove: string) => {
    setCustomAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id !== attrId) return attr;
        return { ...attr, values: attr.values.filter((v) => v !== valToRemove) };
      })
    );
  };

  const buildCombinations = (
    attrs: DynamicCustomAttribute[],
    currentVariations: DynamicVariationRow[] = []
  ): DynamicVariationRow[] => {
    const activeAttrs = attrs.filter(
      (a) => a.name.trim() !== "" && a.values.length > 0
    );

    if (activeAttrs.length === 0) return [];

    let combinations: Record<string, string>[] = [{}];

    for (const attr of activeAttrs) {
      const nextCombos: Record<string, string>[] = [];
      for (const existingCombo of combinations) {
        for (const val of attr.values) {
          if (val && val.trim()) {
            nextCombos.push({
              ...existingCombo,
              [attr.name.trim()]: val.trim(),
            });
          }
        }
      }
      combinations = nextCombos;
    }

    const baseSkuPrefix = (slug || name || "PROD")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) || "PROD";

    return combinations.map((combo) => {
      const existing = currentVariations.find((v) => {
        const keys = Object.keys(combo);
        return (
          keys.every((k) => v.combination && v.combination[k] === combo[k]) &&
          Object.keys(v.combination || {}).length === keys.length
        );
      });

      if (existing) return existing;

      const skuSuffix = Object.values(combo)
        .map((val) => val.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
        .join("-");

      return {
        sku: `${baseSkuPrefix}-${skuSuffix}`,
        price: price || "25.00",
        original_price: originalPrice || "",
        stock: stock || "20",
        image: image || "",
        is_active: true,
        combination: combo,
      };
    });
  };

  const generateCombinationsMatrix = () => {
    // Commit any uncommitted inputs first
    const committed = customAttributes.map((attr) => {
      if (attr.inputVal && attr.inputVal.trim()) {
        const vals = attr.inputVal
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        const set = new Set([...attr.values, ...vals]);
        return { ...attr, values: Array.from(set), inputVal: "" };
      }
      return attr;
    });
    setCustomAttributes(committed);

    const activeAttrs = committed.filter(
      (a) => a.name.trim() !== "" && a.values.length > 0
    );

    if (activeAttrs.length === 0) {
      alert("Please add at least one attribute with at least one value before generating combinations.");
      return;
    }

    const newRows = buildCombinations(committed, variationsList);
    setVariationsList(newRows);
  };

  const addManualVariationRow = () => {
    const combo: Record<string, string> = {};
    customAttributes.forEach((attr) => {
      if (attr.name.trim()) {
        combo[attr.name.trim()] = attr.values[0] || "Standard";
      }
    });
    const baseSkuPrefix = (slug || name || "PROD")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    setVariationsList((prev) => [
      ...prev,
      {
        sku: `${baseSkuPrefix}-${randomSuffix}`,
        price: price || "25.00",
        original_price: originalPrice || "",
        stock: stock || "20",
        image: image || "",
        is_active: true,
        combination: combo,
      },
    ]);
  };

  const updateVariationRow = (index: number, field: keyof DynamicVariationRow, value: any) => {
    setVariationsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateVariationCombinationValue = (
    rowIndex: number,
    attrName: string,
    newVal: string
  ) => {
    setVariationsList((prev) => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        combination: {
          ...copy[rowIndex].combination,
          [attrName]: newVal,
        },
      };
      return copy;
    });
  };

  const removeVariationRow = (index: number) => {
    setVariationsList((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleParentCategoryChange = (parentSlug: string) => {
    setSelectedParentSlug(parentSlug);
    setSelectedSubcategorySlug(""); // Reset subcategory when parent changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Product Name is required.");
      return;
    }
    if (!slug.trim()) {
      setFormError("Product URL Slug is required.");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      setFormError("A valid Price (₹) is required.");
      return;
    }

    const currentParent = mainCategories.find((c) => c.slug === selectedParentSlug);
    const currentSub = availableSubcategories.find((s) => s.slug === selectedSubcategorySlug);

    const formData = new FormData();
    if (initialProduct?.id) {
      formData.append("id", String(initialProduct.id));
    }
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("category_slug", selectedParentSlug);
    formData.append("category_name", currentParent?.name || selectedParentSlug);

    if (selectedSubcategorySlug === "__custom__" && customSubcategory.trim()) {
      const customName = customSubcategory.trim();
      const customSlug = customName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      formData.append("subcategory_slug", customSlug);
      formData.append("subcategory_name", customName);
    } else if (currentSub) {
      formData.append("subcategory_slug", currentSub.slug);
      formData.append("subcategory_name", currentSub.name);
    } else {
      formData.append("subcategory_slug", "");
      formData.append("subcategory_name", "");
    }

    formData.append("price", price);
    formData.append("original_price", originalPrice);
    formData.append("discount_percent", discountPercent);
    formData.append("stock", stock);
    formData.append("image", image || "");
    formData.append("gallery_images", JSON.stringify(galleryImages));
    formData.append("badge", badge.trim());
    formData.append("brand", brand.trim());
    formData.append("short_description", shortDescription.trim());
    formData.append("description", description.trim());
    formData.append("is_best_seller", isBestSeller ? "1" : "0");
    formData.append("is_featured", isFeatured ? "1" : "0");
    formData.append("is_popular", isPopular ? "1" : "0");
    formData.append("is_on_sale", isOnSale ? "1" : "0");
    formData.append("status", status);
    formData.append("has_variations", hasVariations ? "1" : "0");
    formData.append("allow_custom_sizing", allowCustomSizing ? "1" : "0");
    formData.append("custom_size_rate", customSizeRate || "0");
    formData.append("custom_size_unit", customSizeUnit || "sq_ft");
    formData.append("custom_size_min_price", customSizeMinPrice || "0");
    formData.append("custom_size_linear_mode", customSizeLinearMode || "length_plus_width");

    // Ensure uncommitted attribute text is committed
    const committedAttrs = customAttributes.map((attr) => {
      if (attr.inputVal && attr.inputVal.trim()) {
        const extraVals = attr.inputVal
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        const set = new Set([...attr.values, ...extraVals]);
        return { ...attr, values: Array.from(set), inputVal: "" };
      }
      return attr;
    });

    const activeAttrs = committedAttrs.filter(
      (a) => a.name.trim() !== "" && a.values.length > 0
    );

    if (hasVariations && activeAttrs.length === 0) {
      setFormError("Product Variations is enabled, but no variation options or values (e.g. Size, Color) were configured. Please add options or uncheck 'Variations Active'.");
      return;
    }

    let finalVariations = variationsList;
    if (hasVariations && finalVariations.length === 0 && activeAttrs.length > 0) {
      finalVariations = buildCombinations(committedAttrs, []);
      setVariationsList(finalVariations);
    }

    startTransition(async () => {
      try {
        const res = await saveProductAction(formData);
        const targetId = res.success ? (res.id || initialProduct?.id) : undefined;
        if (res.success && targetId) {
          if (hasVariations) {
            const varPayload = finalVariations.map((v) => {
              const cleanVarImg = (v.image || "").trim();
              const finalImg = (cleanVarImg && cleanVarImg !== image && !cleanVarImg.startsWith("/images/products/")) ? cleanVarImg : null;
              return {
                id: v.id,
                sku: (v.sku || "").trim() || `${(slug || name || "PROD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                price: parseFloat(v.price) || parseFloat(price) || 0,
                original_price: v.original_price ? parseFloat(v.original_price) : null,
                stock: parseInt(v.stock, 10) || 0,
                image: finalImg,
                is_active: v.is_active ? 1 : 0,
                combination: v.combination || {},
              };
            });
            const attrPayload = activeAttrs.map((a) => ({
              name: a.name.trim(),
              values: a.values,
            }));
            const varRes = await saveDynamicProductVariationsAction(targetId, true, attrPayload, varPayload);
            if (!varRes.success) {
              setFormError(varRes.error || "Failed to save product variations. Please check combination values.");
              return;
            }
          } else {
            const varRes = await saveDynamicProductVariationsAction(targetId, false, [], []);
            if (!varRes.success) {
              setFormError(varRes.error || "Failed to update variation settings.");
              return;
            }
          }

          router.push(`/dashboard/products?page=${returnPage}`);
          router.refresh();
        } else {
          setFormError(res.error || "Failed to save product. Please verify inputs.");
        }
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "An unexpected error occurred while saving.");
      }
    });
  };

  const currentSubObj = availableSubcategories.find((s) => s.slug === selectedSubcategorySlug);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "48px" }}>
      {/* Back Link */}
      <div style={{ marginBottom: "18px" }}>
        <Link
          href={`/dashboard/products?page=${returnPage}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#64748B",
            textDecoration: "none",
            fontSize: "0.84rem",
            fontWeight: 600,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FF4035")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
        >
          <ArrowLeft size={16} />
          <span>Back to Product Catalog (Page {returnPage})</span>
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
            {isEditing ? `Edit Product: ${initialProduct?.name}` : "Add New Store Product"}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.85rem" }}>
            Configure product details, categories, sub-categories, inventory, and pricing.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href={`/dashboard/products?page=${returnPage}`}
            className="abid-btn abid-btn-outline"
            style={{
              padding: "8px 16px",
              fontSize: "0.84rem",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="product-master-form"
            disabled={isPending}
            className="abid-btn abid-btn-primary"
            style={{
              padding: "8px 20px",
              fontSize: "0.84rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
            }}
          >
            <Save size={16} />
            <span>{isPending ? "Saving..." : isEditing ? "Update Product" : "Save Product"}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
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
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        id="product-master-form"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Card 1: General Info */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "10px",
            }}
          >
            <Package size={17} style={{ color: "#FF4035" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Product Identification & Details
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Nordic Acoustic Slat Wood Wall Panel"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
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
                placeholder="e.g. nordic-acoustic-slat-wood-panel"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Wall Street Interiors"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Stock Inventory Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Categorization & Sub-Categories Hierarchy */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E0E7FF",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              borderBottom: "1px solid #EEF2FF",
              paddingBottom: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderTree size={17} style={{ color: "#4F46E5" }} />
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Categorization & Sub-Categories Hierarchy
              </h3>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#4F46E5",
                backgroundColor: "#EEF2FF",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              Multi-Level Hierarchy
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
            {/* Primary Category Selector */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#1E293B",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Primary Category *
              </label>
              <select
                value={selectedParentSlug}
                onChange={(e) => handleParentCategoryChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  backgroundColor: "#FFFFFF",
                  outline: "none",
                  fontWeight: 600,
                }}
              >
                {mainCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-category Selector */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#1E293B",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Sub-category {availableSubcategories.length > 0 ? `(${availableSubcategories.length} Available)` : ""}
              </label>
              <select
                value={selectedSubcategorySlug}
                onChange={(e) => setSelectedSubcategorySlug(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  backgroundColor: "#FFFFFF",
                  outline: "none",
                  fontWeight: selectedSubcategorySlug ? 600 : 400,
                }}
              >
                <option value="">-- No Sub-category (Directly under {activeParent?.name || "Main Category"}) --</option>
                {availableSubcategories.map((s) => (
                  <option key={s.id || s.slug} value={s.slug}>
                    └─ {s.name}
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Sub-category...</option>
              </select>

              {selectedSubcategorySlug === "__custom__" && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Type sub-category name (e.g. Lounge Sofas)..."
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #4F46E5",
                      backgroundColor: "#F5F3FF",
                      fontSize: "0.84rem",
                      outline: "none",
                      fontWeight: 600,
                      color: "#1E1B4B",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Breadcrumb Hierarchy Indicator */}
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#F8FAFC",
              border: "1px dashed #CBD5E1",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.82rem",
            }}
          >
            <span style={{ fontWeight: 700, color: "#64748B" }}>Storefront Placement:</span>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>
                {activeParent?.name || selectedParentSlug}
              </span>
              {selectedSubcategorySlug === "__custom__" && customSubcategory.trim() ? (
                <>
                  <span style={{ color: "#94A3B8" }}>&gt;</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#4F46E5",
                      backgroundColor: "#EEF2FF",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {customSubcategory.trim()} (Custom)
                  </span>
                </>
              ) : currentSubObj ? (
                <>
                  <span style={{ color: "#94A3B8" }}>&gt;</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#4F46E5",
                      backgroundColor: "#EEF2FF",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {currentSubObj.name}
                  </span>
                </>
              ) : (
                <span style={{ color: "#64748B", fontStyle: "italic", fontSize: "0.78rem" }}>
                  (Directly in {activeParent?.name || "Main Category"})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pricing & Inventory */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "10px",
            }}
          >
            <IndianRupee size={17} style={{ color: "#059669" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Pricing & Promotions
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Sale Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25.00"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Original Price (₹) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="35.00"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Discount Percent (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Card: Custom Sizing in Feet Measurement */}
        <div
          style={{
            background: "#FFFFFF",
            border: allowCustomSizing ? "2px solid #10B981" : "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            marginBottom: "20px",
            boxShadow: allowCustomSizing
              ? "0 4px 20px rgba(16, 185, 129, 0.08)"
              : "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: allowCustomSizing ? "16px" : 0,
              borderBottom: allowCustomSizing ? "1px solid #F1F5F9" : "none",
              paddingBottom: allowCustomSizing ? "12px" : 0,
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: allowCustomSizing ? "rgba(16, 185, 129, 0.1)" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: allowCustomSizing ? "#10B981" : "#64748B",
                  fontSize: "1rem",
                }}
              >
                📐
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Custom Sizing in Feet (Measurement Pricing)
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0 }}>
                  Allow customers to enter their own feet dimensions (Length × Width) and calculate live estimated pricing
                </p>
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: allowCustomSizing ? "#ECFDF5" : "#F8FAFC",
                border: allowCustomSizing ? "1.5px solid #10B981" : "1px solid #CBD5E1",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: allowCustomSizing ? "#059669" : "#475569",
              }}
            >
              <input
                type="checkbox"
                checked={allowCustomSizing}
                onChange={(e) => setAllowCustomSizing(e.target.checked)}
                style={{ accentColor: "#10B981", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>{allowCustomSizing ? "Custom Sizing Active" : "Enable Custom Sizing"}</span>
            </label>
          </div>

          {allowCustomSizing && (
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {/* Rate per Unit */}
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Rate per Unit (₹) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#64748B" }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customSizeRate}
                      onChange={(e) => setCustomSizeRate(e.target.value)}
                      placeholder="e.g. 14.00"
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 28px",
                        borderRadius: "7px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#0F172A",
                        outline: "none",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                    Dynamic rate (e.g. ₹14 per sq.ft or linear ft)
                  </span>
                </div>

                {/* Pricing Method / Unit */}
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Pricing Method
                  </label>
                  <select
                    value={customSizeUnit}
                    onChange={(e) => setCustomSizeUnit(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "7px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      color: "#0F172A",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                    }}
                  >
                    <option value="sq_ft">Square Feet Calculator (Area: Length × Width)</option>
                    <option value="linear_ft">Linear Feet Calculator (Running or L + W)</option>
                  </select>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                    {customSizeUnit === "sq_ft"
                      ? "Calculates Area = Length (ft) × Width (ft)"
                      : "Calculates Billable Linear Footage"}
                  </span>
                </div>

                {/* Linear Mode Selection (if linear_ft) */}
                {customSizeUnit === "linear_ft" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Linear Calculation Rule
                    </label>
                    <select
                      value={customSizeLinearMode}
                      onChange={(e) => setCustomSizeLinearMode(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "7px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    >
                      <option value="length_plus_width">Length + Width (e.g. 6 ft 3 in + 5 ft = 11.25 ft)</option>
                      <option value="single_length">Single Running Length only (e.g. 10 ft)</option>
                    </select>
                    <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                      {customSizeLinearMode === "length_plus_width"
                        ? "Adds Length & Width for perimeter/frames"
                        : "Measures single running length"}
                    </span>
                  </div>
                )}

                {/* Minimum Charge */}
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Minimum Order Charge (₹)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#64748B" }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customSizeMinPrice}
                      onChange={(e) => setCustomSizeMinPrice(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 28px",
                        borderRadius: "7px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#0F172A",
                        outline: "none",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                    Baseline floor charge (₹0 for none)
                  </span>
                </div>
              </div>

              {/* Dynamic Live Formula Preview */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  backgroundColor: "#ECFDF5",
                  borderRadius: "8px",
                  border: "1px solid #A7F3D0",
                  fontSize: "0.84rem",
                  color: "#065F46",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <i className="fa-solid fa-calculator"></i>
                  <strong>Configured Pricing Rule & Live Storefront Preview:</strong>
                </div>
                {customSizeUnit === "sq_ft" ? (
                  <div>
                    <span><strong>Rule:</strong> Area (sq. ft) = Length (ft) × Width (ft). Rate = ₹{Number(customSizeRate || 0).toFixed(2)} / sq.ft.</span>
                    <div style={{ marginTop: "4px", color: "#047857" }}>
                      <strong>Example:</strong> 6 ft 3 in (6.25 ft) × 5 ft (5.00 ft) = <strong>31.25 sq. ft</strong> × ₹{Number(customSizeRate || 0).toFixed(2)} = <strong>₹{(31.25 * Number(customSizeRate || 0)).toFixed(2)}</strong>
                      {Number(customSizeMinPrice) > (31.25 * Number(customSizeRate || 0)) && (
                        <span style={{ color: "#B45309", marginLeft: "6px" }}>
                          (Min charge ₹{Number(customSizeMinPrice).toFixed(2)} applies)
                        </span>
                      )}
                    </div>
                  </div>
                ) : customSizeLinearMode === "length_plus_width" ? (
                  <div>
                    <span><strong>Rule:</strong> Linear Feet = Length (ft) + Width (ft). Rate = ₹{Number(customSizeRate || 0).toFixed(2)} / linear ft.</span>
                    <div style={{ marginTop: "4px", color: "#047857" }}>
                      <strong>Example:</strong> 6 ft 3 in (6.25 ft) + 5 ft (5.00 ft) = <strong>11.25 linear ft</strong> × ₹{Number(customSizeRate || 0).toFixed(2)} = <strong>₹{(11.25 * Number(customSizeRate || 0)).toFixed(2)}</strong>
                      {Number(customSizeMinPrice) > (11.25 * Number(customSizeRate || 0)) && (
                        <span style={{ color: "#B45309", marginLeft: "6px" }}>
                          (Min charge ₹{Number(customSizeMinPrice).toFixed(2)} applies)
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span><strong>Rule:</strong> Linear Feet = Running Length (ft). Rate = ₹{Number(customSizeRate || 0).toFixed(2)} / linear ft.</span>
                    <div style={{ marginTop: "4px", color: "#047857" }}>
                      <strong>Example:</strong> 11.25 ft running length × ₹{Number(customSizeRate || 0).toFixed(2)} = <strong>₹{(11.25 * Number(customSizeRate || 0)).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card: Product Variations System */}
        <div
          style={{
            background: "#FFFFFF",
            border: hasVariations ? "2px solid #FF4035" : "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: hasVariations
              ? "0 4px 20px rgba(255, 64, 53, 0.08)"
              : "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: hasVariations ? "rgba(255, 64, 53, 0.1)" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: hasVariations ? "#FF4035" : "#64748B",
                }}
              >
                <Sliders size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Product Variations (Size, Color, Material)
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0 }}>
                  Enable if this product has multiple sizes, finishes, or custom dimensions
                </p>
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: hasVariations ? "#FEF2F2" : "#F8FAFC",
                border: hasVariations ? "1.5px solid #FF4035" : "1px solid #CBD5E1",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: hasVariations ? "#FF4035" : "#475569",
              }}
            >
              <input
                type="checkbox"
                checked={hasVariations}
                onChange={(e) => setHasVariations(e.target.checked)}
                style={{ accentColor: "#FF4035", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>{hasVariations ? "Variations Active" : "Enable Variations"}</span>
            </label>
          </div>

          {hasVariations && (
            <div style={{ marginTop: "16px" }}>
              {/* Step 1: Dynamic Custom Attributes & Options */}
              <div
                style={{
                  padding: "18px 20px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      1. Custom Attributes &amp; Options
                    </h4>
                    <p style={{ fontSize: "0.76rem", color: "#64748B", margin: 0 }}>
                      Add custom attributes (e.g. Size, Wood Finish, Material, Dimensions) and enter their option values.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => addCustomAttribute()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "7px 14px",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Option</span>
                    </button>
                    <button
                      type="button"
                      onClick={generateCombinationsMatrix}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        backgroundColor: "#FF4035",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(255, 64, 53, 0.25)",
                      }}
                    >
                      <Grid size={14} />
                      <span>Generate Combination Matrix</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Presets */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>Quick Add:</span>
                  {["Size", "Color / Finish", "Material", "Dimensions"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const exists = customAttributes.some(
                          (a) => a.name.trim().toLowerCase() === preset.toLowerCase()
                        );
                        if (!exists) {
                          addCustomAttribute(preset);
                        } else {
                          alert(`Option "${preset}" already added.`);
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Attributes List */}
                {customAttributes.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px dashed #CBD5E1",
                      color: "#64748B",
                      fontSize: "0.82rem",
                    }}
                  >
                    No attributes configured yet. Click one of the quick presets above or click{" "}
                    <strong>&quot;Add Option&quot;</strong> to create any custom attribute (e.g., Fabric, Leg Finish).
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {customAttributes.map((attr) => (
                      <div
                        key={attr.id}
                        style={{
                          background: "#FFFFFF",
                          padding: "14px 16px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                            gap: "10px",
                          }}
                        >
                          <div style={{ flex: 1, maxWidth: "340px" }}>
                            <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                              Option / Attribute Name
                            </label>
                            <input
                              type="text"
                              value={attr.name}
                              onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                              placeholder="e.g. Size, Wood Finish, Material, Fabric..."
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "#0F172A",
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomAttribute(attr.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 10px",
                              backgroundColor: "#FEE2E2",
                              color: "#DC2626",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              alignSelf: "flex-end",
                              marginBottom: "2px",
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Remove Option</span>
                          </button>
                        </div>

                        {/* Values Tag Editor */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                            <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#475569", margin: 0 }}>
                              Option Values (Type value and press Enter or comma):
                            </label>
                            {(attr.name.toLowerCase().includes("size") || attr.name.toLowerCase().includes("dimen")) && (
                              <span style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 600, backgroundColor: "#ECFDF5", padding: "1px 8px", borderRadius: "4px" }}>
                                💡 Tip: You can include units like (76×80 in), (6×3 ft), or (240×60 cm)
                              </span>
                            )}
                          </div>

                          {(attr.name.toLowerCase().includes("size") || attr.name.toLowerCase().includes("dimen")) && (
                            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>Suggested:</span>
                              {[
                                'King (76" × 80")',
                                'Queen (60" × 80")',
                                '6 × 3 ft',
                                '8 × 4 ft',
                                '5 × 7 ft',
                                'Single (240 × 60 cm)',
                              ].map((presetVal) => (
                                <button
                                  key={presetVal}
                                  type="button"
                                  onClick={() => addAttributeValue(attr.id, presetVal)}
                                  style={{
                                    fontSize: "0.72rem",
                                    padding: "2px 8px",
                                    backgroundColor: "#F1F5F9",
                                    color: "#334155",
                                    border: "1px solid #CBD5E1",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  + {presetVal}
                                </button>
                              ))}
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <input
                              type="text"
                              value={attr.inputVal || ""}
                              onChange={(e) => updateAttributeInputVal(attr.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  addAttributeValue(attr.id, attr.inputVal || "");
                                }
                              }}
                              placeholder='e.g. King (76" × 80"), 6×3 ft, Navy Blue (comma separated or Enter)'
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                fontSize: "0.8rem",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => addAttributeValue(attr.id, attr.inputVal || "")}
                              style={{
                                padding: "6px 14px",
                                backgroundColor: "#0F172A",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Add Value
                            </button>
                          </div>

                          {/* Chips Container */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {attr.values.length === 0 ? (
                              <span style={{ fontSize: "0.76rem", color: "#94A3B8", fontStyle: "italic" }}>
                                No values entered yet. Add at least one value above.
                              </span>
                            ) : (
                              attr.values.map((v) => (
                                <span
                                  key={v}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    backgroundColor: "#EFF6FF",
                                    color: "#1D4ED8",
                                    border: "1px solid #BFDBFE",
                                    padding: "3px 8px 3px 10px",
                                    borderRadius: "100px",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  <span>{v}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAttributeValue(attr.id, v)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#1D4ED8",
                                      cursor: "pointer",
                                      padding: "0",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <X size={13} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Variations Table */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      2. Configured Variations ({variationsList.length})
                    </h4>
                    <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                      Manage variation-specific SKU, Price, Original Price, Stock, Image, and Status.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addManualVariationRow}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      backgroundColor: "#F1F5F9",
                      color: "#334155",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Row Manually</span>
                  </button>
                </div>

                {variationsList.length === 0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "8px",
                      border: "1px dashed #CBD5E1",
                      color: "#64748B",
                      fontSize: "0.84rem",
                    }}
                  >
                    No variations generated yet. Add your options and values above, then click{" "}
                    <strong>&quot;Generate Combination Matrix&quot;</strong>.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569" }}>Combination / Attribute Values</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "140px" }}>SKU</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "100px" }}>Price (₹)</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "100px" }}>Orig. Price</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "80px" }}>Stock</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "140px" }}>Custom Image</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "65px", textAlign: "center" }}>Active</th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", width: "50px", textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variationsList.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {Object.entries(row.combination || {}).map(([attrK, valK]) => (
                                  <span
                                    key={attrK}
                                    style={{
                                      backgroundColor: "#EEF2FF",
                                      color: "#4338CA",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                      border: "1px solid #E0E7FF",
                                    }}
                                  >
                                    {attrK}: {valK}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) => updateVariationRow(idx, "sku", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #CBD5E1",
                                  fontSize: "0.78rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="number"
                                step="0.01"
                                value={row.price}
                                onChange={(e) => updateVariationRow(idx, "price", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #CBD5E1",
                                  fontSize: "0.78rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="number"
                                step="0.01"
                                value={row.original_price}
                                onChange={(e) => updateVariationRow(idx, "original_price", e.target.value)}
                                placeholder="Optional"
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #CBD5E1",
                                  fontSize: "0.78rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="number"
                                value={row.stock}
                                onChange={(e) => updateVariationRow(idx, "stock", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #CBD5E1",
                                  fontSize: "0.78rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {row.image ? (
                                  <img
                                    src={row.image}
                                    alt="Variant"
                                    style={{ width: "28px", height: "28px", borderRadius: "4px", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "4px",
                                      backgroundColor: "#F1F5F9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#94A3B8",
                                    }}
                                  >
                                    <ImageIcon size={14} />
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={row.image}
                                  onChange={(e) => updateVariationRow(idx, "image", e.target.value)}
                                  placeholder="/assets/..."
                                  style={{
                                    flex: 1,
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #CBD5E1",
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={row.is_active}
                                onChange={(e) => updateVariationRow(idx, "is_active", e.target.checked)}
                                style={{ accentColor: "#FF4035", width: "16px", height: "16px", cursor: "pointer" }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => removeVariationRow(idx)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#EF4444",
                                  cursor: "pointer",
                                  padding: "4px",
                                }}
                                title="Remove variation"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Product Image & Badges */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "10px",
            }}
          >
            <Tag size={17} style={{ color: "#D97706" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Media & Merchandising Badges
            </h3>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <ImageUploader
              value={image}
              onChange={setImage}
              label="Product Main Photo *"
              name="product_image"
            />
            {/* Multi-Photo Product Gallery Manager */}
            <ProductGalleryManager
              images={galleryImages}
              onChange={setGalleryImages}
              mainImage={image}
              onSetMainImage={(newMain) => {
                setImage(newMain);
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Promo Badge Text (e.g. Hot, -20%, New, Bespoke)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Hot or 15% OFF"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "7px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.86rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Merchandising Highlight Checkboxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
              paddingTop: "6px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #E2E8F0",
                backgroundColor: isFeatured ? "#FEF2F2" : "#F8FAFC",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ accentColor: "#FF4035", width: "16px", height: "16px" }}
              />
              <span>Featured Product</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #E2E8F0",
                backgroundColor: isBestSeller ? "#FEF3C7" : "#F8FAFC",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                style={{ accentColor: "#D97706", width: "16px", height: "16px" }}
              />
              <span>Best Seller</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #E2E8F0",
                backgroundColor: isPopular ? "#EEF2FF" : "#F8FAFC",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                style={{ accentColor: "#4F46E5", width: "16px", height: "16px" }}
              />
              <span>Popular Item</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #E2E8F0",
                backgroundColor: isOnSale ? "#ECFDF5" : "#F8FAFC",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(e) => setIsOnSale(e.target.checked)}
                style={{ accentColor: "#059669", width: "16px", height: "16px" }}
              />
              <span>On Sale</span>
            </label>
          </div>
        </div>

        {/* Card 5: Descriptions */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "10px",
            }}
          >
            <Info size={17} style={{ color: "#0284C7" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Descriptions & Specifications
            </h3>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Short Summary Description
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence overview for product card tooltips and quick view..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #CBD5E1",
                fontSize: "0.86rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Full Product Description & Material Specs
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, dimensions, finish options, installation instructions..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "7px",
                border: "1px solid #CBD5E1",
                fontSize: "0.86rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        {/* Card 6: Active Status Checkbox */}
        <div
          onClick={() => setStatus(status === "active" ? "inactive" : "active")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderRadius: "10px",
            border: status === "active" ? "1.5px solid #10B981" : "1.5px solid #CBD5E1",
            backgroundColor: status === "active" ? "#F0FDF4" : "#F8FAFC",
            cursor: "pointer",
            transition: "all 0.2s ease",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="product_is_active_checkbox"
              checked={status === "active"}
              onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")}
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
                htmlFor="product_is_active_checkbox"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  cursor: "pointer",
                }}
              >
                Active Status & Storefront Publication
              </label>
              <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                When checked, this product is published and purchasable across the live store.
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
              backgroundColor: status === "active" ? "#DCFCE7" : "#E2E8F0",
              color: status === "active" ? "#15803D" : "#64748B",
            }}
          >
            {status === "active" ? <CheckCircle size={13} /> : <XCircle size={13} />}
            <span>{status === "active" ? "Active (Live on Site)" : "Inactive (Draft)"}</span>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid #E2E8F0",
            paddingTop: "16px",
          }}
        >
          <Link
            href={`/dashboard/products?page=${returnPage}`}
            className="abid-btn abid-btn-outline"
            style={{
              padding: "9px 20px",
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
            disabled={isPending}
            className="abid-btn abid-btn-primary"
            style={{
              padding: "9px 24px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
            }}
          >
            <Save size={16} />
            <span>{isPending ? "Saving..." : isEditing ? "Save Product Changes" : "Create Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
