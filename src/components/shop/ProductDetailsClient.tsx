"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/actions/products";
import { ProductVariation, ProductAttribute } from "@/lib/actions/variations";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDealerAuth } from "@/components/auth/DealerAuthProvider";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import { isColorAttribute, getColorHex, formatDescriptionHtml } from "@/lib/colorShades";

interface ReviewItem {
  id: number;
  author: string;
  avatar?: string;
  date: string;
  rating: number;
  comment: string;
}

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
  variations?: ProductVariation[];
  allAttributes?: ProductAttribute[];
  whatsappNumber?: string;
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
  variations = [],
  allAttributes = [],
  whatsappNumber = "",
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { dealer, isApproved: isDealerApproved } = useDealerAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [inWishlist, setInWishlist] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<string>("");
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);

  // Identify distinct attributes used in this product's variations dynamically
  const productAttributes = useMemo(() => {
    const attrMap = new Map<number, { id: number; name: string; slug: string }>();
    (variations || []).forEach((v) => {
      (v.values || []).forEach((val) => {
        if (!attrMap.has(val.attribute_id)) {
          const fromAll = (allAttributes || []).find((a) => a.id === val.attribute_id);
          attrMap.set(val.attribute_id, {
            id: val.attribute_id,
            name: fromAll?.name || val.attribute_name,
            slug: fromAll?.slug || val.attribute_slug || "",
          });
        }
      });
    });
    return Array.from(attrMap.values());
  }, [variations, allAttributes]);

  // Identify if a dedicated "Size" / "Dimensions" attribute exists in variations
  const sizeAttribute = useMemo(() => {
    return productAttributes.find((attr) => {
      const n = attr.name.toLowerCase();
      return n.includes("size") || n.includes("dimen") || n.includes("measurement");
    });
  }, [productAttributes]);

  // Non-size attributes (e.g. Fabric Colour, Control Mechanism, Leg Finish, etc.)
  const nonSizeAttributes = useMemo(() => {
    return productAttributes.filter((attr) => {
      const n = attr.name.toLowerCase();
      return !n.includes("size") && !n.includes("dimen") && !n.includes("measurement");
    });
  }, [productAttributes]);

  // Available standard sizes from sizeAttribute
  const standardSizes = useMemo(() => {
    if (!sizeAttribute) return [];
    const map = new Map<number, string>();
    (variations || []).forEach((v) => {
      (v.values || []).forEach((val) => {
        if (val.attribute_id === sizeAttribute.id) {
          map.set(val.value_id, val.value_label);
        }
      });
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [sizeAttribute, variations]);

  const hasStandardSizes = standardSizes.length > 0;

  // Custom Sizing Availability & Sizing Mode
  const isCustomSizingEnabled = Boolean(
    product.allow_custom_sizing || (product.custom_size_rate && Number(product.custom_size_rate) > 0)
  );

  const [sizingMode, setSizingMode] = useState<"standard" | "custom">(() => {
    if (!product.has_variations && !hasStandardSizes && isCustomSizingEnabled) return "custom";
    return "standard";
  });
  const isCustomMode = isCustomSizingEnabled && sizingMode === "custom";

  // Initial selection: first active variation or first available values
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<number, number>>(() => {
    if (variations && variations.length > 0 && variations[0].values) {
      const initial: Record<number, number> = {};
      variations[0].values.forEach((v) => {
        initial[v.attribute_id] = v.value_id;
      });
      return initial;
    }
    return {};
  });

  // Find currently matched variation
  const currentVariation = useMemo(() => {
    if (!variations || variations.length === 0) return null;
    return variations.find((v) => {
      if (!v.values || v.values.length === 0) return false;
      return v.values.every((val) => {
        if (isCustomMode && sizeAttribute && val.attribute_id === sizeAttribute.id) {
          return true;
        }
        return selectedAttributeValues[val.attribute_id] === val.value_id;
      });
    });
  }, [variations, selectedAttributeValues, isCustomMode, sizeAttribute]);

  // Active gallery image
  const [activeImage, setActiveImage] = useState<string>(product.image || "");
  const [userSelectedGalleryImage, setUserSelectedGalleryImage] = useState<boolean>(false);

  // When variation changes, instantly shift active image to that variation's photo
  React.useEffect(() => {
    const varImg = currentVariation?.image?.trim();
    if (varImg && varImg !== "") {
      setActiveImage(varImg);
      setUserSelectedGalleryImage(false);
    } else if (!userSelectedGalleryImage && product.image && product.image.trim() !== "") {
      setActiveImage(product.image);
    }
  }, [currentVariation, product.image, userSelectedGalleryImage]);

  React.useEffect(() => {
    setInWishlist(isInWishlist(product.id));
    const handleWishlistUpdate = () => {
      setInWishlist(isInWishlist(product.id));
    };
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdate);
  }, [product.id]);

  const currentImage = (activeImage && activeImage.trim() !== "")
    ? activeImage
    : (product.image && product.image.trim() !== "")
    ? product.image
    : null;

  // Helper to extract multiple image URLs from variation image string
  const parseVarImages = (imgStr: string | null | undefined): string[] => {
    if (!imgStr || !imgStr.trim()) return [];
    const raw = imgStr.trim();
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter(Boolean) : [raw];
      } catch {
        return [raw];
      }
    }
    if (raw.includes(",")) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [raw];
  };

  // Identify the Color/Shade attribute if present on this product
  const colorAttribute = useMemo(() => {
    return productAttributes.find((attr) => isColorAttribute(attr.name));
  }, [productAttributes]);

  // Selected Color value ID
  const selectedColorValId = colorAttribute ? selectedAttributeValues[colorAttribute.id] : null;

  // Base fallback gallery from product.image + product.gallery_images
  const baseGalleryImages = useMemo(() => {
    const extraGallery = Array.isArray(product.gallery_images)
      ? product.gallery_images
      : typeof product.gallery_images === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(product.gallery_images);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

    return Array.from(
      new Set(
        [product.image, ...extraGallery].filter(
          (img): img is string => Boolean(img && typeof img === "string" && img.trim() !== "")
        )
      )
    );
  }, [product.image, product.gallery_images]);

  // Extract ONLY images belonging to the currently selected color shade
  const activeColorImages = useMemo(() => {
    if (!colorAttribute || !selectedColorValId) return [];

    const foundImages: string[] = [];

    (variations || []).forEach((v) => {
      const hasSelectedColor = (v.values || []).some(
        (val) => val.attribute_id === colorAttribute.id && val.value_id === selectedColorValId
      );

      if (hasSelectedColor && v.image && v.image.trim()) {
        const urls = parseVarImages(v.image);
        urls.forEach((url) => {
          if (url && !foundImages.includes(url)) {
            foundImages.push(url);
          }
        });
      }
    });

    return foundImages;
  }, [colorAttribute, selectedColorValId, variations]);

  // Filter gallery images: when a color shade is active and has images, ONLY show that color's photos and thumbnails!
  const galleryImages = useMemo(() => {
    if (activeColorImages.length > 0) {
      return activeColorImages;
    }
    return baseGalleryImages;
  }, [activeColorImages, baseGalleryImages]);

  // When activeColorImages changes (user clicked a color), immediately shift gallery to that color's first photo
  useEffect(() => {
    if (activeColorImages.length > 0) {
      setActiveImage(activeColorImages[0]);
      setUserSelectedGalleryImage(false);
    }
  }, [activeColorImages]);

  const handleGallerySelectImage = (img: string) => {
    setActiveImage(img);
    setUserSelectedGalleryImage(true);
    // Auto-select matched variation if this image is specific to one
    const matchedVar = (variations || []).find((v) => {
      if (!v.image) return false;
      const urls = parseVarImages(v.image);
      return urls.includes(img);
    });
    if (matchedVar && matchedVar.values) {
      const updatedAttrs: Record<number, number> = {};
      matchedVar.values.forEach((v) => {
        updatedAttrs[v.attribute_id] = v.value_id;
      });
      setSelectedAttributeValues((prev) => ({ ...prev, ...updatedAttrs }));
    }
  };

  // Custom Sizing in Feet Measurement Settings
  const customRate = Number(product.custom_size_rate || 14);
  const customUnit = product.custom_size_unit || "sq_ft";
  const customMinPrice = Number(product.custom_size_min_price || 0);
  const customLinearMode = product.custom_size_linear_mode || "length_plus_width";

  const [lengthFeet, setLengthFeet] = useState<string>("5");
  const [lengthInches, setLengthInches] = useState<string>("0");
  const [widthFeet, setWidthFeet] = useState<string>("4");
  const [widthInches, setWidthInches] = useState<string>("0");
  const [showPricingBreakdown, setShowPricingBreakdown] = useState<boolean>(false);

  const quickPresets = [
    { label: "Small (3 × 4 ft)", wFt: "3", wIn: "0", lFt: "4", lIn: "0" },
    { label: "Standard (4 × 5 ft)", wFt: "4", wIn: "0", lFt: "5", lIn: "0" },
    { label: "Large (5 × 6 ft)", wFt: "5", wIn: "0", lFt: "6", lIn: "0" },
    { label: "Balcony (6 × 7 ft)", wFt: "6", wIn: "0", lFt: "7", lIn: "0" },
  ];
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("Standard (4 × 5 ft)");

  const lengthFtNum = parseFloat(lengthFeet) || 0;
  const lengthInNum = parseFloat(lengthInches) || 0;
  const widthFtNum = parseFloat(widthFeet) || 0;
  const widthInNum = parseFloat(widthInches) || 0;

  // Decimal feet conversions
  const totalLengthFeet = Math.max(0, lengthFtNum + lengthInNum / 12);
  const hasWidth = customUnit === "sq_ft" || customLinearMode === "length_plus_width";
  const totalWidthFeet = hasWidth ? Math.max(0, widthFtNum + widthInNum / 12) : 0;

  // Computed custom area / linear feet
  let customTotalMeasurement = 0;
  let customUnitLabel = "";
  let customFormulaText = "";

  if (customUnit === "sq_ft") {
    customTotalMeasurement = Number((totalLengthFeet * totalWidthFeet).toFixed(2));
    customUnitLabel = "sq. ft";
    customFormulaText = `${totalLengthFeet.toFixed(2)} ft × ${totalWidthFeet.toFixed(2)} ft = ${customTotalMeasurement} sq. ft`;
  } else {
    if (customLinearMode === "single_length") {
      customTotalMeasurement = Number(totalLengthFeet.toFixed(2));
      customUnitLabel = "linear ft";
      customFormulaText = `${totalLengthFeet.toFixed(2)} running ft`;
    } else {
      // length_plus_width (e.g. 6 ft 3 in + 5 ft = 11.25 linear ft)
      customTotalMeasurement = Number((totalLengthFeet + totalWidthFeet).toFixed(2));
      customUnitLabel = "linear ft";
      customFormulaText = `${totalLengthFeet.toFixed(2)} ft + ${totalWidthFeet.toFixed(2)} ft = ${customTotalMeasurement} linear ft`;
    }
  }

  const rawCustomPrice = Number((customTotalMeasurement * customRate).toFixed(2));
  // B2B Dealer check & MOQ resolution
  const isApprovedDealer = Boolean(isDealerApproved);
  const moq = isApprovedDealer ? Math.max(1, Number(product.min_order_quantity) || 1) : 1;

  // Custom sizing minimum charge: applies to B2B dealer orders when configured in admin
  const customMinChargeApplied = isApprovedDealer && customMinPrice > 0 && rawCustomPrice < customMinPrice;
  const customEstimatedPrice = customMinChargeApplied ? customMinPrice : rawCustomPrice;

  // Base retail unit and original price
  const retailUnitPrice = currentVariation ? Number(currentVariation.price) : Number(product.price);
  const retailOriginalPrice = currentVariation
    ? currentVariation.original_price ? Number(currentVariation.original_price) : null
    : product.original_price ? Number(product.original_price) : null;

  // B2B Dealer unit price resolution (adjusted from admin panel)
  let dealerUnitPrice = retailUnitPrice;
  if (isApprovedDealer) {
    if (currentVariation && currentVariation.wholesale_price && Number(currentVariation.wholesale_price) > 0) {
      dealerUnitPrice = Number(currentVariation.wholesale_price);
    } else if (product.default_wholesale_price && Number(product.default_wholesale_price) > 0) {
      if (currentVariation && Number(currentVariation.price) !== Number(product.price) && Number(product.price) > 0) {
        const discountRatio = (Number(product.price) - Number(product.default_wholesale_price)) / Number(product.price);
        dealerUnitPrice = Math.max(1, Math.round(retailUnitPrice * (1 - discountRatio)));
      } else {
        dealerUnitPrice = Number(product.default_wholesale_price);
      }
    }
  }

  // Active display values
  const displayPrice = isCustomMode
    ? customEstimatedPrice
    : isApprovedDealer
    ? dealerUnitPrice
    : retailUnitPrice;

  const displayOriginalPrice = isCustomMode
    ? null
    : isApprovedDealer && retailUnitPrice > displayPrice
    ? retailUnitPrice
    : retailOriginalPrice;

  const tradeSavingsPercent = isApprovedDealer && retailUnitPrice > displayPrice
    ? Math.round(((retailUnitPrice - displayPrice) / retailUnitPrice) * 100)
    : 0;

  const displayStock = isCustomMode ? 99 : currentVariation ? currentVariation.stock : product.stock;
  const isOutOfStock = !isCustomMode && displayStock <= 0;
  const displaySku = isCustomMode
    ? `${currentVariation?.sku || `WSI-${product.id.toString().padStart(5, "0")}`}-CUSTOM`
    : currentVariation?.sku || `WSI-${product.id.toString().padStart(5, "0")}`;

  // Synchronize initial dealer quantity with MOQ
  useEffect(() => {
    if (isApprovedDealer && moq > 1) {
      setQuantity((currentQty) => (currentQty < moq ? moq : currentQty));
    }
  }, [isApprovedDealer, moq]);

  // Review submission state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectAttributeValue = (attrId: number, valId: number) => {
    setSelectedAttributeValues((prev) => {
      const updated = {
        ...prev,
        [attrId]: valId,
      };

      // If selecting a color attribute, collect all images for this color and shift gallery immediately
      if (colorAttribute && attrId === colorAttribute.id) {
        const matchingColorImages: string[] = [];
        (variations || []).forEach((v) => {
          const hasColor = (v.values || []).some(
            (val) => val.attribute_id === attrId && val.value_id === valId
          );
          if (hasColor && v.image && v.image.trim()) {
            const urls = parseVarImages(v.image);
            urls.forEach((u) => {
              if (u && !matchingColorImages.includes(u)) matchingColorImages.push(u);
            });
          }
        });

        if (matchingColorImages.length > 0) {
          setActiveImage(matchingColorImages[0]);
          setUserSelectedGalleryImage(false);
        }
      } else {
        // Fallback for non-color attribute selection
        const matchedWithImg = (variations || []).find((v) => {
          if (!v.image || !v.image.trim()) return false;
          if (!v.values) return false;
          return v.values.some((val) => val.attribute_id === attrId && val.value_id === valId);
        });

        if (matchedWithImg?.image) {
          const first = parseVarImages(matchedWithImg.image)[0];
          if (first) {
            setActiveImage(first);
            setUserSelectedGalleryImage(false);
          }
        }
      }

      return updated;
    });
  };

  const handleAddToCart = (): boolean => {
    if (!isApprovedDealer && !requireAuth("cart")) {
      return false;
    }

    // Strict MOQ Check for B2B Dealers:
    if (isApprovedDealer && quantity < moq) {
      alert(`⚠️ Minimum Order Requirement: As an approved B2B Trade Partner, the minimum order for "${product.name}" is ${moq} units. You currently have ${quantity} selected. Please increase your quantity to proceed.`);
      showNotification(`⚠️ Minimum B2B order of ${moq} units required. Quantity adjusted to ${moq}.`);
      setQuantity(moq);
      return false;
    }

    if (isCustomMode) {
      if (customTotalMeasurement <= 0) {
        showNotification("Please enter valid measurements in feet and inches.");
        return false;
      }

      const attributeMap: Record<string, string> = {};
      if (currentVariation && currentVariation.values) {
        currentVariation.values.forEach((val) => {
          if (!val.attribute_name.toLowerCase().includes("size") && !val.attribute_name.toLowerCase().includes("dimen")) {
            attributeMap[val.attribute_name] = val.value_label;
          }
        });
      }

      if (totalLengthFeet <= 0 || (hasWidth && totalWidthFeet <= 0)) {
        showNotification("Please enter valid length and width dimensions.");
        return false;
      }

      const lengthLabel = lengthInNum > 0 ? `${lengthFtNum} ft ${lengthInNum} in` : `${lengthFtNum} ft`;
      const widthLabel = hasWidth ? (widthInNum > 0 ? `${widthFtNum} ft ${widthInNum} in` : `${widthFtNum} ft`) : undefined;

      const dimensionSummary = hasWidth
        ? (customUnit === "sq_ft" ? `${lengthLabel} × ${widthLabel}` : `${lengthLabel} + ${widthLabel}`)
        : lengthLabel;

      attributeMap["Custom Sizing"] = `${dimensionSummary} (${customTotalMeasurement} ${customUnitLabel})`;
      attributeMap["Pricing Method"] = customUnit === "sq_ft"
        ? "Square Feet (Area: L × W)"
        : `Linear Feet (${customLinearMode === "single_length" ? "Running Length" : "Length + Width"})`;
      attributeMap["Rate"] = `₹${customRate.toFixed(2)} / ${customUnitLabel}`;

      addToCart({
        productId: product.id,
        variationId: undefined,
        name: product.name,
        slug: product.slug,
        price: customEstimatedPrice,
        originalPrice: null,
        quantity,
        image: activeImage || product.image,
        attributes: attributeMap,
        customDetails: {
          isCustom: true,
          pricingMethod: customUnit,
          linearMode: customLinearMode,
          lengthFeet: lengthFtNum,
          lengthInches: lengthInNum,
          widthFeet: hasWidth ? widthFtNum : undefined,
          widthInches: hasWidth ? widthInNum : undefined,
          totalLengthFeet,
          totalWidthFeet: hasWidth ? totalWidthFeet : undefined,
          billableMeasurement: customTotalMeasurement,
          unitLabel: customUnitLabel,
          rate: customRate,
          minPrice: 0,
          minPriceApplied: false,
          calculatedPrice: customEstimatedPrice,
          formulaSummary: `${customFormulaText} × ₹${customRate} = ₹${customEstimatedPrice}`,
        },
        sku: displaySku,
        maxStock: 99,
        moq: isApprovedDealer ? moq : 1,
        isWholesale: isApprovedDealer,
      });

      showNotification(
        `Added ${quantity} x "${product.name}" with Custom Sizing (${dimensionSummary} = ₹${customEstimatedPrice.toFixed(2)}) to your cart!`
      );
      return true;
    }

    if (product.has_variations && productAttributes.length > 0 && !currentVariation) {
      showNotification("Please select all product options to continue.");
      return false;
    }
    if (isOutOfStock) {
      showNotification("This selected variation is currently out of stock.");
      return false;
    }

    const attributeMap: Record<string, string> = {};
    if (currentVariation && currentVariation.values) {
      currentVariation.values.forEach((val) => {
        attributeMap[val.attribute_name] = val.value_label;
      });
    }

    addToCart({
      productId: product.id,
      variationId: currentVariation ? currentVariation.id : undefined,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      quantity,
      image: activeImage || product.image,
      attributes: Object.keys(attributeMap).length > 0 ? attributeMap : undefined,
      sku: displaySku,
      maxStock: displayStock,
      moq: isApprovedDealer ? moq : 1,
      isWholesale: isApprovedDealer,
    });

    const attrSummary = Object.entries(attributeMap)
      .map(([k, v]) => `${v}`)
      .join(", ");

    showNotification(
      `Added ${quantity} x "${product.name}"${attrSummary ? ` (${attrSummary})` : ""} to your cart!`
    );
    return true;
  };

  const handleBuyNow = () => {
    if (isApprovedDealer && quantity < moq) {
      alert(`⚠️ Minimum Order Requirement: As an approved B2B Trade Partner, the minimum order for "${product.name}" is ${moq} units. You currently have ${quantity} selected. Please increase your quantity to proceed.`);
      showNotification(`⚠️ Order quantity below minimum (${moq} units required for B2B).`);
      setQuantity(moq);
      return;
    }

    if (!isApprovedDealer && !requireAuth("checkout")) {
      return;
    }
    const success = handleAddToCart();
    if (success) {
      router.push("/checkout");
    }
  };

  const handleToggleWishlist = () => {
    if (!requireAuth("wishlist")) {
      return;
    }
    const { added } = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      image: activeImage || product.image,
      categoryName: product.category_name,
      stock: displayStock,
    });
    setInWishlist(added);
    showNotification(
      added
        ? `Added "${product.name}" to your wishlist!`
        : `Removed "${product.name}" from your wishlist.`
    );
  };

  const displayWhatsAppNumber = whatsappNumber || "";

  const getWhatsAppMessageText = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const lengthLabel = lengthInNum > 0 ? `${lengthFtNum} ft ${lengthInNum} in` : `${lengthFtNum} ft`;
    const widthLabel = hasWidth ? (widthInNum > 0 ? `${widthFtNum} ft ${widthInNum} in` : `${widthFtNum} ft`) : "";
    const dimensionStr = hasWidth
      ? (customUnit === "sq_ft" ? `${lengthLabel} × ${widthLabel}` : `${lengthLabel} + ${widthLabel}`)
      : lengthLabel;

    // Selected variation attributes (e.g. Color: Navy Velvet)
    const selectedAttrsSummary = Object.entries(selectedAttributeValues)
      .map(([attrId, valId]) => {
        const attr = allAttributes.find((a) => String(a.id) === String(attrId));
        const val = attr?.values.find((v) => String(v.id) === String(valId));
        return attr && val ? `• ${attr.name}: ${val.value}` : null;
      })
      .filter(Boolean)
      .join("\n");

    const lines = [
      `*📐 CUSTOM SIZING INQUIRY / SPECIFICATION*`,
      `Wall Street Interiors — Bespoke Architectural Solutions`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Product:* ${product.name}`,
      `🏷️ *Product Code / SKU:* ${displaySku}`,
      currentUrl ? `🔗 *Product URL:* ${currentUrl}` : null,
      ``,
      `📏 *Custom Dimensions Specified:*`,
      `• Dimensions: *${dimensionStr}*`,
      `• Decimal Equivalent: ${totalLengthFeet.toFixed(2)} ft ${hasWidth ? `× ${totalWidthFeet.toFixed(2)} ft` : ""}`,
      `• Billable ${customUnit === "sq_ft" ? "Total Area" : "Measurement"}: *${customTotalMeasurement} ${customUnitLabel}*`,
      `• Calculation Formula: ${customFormulaText}`,
      `• Applied Rate: ₹${customRate.toFixed(2)} / ${customUnitLabel}`,
      ``,
      selectedAttrsSummary ? `🎨 *Selected Specifications / Finishes:*\n${selectedAttrsSummary}\n` : null,
      `💰 *Estimated Unit Price:* ₹${customEstimatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      `🔢 *Quantity Required:* ${quantity} unit(s)`,
      `💵 *Total Estimated Value:* ₹${(customEstimatedPrice * quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ``,
      customNotes.trim() ? `📝 *Client Specific Requirements / Notes:*\n"${customNotes.trim()}"\n` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👋 Hello Business Manager, I generated this custom sizing estimate on your website. Please review the measurements above and confirm the quote, production schedule, and material sample availability.`
    ].filter((line) => line !== null);

    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    if (totalLengthFeet <= 0 || (hasWidth && totalWidthFeet <= 0)) {
      showNotification("Please enter valid length and width dimensions before sending to WhatsApp.");
      return;
    }

    const cleanNumber = (whatsappNumber || "").replace(/[^0-9]/g, "");
    if (!cleanNumber) {
      showNotification("WhatsApp support is not currently configured. Please use our Contact page.");
      return;
    }
    const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = getWhatsAppMessageText();
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleStandardWhatsAppQuote = () => {
    const cleanNumber = (whatsappNumber || "+919018454526").replace(/[^0-9]/g, "");
    const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Hi Wall Street Interiors, I am interested in:
*${product.name}*
Price: ₹${displayPrice.toLocaleString("en-IN")}
Category: ${product.category_name || "Interior Materials"}
Product Link: ${currentUrl}

Could you please share availability, wholesale/retail pricing, and delivery/measuring in Srinagar?`;

    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyWhatsAppText = async () => {
    try {
      const message = getWhatsAppMessageText();
      await navigator.clipboard.writeText(message);
      setCopiedWhatsAppText(true);
      showNotification("Custom sizing specification copied to clipboard!");
      setTimeout(() => setCopiedWhatsAppText(false), 3000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev: ReviewItem = {
      id: Date.now(),
      author: reviewName.trim(),
      date: "Just now",
      rating: reviewRating,
      comment: reviewComment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setReviewName("");
    setReviewEmail("");
    setReviewComment("");
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
    showNotification("Thank you! Your verified review has been published.");
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcumb-section">
        <div
          className="breadcumb-container-wrapper"
          style={{
            backgroundImage: "url('/assets/images/breadcumb/breadcumb-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="shape1">
            <img src="/assets/images/shape/breadcumb-shape1_1.png" alt="shape" />
          </div>
          <div className="shape2">
            <img src="/assets/images/shape/breadcumb-shape1_2.png" alt="shape" />
          </div>
          <div className="shape3">
            <img src="/assets/images/shape/breadcumb-shape1_3.png" alt="shape" />
          </div>
          <div className="shape4">
            <img src="/assets/images/shape/breadcumb-shape1_4.png" alt="shape" />
          </div>
          <div className="container">
            <ul className="breadcumb-wrapper">
              <li>
                <Link href="/">
                  <i className="fa-sharp fa-light fa-house"></i>
                </Link>
              </li>
              <li>
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li>
                <Link href="/shop">{product.category_name || "Products"}</Link>
              </li>
              <li>
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li style={{ color: "var(--theme)", fontWeight: 600 }}>{product.name}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Product Details Section */}
      <div className="shop-details-section section-padding fix bg-white">
        <div className="shop-details">
          <div className="container">
            {notification && (
              <div
                style={{
                  padding: "14px 22px",
                  backgroundColor: "#ECFDF5",
                  color: "#065F46",
                  borderRadius: "10px",
                  marginBottom: "30px",
                  border: "1px solid #10B981",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span>{notification}</span>
                </div>
                <div className="d-flex gap-2">
                  <Link href="/cart" className="theme-btn" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                    View Cart
                  </Link>
                  <Link href="/wishlist" className="theme-btn style6" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                    Wishlist
                  </Link>
                </div>
              </div>
            )}

            <div className="row gx-60 align-items-start">
              {/* Product Gallery with Interactive Hover Zoom Lens & Thumbnail Navigation */}
              <div className="col-lg-6 mb-4 mb-lg-0">
                <ProductImageGallery
                  images={galleryImages}
                  activeImage={currentImage || product.image || ""}
                  onSelectImage={handleGallerySelectImage}
                  productName={product.name}
                  badge={product.badge}
                  discountPercent={product.discount_percent}
                  height={540}
                />
              </div>

              {/* Product Information */}
              <div className="col-lg-6">
                <div className="product-about">
                  {/* Rating & Stock Status Header */}
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <ul className="star d-flex" style={{ listStyle: "none", padding: 0, margin: 0, color: "#F59E0B" }}>
                        {[...Array(5)].map((_, i) => (
                          <li key={i} style={{ marginRight: "2px" }}>
                            <i
                              className={
                                i < Math.floor(product.rating || 5)
                                  ? "fa-solid fa-star"
                                  : "fa-regular fa-star"
                              }
                              style={{ fontSize: "0.78rem" }}
                            ></i>
                          </li>
                        ))}
                      </ul>
                      <span style={{ color: "#64748B", fontSize: "0.78rem", fontWeight: 500 }}>
                        ({product.reviews_count || reviews.length} customer reviews)
                      </span>
                    </div>

                    {displayStock > 0 ? (
                      <span
                        style={{
                          backgroundColor: "#F0FDF4",
                          color: "#16A34A",
                          border: "1px solid #DCFCE7",
                          borderRadius: "12px",
                          padding: "2px 8px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16A34A", display: "inline-block" }}></span>
                        In Stock
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FEE2E2",
                          borderRadius: "12px",
                          padding: "2px 8px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1
                    className="product-title"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#0F172A",
                      marginBottom: "6px",
                      lineHeight: 1.3,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {product.name}
                  </h1>

                  {/* Clean Minimal Metadata Line */}
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-3" style={{ fontSize: "0.76rem", color: "#64748B" }}>
                    <span>SKU: <strong style={{ color: "#334155" }}>{displaySku}</strong></span>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span>Category: <strong style={{ color: "#334155" }}>{product.category_name}</strong></span>
                    {product.brand && (
                      <>
                        <span style={{ color: "#CBD5E1" }}>•</span>
                        <span>Brand: <strong style={{ color: "#334155" }}>{product.brand}</strong></span>
                      </>
                    )}
                  </div>

                  {/* B2B Dealer Trade Partner Indicator */}
                  {isApprovedDealer && (
                    <div style={{ width: "100%", marginBottom: "8px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.35)",
                          color: "#065F46",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                        }}
                      >
                        <i className="fa-solid fa-shield-check" style={{ color: "#10B981" }}></i>
                        B2B Trade Partner Pricing &bull; {dealer?.companyName || "Approved Dealer"}
                      </span>
                    </div>
                  )}

                  {/* Price Area with Transparent Rate */}
                  <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                    <h2
                      className="product-price"
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        color: "var(--theme, #FF4035)",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{Number(displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h2>

                    {isApprovedDealer && (
                      <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 700 }}>
                        / unit (Wholesale)
                      </span>
                    )}

                    {displayOriginalPrice && Number(displayOriginalPrice) > Number(displayPrice) && (
                      <span
                        style={{
                          fontSize: "1.05rem",
                          color: "#94A3B8",
                          textDecoration: "line-through",
                          fontWeight: 400,
                        }}
                      >
                        {isApprovedDealer ? `Retail: ₹${Number(displayOriginalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `₹${Number(displayOriginalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                      </span>
                    )}

                    {isApprovedDealer && tradeSavingsPercent > 0 && (
                      <span
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FECACA",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        Save {tradeSavingsPercent}%
                      </span>
                    )}

                    {isApprovedDealer && moq > 1 && (
                      <span
                        style={{
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          border: "1px solid #CBD5E1",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        📦 Min B2B Order: {moq} units
                      </span>
                    )}

                    {/* Subtle Made-to-Measure Rate Callout */}
                    {isCustomSizingEnabled && (
                      <span
                        style={{
                          backgroundColor: "#F8FAFC",
                          color: "#475569",
                          border: "1px solid #E2E8F0",
                          borderRadius: "6px",
                          padding: "3px 9px",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span>📐 Made to measure:</span>
                        <strong style={{ color: "#0F172A", fontWeight: 700 }}>₹{customRate.toFixed(2)}</strong>
                        <span style={{ color: "#64748B" }}>/ {customUnitLabel}</span>
                      </span>
                    )}
                  </div>

                  {customMinChargeApplied && (
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        color: "#92400E",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        marginBottom: "12px",
                      }}
                    >
                      ℹ️ Minimum B2B order charge of ₹{customMinPrice.toFixed(2)} applied for custom dimensioning.
                    </div>
                  )}

                  {/* Short Description formatted cleanly as per entered in admin */}
                  <div
                    className="text mb-3 pb-2"
                    style={{
                      color: "#64748B",
                      fontSize: "0.86rem",
                      lineHeight: 1.6,
                      borderBottom: "1px solid #F1F5F9",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatDescriptionHtml(
                        product.short_description ||
                        product.description ||
                        "Engineered with certified high-fidelity components, robust joinery, and precision architectural finishing to deliver exceptional luxury aesthetics and long-lasting durability."
                      ),
                    }}
                  />

                  {/* ══════════════════════════════════════════════════════════════ */}
                  {/* 1. DIMENSIONS & SIZING (ABOVE COLORS)                           */}
                  {/* Presets are OUTSIDE as pill buttons; Custom Size in dropdown    */}
                  {/* ══════════════════════════════════════════════════════════════ */}
                  {(hasStandardSizes || isCustomSizingEnabled) && (
                    <div className="product-sizing-section mb-3">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <span style={{ fontWeight: 700, color: "#64748B", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Dimensions / Size:
                        </span>
                        {isCustomSizingEnabled && (
                          <span style={{ fontSize: "0.72rem", color: "#475569", fontWeight: 500 }}>
                            📐 Rate: <strong style={{ color: "#0F172A" }}>₹{customRate.toFixed(2)}</strong> / {customUnitLabel}
                          </span>
                        )}
                      </div>

                      {/* Outside Pill-Shaped Presets */}
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        {/* A. Standard sizes from admin variations */}
                        {hasStandardSizes && sizeAttribute && standardSizes.map((sz) => {
                          const isSelected = !isCustomMode && selectedAttributeValues[sizeAttribute.id] === sz.id;
                          return (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => {
                                setSizingMode("standard");
                                setSelectedPresetKey(`std_${sz.id}`);
                                handleSelectAttributeValue(sizeAttribute.id, sz.id);
                              }}
                              style={{
                                padding: "5px 13px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: isSelected ? 700 : 500,
                                border: isSelected ? "1.5px solid #0F172A" : "1px solid #CBD5E1",
                                backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                                color: isSelected ? "#FFFFFF" : "#334155",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                boxShadow: isSelected ? "0 2px 5px rgba(15, 23, 42, 0.15)" : "none",
                              }}
                            >
                              {isSelected && <span style={{ fontSize: "0.68rem", color: "#93C5FD" }}>✓</span>}
                              <span>{sz.label}</span>
                            </button>
                          );
                        })}

                        {/* B. Quick Dimension Presets */}
                        {quickPresets.map((preset) => {
                          const isSelected = !isCustomMode && selectedPresetKey === preset.label;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setSelectedPresetKey(preset.label);
                                setWidthFeet(preset.wFt);
                                setWidthInches(preset.wIn);
                                setLengthFeet(preset.lFt);
                                setLengthInches(preset.lIn);
                                setSizingMode("standard");
                                if (sizeAttribute) {
                                  const matched = standardSizes.find((s) =>
                                    s.label.toLowerCase().includes(preset.wFt) && s.label.toLowerCase().includes(preset.lFt)
                                  );
                                  if (matched) {
                                    handleSelectAttributeValue(sizeAttribute.id, matched.id);
                                  }
                                }
                              }}
                              style={{
                                padding: "5px 13px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: isSelected ? 700 : 500,
                                border: isSelected ? "1.5px solid #0F172A" : "1px solid #CBD5E1",
                                backgroundColor: isSelected ? "#0F172A" : "#FFFFFF",
                                color: isSelected ? "#FFFFFF" : "#334155",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                boxShadow: isSelected ? "0 2px 5px rgba(15, 23, 42, 0.15)" : "none",
                              }}
                            >
                              {isSelected && <span style={{ fontSize: "0.68rem", color: "#93C5FD" }}>✓</span>}
                              <span>{preset.label}</span>
                            </button>
                          );
                        })}

                        {/* C. Custom Size Dropdown Toggle Pill */}
                        {isCustomSizingEnabled && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = isCustomMode ? "standard" : "custom";
                              setSizingMode(next);
                              if (next === "custom") {
                                setSelectedPresetKey("__custom__");
                              }
                            }}
                            style={{
                              padding: "5px 14px",
                              borderRadius: "20px",
                              fontSize: "0.78rem",
                              fontWeight: isCustomMode ? 700 : 600,
                              border: isCustomMode ? "1.5px solid var(--theme, #FF4035)" : "1px dashed #94A3B8",
                              backgroundColor: isCustomMode ? "#FFF5F4" : "#F8FAFC",
                              color: isCustomMode ? "var(--theme, #FF4035)" : "#334155",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: isCustomMode ? "0 2px 6px rgba(255, 64, 53, 0.18)" : "none",
                            }}
                          >
                            <span>📐 Custom Size (Made to Measure)</span>
                            <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>{isCustomMode ? "▲" : "▼"}</span>
                          </button>
                        )}
                      </div>

                      {/* Compact, Small Custom Size Box in Dropdown */}
                      {isCustomMode && (
                        <div
                          style={{
                            maxWidth: "400px",
                            padding: "10px 14px",
                            backgroundColor: "#F8FAFC",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            marginTop: "6px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#334155" }}>
                              Exact Window / Recess Dimensions:
                            </span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--theme, #FF4035)" }}>
                              ₹{customRate.toFixed(2)} / {customUnitLabel}
                            </span>
                          </div>

                          <div className="row g-2 align-items-center mb-2">
                            {hasWidth && (
                              <div className="col-6">
                                <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "2px" }}>
                                  Width (Across)
                                </label>
                                <div className="d-flex align-items-center gap-1">
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      value={widthFeet}
                                      onChange={(e) => {
                                        setWidthFeet(e.target.value);
                                        setSelectedPresetKey("__custom__");
                                      }}
                                      placeholder="0"
                                      style={{
                                        width: "100%",
                                        padding: "3px 20px 3px 6px",
                                        borderRadius: "4px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        color: "#0F172A",
                                        height: "26px",
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.65rem", fontWeight: 600 }}>
                                      ft
                                    </span>
                                  </div>
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      max="11"
                                      value={widthInches}
                                      onChange={(e) => {
                                        setWidthInches(e.target.value);
                                        setSelectedPresetKey("__custom__");
                                      }}
                                      placeholder="0"
                                      style={{
                                        width: "100%",
                                        padding: "3px 20px 3px 6px",
                                        borderRadius: "4px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        color: "#0F172A",
                                        height: "26px",
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.65rem", fontWeight: 600 }}>
                                      in
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className={hasWidth ? "col-6" : "col-12"}>
                              <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "2px" }}>
                                {hasWidth ? "Height / Drop" : "Length"}
                              </label>
                              <div className="d-flex align-items-center gap-1">
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    value={lengthFeet}
                                    onChange={(e) => {
                                      setLengthFeet(e.target.value);
                                      setSelectedPresetKey("__custom__");
                                    }}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      padding: "3px 20px 3px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      color: "#0F172A",
                                      height: "26px",
                                      background: "#FFFFFF",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.65rem", fontWeight: 600 }}>
                                    ft
                                  </span>
                                </div>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={lengthInches}
                                    onChange={(e) => {
                                      setLengthInches(e.target.value);
                                      setSelectedPresetKey("__custom__");
                                    }}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      padding: "3px 20px 3px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      color: "#0F172A",
                                      height: "26px",
                                      background: "#FFFFFF",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.65rem", fontWeight: 600 }}>
                                    in
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compact 1-line Calculation Summary */}
                          <div className="d-flex align-items-center justify-content-between pt-1" style={{ borderTop: "1px solid #E2E8F0", fontSize: "0.74rem" }}>
                            <span style={{ color: "#64748B" }}>
                              Area: <strong style={{ color: "#0F172A" }}>{customTotalMeasurement} {customUnitLabel}</strong>
                            </span>
                            <span style={{ fontWeight: 700, color: "#0F172A" }}>
                              Calculated Price: <strong style={{ color: "var(--theme, #FF4035)" }}>₹{customEstimatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══════════════════════════════════════════════════════════════ */}
                  {/* 2. COLOR SHADES & OTHER ATTRIBUTES (BELOW DIMENSIONS)          */}
                  {/* Clicking color shifts gallery to ONLY that color's photos!     */}
                  {/* ══════════════════════════════════════════════════════════════ */}
                  {product.has_variations && nonSizeAttributes.length > 0 && (
                    <div className="product-details mb-3">
                      {nonSizeAttributes.map((attr: { id: number; name: string; slug: string }) => {
                        const attrValuesMap = new Map<number, string>();
                        (variations || []).forEach((v) => {
                          (v.values || []).forEach((val) => {
                            if (val.attribute_id === attr.id) {
                              attrValuesMap.set(val.value_id, val.value_label);
                            }
                          });
                        });
                        const availableValues = Array.from(attrValuesMap.entries());
                        const isColor = isColorAttribute(attr.name);

                        return (
                          <div key={attr.id} className="mb-2">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span style={{ fontWeight: 700, color: "#64748B", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {attr.name}:
                              </span>
                              {selectedAttributeValues[attr.id] && (
                                <span style={{ fontSize: "0.78rem", color: isColor ? "var(--theme, #FF4035)" : "#0F172A", fontWeight: 700 }}>
                                  {attrValuesMap.get(selectedAttributeValues[attr.id])}
                                </span>
                              )}
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              {availableValues.map(([valId, valLabel]) => {
                                const isSelected = selectedAttributeValues[attr.id] === valId;
                                const valColorCode = (() => {
                                  for (const v of variations || []) {
                                    for (const val of v.values || []) {
                                      if (val.value_id === valId && val.color_code) return val.color_code;
                                    }
                                  }
                                  const fromAll = (allAttributes || []).find((a) => a.id === attr.id);
                                  const foundVal = fromAll?.values?.find((v) => v.id === valId);
                                  return getColorHex(valLabel, foundVal?.color_code);
                                })();

                                if (isColor) {
                                  return (
                                    <button
                                      key={valId}
                                      type="button"
                                      onClick={() => handleSelectAttributeValue(attr.id, valId)}
                                      title={`Select shade: ${valLabel} (view photos)`}
                                      style={{
                                        border: isSelected ? "2px solid var(--theme, #FF4035)" : "1.5px solid #E2E8F0",
                                        background: isSelected ? "#FFF5F4" : "#FFFFFF",
                                        color: isSelected ? "var(--theme, #FF4035)" : "#334155",
                                        padding: "5px 12px 5px 7px",
                                        borderRadius: "20px",
                                        fontWeight: isSelected ? 700 : 500,
                                        fontSize: "0.8rem",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        boxShadow: isSelected ? "0 2px 6px rgba(255, 64, 53, 0.2)" : "none",
                                      }}
                                    >
                                      {/* Round Visual Color Swatch Dot */}
                                      <span
                                        style={{
                                          width: "16px",
                                          height: "16px",
                                          borderRadius: "50%",
                                          backgroundColor: valColorCode,
                                          display: "inline-block",
                                          border:
                                            valColorCode === "#FFFFFF" || valColorCode === "#FAF7F2" || valColorCode === "#F8FAFC"
                                              ? "1.5px solid #CBD5E1"
                                              : "1px solid rgba(0,0,0,0.15)",
                                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span>{valLabel}</span>
                                      {isSelected && <span style={{ fontSize: "0.75rem", fontWeight: 900 }}>✓</span>}
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    key={valId}
                                    type="button"
                                    onClick={() => handleSelectAttributeValue(attr.id, valId)}
                                    style={{
                                      border: isSelected ? "1.5px solid #0F172A" : "1px solid #E2E8F0",
                                      background: isSelected ? "#0F172A" : "#FFFFFF",
                                      color: isSelected ? "#FFFFFF" : "#334155",
                                      padding: "5px 12px",
                                      borderRadius: "6px",
                                      fontWeight: isSelected ? 600 : 500,
                                      fontSize: "0.8rem",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      boxShadow: isSelected ? "0 1px 3px rgba(15, 23, 42, 0.12)" : "none",
                                    }}
                                  >
                                    {isSelected && <span style={{ fontSize: "0.7rem", color: "#93C5FD" }}>✓</span>}
                                    {valLabel}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* B2B MOQ Alert Banner */}
                  {isApprovedDealer && quantity < moq && (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#FEF2F2",
                        border: "1.5px solid #F87171",
                        color: "#991B1B",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        marginBottom: "12px",
                      }}
                    >
                      <i className="fa-solid fa-triangle-exclamation" style={{ color: "#DC2626", fontSize: "1.1rem", flexShrink: 0 }}></i>
                      <div style={{ flex: 1 }}>
                        <span>
                          Minimum B2B order requirement is <strong>{moq} units</strong>. You currently have <strong>{quantity} unit(s)</strong> selected.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantity(moq)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          border: "none",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Set to {moq} units
                      </button>
                    </div>
                  )}

                  {isApprovedDealer && quantity >= moq && moq > 1 && (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        color: "#065F46",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        marginBottom: "10px",
                      }}
                    >
                      <i className="fa-solid fa-circle-check" style={{ color: "#10B981" }}></i>
                      <span>B2B Minimum Order requirement satisfied ({quantity} units selected at ₹{displayPrice.toFixed(2)}/unit).</span>
                    </div>
                  )}

                  {/* Quantity and Actions */}
                  <div className="actions mb-3 d-flex align-items-center gap-2 flex-wrap">
                    {/* Compact Quantity */}
                    <div
                      className="d-flex align-items-center"
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        overflow: "hidden",
                        height: "38px",
                        background: "#F8FAFC",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        style={{
                          border: "none",
                          background: "transparent",
                          width: "30px",
                          height: "38px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Decrease quantity"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min={1}
                        max={displayStock || 99}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          border: "none",
                          background: "transparent",
                          width: "36px",
                          height: "38px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "#0F172A",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(displayStock || 99, q + 1))}
                        style={{
                          border: "none",
                          background: "transparent",
                          width: "30px",
                          height: "38px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Increase quantity"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      style={{
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.6 : 1,
                        height: "38px",
                        padding: "0 18px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        backgroundColor: "var(--theme, #FF4035)",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        boxShadow: "0 1px 3px rgba(255, 64, 53, 0.2)",
                      }}
                    >
                      <i className="fa-regular fa-cart-shopping"></i>
                      <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                    </button>

                    {/* Buy Now */}
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      style={{
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.6 : 1,
                        height: "38px",
                        padding: "0 18px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        backgroundColor: "#0F172A",
                        border: "1px solid #0F172A",
                        color: "#FFFFFF",
                        borderRadius: "6px",
                        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                      }}
                    >
                      <i className="fa-solid fa-bolt" style={{ color: "#FBBF24" }}></i>
                      <span>Buy Now</span>
                    </button>

                    {/* Compact Wishlist Icon Button */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      title={inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
                      style={{
                        cursor: "pointer",
                        width: "38px",
                        height: "38px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: inWishlist ? "#FEF2F2" : "#FFFFFF",
                        border: inWishlist ? "1px solid #FECACA" : "1px solid #CBD5E1",
                        borderRadius: "6px",
                        color: inWishlist ? "#DC2626" : "#64748B",
                        transition: "all 0.15s ease",
                      }}
                      aria-label="Wishlist"
                    >
                      <i
                        className={`fa-heart ${inWishlist ? "fa-solid text-danger" : "fa-regular"}`}
                        style={{ fontSize: "0.95rem" }}
                      ></i>
                    </button>

                    {/* Compact WhatsApp Button */}
                    <button
                      type="button"
                      onClick={isCustomMode ? handleSendWhatsApp : handleStandardWhatsAppQuote}
                      title="Get quote on WhatsApp"
                      style={{
                        cursor: "pointer",
                        height: "38px",
                        padding: "0 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "#22C55E",
                        border: "none",
                        color: "#FFFFFF",
                        borderRadius: "6px",
                        boxShadow: "0 1px 3px rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ fontSize: "1rem" }} />
                      <span>Get Quote</span>
                    </button>
                  </div>

                  {/* B2B Live Order Total Preview */}
                  {isApprovedDealer && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        fontSize: "0.82rem",
                        color: "#475569",
                        marginBottom: "12px",
                      }}
                    >
                      B2B Estimated Order Total ({quantity} units × ₹{displayPrice.toFixed(2)}):{" "}
                      <strong style={{ color: "var(--theme, #FF4035)", fontSize: "0.95rem" }}>
                        ₹{(quantity * displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  )}

                  {/* Product Details Footer & Social Share */}
                  <div
                    className="product-details-footer pt-3 mt-4"
                    style={{ borderTop: "1px solid #E2E8F0" }}
                  >
                    <div className="share d-flex align-items-center gap-3">
                      <span style={{ fontWeight: 600, color: "#64748B", fontSize: "0.9rem" }}>
                        Share:
                      </span>
                      <ul
                        className="social-media d-flex gap-2"
                        style={{ listStyle: "none", padding: 0, margin: 0 }}
                      >
                        {[
                          { icon: "fa-brands fa-facebook-f", url: "https://facebook.com" },
                          { icon: "fa-brands fa-twitter", url: "https://twitter.com" },
                          { icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com" },
                          { icon: "fa-brands fa-youtube", url: "https://youtube.com" },
                        ].map((s, i) => (
                          <li key={i}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                border: "1px solid #E2E8F0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748B",
                                textDecoration: "none",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--theme)";
                                e.currentTarget.style.color = "#FFFFFF";
                                e.currentTarget.style.borderColor = "var(--theme)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#64748B";
                                e.currentTarget.style.borderColor = "#E2E8F0";
                              }}
                            >
                              <i className={s.icon}></i>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description, Specs & Reviews Tabs */}
            <div className="row mt-5 pt-4">
              <div className="col-12">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    borderBottom: "2px solid #E2E8F0",
                    marginBottom: "30px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("desc")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: activeTab === "desc" ? "#0F172A" : "#64748B",
                      borderBottom: activeTab === "desc" ? "2px solid #0F172A" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Product Description
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("specs")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: activeTab === "specs" ? "#0F172A" : "#64748B",
                      borderBottom: activeTab === "specs" ? "2px solid #0F172A" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Specifications
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: activeTab === "reviews" ? "#0F172A" : "#64748B",
                      borderBottom: activeTab === "reviews" ? "2px solid #0F172A" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Reviews ({reviews.length})
                  </button>
                </div>

                {/* Tab: Description rendered exactly as added in description boxes */}
                {activeTab === "desc" && (
                  <div
                    className="product-description"
                    style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem" }}
                    dangerouslySetInnerHTML={{
                      __html: formatDescriptionHtml(
                        product.description ||
                        product.short_description ||
                        "Detailed product overview and material specifications coming soon."
                      ),
                    }}
                  />
                )}

                {/* Tab: Specs */}
                {activeTab === "specs" && (
                  <div className="table-responsive">
                    <table className="table table-bordered" style={{ maxWidth: "720px" }}>
                      <tbody>
                        <tr>
                          <th style={{ width: "220px", background: "#F8FAFC", color: "#1E293B" }}>SKU Code</th>
                          <td><strong style={{ color: "var(--theme)" }}>{displaySku}</strong></td>
                        </tr>
                        <tr>
                          <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Category</th>
                          <td>{product.category_name}</td>
                        </tr>
                        {currentVariation?.values && currentVariation.values.length > 0 ? (
                          currentVariation.values.map((val) => (
                            <tr key={val.attribute_id}>
                              <th style={{ background: "#F8FAFC", color: "#1E293B" }}>{val.attribute_name}</th>
                              <td>{val.value_label}</td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr>
                              <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Primary Material</th>
                              <td>Kiln-Dried Hardwood, Architectural Veneer & Precision Metal Joinery</td>
                            </tr>
                            <tr>
                              <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Finish</th>
                              <td>Hand-Applied Matte Protective Lacquer & UV Resistant Coating</td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Stock Availability</th>
                          <td>
                            {displayStock > 0 ? (
                              <span style={{ color: "#10B981", fontWeight: 600 }}>
                                {displayStock} Units Available (Ready for Immediate Dispatch)
                              </span>
                            ) : (
                              <span style={{ color: "#EF4444", fontWeight: 600 }}>Made to Order (Approx. 2-3 weeks)</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Craftsmanship Warranty</th>
                          <td>3-Year Comprehensive Wall Street Interiors Warranty on Structural Joinery</td>
                        </tr>
                        <tr>
                          <th style={{ background: "#F8FAFC", color: "#1E293B" }}>Delivery & Installation</th>
                          <td>White-Glove Pan-India Doorstep Delivery with On-site Specialist Assembly</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tab: Reviews */}
                {activeTab === "reviews" && (
                  <div>
                    <div className="product-review mb-5">
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", marginBottom: "20px" }}>
                        {reviews.length.toString().padStart(2, "0")} Customer Reviews
                      </h3>
                      {reviews.length > 0 ? (
                        <ul className="comment-list" style={{ listStyle: "none", padding: 0 }}>
                          {reviews.map((rev) => (
                            <li
                              key={rev.id}
                              className="review comment-item mb-4 pb-4"
                              style={{ borderBottom: "1px solid #E2E8F0" }}
                            >
                              <div className="post-comment d-flex gap-3">
                                <div className="comment-avater">
                                  {rev.avatar ? (
                                    <img
                                      src={rev.avatar}
                                      alt={rev.author}
                                      style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "54px",
                                        height: "54px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--theme-soft, #FFF1F0)",
                                        color: "var(--theme, #FF4035)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "1.2rem",
                                      }}
                                    >
                                      {rev.author?.charAt(0) || "U"}
                                    </div>
                                  )}
                                </div>
                                <div className="comment-content flex-1">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h4 className="name" style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                                      {rev.author}
                                    </h4>
                                    <div className="commented-on" style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                                      {rev.date}
                                    </div>
                                  </div>
                                  <ul
                                    className="star d-flex mb-2"
                                    style={{ listStyle: "none", padding: 0, margin: 0, color: "#F59E0B" }}
                                  >
                                    {[...Array(5)].map((_, idx) => (
                                      <li key={idx} style={{ marginRight: "2px" }}>
                                        <i
                                          className={
                                            idx < rev.rating ? "fa-solid fa-star" : "fa-regular fa-star"
                                          }
                                        ></i>
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="text" style={{ color: "#475569", margin: 0, lineHeight: 1.6 }}>
                                    {rev.comment}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div
                          style={{
                            padding: "36px 24px",
                            textAlign: "center",
                            background: "#F8FAFC",
                            borderRadius: "12px",
                            border: "1px dashed #CBD5E1",
                            color: "#64748B",
                            marginBottom: "30px",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "0.95rem" }}>
                            No reviews yet for this product. Be the first to share your experience!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Add a review form */}
                    <div className="comment-form mt-4" style={{ maxWidth: "800px" }}>
                      <div className="form-title mb-4">
                        <h3 className="inner-title" style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F172A" }}>
                          Add a Review
                        </h3>
                        <p style={{ color: "#64748B", fontSize: "0.9rem" }}>
                          Your email address will not be published. Required fields are marked *
                        </p>
                        <div className="rating d-flex align-items-center gap-3 mt-3">
                          <p style={{ margin: 0, fontWeight: 600, color: "#1E293B" }}>Rate this product: *</p>
                          <ul
                            className="star d-flex"
                            style={{ listStyle: "none", padding: 0, margin: 0, cursor: "pointer", color: "#F59E0B" }}
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <li
                                key={star}
                                onClick={() => setReviewRating(star)}
                                style={{ marginRight: "4px", fontSize: "1.2rem" }}
                              >
                                <i className={star <= reviewRating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {reviewSuccess && (
                        <div
                          style={{
                            padding: "12px 18px",
                            backgroundColor: "#ECFDF5",
                            color: "#065F46",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            border: "1px solid #10B981",
                            fontWeight: 600,
                          }}
                        >
                          <i className="fa-solid fa-circle-check me-2"></i>
                          Your review was posted successfully!
                        </div>
                      )}

                      <form onSubmit={handleReviewSubmit}>
                        <div className="row g-3">
                          <div className="col-md-6 form-group">
                            <input
                              type="text"
                              placeholder="Your Name *"
                              required
                              value={reviewName}
                              onChange={(e) => setReviewName(e.target.value)}
                              className="form-control"
                              style={{ padding: "12px 16px", borderRadius: "8px" }}
                            />
                          </div>
                          <div className="col-md-6 form-group">
                            <input
                              type="email"
                              placeholder="Your Email *"
                              required
                              value={reviewEmail}
                              onChange={(e) => setReviewEmail(e.target.value)}
                              className="form-control"
                              style={{ padding: "12px 16px", borderRadius: "8px" }}
                            />
                          </div>
                          <div className="col-12 form-group">
                            <textarea
                              placeholder="Write your review here *"
                              required
                              rows={4}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="form-control"
                              style={{ padding: "12px 16px", borderRadius: "8px" }}
                            ></textarea>
                          </div>
                          <div className="col-12 form-group mb-0">
                            <button
                              type="submit"
                              className="theme-btn"
                              style={{ cursor: "pointer", padding: "12px 28px" }}
                            >
                              <span>Post A Comment</span>
                              <i className="fa-sharp fa-regular fa-arrow-right-long bg-transparent text-white ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-5 pt-5" style={{ borderTop: "1px solid #E2E8F0" }}>
                <div className="section-title text-center mb-5">
                  <h6 className="subtitle" style={{ color: "var(--theme)", fontWeight: 700, textTransform: "uppercase" }}>
                    Handpicked Recommendations
                  </h6>
                  <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A" }}>
                    Related Products
                  </h2>
                </div>

                <div className="row g-4">
                  {relatedProducts.map((rel) => (
                    <div key={rel.id} className="col-xl-3 col-lg-4 col-md-6">
                      <div
                        className="best-seller-product-items-two item-border"
                        style={{
                          background: "#FFFFFF",
                          borderRadius: "14px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div className="icon-box2">
                          <Link href={`/product/${rel.slug}`} title="View Details">
                            <i className="fa-regular fa-eye"></i>
                          </Link>
                          <Link href="/wishlist" title="Wishlist">
                            <i className="fa-regular fa-heart"></i>
                          </Link>
                          <button
                            type="button"
                            onClick={() => showNotification(`Added "${rel.name}" to cart!`)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                            title="Add to Cart"
                          >
                            <i className="fa-light fa-bag-shopping"></i>
                          </button>
                        </div>

                        {rel.badge && (
                          <div className="best-seller-product-items-two__badge1">
                            {rel.badge}
                          </div>
                        )}

                        <div
                          className="best-seller-product-items-two__thumb"
                          style={{
                            padding: 0,
                            width: "100%",
                            height: "220px",
                            overflow: "hidden",
                            position: "relative",
                            backgroundColor: "#F8FAFC",
                          }}
                        >
                          {rel.image && rel.image.trim() !== "" ? (
                            <Link href={`/product/${rel.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                              <img
                                src={rel.image}
                                alt={rel.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                  transition: "transform 0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                              />
                            </Link>
                          ) : null}
                        </div>

                        <div className="best-seller-product-items-two__content p-3 mt-auto">
                          <div className="best-seller-product-items-two__details">
                            <p className="best-seller-product-items-two__details--subtitle">
                              {rel.category_name}
                            </p>
                            <h6 className="best-seller-product-items-two__details--title">
                              <Link href={`/product/${rel.slug}`}>{rel.name}</Link>
                            </h6>
                            <div className="best-seller-product-items-two__details--price">
                              <span className="offer-price">₹{rel.price.toFixed(2)}</span>
                              {rel.original_price && (
                                <span className="original-price">₹{rel.original_price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
