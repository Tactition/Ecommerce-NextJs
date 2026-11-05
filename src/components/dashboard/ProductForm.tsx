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
  Wand2,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Eye,
} from "lucide-react";

export interface DynamicCustomAttribute {
  id: string;
  name: string;
  values: string[];
  rawPipedValue?: string;
  inputVal?: string;
  isVisible?: boolean;
  usedForVariations?: boolean;
  isExpanded?: boolean;
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
  isExpanded?: boolean;
}

export const parseAttributeValues = (raw: string): string[] => {
  if (!raw || !raw.trim()) return [];
  const delimiter = raw.includes("|") ? "|" : ",";
  const parts = raw
    .split(delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
};

export const VARIATION_TEMPLATES = [
  {
    title: "Blinds (Fabric + Mechanism)",
    icon: "🪟",
    description: "Colour + Manual / Smart Motor",
    attributes: [
      { name: "Fabric Colour", values: ["Warm White", "Mist Grey", "Slate Charcoal"] },
      { name: "Control Mechanism", values: ["Manual Chain", "Motorized Smart"] },
    ],
  },
  {
    title: "Curtains (Drop Length)",
    icon: "🚪",
    description: "5ft Window, 7ft Door, 9ft Long Door",
    attributes: [
      { name: "Curtain Drop", values: ["Window (5 ft / 60 in)", "Door (7 ft / 84 in)", "Long Door (9 ft / 108 in)"] },
      { name: "Header Style", values: ["Eyelet Ring", "American Pleat"] },
    ],
  },
  {
    title: "Flooring (Wood Finishes)",
    icon: "🪵",
    description: "Oak, Teak, Walnut, Smoked Grey",
    attributes: [
      { name: "Wood Finish", values: ["Natural Oak", "Walnut Teak", "Smoked Grey", "Charcoal Ebony"] },
    ],
  },
  {
    title: "Wallpaper (Material Finishes)",
    icon: "🎨",
    description: "Matte, Vinyl, Peel & Stick",
    attributes: [
      { name: "Material Finish", values: ["Non-Woven Matte", "Textured Vinyl", "Peel & Stick"] },
    ],
  },
  {
    title: "Standard Sizes (S, M, L)",
    icon: "📐",
    description: "Small, Medium, Large, XL",
    attributes: [
      { name: "Size", values: ["Small", "Medium", "Large", "Extra Large"] },
    ],
  },
];

export const getSuggestedValuesForAttr = (attrName: string) => {
  const lower = attrName.toLowerCase().trim();
  if (!lower) return [];
  if (lower.includes("colour") || lower.includes("color") || lower.includes("fabric")) {
    return ["Warm White", "Mist Grey", "Slate Charcoal", "Navy Blue", "Ivory Beige", "Earthy Taupe", "Olive Green", "Matte Black"];
  }
  if (lower.includes("control") || lower.includes("mechanism") || lower.includes("operation")) {
    return ["Manual Chain", "Motorized Smart", "Cordless Spring", "Remote Automated"];
  }
  if (lower.includes("wood") || lower.includes("floor") || lower.includes("plank")) {
    return ["Natural Oak", "Walnut Teak", "Smoked Grey", "Charcoal Ebony", "Honey Pine", "Rustic Maple"];
  }
  if (lower.includes("curtain") || lower.includes("drop") || lower.includes("length") || lower.includes("height")) {
    return ["Window (5 ft / 60 in)", "Door (7 ft / 84 in)", "Long Door (9 ft / 108 in)"];
  }
  if (lower.includes("header") || lower.includes("pleat") || lower.includes("style")) {
    return ["Eyelet Ring", "American Pleat", "Rod Pocket", "Pinch Pleat"];
  }
  if (lower.includes("material") || lower.includes("finish") || lower.includes("texture")) {
    return ["Non-Woven Matte", "Textured Vinyl", "Peel & Stick", "Blackout Fabric", "Translucent Sheer"];
  }
  if (lower.includes("size") || lower.includes("dimen")) {
    return ["Small (3 × 4 ft)", "Standard (4 × 5 ft)", "Large (5 × 6 ft)", "Balcony (6 × 7 ft)", "Single (3 × 6 ft)", "Queen (5 × 6.5 ft)", "King (6 × 6.5 ft)"];
  }
  return ["Standard", "Premium", "Deluxe"];
};

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
        return Array.from(attrMap.entries()).map(([name, vals], idx) => {
          const valArray = Array.from(vals);
          return {
            id: `attr_${idx + 1}_${Date.now()}`,
            name,
            values: valArray,
            rawPipedValue: valArray.join(" | "),
            inputVal: "",
            isVisible: true,
            usedForVariations: true,
            isExpanded: true,
          };
        });
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
          isExpanded: false,
        };
      });
    }
    return [];
  });

  // WooCommerce-style Tab & Action States
  const [wooActiveTab, setWooActiveTab] = useState<"attributes" | "variations">("attributes");
  const [wooVariationAction, setWooVariationAction] = useState<"generate" | "add_manual">("generate");
  const [wooBulkAction, setWooBulkAction] = useState<string>("");
  const [wooNoticeMsg, setWooNoticeMsg] = useState<string>("");

  const buildCombinations = (
    attrs: DynamicCustomAttribute[],
    currentVariations: DynamicVariationRow[] = []
  ): DynamicVariationRow[] => {
    // Only use attributes marked "usedForVariations" (WooCommerce standard)
    const activeAttrs = attrs.filter(
      (a) => a.name.trim() !== "" && a.values.length > 0 && a.usedForVariations !== false
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

    const defaultVarPrice = price && parseFloat(price) > 0 ? price : "25.00";
    const defaultVarStock = stock && parseInt(stock, 10) >= 0 ? stock : "20";

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
        price: defaultVarPrice,
        original_price: originalPrice || "",
        stock: defaultVarStock,
        image: image || "",
        is_active: true,
        combination: combo,
        isExpanded: false,
      };
    });
  };

  const addCustomAttribute = (initialName: string = "") => {
    const newAttr: DynamicCustomAttribute = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: initialName,
      values: [],
      rawPipedValue: "",
      inputVal: "",
      isVisible: true,
      usedForVariations: true,
      isExpanded: true,
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

  const updateAttributePipedValue = (attrId: string, text: string) => {
    setCustomAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId) return a;
        const parsed = parseAttributeValues(text);
        return {
          ...a,
          rawPipedValue: text,
          values: parsed,
        };
      })
    );
  };

  const appendSuggestedValueToAttr = (attrId: string, term: string) => {
    setCustomAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId) return a;
        const currentVals = a.values || [];
        if (currentVals.includes(term)) return a;
        const newVals = [...currentVals, term];
        return {
          ...a,
          values: newVals,
          rawPipedValue: newVals.join(" | "),
        };
      })
    );
  };

  const updateAttributeField = (
    attrId: string,
    field: "usedForVariations" | "isVisible" | "isExpanded",
    value: boolean
  ) => {
    setCustomAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, [field]: value } : a))
    );
  };

  const handleSaveAttributes = () => {
    const committed = customAttributes.map((attr) => {
      let vals = attr.values;
      if (attr.rawPipedValue) {
        const parsed = parseAttributeValues(attr.rawPipedValue);
        if (parsed.length > 0) vals = parsed;
      }
      return { ...attr, values: vals };
    });
    setCustomAttributes(committed);
    setWooNoticeMsg("✅ Attributes saved successfully.");
    setTimeout(() => setWooNoticeMsg(""), 3500);
  };

  const handleExecuteVariationAction = () => {
    if (wooVariationAction === "generate") {
      const committed = customAttributes.map((attr) => {
        let vals = attr.values;
        if (attr.rawPipedValue) {
          const parsed = parseAttributeValues(attr.rawPipedValue);
          if (parsed.length > 0) vals = parsed;
        }
        return { ...attr, values: vals };
      });
      setCustomAttributes(committed);

      const activeAttrs = committed.filter(
        (a) => a.name.trim() !== "" && a.values.length > 0 && a.usedForVariations !== false
      );

      if (activeAttrs.length === 0) {
        alert("Before generating variations, please add at least one attribute with values and check 'Used for variations'.");
        return;
      }

      if (variationsList.length > 0) {
        const confirmGen = confirm(
          `Are you sure you want to link all variations? This will generate a new variation for each and every possible combination of variation attributes (${activeAttrs.map((a) => a.name).join(", ")}).`
        );
        if (!confirmGen) return;
      }

      const newRows = buildCombinations(committed, variationsList);
      setVariationsList(newRows);
      setWooNoticeMsg(`⚡ ${newRows.length} variations generated from attributes.`);
      setTimeout(() => setWooNoticeMsg(""), 4000);
    } else if (wooVariationAction === "add_manual") {
      addManualVariationRow();
      setWooNoticeMsg("Added a new variation row.");
      setTimeout(() => setWooNoticeMsg(""), 3500);
    }
  };

  const handleExecuteBulkAction = () => {
    if (!wooBulkAction) return;

    if (wooBulkAction === "set_regular_price") {
      const val = prompt("Enter regular price for all variations (₹):", price || "2499");
      if (val !== null && val.trim() !== "" && !isNaN(parseFloat(val))) {
        setVariationsList((prev) => prev.map((r) => ({ ...r, price: val.trim() })));
        setWooNoticeMsg(`Updated regular price for all variations to ₹${val.trim()}`);
      }
    } else if (wooBulkAction === "set_sale_price") {
      const val = prompt("Enter sale / original price for all variations (₹) [Leave blank to clear]:", originalPrice || "");
      if (val !== null) {
        setVariationsList((prev) => prev.map((r) => ({ ...r, original_price: val.trim() })));
        setWooNoticeMsg(`Updated sale price for all variations`);
      }
    } else if (wooBulkAction === "copy_base_price") {
      const targetPrice = price && parseFloat(price) > 0 ? price : "0";
      setVariationsList((prev) => prev.map((r) => ({ ...r, price: targetPrice })));
      setWooNoticeMsg(`Copied base product price (₹${targetPrice}) to all variations`);
    } else if (wooBulkAction === "set_stock") {
      const val = prompt("Enter stock quantity for all variations:", stock || "50");
      if (val !== null && val.trim() !== "" && !isNaN(parseInt(val, 10))) {
        setVariationsList((prev) => prev.map((r) => ({ ...r, stock: val.trim() })));
        setWooNoticeMsg(`Updated stock quantity for all variations to ${val.trim()}`);
      }
    } else if (wooBulkAction === "set_in_stock") {
      setVariationsList((prev) => prev.map((r) => ({ ...r, is_active: true })));
      setWooNoticeMsg(`Set status to 'In stock' for all variations`);
    } else if (wooBulkAction === "set_out_of_stock") {
      setVariationsList((prev) => prev.map((r) => ({ ...r, is_active: false })));
      setWooNoticeMsg(`Set status to 'Out of stock' for all variations`);
    } else if (wooBulkAction === "toggle_enabled") {
      setVariationsList((prev) => prev.map((r) => ({ ...r, is_active: !r.is_active })));
      setWooNoticeMsg(`Toggled 'Enabled' status for all variations`);
    } else if (wooBulkAction === "auto_skus") {
      handleAutoGenerateSkus();
    } else if (wooBulkAction === "delete_all") {
      const confirmed = confirm("Are you sure you want to delete all variations? This cannot be undone.");
      if (confirmed) {
        setVariationsList([]);
        setWooNoticeMsg(`Deleted all variations.`);
      }
    }

    setWooBulkAction("");
    setTimeout(() => setWooNoticeMsg(""), 4000);
  };

  const setAllExpanded = (expanded: boolean) => {
    setVariationsList((prev) => prev.map((r) => ({ ...r, isExpanded: expanded })));
  };

  const toggleRowExpanded = (idx: number) => {
    setVariationsList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], isExpanded: !copy[idx].isExpanded };
      return copy;
    });
  };

  const applyTemplate = (tpl: (typeof VARIATION_TEMPLATES)[0]) => {
    const newAttrs: DynamicCustomAttribute[] = tpl.attributes.map((a, idx) => ({
      id: `attr_${Date.now()}_${idx}`,
      name: a.name,
      values: [...a.values],
      rawPipedValue: a.values.join(" | "),
      inputVal: "",
      isVisible: true,
      usedForVariations: true,
      isExpanded: true,
    }));
    setCustomAttributes(newAttrs);
    const newCombos = buildCombinations(newAttrs, []);
    setVariationsList(newCombos);
    setHasVariations(true);
    setWooActiveTab("variations");
    setWooNoticeMsg(`✨ Loaded "${tpl.title}" template with ${newCombos.length} variations generated!`);
    setTimeout(() => setWooNoticeMsg(""), 4500);
  };

  const handleAutoGenerateSkus = () => {
    const baseSkuPrefix = (slug || name || "PROD")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "PROD";

    setVariationsList((prev) =>
      prev.map((row) => {
        const parts = Object.values(row.combination || {}).map((val) =>
          val.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")
        );
        return {
          ...row,
          sku: `${baseSkuPrefix}-${parts.join("-")}`,
        };
      })
    );
    setWooNoticeMsg(`✅ Auto-generated clean SKUs for all variations!`);
    setTimeout(() => setWooNoticeMsg(""), 3500);
  };

  const addManualVariationRow = () => {
    const combo: Record<string, string> = {};
    customAttributes.forEach((attr) => {
      if (attr.name.trim() && attr.usedForVariations !== false) {
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
        isExpanded: true,
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
      let vals = attr.values;
      if (attr.rawPipedValue) {
        const parsed = parseAttributeValues(attr.rawPipedValue);
        if (parsed.length > 0) vals = parsed;
      } else if (attr.inputVal && attr.inputVal.trim()) {
        const extraVals = attr.inputVal
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        const set = new Set([...attr.values, ...extraVals]);
        vals = Array.from(set);
      }
      return { ...attr, values: vals };
    });

    const activeAttrs = committedAttrs.filter(
      (a) => a.name.trim() !== "" && a.values.length > 0 && a.usedForVariations !== false
    );

    if (hasVariations && activeAttrs.length === 0) {
      setFormError("Variable Product is enabled, but no attributes with 'Used for variations' checked were configured. Please add attributes on the Attributes tab or uncheck 'Variable Product'.");
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
              {/* Guidance Info Card */}
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  fontSize: "0.82rem",
                  color: "#166534",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>💡</span>
                  <span>Storefront Sizing Architecture:</span>
                </div>
                <ul style={{ margin: "4px 0 0 18px", padding: 0, lineHeight: 1.5 }}>
                  <li>
                    <strong>Custom Made-to-Measure:</strong> With custom sizing enabled, customers can enter exact Width &amp; Height in feet and inches with real-time price calculation.
                  </li>
                  <li>
                    <strong>Merged Selector:</strong> If you also add &quot;Size&quot; options in Product Options below, standard sizes and &quot;Made to Measure&quot; are seamlessly merged into one single selector.
                  </li>
                  <li>
                    <strong>Purely Custom (e.g. Blinds):</strong> If no &quot;Size&quot; attribute is added below, the product page directly shows the clean Made-to-Measure dimensions input without unnecessary toggles.
                  </li>
                </ul>
              </div>

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

        {/* Card: WooCommerce Variable Product System */}
        <div
          style={{
            background: "#FFFFFF",
            border: hasVariations ? "2px solid #2271B1" : "1px solid #CBD5E1",
            borderRadius: "10px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            transition: "all 0.2s ease",
          }}
        >
          {/* WooCommerce Postbox Header */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#F0F0F1",
              borderBottom: "1px solid #DCDCDE",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: hasVariations ? "#2271B1" : "#8C8F94",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Sliders size={18} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1D2327" }}>
                  Product data —
                </span>
                <span
                  style={{
                    backgroundColor: hasVariations ? "#2271B1" : "#FFFFFF",
                    color: hasVariations ? "#FFFFFF" : "#50575E",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    border: hasVariations ? "none" : "1px solid #CBD5E1",
                  }}
                >
                  {hasVariations ? "Variable product" : "Simple product"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  (WooCommerce Style Variations Manager)
                </span>
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "4px",
                backgroundColor: hasVariations ? "#2271B1" : "#FFFFFF",
                color: hasVariations ? "#FFFFFF" : "#1D2327",
                border: hasVariations ? "1px solid #2271B1" : "1px solid #8C8F94",
                fontSize: "0.82rem",
                fontWeight: 700,
                transition: "all 0.15s ease",
              }}
            >
              <input
                type="checkbox"
                checked={hasVariations}
                onChange={(e) => setHasVariations(e.target.checked)}
                style={{ accentColor: "#2271B1", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>{hasVariations ? "Variable Product Active" : "Enable Variable Product"}</span>
            </label>
          </div>

          {hasVariations && (
            <div>
              {/* WooCommerce Tabs Navigation: Attributes | Variations */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#F0F0F1",
                  borderBottom: "1px solid #DCDCDE",
                  padding: "0 14px",
                  gap: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setWooActiveTab("attributes")}
                  style={{
                    padding: "10px 18px",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: wooActiveTab === "attributes" ? "#1D2327" : "#50575E",
                    backgroundColor: wooActiveTab === "attributes" ? "#FFFFFF" : "transparent",
                    border: wooActiveTab === "attributes" ? "1px solid #DCDCDE" : "1px solid transparent",
                    borderBottom: wooActiveTab === "attributes" ? "1px solid #FFFFFF" : "none",
                    borderTop: wooActiveTab === "attributes" ? "3px solid #2271B1" : "3px solid transparent",
                    marginBottom: wooActiveTab === "attributes" ? "-1px" : "0",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🏷️ Attributes</span>
                  <span
                    style={{
                      backgroundColor: wooActiveTab === "attributes" ? "#2271B1" : "#DCDCDE",
                      color: wooActiveTab === "attributes" ? "#FFFFFF" : "#50575E",
                      fontSize: "0.72rem",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {customAttributes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setWooActiveTab("variations")}
                  style={{
                    padding: "10px 18px",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: wooActiveTab === "variations" ? "#1D2327" : "#50575E",
                    backgroundColor: wooActiveTab === "variations" ? "#FFFFFF" : "transparent",
                    border: wooActiveTab === "variations" ? "1px solid #DCDCDE" : "1px solid transparent",
                    borderBottom: wooActiveTab === "variations" ? "1px solid #FFFFFF" : "none",
                    borderTop: wooActiveTab === "variations" ? "3px solid #2271B1" : "3px solid transparent",
                    marginBottom: wooActiveTab === "variations" ? "-1px" : "0",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🔀 Variations</span>
                  <span
                    style={{
                      backgroundColor: wooActiveTab === "variations" ? "#2271B1" : "#DCDCDE",
                      color: wooActiveTab === "variations" ? "#FFFFFF" : "#50575E",
                      fontSize: "0.72rem",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {variationsList.length}
                  </span>
                </button>
              </div>

              {/* Status Notice Banner (WooCommerce Toast) */}
              {wooNoticeMsg && (
                <div
                  style={{
                    margin: "14px 20px 0 20px",
                    padding: "10px 14px",
                    backgroundColor: "#F0FDF4",
                    borderLeft: "4px solid #16A34A",
                    borderTop: "1px solid #BBF7D0",
                    borderRight: "1px solid #BBF7D0",
                    borderBottom: "1px solid #BBF7D0",
                    color: "#166534",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle size={15} style={{ color: "#16A34A" }} />
                  <span>{wooNoticeMsg}</span>
                </div>
              )}

              {/* TAB 1: ATTRIBUTES */}
              {wooActiveTab === "attributes" && (
                <div style={{ padding: "20px" }}>
                  {/* Attributes Toolbar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.84rem",
                          border: "1px solid #8C8F94",
                          borderRadius: "4px",
                          backgroundColor: "#FFFFFF",
                          color: "#2C3338",
                        }}
                      >
                        <option value="custom">Custom product attribute</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => addCustomAttribute()}
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          backgroundColor: "#F6F7F7",
                          color: "#2271B1",
                          border: "1px solid #2271B1",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Plus size={13} />
                        <span>Add attribute</span>
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>Quick Presets:</span>
                      {["Fabric Colour", "Control Mechanism", "Wood Finish", "Size", "Dimensions"].map((preset) => (
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
                              alert(`Attribute "${preset}" already added.`);
                            }
                          }}
                          style={{
                            fontSize: "0.74rem",
                            padding: "3px 10px",
                            backgroundColor: "#FFFFFF",
                            color: "#1E293B",
                            border: "1px solid #CBD5E1",
                            borderRadius: "14px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attributes List */}
                  {customAttributes.length === 0 ? (
                    <div
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "6px",
                        border: "1px dashed #CBD5E1",
                        color: "#64748B",
                        fontSize: "0.84rem",
                      }}
                    >
                      <p style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#1D2327" }}>
                        No attributes configured yet.
                      </p>
                      <p style={{ margin: 0, fontSize: "0.8rem" }}>
                        Click <strong>&quot;Add attribute&quot;</strong> above, or click one of the quick presets like <strong>+ Fabric Colour</strong> or <strong>+ Control Mechanism</strong>.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {customAttributes.map((attr, idx) => {
                        const isExpanded = attr.isExpanded !== false;
                        const suggestions = getSuggestedValuesForAttr(attr.name).filter(
                          (s) => !attr.values.includes(s)
                        );

                        return (
                          <div
                            key={attr.id}
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #CCD0D4",
                              borderRadius: "4px",
                              boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
                            }}
                          >
                            {/* Attribute Header */}
                            <div
                              style={{
                                padding: "10px 14px",
                                backgroundColor: "#F6F7F7",
                                borderBottom: isExpanded ? "1px solid #DCDCDE" : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                              }}
                              onClick={() => updateAttributeField(attr.id, "isExpanded", !isExpanded)}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#8C8F94", fontSize: "0.8rem", fontWeight: 700 }}>
                                  #{idx + 1}
                                </span>
                                <strong style={{ fontSize: "0.86rem", color: "#1D2327" }}>
                                  {attr.name.trim() ? attr.name : "New Attribute"}
                                </strong>
                                {attr.usedForVariations !== false && (
                                  <span style={{ fontSize: "0.72rem", backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", padding: "1px 6px", borderRadius: "3px" }}>
                                    Used for variations
                                  </span>
                                )}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeCustomAttribute(attr.id);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#B32D2E",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Remove
                                </button>
                                <span style={{ color: "#8C8F94", fontSize: "0.8rem" }}>
                                  {isExpanded ? "▲" : "▼"}
                                </span>
                              </div>
                            </div>

                            {/* Attribute Body (when expanded) */}
                            {isExpanded && (
                              <div style={{ padding: "16px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
                                  {/* Name */}
                                  <div>
                                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1D2327", marginBottom: "4px" }}>
                                      Name:
                                    </label>
                                    <input
                                      type="text"
                                      value={attr.name}
                                      onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                                      placeholder="e.g. Fabric Colour, Control Mechanism, Size..."
                                      style={{
                                        width: "100%",
                                        maxWidth: "360px",
                                        padding: "6px 10px",
                                        fontSize: "0.84rem",
                                        borderRadius: "4px",
                                        border: "1px solid #8C8F94",
                                      }}
                                    />
                                  </div>

                                  {/* Value(s) Piped Input */}
                                  <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1D2327", margin: 0 }}>
                                        Value(s):
                                      </label>
                                      <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                                        Enter values separated by &quot;|&quot; (e.g. <code>Warm White | Mist Grey | Slate Charcoal</code>)
                                      </span>
                                    </div>
                                    <textarea
                                      rows={2}
                                      value={attr.rawPipedValue !== undefined ? attr.rawPipedValue : (attr.values || []).join(" | ")}
                                      onChange={(e) => updateAttributePipedValue(attr.id, e.target.value)}
                                      placeholder="Warm White | Mist Grey | Slate Charcoal"
                                      style={{
                                        width: "100%",
                                        padding: "8px 10px",
                                        fontSize: "0.82rem",
                                        borderRadius: "4px",
                                        border: "1px solid #8C8F94",
                                        fontFamily: "inherit",
                                        lineHeight: 1.4,
                                      }}
                                    />

                                    {/* Suggested Terms Row */}
                                    {suggestions.length > 0 && (
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700 }}>
                                          Suggested terms:
                                        </span>
                                        {suggestions.slice(0, 7).map((sug) => (
                                          <button
                                            key={sug}
                                            type="button"
                                            onClick={() => appendSuggestedValueToAttr(attr.id, sug)}
                                            style={{
                                              fontSize: "0.72rem",
                                              padding: "2px 8px",
                                              backgroundColor: "#F0F0F1",
                                              color: "#1D2327",
                                              border: "1px solid #CBD5E1",
                                              borderRadius: "12px",
                                              cursor: "pointer",
                                              fontWeight: 600,
                                            }}
                                            title={`Add ${sug}`}
                                          >
                                            + {sug}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Checkboxes (WooCommerce Standard) */}
                                  <div style={{ display: "flex", gap: "20px", alignItems: "center", marginTop: "4px", flexWrap: "wrap" }}>
                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#1D2327", cursor: "pointer" }}>
                                      <input
                                        type="checkbox"
                                        checked={attr.isVisible !== false}
                                        onChange={(e) => updateAttributeField(attr.id, "isVisible", e.target.checked)}
                                        style={{ accentColor: "#2271B1" }}
                                      />
                                      <span>Visible on the product page</span>
                                    </label>

                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#1D2327", cursor: "pointer", fontWeight: 700 }}>
                                      <input
                                        type="checkbox"
                                        checked={attr.usedForVariations !== false}
                                        onChange={(e) => updateAttributeField(attr.id, "usedForVariations", e.target.checked)}
                                        style={{ accentColor: "#2271B1" }}
                                      />
                                      <span>Used for variations</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Attributes Save Button & Next Step */}
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", borderTop: "1px solid #E2E8F0", paddingTop: "16px" }}>
                    <button
                      type="button"
                      onClick={handleSaveAttributes}
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "#2271B1",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Save attributes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSaveAttributes();
                        setWooActiveTab("variations");
                      }}
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "#FFFFFF",
                        color: "#2271B1",
                        border: "1px solid #2271B1",
                        borderRadius: "4px",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Proceed to Variations Tab</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: VARIATIONS */}
              {wooActiveTab === "variations" && (
                <div style={{ padding: "20px" }}>
                  {/* WooCommerce Variation Actions Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "16px",
                      backgroundColor: "#F6F7F7",
                      padding: "10px 14px",
                      border: "1px solid #DCDCDE",
                      borderRadius: "6px",
                    }}
                  >
                    {/* Action 1: Variation Generation */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={wooVariationAction}
                        onChange={(e) => setWooVariationAction(e.target.value as any)}
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                          borderRadius: "4px",
                          border: "1px solid #8C8F94",
                          backgroundColor: "#FFFFFF",
                          color: "#2C3338",
                        }}
                      >
                        <option value="generate">Generate variations from all attributes</option>
                        <option value="add_manual">Add variation manually</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleExecuteVariationAction}
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          backgroundColor: "#2271B1",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Go
                      </button>
                    </div>

                    {/* Action 2: Bulk Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={wooBulkAction}
                        onChange={(e) => setWooBulkAction(e.target.value)}
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                          borderRadius: "4px",
                          border: "1px solid #8C8F94",
                          backgroundColor: "#FFFFFF",
                          color: "#2C3338",
                        }}
                      >
                        <option value="">Bulk actions</option>
                        <optgroup label="Pricing">
                          <option value="set_regular_price">Set regular prices (₹)</option>
                          <option value="set_sale_price">Set sale prices (₹)</option>
                          <option value="copy_base_price">Copy product base price to all</option>
                        </optgroup>
                        <optgroup label="Inventory">
                          <option value="set_stock">Set stock quantity</option>
                          <option value="set_in_stock">Set status to: In stock</option>
                          <option value="set_out_of_stock">Set status to: Out of stock</option>
                        </optgroup>
                        <optgroup label="Status & SKUs">
                          <option value="auto_skus">Auto-generate clean SKUs</option>
                          <option value="toggle_enabled">Toggle &apos;Enabled&apos; for all</option>
                        </optgroup>
                        <optgroup label="Delete">
                          <option value="delete_all">Delete all variations</option>
                        </optgroup>
                      </select>
                      <button
                        type="button"
                        onClick={handleExecuteBulkAction}
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          backgroundColor: "#F6F7F7",
                          color: "#2271B1",
                          border: "1px solid #2271B1",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Expand all / Close all */}
                    <div style={{ display: "flex", gap: "8px", fontSize: "0.78rem" }}>
                      <button
                        type="button"
                        onClick={() => setAllExpanded(true)}
                        style={{ color: "#2271B1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                      >
                        Expand all
                      </button>
                      <span style={{ color: "#8C8F94" }}>|</span>
                      <button
                        type="button"
                        onClick={() => setAllExpanded(false)}
                        style={{ color: "#2271B1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                      >
                        Close all
                      </button>
                    </div>
                  </div>

                  {/* Variations List */}
                  {variationsList.length === 0 ? (
                    <div
                      style={{
                        padding: "36px",
                        textAlign: "center",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "6px",
                        border: "1px dashed #CBD5E1",
                        color: "#64748B",
                        fontSize: "0.84rem",
                      }}
                    >
                      <p style={{ margin: "0 0 10px 0", fontWeight: 700, color: "#1D2327" }}>
                        Before you can add a variation you need to add some variation attributes on the Attributes tab.
                      </p>
                      <button
                        type="button"
                        onClick={() => setWooActiveTab("attributes")}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#2271B1",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Go to Attributes Tab ➔
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {variationsList.map((row, idx) => {
                        const isExpanded = Boolean(row.isExpanded);
                        const activeVariationAttrs = customAttributes.filter(
                          (a) => a.name.trim() !== "" && a.usedForVariations !== false
                        );

                        return (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #CCD0D4",
                              borderRadius: "4px",
                              boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
                            }}
                          >
                            {/* Variation Row Header (WooCommerce Style) */}
                            <div
                              style={{
                                padding: "10px 14px",
                                backgroundColor: "#F6F7F7",
                                borderBottom: isExpanded ? "1px solid #DCDCDE" : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "10px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <span style={{ color: "#8C8F94", fontSize: "0.8rem", fontWeight: 700 }}>
                                  #{idx + 1}
                                </span>

                                {/* Attribute Dropdowns (The hallmark of WooCommerce variations) */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  {activeVariationAttrs.map((attr) => (
                                    <div key={attr.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#50575E" }}>
                                        {attr.name}:
                                      </label>
                                      <select
                                        value={row.combination[attr.name] || ""}
                                        onChange={(e) => updateVariationCombinationValue(idx, attr.name, e.target.value)}
                                        style={{
                                          padding: "4px 8px",
                                          fontSize: "0.78rem",
                                          borderRadius: "4px",
                                          border: "1px solid #8C8F94",
                                          backgroundColor: "#FFFFFF",
                                          fontWeight: 600,
                                          color: "#2C3338",
                                        }}
                                      >
                                        <option value="">Any {attr.name}...</option>
                                        {attr.values.map((v) => (
                                          <option key={v} value={v}>
                                            {v}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Snippet & Controls */}
                              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                                  SKU: <strong>{row.sku || "—"}</strong>
                                </span>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D2327" }}>
                                  ₹{row.price || "0.00"}
                                </span>

                                <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#1D2327", cursor: "pointer", fontWeight: 600 }}>
                                  <input
                                    type="checkbox"
                                    checked={row.is_active}
                                    onChange={(e) => updateVariationRow(idx, "is_active", e.target.checked)}
                                    style={{ accentColor: "#2271B1" }}
                                  />
                                  <span>Enabled</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => removeVariationRow(idx)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#B32D2E",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                  title="Remove this variation"
                                >
                                  Remove
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleRowExpanded(idx)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#50575E",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    padding: "2px 4px",
                                  }}
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  {isExpanded ? "▲" : "▼"}
                                </button>
                              </div>
                            </div>

                            {/* Variation Row Body (When Expanded) */}
                            {isExpanded && (
                              <div style={{ padding: "16px", backgroundColor: "#FFFFFF" }}>
                                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                  {/* Left: Variant Photo Box */}
                                  <div style={{ width: "120px" }}>
                                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                      Variant Image:
                                    </label>
                                    <div
                                      style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "4px",
                                        border: "1px dashed #CCD0D4",
                                        backgroundColor: "#F6F7F7",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        position: "relative",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      {row.image ? (
                                        <img
                                          src={row.image}
                                          alt="Variant thumbnail"
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      ) : (
                                        <div style={{ textAlign: "center", color: "#8C8F94" }}>
                                          <ImageIcon size={24} />
                                          <div style={{ fontSize: "0.68rem", marginTop: "4px" }}>Set image</div>
                                        </div>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      value={row.image}
                                      onChange={(e) => updateVariationRow(idx, "image", e.target.value)}
                                      placeholder="/assets/..."
                                      style={{
                                        width: "100%",
                                        padding: "4px 6px",
                                        fontSize: "0.72rem",
                                        borderRadius: "3px",
                                        border: "1px solid #8C8F94",
                                      }}
                                      title="Image path"
                                    />
                                  </div>

                                  {/* Right: Pricing, SKU, Stock Grid */}
                                  <div style={{ flex: 1, minWidth: "260px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                                      {/* SKU */}
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                          SKU:
                                        </label>
                                        <input
                                          type="text"
                                          value={row.sku}
                                          onChange={(e) => updateVariationRow(idx, "sku", e.target.value)}
                                          placeholder="SKU"
                                          style={{
                                            width: "100%",
                                            padding: "6px 8px",
                                            fontSize: "0.8rem",
                                            borderRadius: "3px",
                                            border: "1px solid #8C8F94",
                                            fontFamily: "monospace",
                                          }}
                                        />
                                      </div>

                                      {/* Regular Price */}
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                          Regular price (₹) *:
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={row.price}
                                          onChange={(e) => updateVariationRow(idx, "price", e.target.value)}
                                          placeholder="e.g. 2499.00"
                                          style={{
                                            width: "100%",
                                            padding: "6px 8px",
                                            fontSize: "0.8rem",
                                            borderRadius: "3px",
                                            border: "1px solid #8C8F94",
                                            fontWeight: 700,
                                            color: "#1D2327",
                                          }}
                                        />
                                      </div>

                                      {/* Sale Price */}
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                          Sale price (₹):
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={row.original_price}
                                          onChange={(e) => updateVariationRow(idx, "original_price", e.target.value)}
                                          placeholder="Optional"
                                          style={{
                                            width: "100%",
                                            padding: "6px 8px",
                                            fontSize: "0.8rem",
                                            borderRadius: "3px",
                                            border: "1px solid #8C8F94",
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                                      {/* Stock Quantity */}
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                          Stock quantity:
                                        </label>
                                        <input
                                          type="number"
                                          value={row.stock}
                                          onChange={(e) => updateVariationRow(idx, "stock", e.target.value)}
                                          placeholder="e.g. 25"
                                          style={{
                                            width: "100%",
                                            padding: "6px 8px",
                                            fontSize: "0.8rem",
                                            borderRadius: "3px",
                                            border: "1px solid #8C8F94",
                                          }}
                                        />
                                      </div>

                                      {/* Stock Status */}
                                      <div>
                                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#50575E", marginBottom: "4px" }}>
                                          Stock status:
                                        </label>
                                        <select
                                          value={row.is_active ? "instock" : "outofstock"}
                                          onChange={(e) => updateVariationRow(idx, "is_active", e.target.value === "instock")}
                                          style={{
                                            width: "100%",
                                            padding: "6px 8px",
                                            fontSize: "0.8rem",
                                            borderRadius: "3px",
                                            border: "1px solid #8C8F94",
                                            backgroundColor: "#FFFFFF",
                                          }}
                                        >
                                          <option value="instock">In stock</option>
                                          <option value="outofstock">Out of stock</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Storefront Custom Sizing Reminder */}
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px 16px",
                      backgroundColor: "#F0F9FF",
                      border: "1px solid #BAE6FD",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Info size={16} style={{ color: "#0284C7", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.78rem", color: "#0369A1" }}>
                      <strong>Storefront Custom Sizing:</strong> Customers will see your configured variations (e.g. Fabric Colour &amp; Mechanism). If <em>Made to Measure (Custom Sizing)</em> is enabled below, customers will also be able to choose either standard sizing or enter their exact custom dimensions!
                    </span>
                  </div>
                </div>
              )}
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
