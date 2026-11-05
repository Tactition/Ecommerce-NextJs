"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/actions/products";
import { ProductVariation, ProductAttribute } from "@/lib/actions/variations";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";
import ProductImageGallery from "@/components/shop/ProductImageGallery";

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

  // When variation changes, update image ONLY if variation has a custom image distinctly different from product.image
  React.useEffect(() => {
    const varImg = currentVariation?.image?.trim();
    if (varImg && varImg !== product.image && !varImg.startsWith("/images/products/")) {
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

  // Build unique product gallery images from main image + product gallery_images + variation images
  const galleryImages = useMemo(() => {
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

    const customVarImages = (variations || [])
      .map((v) => v.image?.trim())
      .filter((img): img is string => Boolean(img && img !== product.image && !img.startsWith("/images/products/")));

    return Array.from(
      new Set(
        [
          product.image,
          ...extraGallery,
          ...customVarImages,
        ].filter((img): img is string => Boolean(img && typeof img === "string" && img.trim() !== ""))
      )
    );
  }, [product.image, product.gallery_images, variations]);

  const handleGallerySelectImage = (img: string) => {
    setActiveImage(img);
    setUserSelectedGalleryImage(true);
    // Auto-select matched variation if this image is specific to one
    const matchedVar = (variations || []).find((v) => v.image === img && v.values && v.values.length > 0);
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
  const customMinPriceApplied = customMinPrice > 0 && rawCustomPrice < customMinPrice;
  const customEstimatedPrice = customMinPriceApplied ? customMinPrice : rawCustomPrice;

  // Dynamic values
  const displayPrice = isCustomMode
    ? customEstimatedPrice
    : currentVariation
    ? currentVariation.price
    : product.price;
  const displayOriginalPrice = isCustomMode
    ? null
    : currentVariation
    ? currentVariation.original_price
    : product.original_price;
  const displayStock = isCustomMode ? 99 : currentVariation ? currentVariation.stock : product.stock;
  const isOutOfStock = !isCustomMode && displayStock <= 0;
  const displaySku = isCustomMode
    ? `${currentVariation?.sku || `WSI-${product.id.toString().padStart(5, "0")}`}-CUSTOM`
    : currentVariation?.sku || `WSI-${product.id.toString().padStart(5, "0")}`;

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
    setSelectedAttributeValues((prev) => ({
      ...prev,
      [attrId]: valId,
    }));
  };

  const handleAddToCart = (): boolean => {
    if (!requireAuth("cart")) {
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

      if (customMinPriceApplied) {
        attributeMap["Minimum Charge"] = `₹${customMinPrice.toFixed(2)} applied`;
      }

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
          minPrice: customMinPrice,
          minPriceApplied: customMinPriceApplied,
          calculatedPrice: customEstimatedPrice,
          formulaSummary: `${customFormulaText} × ₹${customRate} = ₹${customEstimatedPrice}`,
        },
        sku: displaySku,
        maxStock: 99,
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
    if (!requireAuth("checkout")) {
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
      customMinPriceApplied ? `• Minimum Base Order Charge: ₹${customMinPrice.toFixed(2)} (applied)` : null,
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

                  {/* Price Area with Transparent Rate */}
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <h2
                      className="product-price"
                      style={{
                        fontSize: "1.65rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{Number(displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h2>

                    {displayOriginalPrice && Number(displayOriginalPrice) > Number(displayPrice) && (
                      <span
                        style={{
                          fontSize: "1.05rem",
                          color: "#94A3B8",
                          textDecoration: "line-through",
                          fontWeight: 400,
                        }}
                      >
                        ₹{Number(displayOriginalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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

                    {customMinPrice > 0 && isCustomSizingEnabled && (
                      <span
                        style={{
                          backgroundColor: "#FEF9C3",
                          color: "#854D0E",
                          border: "1px solid #FEF08A",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                        title="Minimum base charge for small custom cuts"
                      >
                        Min. Order: ₹{customMinPrice.toFixed(0)}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p
                    className="text"
                    style={{
                      color: "#64748B",
                      fontSize: "0.86rem",
                      lineHeight: 1.6,
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    {product.short_description ||
                      product.description ||
                      "Engineered with certified high-fidelity components, robust joinery, and precision architectural finishing to deliver exceptional luxury aesthetics and long-lasting durability."}
                  </p>

                  {/* ══════════════════════════════════════════════════════════════ */}
                  {/* SIZING & TRANSPARENT CUSTOM PRICE CALCULATION                  */}
                  {/* Shows exact rate, dimensions, and live math breakdown          */}
                                                      {/* ══════════════════════════════════════════════════════════════ */}
                  {/* 1. ADMIN VARIATIONS (Color, Fabric, Control Mechanism...) */}
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

                        return (
                          <div key={attr.id} className="mb-2">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span style={{ fontWeight: 700, color: "#64748B", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {attr.name}:
                              </span>
                              {selectedAttributeValues[attr.id] && (
                                <span style={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 600 }}>
                                  {attrValuesMap.get(selectedAttributeValues[attr.id])}
                                </span>
                              )}
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              {availableValues.map(([valId, valLabel]) => {
                                const isSelected = selectedAttributeValues[attr.id] === valId;
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

                  {/* ══════════════════════════════════════════════════════════════ */}
                  {/* 2. REAL SIZE DROPDOWN (Standard Sizes & Custom Sizing)          */}
                  {/* ══════════════════════════════════════════════════════════════ */}
                  {(hasStandardSizes || isCustomSizingEnabled) && (
                    <div className="mb-3" style={{ maxWidth: "420px" }}>
                      <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Size / Dimensions:
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={
                            isCustomMode
                              ? "__custom__"
                              : sizeAttribute && selectedAttributeValues[sizeAttribute.id]
                              ? String(selectedAttributeValues[sizeAttribute.id])
                              : "__standard__"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__custom__") {
                              setSizingMode("custom");
                            } else {
                              setSizingMode("standard");
                              if (sizeAttribute && val !== "__standard__") {
                                handleSelectAttributeValue(sizeAttribute.id, Number(val));
                              }
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 36px 6px 12px",
                            borderRadius: "6px",
                            border: isCustomMode ? "1.5px solid #0F172A" : "1px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            color: "#0F172A",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            appearance: "none",
                            cursor: "pointer",
                            outline: "none",
                            height: "36px",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          }}
                        >
                          {hasStandardSizes ? (
                            <>
                              {standardSizes.map((sz) => (
                                <option key={sz.id} value={String(sz.id)}>
                                  {sz.label} (Standard Size)
                                </option>
                              ))}
                            </>
                          ) : (
                            <option value="__standard__">
                              Standard Size (Included with Variation)
                            </option>
                          )}
                          {isCustomSizingEnabled && (
                            <option value="__custom__">
                              📐 Made to Measure — Custom Fit (₹{customRate.toFixed(2)} / {customUnitLabel})
                            </option>
                          )}
                        </select>
                      </div>

                      {/* When Custom Sizing is Selected: Compact, Elegant Card */}
                      {isCustomMode && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "10px 12px",
                            backgroundColor: "#F8FAFC",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#334155" }}>
                              Exact Dimensions:
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#0F172A",
                                backgroundColor: "#E2E8F0",
                                padding: "2px 7px",
                                borderRadius: "4px",
                              }}
                            >
                              ₹{customRate.toFixed(2)} / {customUnitLabel}
                            </span>
                          </div>

                          <div className="row g-2 align-items-center mb-2">
                            {hasWidth && (
                              <div className="col-6">
                                <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "2px" }}>
                                  Width (Across)
                                </label>
                                <div className="d-flex align-items-center gap-1">
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      value={widthFeet}
                                      onChange={(e) => setWidthFeet(e.target.value)}
                                      placeholder="0"
                                      style={{
                                        width: "100%",
                                        padding: "4px 22px 4px 6px",
                                        borderRadius: "4px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "#0F172A",
                                        outline: "none",
                                        height: "28px",
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.68rem", fontWeight: 600 }}>
                                      ft
                                    </span>
                                  </div>
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      max="11"
                                      value={widthInches}
                                      onChange={(e) => setWidthInches(e.target.value)}
                                      placeholder="0"
                                      style={{
                                        width: "100%",
                                        padding: "4px 22px 4px 6px",
                                        borderRadius: "4px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "#0F172A",
                                        outline: "none",
                                        height: "28px",
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.68rem", fontWeight: 600 }}>
                                      in
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className={hasWidth ? "col-6" : "col-12"}>
                              <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "2px" }}>
                                {hasWidth ? "Height / Drop" : "Length"}
                              </label>
                              <div className="d-flex align-items-center gap-1">
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    value={lengthFeet}
                                    onChange={(e) => setLengthFeet(e.target.value)}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      padding: "4px 22px 4px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      color: "#0F172A",
                                      outline: "none",
                                      height: "28px",
                                      background: "#FFFFFF",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.68rem", fontWeight: 600 }}>
                                    ft
                                  </span>
                                </div>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={lengthInches}
                                    onChange={(e) => setLengthInches(e.target.value)}
                                    placeholder="0"
                                    style={{
                                      width: "100%",
                                      padding: "4px 22px 4px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      color: "#0F172A",
                                      outline: "none",
                                      height: "28px",
                                      background: "#FFFFFF",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.68rem", fontWeight: 600 }}>
                                    in
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Presets */}
                          <div className="d-flex align-items-center gap-1 flex-wrap mb-2">
                            <span style={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 500 }}>Presets:</span>
                            {[
                              { label: "3×4 ft", wF: "3", wI: "0", lF: "4", lI: "0" },
                              { label: "4×5 ft", wF: "4", wI: "0", lF: "5", lI: "0" },
                              { label: "5×6 ft", wF: "5", wI: "0", lF: "6", lI: "0" },
                              { label: "6×7 ft", wF: "6", wI: "0", lF: "7", lI: "0" },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setWidthFeet(preset.wF);
                                  setWidthInches(preset.wI);
                                  setLengthFeet(preset.lF);
                                  setLengthInches(preset.lI);
                                }}
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #CBD5E1",
                                  borderRadius: "4px",
                                  padding: "1px 6px",
                                  fontSize: "0.68rem",
                                  color: "#475569",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          {/* Live Calculated Price Summary */}
                          <div className="d-flex align-items-center justify-content-between pt-2" style={{ borderTop: "1px solid #E2E8F0", fontSize: "0.78rem" }}>
                            <span style={{ color: "#64748B" }}>
                              Area: <strong style={{ color: "#0F172A" }}>{customTotalMeasurement} {customUnitLabel}</strong>
                            </span>
                            <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>
                              Calculated: <strong style={{ color: "var(--theme, #FF4035)" }}>₹{customEstimatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                            </span>
                          </div>
                        </div>
                      )}
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
                      title="Chat with Srinagar Showroom on WhatsApp"
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
                      <span>Room Quote</span>
                    </button>
                  </div>

                  {/* Srinagar & Kashmir Importer-Direct Trust Strip */}
                  <div
                    style={{
                      marginTop: "16px",
                      marginBottom: "8px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#0F172A", fontSize: "0.78rem", marginBottom: "6px" }}>
                      <i className="fa-solid fa-certificate text-danger" style={{ fontSize: "0.8rem" }} />
                      <span>Wall Street Interiors — Importer-Direct Kashmir Advantage</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "6px", fontSize: "0.74rem", color: "#475569" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-solid fa-store" style={{ color: "#D4AF37", fontSize: "0.75rem" }} />
                        <span><strong>Showroom:</strong> New Habba Kadal Bridge, Srinagar</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-solid fa-warehouse" style={{ color: "#D4AF37", fontSize: "0.75rem" }} />
                        <span><strong>Godown:</strong> Fateh Kadal, Srinagar</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-solid fa-snowflake" style={{ color: "#2563EB", fontSize: "0.75rem" }} />
                        <span><strong>Sub-zero Tested:</strong> Kashmir winter proof</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-brands fa-whatsapp" style={{ color: "#22C55E", fontSize: "0.78rem" }} />
                        <span><strong>Direct Desk:</strong> +91 9018454526</span>
                      </div>
                    </div>
                  </div>

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

                {/* Tab: Description */}
                {activeTab === "desc" && (
                  <div className="product-description" style={{ color: "#475569", lineHeight: 1.8 }}>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>
                      Detailed Product Overview
                    </h3>
                    <p style={{ marginBottom: "16px" }}>
                      {product.description ||
                        "Every bespoke furniture piece and architectural finish from Wall Street Interiors is crafted to exacting standards using premium grade timbers, precision acoustic damping, and European hardware. Designed for high-end residential, boutique hospitality, and modern commercial interiors."}
                    </p>
                    <p>
                      Each architectural surface and furniture module is inspected under rigorous quality controls and protected in transit-grade protective wrapping to safeguard fine wood veneers, soft-close hinges, and luxury upholstery.
                    </p>
                  </div>
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
