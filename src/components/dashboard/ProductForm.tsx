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

  const [bulkPriceInput, setBulkPriceInput] = useState("");
  const [bulkStockInput, setBulkStockInput] = useState("");
  const [bulkStatusMsg, setBulkStatusMsg] = useState("");

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
      };
    });
  };

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
    setCustomAttributes((prev) => {
      const remaining = prev.filter((a) => a.id !== attrId);
      const active = remaining.filter((a) => a.name.trim() !== "" && a.values.length > 0);
      if (active.length > 0) {
        setVariationsList((currentRows) => buildCombinations(remaining, currentRows));
      } else {
        setVariationsList([]);
      }
      return remaining;
    });
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

    setCustomAttributes((prev) => {
      const nextAttrs = prev.map((attr) => {
        if (attr.id !== attrId) return attr;
        const set = new Set(attr.values);
        valsToAdd.forEach((v) => set.add(v));
        return { ...attr, values: Array.from(set), inputVal: "" };
      });

      // Auto-sync variations so the client doesn't need to manually hunt for a matrix button
      const active = nextAttrs.filter((a) => a.name.trim() !== "" && a.values.length > 0);
      if (active.length > 0) {
        setVariationsList((currentRows) => buildCombinations(nextAttrs, currentRows));
      }
      return nextAttrs;
    });
  };

  const removeAttributeValue = (attrId: string, valToRemove: string) => {
    setCustomAttributes((prev) => {
      const nextAttrs = prev.map((attr) => {
        if (attr.id !== attrId) return attr;
        return { ...attr, values: attr.values.filter((v) => v !== valToRemove) };
      });

      const active = nextAttrs.filter((a) => a.name.trim() !== "" && a.values.length > 0);
      if (active.length > 0) {
        setVariationsList((currentRows) => buildCombinations(nextAttrs, currentRows));
      } else {
        setVariationsList([]);
      }
      return nextAttrs;
    });
  };

  const applyTemplate = (tpl: (typeof VARIATION_TEMPLATES)[0]) => {
    const newAttrs: DynamicCustomAttribute[] = tpl.attributes.map((a, idx) => ({
      id: `attr_${Date.now()}_${idx}`,
      name: a.name,
      values: [...a.values],
      inputVal: "",
    }));
    setCustomAttributes(newAttrs);
    const newCombos = buildCombinations(newAttrs, []);
    setVariationsList(newCombos);
    setHasVariations(true);
    setBulkStatusMsg(`✨ Loaded "${tpl.title}" template with ${newCombos.length} variations generated!`);
    setTimeout(() => setBulkStatusMsg(""), 4500);
  };

  const handleApplyBasePriceToAll = () => {
    const targetPrice = price && parseFloat(price) > 0 ? price : "0";
    setVariationsList((prev) =>
      prev.map((row) => ({
        ...row,
        price: targetPrice,
        original_price: originalPrice || row.original_price,
      }))
    );
    setBulkStatusMsg(`✅ Set price for all variations to product base price (₹${targetPrice})`);
    setTimeout(() => setBulkStatusMsg(""), 3500);
  };

  const handleApplyBulkPrice = () => {
    const clean = bulkPriceInput.trim();
    if (!clean || isNaN(parseFloat(clean))) {
      alert("Please enter a valid price (e.g. 2499).");
      return;
    }
    setVariationsList((prev) =>
      prev.map((row) => ({
        ...row,
        price: clean,
      }))
    );
    setBulkStatusMsg(`✅ Updated price for all ${variationsList.length} variations to ₹${clean}`);
    setBulkPriceInput("");
    setTimeout(() => setBulkStatusMsg(""), 3500);
  };

  const handleApplyBulkStock = () => {
    const clean = bulkStockInput.trim();
    if (!clean || isNaN(parseInt(clean, 10))) {
      alert("Please enter a valid stock quantity (e.g. 50).");
      return;
    }
    setVariationsList((prev) =>
      prev.map((row) => ({
        ...row,
        stock: clean,
      }))
    );
    setBulkStatusMsg(`✅ Updated stock for all ${variationsList.length} variations to ${clean} units`);
    setBulkStockInput("");
    setTimeout(() => setBulkStatusMsg(""), 3500);
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
    setBulkStatusMsg(`✅ Auto-generated clean SKUs for all variations!`);
    setTimeout(() => setBulkStatusMsg(""), 3500);
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
    setBulkStatusMsg(`⚡ Refreshed combinations: ${newRows.length} variations ready!`);
    setTimeout(() => setBulkStatusMsg(""), 3500);
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

        {/* Card: Product Variations System */}
        <div
          style={{
            background: "#FFFFFF",
            border: hasVariations ? "2px solid #FF4035" : "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: hasVariations
              ? "0 4px 20px rgba(255, 64, 53, 0.08)"
              : "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Card Header & Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: hasVariations ? "20px" : "0",
              borderBottom: hasVariations ? "1px solid #F1F5F9" : "none",
              paddingBottom: hasVariations ? "14px" : "0",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: hasVariations ? "#FEF2F2" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: hasVariations ? "#FF4035" : "#64748B",
                }}
              >
                <Sliders size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Product Variations &amp; Options (Colour, Mechanism, Sizes)
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "2px 0 0 0" }}>
                  Turn this on if your product comes with multiple options (e.g. Fabric Colour, Control Mechanism, Standard Sizes).
                </p>
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "30px",
                backgroundColor: hasVariations ? "#FF4035" : "#F1F5F9",
                color: hasVariations ? "#FFFFFF" : "#475569",
                border: hasVariations ? "1.5px solid #FF4035" : "1px solid #CBD5E1",
                fontSize: "0.84rem",
                fontWeight: 700,
                transition: "all 0.2s ease",
                boxShadow: hasVariations ? "0 2px 8px rgba(255, 64, 53, 0.3)" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={hasVariations}
                onChange={(e) => setHasVariations(e.target.checked)}
                style={{ accentColor: "#FFFFFF", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>{hasVariations ? "Variations Active" : "Enable Variations"}</span>
            </label>
          </div>

          {hasVariations && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* 1-Click Popular Templates Bar */}
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1.5px solid #86EFAC",
                  borderRadius: "12px",
                  padding: "16px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <Sparkles size={16} style={{ color: "#16A34A" }} />
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#166534" }}>
                    ✨ 1-Click Ready Templates for Wall Street Interiors:
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "#15803D" }}>
                    (Click any template to auto-fill options &amp; generate variations instantly)
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
                  {VARIATION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        textAlign: "left",
                        padding: "10px 12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #BBF7D0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#16A34A";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(22, 163, 74, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#BBF7D0";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "1.1rem" }}>{tpl.icon}</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F172A" }}>
                          {tpl.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1: Define Options & Values */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              >
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
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#FF4035",
                          color: "#FFFFFF",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        1
                      </span>
                      <span>Define Product Options (e.g. Fabric Colour, Control Mechanism, Size)</span>
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "4px 0 0 30px" }}>
                      Click suggested values or type custom ones. Variations below update automatically in real-time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addCustomAttribute()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Plus size={15} style={{ color: "#FF4035" }} />
                    <span>Add Another Option</span>
                  </button>
                </div>

                {/* Custom Attributes List */}
                {customAttributes.length === 0 ? (
                  <div
                    style={{
                      padding: "28px",
                      textAlign: "center",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1.5px dashed #CBD5E1",
                      color: "#64748B",
                      fontSize: "0.85rem",
                    }}
                  >
                    <p style={{ margin: "0 0 10px 0", fontWeight: 600, color: "#334155" }}>
                      No options added yet.
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748B" }}>
                      Click one of the <strong>1-Click Templates</strong> above, or click{" "}
                      <strong>&quot;Add Another Option&quot;</strong> to create your own (e.g. Fabric Colour, Drop Length).
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {customAttributes.map((attr, attrIdx) => {
                      const suggestions = getSuggestedValuesForAttr(attr.name).filter(
                        (s) => !attr.values.includes(s)
                      );

                      return (
                        <div
                          key={attr.id}
                          style={{
                            background: "#FFFFFF",
                            padding: "16px 18px",
                            borderRadius: "10px",
                            border: "1px solid #CBD5E1",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                        >
                          {/* Option Name & Delete */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "12px",
                              gap: "12px",
                            }}
                          >
                            <div style={{ flex: 1, maxWidth: "420px" }}>
                              <label
                                style={{
                                  fontSize: "0.76rem",
                                  fontWeight: 700,
                                  color: "#334155",
                                  display: "block",
                                  marginBottom: "5px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                Option {attrIdx + 1} Name:
                              </label>
                              <input
                                type="text"
                                value={attr.name}
                                onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                                placeholder="e.g. Fabric Colour, Control Mechanism, Wood Finish, Size..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "7px",
                                  border: "1.5px solid #CBD5E1",
                                  fontSize: "0.86rem",
                                  fontWeight: 700,
                                  color: "#0F172A",
                                  backgroundColor: "#F8FAFC",
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeCustomAttribute(attr.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "7px 12px",
                                backgroundColor: "#FEE2E2",
                                color: "#DC2626",
                                border: "1px solid #FECACA",
                                borderRadius: "7px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                alignSelf: "flex-end",
                                marginBottom: "2px",
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Remove Option</span>
                            </button>
                          </div>

                          {/* Quick Suggested Chips for this option */}
                          {suggestions.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginBottom: "12px",
                                flexWrap: "wrap",
                                backgroundColor: "#F8FAFC",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #F1F5F9",
                              }}
                            >
                              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700 }}>
                                💡 Suggested:
                              </span>
                              {suggestions.slice(0, 7).map((sug) => (
                                <button
                                  key={sug}
                                  type="button"
                                  onClick={() => addAttributeValue(attr.id, sug)}
                                  style={{
                                    fontSize: "0.74rem",
                                    fontWeight: 600,
                                    padding: "3px 10px",
                                    backgroundColor: "#FFFFFF",
                                    color: "#1E293B",
                                    border: "1px solid #CBD5E1",
                                    borderRadius: "14px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#EFF6FF";
                                    e.currentTarget.style.borderColor = "#93C5FD";
                                    e.currentTarget.style.color = "#1D4ED8";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                    e.currentTarget.style.borderColor = "#CBD5E1";
                                    e.currentTarget.style.color = "#1E293B";
                                  }}
                                >
                                  <Plus size={11} />
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Custom Value Input */}
                          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
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
                              placeholder='Type a value (e.g. Navy Blue, 5x7 ft) and press Enter or comma...'
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "7px",
                                border: "1px solid #CBD5E1",
                                fontSize: "0.84rem",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => addAttributeValue(attr.id, attr.inputVal || "")}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#0F172A",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "7px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              + Add Value
                            </button>
                          </div>

                          {/* Added Values Chips */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>
                              Active Values ({attr.values.length}):
                            </span>
                            {attr.values.length === 0 ? (
                              <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontStyle: "italic" }}>
                                No values added yet. Click a suggestion above or type one.
                              </span>
                            ) : (
                              attr.values.map((v) => (
                                <span
                                  key={v}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    backgroundColor: "#EFF6FF",
                                    color: "#1D4ED8",
                                    border: "1px solid #BFDBFE",
                                    padding: "4px 10px",
                                    borderRadius: "100px",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
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
                                    title={`Remove ${v}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Variations Table & Quick Bulk Tools */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#FF4035",
                          color: "#FFFFFF",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        2
                      </span>
                      <span>Configured Variations ({variationsList.length}) &amp; Bulk Pricing</span>
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "4px 0 0 30px" }}>
                      Manage variation-specific prices, stock, and photos. Use the bulk tools below to set prices in 1 second!
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={generateCombinationsMatrix}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 14px",
                        backgroundColor: "#F1F5F9",
                        color: "#334155",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Sync and re-generate all combinations"
                    >
                      <RefreshCw size={14} />
                      <span>Sync Combinations</span>
                    </button>
                    <button
                      type="button"
                      onClick={addManualVariationRow}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 14px",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Row Manually</span>
                    </button>
                  </div>
                </div>

                {/* Bulk Status Toast / Banner */}
                {bulkStatusMsg && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#065F46",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    <CheckCircle size={16} style={{ color: "#059669" }} />
                    <span>{bulkStatusMsg}</span>
                  </div>
                )}

                {/* Quick Bulk Pricing & Stock Tools Bar */}
                {variationsList.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <Zap size={15} style={{ color: "#D97706" }} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                        ⚡ Quick Bulk Actions (Apply to all {variationsList.length} variations at once):
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                      {/* Shortcut 1: Base Price */}
                      <button
                        type="button"
                        onClick={handleApplyBasePriceToAll}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#334155",
                          cursor: "pointer",
                        }}
                      >
                        <Copy size={13} style={{ color: "#FF4035" }} />
                        <span>Copy Base Price (₹{price || 0}) to All</span>
                      </button>

                      {/* Shortcut 2: Custom Bulk Price */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Set Price:</span>
                        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                          <span style={{ position: "absolute", left: "8px", fontSize: "0.78rem", color: "#64748B" }}>₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={bulkPriceInput}
                            onChange={(e) => setBulkPriceInput(e.target.value)}
                            placeholder="e.g. 2499"
                            style={{
                              width: "100px",
                              padding: "5px 8px 5px 20px",
                              borderRadius: "6px",
                              border: "1px solid #CBD5E1",
                              fontSize: "0.78rem",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyBulkPrice}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#0F172A",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Apply Price
                        </button>
                      </div>

                      {/* Shortcut 3: Bulk Stock */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Set Stock:</span>
                        <input
                          type="number"
                          value={bulkStockInput}
                          onChange={(e) => setBulkStockInput(e.target.value)}
                          placeholder="e.g. 50"
                          style={{
                            width: "75px",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            fontSize: "0.78rem",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkStock}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#0F172A",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Apply Stock
                        </button>
                      </div>

                      {/* Shortcut 4: Auto-Generate Clean SKUs */}
                      <button
                        type="button"
                        onClick={handleAutoGenerateSkus}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          backgroundColor: "#FEF2F2",
                          border: "1px solid #FECACA",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#DC2626",
                          cursor: "pointer",
                        }}
                      >
                        <Wand2 size={13} />
                        <span>Auto-Format Clean SKUs</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Variations Table */}
                {variationsList.length === 0 ? (
                  <div
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "10px",
                      border: "1.5px dashed #CBD5E1",
                      color: "#64748B",
                      fontSize: "0.85rem",
                    }}
                  >
                    No variations generated yet. Add options and values above or click one of the{" "}
                    <strong>1-Click Templates</strong> to create combinations automatically.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", textAlign: "left" }}>
                          <th style={{ padding: "10px 14px", fontWeight: 700, color: "#334155" }}>
                            Option Combination
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "120px" }}>
                            Price (₹)
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "115px" }}>
                            Orig. Price
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "85px" }}>
                            Stock
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "140px" }}>
                            SKU
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "140px" }}>
                            Variant Image
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "65px", textAlign: "center" }}>
                            Active
                          </th>
                          <th style={{ padding: "10px 12px", fontWeight: 700, color: "#334155", width: "50px", textAlign: "center" }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variationsList.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            {/* Combination Pills */}
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {Object.entries(row.combination || {}).map(([attrK, valK]) => (
                                  <span
                                    key={attrK}
                                    style={{
                                      backgroundColor: "#EEF2FF",
                                      color: "#3730A3",
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      fontWeight: 700,
                                      fontSize: "0.76rem",
                                      border: "1px solid #C7D2FE",
                                    }}
                                  >
                                    <span style={{ color: "#6366F1", marginRight: "3px" }}>{attrK}:</span>
                                    <span>{valK}</span>
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Price */}
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <span style={{ position: "absolute", left: "8px", fontSize: "0.78rem", color: "#64748B" }}>₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={row.price}
                                  onChange={(e) => updateVariationRow(idx, "price", e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px 6px 18px",
                                    borderRadius: "6px",
                                    border: "1px solid #CBD5E1",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    color: "#0F172A",
                                  }}
                                />
                              </div>
                            </td>

                            {/* Orig Price */}
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <span style={{ position: "absolute", left: "8px", fontSize: "0.78rem", color: "#94A3B8" }}>₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={row.original_price}
                                  onChange={(e) => updateVariationRow(idx, "original_price", e.target.value)}
                                  placeholder="Optional"
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px 6px 18px",
                                    borderRadius: "6px",
                                    border: "1px solid #CBD5E1",
                                    fontSize: "0.8rem",
                                  }}
                                />
                              </div>
                            </td>

                            {/* Stock */}
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
                                  fontSize: "0.82rem",
                                }}
                              />
                            </td>

                            {/* SKU */}
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
                                  fontSize: "0.76rem",
                                  fontFamily: "monospace",
                                }}
                              />
                            </td>

                            {/* Variant Image */}
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

                            {/* Active */}
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={row.is_active}
                                onChange={(e) => updateVariationRow(idx, "is_active", e.target.checked)}
                                style={{ accentColor: "#FF4035", width: "16px", height: "16px", cursor: "pointer" }}
                              />
                            </td>

                            {/* Action */}
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

                {/* Storefront Customer Experience Preview Card */}
                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px 18px",
                    backgroundColor: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <Eye size={18} style={{ color: "#0284C7", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 700, color: "#0369A1" }}>
                      How this appears to buyers on your website:
                    </h5>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "#0C4A6E", lineHeight: "1.4" }}>
                      Customers first pick their options (e.g. <strong>Fabric Colour</strong>, then <strong>Control Mechanism</strong>) using interactive pill buttons.
                      If <em>Made to Measure (Custom Sizing)</em> is enabled below, customers will see a clean dropdown allowing them to choose either standard sizing or enter custom window dimensions!
                    </p>
                  </div>
                </div>
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
