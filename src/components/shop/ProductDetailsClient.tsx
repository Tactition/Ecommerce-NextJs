"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/actions/products";
import { ProductVariation, ProductAttribute } from "@/lib/actions/variations";
import { addToCart } from "@/lib/cart";
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
  const currentVariation = (variations || []).find((v) => {
    if (!v.values || v.values.length === 0) return false;
    return v.values.every((val) => selectedAttributeValues[val.attribute_id] === val.value_id);
  });

  // Active gallery image
  const [activeImage, setActiveImage] = useState<string>(product.image || "");

  // When variation changes, update image if variation has custom image
  React.useEffect(() => {
    if (currentVariation?.image && currentVariation.image.trim() !== "") {
      setActiveImage(currentVariation.image);
    } else if (product.image && product.image.trim() !== "") {
      setActiveImage(product.image);
    }
  }, [currentVariation, product.image]);

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

    return Array.from(
      new Set(
        [
          product.image,
          ...extraGallery,
          ...(variations || []).map((v) => v.image),
        ].filter((img): img is string => Boolean(img && typeof img === "string" && img.trim() !== ""))
      )
    );
  }, [product.image, product.gallery_images, variations]);

  const handleGallerySelectImage = (img: string) => {
    setActiveImage(img);
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

  // Custom Sizing in Feet State
  const isCustomSizingEnabled = Boolean(
    product.allow_custom_sizing || (product.custom_size_rate && Number(product.custom_size_rate) > 0)
  );
  const customRate = Number(product.custom_size_rate || 14);
  const customUnit = product.custom_size_unit || "sq_ft";
  const customMinPrice = Number(product.custom_size_min_price || 0);
  const customLinearMode = product.custom_size_linear_mode || "length_plus_width";

  const [sizingMode, setSizingMode] = useState<"standard" | "custom">("standard");
  const [lengthFeet, setLengthFeet] = useState<string>("6");
  const [lengthInches, setLengthInches] = useState<string>("3");
  const [widthFeet, setWidthFeet] = useState<string>("5");
  const [widthInches, setWidthInches] = useState<string>("0");

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
  const isCustomMode = isCustomSizingEnabled && sizingMode === "custom";
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
    const next = !inWishlist;
    setInWishlist(next);
    showNotification(
      next
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
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodeURIComponent(message)}`;

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
                  {/* Rating */}
                  <div className="rating d-flex align-items-center gap-2 mb-2">
                    <ul className="star d-flex" style={{ listStyle: "none", padding: 0, margin: 0, color: "#F59E0B" }}>
                      {[...Array(5)].map((_, i) => (
                        <li key={i} style={{ marginRight: "3px" }}>
                          <i
                            className={
                              i < Math.floor(product.rating || 5)
                                ? "fa-solid fa-star"
                                : "fa-regular fa-star"
                            }
                          ></i>
                        </li>
                      ))}
                    </ul>
                    <h6 style={{ margin: 0, color: "#64748B", fontSize: "0.9rem", fontWeight: 600 }}>
                      ({product.reviews_count || reviews.length} customer reviews)
                    </h6>
                  </div>

                  {/* Price */}
                  <div className="d-flex align-items-baseline gap-3 mb-3 flex-wrap">
                    <h3
                      className="product-price"
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        color: "var(--theme)",
                        margin: 0,
                      }}
                    >
                      ₹{Number(displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h3>
                    {isCustomMode && (
                      <span
                        style={{
                          backgroundColor: "#ECFDF5",
                          color: "#059669",
                          border: "1px solid #A7F3D0",
                          borderRadius: "20px",
                          padding: "4px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span>📐</span> Custom Size Estimate ({customTotalMeasurement} {customUnitLabel})
                      </span>
                    )}
                    {displayOriginalPrice && Number(displayOriginalPrice) > Number(displayPrice) && (
                      <span
                        style={{
                          fontSize: "1.3rem",
                          color: "#94A3B8",
                          textDecoration: "line-through",
                          fontWeight: 500,
                        }}
                      >
                        ₹{Number(displayOriginalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1
                    className="product-title"
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      marginBottom: "16px",
                      lineHeight: 1.25,
                    }}
                  >
                    {product.name}
                  </h1>

                  {/* Short Description */}
                  <p
                    className="text"
                    style={{
                      color: "#475569",
                      fontSize: "1rem",
                      lineHeight: 1.7,
                      marginBottom: "24px",
                    }}
                  >
                    {product.short_description ||
                      product.description ||
                      "Engineered with certified high-fidelity components, robust joinery, and precision architectural finishing to deliver exceptional luxury aesthetics and long-lasting durability."}
                  </p>

                  {/* Metadata Tags */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#F8FAFC",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      marginBottom: "24px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "20px",
                      fontSize: "0.88rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "#64748B", fontWeight: 500 }}>SKU: </span>
                      <strong style={{ color: "#0F172A" }}>{displaySku}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748B", fontWeight: 500 }}>Category: </span>
                      <strong style={{ color: "#0F172A" }}>{product.category_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748B", fontWeight: 500 }}>Brand: </span>
                      <strong style={{ color: "#0F172A" }}>{product.brand || "Wall Street Interiors"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748B", fontWeight: 500 }}>Availability: </span>
                      {displayStock > 0 ? (
                        <span style={{ color: "#10B981", fontWeight: 700 }}>
                          <i className="fa-solid fa-circle-check me-1"></i> In Stock ({displayStock} units)
                        </span>
                      ) : (
                        <span style={{ color: "#EF4444", fontWeight: 700 }}>Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Custom Sizing Mode & Panel */}
                  {isCustomSizingEnabled && (
                    <div
                      style={{
                        marginBottom: "24px",
                        padding: "18px 20px",
                        backgroundColor: isCustomMode ? "var(--bg-1, #FFF5F4)" : "#F8FAFC",
                        borderRadius: "14px",
                        border: isCustomMode ? "2px solid var(--theme, #FF4035)" : "1px solid #E2E8F0",
                        boxShadow: isCustomMode ? "0 6px 20px rgba(255, 64, 53, 0.1)" : "none",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div>
                          <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "0.98rem", display: "block" }}>
                            Sizing Options
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                            Choose from pre-set standard sizes or input custom feet dimensions
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSizingMode("standard")}
                            style={{
                              padding: "7px 16px",
                              borderRadius: "20px",
                              border: sizingMode === "standard" ? "2px solid var(--theme, #FF4035)" : "1px solid #CBD5E1",
                              backgroundColor: sizingMode === "standard" ? "var(--theme, #FF4035)" : "#FFFFFF",
                              color: sizingMode === "standard" ? "#FFFFFF" : "#475569",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: sizingMode === "standard" ? "0 2px 8px rgba(255, 64, 53, 0.25)" : "none",
                            }}
                          >
                            Standard Sizes
                          </button>
                          <button
                            type="button"
                            onClick={() => setSizingMode("custom")}
                            style={{
                              padding: "7px 16px",
                              borderRadius: "20px",
                              border: sizingMode === "custom" ? "2px solid var(--theme, #FF4035)" : "1px solid #CBD5E1",
                              backgroundColor: sizingMode === "custom" ? "var(--theme, #FF4035)" : "#FFFFFF",
                              color: sizingMode === "custom" ? "#FFFFFF" : "#475569",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: sizingMode === "custom" ? "0 2px 8px rgba(255, 64, 53, 0.25)" : "none",
                            }}
                          >
                            <span>📐</span> Custom Sizing (in feet)
                          </button>
                        </div>
                      </div>

                      {sizingMode === "custom" ? (
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1.5px solid rgba(255, 64, 53, 0.22)",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                          }}
                        >
                          {/* Calculator Header & Badges */}
                          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ fontWeight: 800, color: "var(--title, #0A111E)", fontSize: "0.95rem" }}>
                                📐 {customUnit === "sq_ft" ? "Square Feet Calculator (Area)" : "Linear Feet Calculator"}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  backgroundColor: "rgba(255, 64, 53, 0.08)",
                                  color: "var(--theme, #FF4035)",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontWeight: 700,
                                  border: "1px solid rgba(255, 64, 53, 0.2)",
                                }}
                              >
                                {customUnit === "sq_ft"
                                  ? "Area: Length × Width"
                                  : customLinearMode === "single_length"
                                  ? "Running Length"
                                  : "Length + Width"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--theme, #FF4035)",
                                  fontWeight: 700,
                                  backgroundColor: "var(--bg-1, #FFF5F4)",
                                  padding: "4px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(255, 64, 53, 0.25)",
                                }}
                              >
                                Admin Rate: ₹{customRate.toFixed(2)} / {customUnitLabel}
                              </span>
                              {customMinPrice > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#B45309",
                                    fontWeight: 700,
                                    backgroundColor: "#FEF3C7",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #FDE68A",
                                  }}
                                >
                                  Min Charge: ₹{customMinPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dimensions Input Row */}
                          <div className="row g-3 mb-3">
                            {/* Length Inputs (Feet & Inches) */}
                            <div className={hasWidth ? "col-sm-6" : "col-12"}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", margin: 0 }}>
                                  Length *
                                </label>
                                <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                                  {lengthFtNum} ft {lengthInNum > 0 ? `${lengthInNum} in ` : ""}= <strong>{totalLengthFeet.toFixed(2)} ft</strong>
                                </span>
                              </div>
                              <div className="d-flex gap-2">
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={lengthFeet}
                                    onChange={(e) => setLengthFeet(e.target.value)}
                                    placeholder="Feet"
                                    aria-label="Length feet"
                                    style={{
                                      width: "100%",
                                      padding: "8px 32px 8px 10px",
                                      borderRadius: "8px",
                                      border: "1px solid #CBD5E1",
                                      fontWeight: 700,
                                      fontSize: "0.92rem",
                                      color: "#0F172A",
                                      outline: "none",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>
                                    ft
                                  </span>
                                </div>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    step="1"
                                    value={lengthInches}
                                    onChange={(e) => setLengthInches(e.target.value)}
                                    placeholder="Inches"
                                    aria-label="Length inches"
                                    style={{
                                      width: "100%",
                                      padding: "8px 32px 8px 10px",
                                      borderRadius: "8px",
                                      border: "1px solid #CBD5E1",
                                      fontWeight: 700,
                                      fontSize: "0.92rem",
                                      color: "#0F172A",
                                      outline: "none",
                                    }}
                                  />
                                  <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>
                                    in
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Width Inputs (Feet & Inches) */}
                            {hasWidth && (
                              <div className="col-sm-6">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", margin: 0 }}>
                                    Width / Height *
                                  </label>
                                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                                    {widthFtNum} ft {widthInNum > 0 ? `${widthInNum} in ` : ""}= <strong>{totalWidthFeet.toFixed(2)} ft</strong>
                                  </span>
                                </div>
                                <div className="d-flex gap-2">
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={widthFeet}
                                      onChange={(e) => setWidthFeet(e.target.value)}
                                      placeholder="Feet"
                                      aria-label="Width feet"
                                      style={{
                                        width: "100%",
                                        padding: "8px 32px 8px 10px",
                                        borderRadius: "8px",
                                        border: "1px solid #CBD5E1",
                                        fontWeight: 700,
                                        fontSize: "0.92rem",
                                        color: "#0F172A",
                                        outline: "none",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>
                                      ft
                                    </span>
                                  </div>
                                  <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                      type="number"
                                      min="0"
                                      max="11"
                                      step="1"
                                      value={widthInches}
                                      onChange={(e) => setWidthInches(e.target.value)}
                                      placeholder="Inches"
                                      aria-label="Width inches"
                                      style={{
                                        width: "100%",
                                        padding: "8px 32px 8px 10px",
                                        borderRadius: "8px",
                                        border: "1px solid #CBD5E1",
                                        fontWeight: 700,
                                        fontSize: "0.92rem",
                                        color: "#0F172A",
                                        outline: "none",
                                      }}
                                    />
                                    <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>
                                      in
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                            <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Quick Presets:</span>
                            {(customUnit === "sq_ft"
                              ? [
                                  { l: "6", lin: "3", w: "5", win: "0", label: "6'3\" × 5' (31.25 sq.ft)" },
                                  { l: "4", lin: "0", w: "2", win: "0", label: "4' × 2' (8 sq.ft)" },
                                  { l: "6", lin: "0", w: "3", win: "0", label: "6' × 3' (18 sq.ft)" },
                                  { l: "8", lin: "0", w: "4", win: "0", label: "8' × 4' (32 sq.ft)" },
                                  { l: "10", lin: "0", w: "5", win: "0", label: "10' × 5' (50 sq.ft)" },
                                ]
                              : customLinearMode === "length_plus_width"
                              ? [
                                  { l: "6", lin: "3", w: "5", win: "0", label: "6'3\" + 5' (11.25 linear ft)" },
                                  { l: "4", lin: "0", w: "3", win: "0", label: "4' + 3' (7 linear ft)" },
                                  { l: "8", lin: "0", w: "5", win: "0", label: "8' + 5' (13 linear ft)" },
                                  { l: "10", lin: "0", w: "6", win: "0", label: "10' + 6' (16 linear ft)" },
                                ]
                              : [
                                  { l: "6", lin: "3", w: "0", win: "0", label: "6'3\" (6.25 linear ft)" },
                                  { l: "10", lin: "0", w: "0", win: "0", label: "10' running" },
                                  { l: "15", lin: "0", w: "0", win: "0", label: "15' running" },
                                  { l: "20", lin: "0", w: "0", win: "0", label: "20' running" },
                                ]
                            ).map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setLengthFeet(preset.l);
                                  setLengthInches(preset.lin);
                                  setWidthFeet(preset.w);
                                  setWidthInches(preset.win);
                                }}
                                style={{
                                  background:
                                    lengthFeet === preset.l && lengthInches === preset.lin && widthFeet === preset.w && widthInches === preset.win
                                      ? "var(--bg-1, #FFF5F4)"
                                      : "#F8FAFC",
                                  border:
                                    lengthFeet === preset.l && lengthInches === preset.lin && widthFeet === preset.w && widthInches === preset.win
                                      ? "1.5px solid var(--theme, #FF4035)"
                                      : "1px solid #E2E8F0",
                                  color:
                                    lengthFeet === preset.l && lengthInches === preset.lin && widthFeet === preset.w && widthInches === preset.win
                                      ? "var(--theme, #FF4035)"
                                      : "#475569",
                                  borderRadius: "6px",
                                  padding: "5px 12px",
                                  fontSize: "0.76rem",
                                  fontWeight:
                                    lengthFeet === preset.l && lengthInches === preset.lin && widthFeet === preset.w && widthInches === preset.win
                                      ? 700
                                      : 500,
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          {/* Live Calculation Display Box */}
                          <div
                            style={{
                              padding: "16px 18px",
                              backgroundColor: "var(--bg-1, #FFF5F4)",
                              borderRadius: "10px",
                              border: "1.5px solid rgba(255, 64, 53, 0.22)",
                              boxShadow: "0 2px 8px rgba(255, 64, 53, 0.04)",
                            }}
                          >
                            <div
                              className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 pb-2"
                              style={{ borderBottom: "1px dashed rgba(255, 64, 53, 0.25)" }}
                            >
                              <div>
                                <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, display: "block" }}>
                                  Entered Dimensions:
                                </span>
                                <strong style={{ fontSize: "0.95rem", color: "#0F172A" }}>
                                  {lengthFtNum} ft {lengthInNum > 0 ? `${lengthInNum} in` : "0 in"} ({totalLengthFeet.toFixed(2)} ft)
                                  {hasWidth ? ` ${customUnit === "sq_ft" ? "×" : "+"} ${widthFtNum} ft ${widthInNum > 0 ? `${widthInNum} in` : "0 in"} (${totalWidthFeet.toFixed(2)} ft)` : ""}
                                </strong>
                              </div>
                              <div className="text-end">
                                <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, display: "block" }}>
                                  Billable {customUnit === "sq_ft" ? "Total Area" : "Measurement"}:
                                </span>
                                <strong style={{ fontSize: "1.15rem", color: "var(--theme, #FF4035)" }}>
                                  {customTotalMeasurement} {customUnitLabel}
                                </strong>
                              </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <div>
                                <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                                  <strong>Formula: </strong> {customFormulaText} × ₹{customRate.toFixed(2)}/{customUnitLabel}
                                </div>
                                {customMinPriceApplied && (
                                  <div style={{ fontSize: "0.76rem", color: "#B45309", fontWeight: 700, marginTop: "2px" }}>
                                    <i className="fa-solid fa-circle-info me-1"></i>
                                    Minimum order charge of ₹{customMinPrice.toFixed(2)} applied (calculated raw total: ₹{rawCustomPrice.toFixed(2)})
                                  </div>
                                )}
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "0.76rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>
                                  Estimated Price
                                </span>
                                <span style={{ fontSize: "1.7rem", color: "var(--theme, #FF4035)", fontWeight: 900, lineHeight: 1.1 }}>
                                  ₹{customEstimatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* WhatsApp Business Manager Requirements Dispatch Section */}
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "16px 18px",
                              backgroundColor: "#F0FDF4",
                              border: "1.5px solid #86EFAC",
                              borderRadius: "10px",
                              boxShadow: "0 2px 10px rgba(34, 197, 94, 0.08)",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: "#25D366",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#FFFFFF",
                                    flexShrink: 0,
                                    boxShadow: "0 2px 6px rgba(37, 211, 102, 0.4)",
                                  }}
                                >
                                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                  </svg>
                                </div>
                                <div>
                                  <span style={{ fontWeight: 800, color: "#14532D", fontSize: "0.88rem", display: "block" }}>
                                    Send Sizing Requirements to Business Manager
                                  </span>
                                  <span style={{ fontSize: "0.75rem", color: "#166534" }}>
                                    Official Business Desk: <strong>{displayWhatsAppNumber}</strong>
                                  </span>
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  backgroundColor: "#DCFCE7",
                                  color: "#15803D",
                                  padding: "3px 9px",
                                  borderRadius: "12px",
                                  fontWeight: 700,
                                  border: "1px solid #BBF7D0",
                                }}
                              >
                                <i className="fa-solid fa-bolt me-1"></i> Instant Quote & Site Help
                              </span>
                            </div>

                            {/* Optional Customer Note / Requirements */}
                            <div className="mb-3">
                              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534", display: "block", marginBottom: "4px" }}>
                                Specific Requirements or Room Notes (Optional):
                              </label>
                              <input
                                type="text"
                                value={customNotes}
                                onChange={(e) => setCustomNotes(e.target.value)}
                                placeholder="e.g. Master Bedroom accent wall, acoustic backing needed, request site visit..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid #86EFAC",
                                  backgroundColor: "#FFFFFF",
                                  fontSize: "0.82rem",
                                  color: "#0F172A",
                                  outline: "none",
                                }}
                              />
                            </div>

                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={handleSendWhatsApp}
                                style={{
                                  flex: "1 1 220px",
                                  backgroundColor: "#25D366",
                                  color: "#FFFFFF",
                                  border: "none",
                                  padding: "10px 18px",
                                  borderRadius: "8px",
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "8px",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 12px rgba(37, 211, 102, 0.25)",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#20BA59")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <span>Send Requirements via WhatsApp</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleCopyWhatsAppText}
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  color: "#166534",
                                  border: "1px solid #86EFAC",
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                  fontSize: "0.82rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                title="Copy requirement summary text to clipboard"
                              >
                                <i className={`fa-solid ${copiedWhatsAppText ? "fa-check text-success" : "fa-copy"}`}></i>
                                <span>{copiedWhatsAppText ? "Copied!" : "Copy Details"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                          Showing pre-set standard sizes below. Need a specific room or wall fit? Switch to <strong>Custom Sizing (in feet)</strong>.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Product Variations */}
                  {product.has_variations && productAttributes.length > 0 && (
                    <div className="product-details mb-4">
                      {productAttributes
                        .filter((attr) => {
                          if (sizingMode === "custom") {
                            return (
                              !attr.name.toLowerCase().includes("size") &&
                              !attr.name.toLowerCase().includes("dimen")
                            );
                          }
                          return true;
                        })
                        .map((attr: { id: number; name: string; slug: string }) => {
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
                          <div key={attr.id} className="mb-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span style={{ fontWeight: 700, color: "#1E293B", fontSize: "0.95rem" }}>
                                {attr.name}:
                              </span>
                              {selectedAttributeValues[attr.id] && (
                                <span style={{ fontSize: "0.88rem", color: "var(--theme)", fontWeight: 600 }}>
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
                                      border: isSelected ? "2px solid var(--theme)" : "1px solid #CBD5E1",
                                      background: isSelected ? "var(--theme)" : "#FFFFFF",
                                      color: isSelected ? "#FFFFFF" : "#1E293B",
                                      padding: "7px 16px",
                                      borderRadius: "8px",
                                      fontWeight: 600,
                                      fontSize: "0.88rem",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      boxShadow: isSelected ? "0 2px 6px rgba(255, 64, 53, 0.25)" : "none",
                                    }}
                                  >
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

                  {/* Quantity and Actions */}
                  <div className="actions mb-4 d-flex align-items-center gap-4 flex-wrap">
                    <div className="quantity">
                      <p style={{ margin: "0 0 6px 0", fontWeight: 600, fontSize: "0.88rem", color: "#64748B" }}>
                        Quantity
                      </p>
                      <div
                        className="qty-wrapper d-flex align-items-center"
                        style={{
                          border: "1px solid #CBD5E1",
                          borderRadius: "10px",
                          overflow: "hidden",
                          width: "130px",
                          background: "#F8FAFC",
                        }}
                      >
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          style={{
                            border: "none",
                            background: "transparent",
                            width: "38px",
                            height: "44px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            color: "#475569",
                          }}
                          aria-label="Decrease quantity"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          className="qty-input text-center"
                          value={quantity}
                          min={1}
                          max={displayStock || 99}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            border: "none",
                            background: "transparent",
                            width: "54px",
                            height: "44px",
                            fontWeight: 700,
                            color: "#0F172A",
                          }}
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity((q) => Math.min(displayStock || 99, q + 1))}
                          style={{
                            border: "none",
                            background: "transparent",
                            width: "38px",
                            height: "44px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            color: "#475569",
                          }}
                          aria-label="Increase quantity"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-end gap-3 flex-wrap" style={{ marginTop: "24px" }}>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`theme-btn ${isOutOfStock ? "disabled" : ""}`}
                        style={{
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          opacity: isOutOfStock ? 0.6 : 1,
                          padding: "14px 30px",
                          fontSize: "0.95rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                        <i className="fa-regular fa-cart-shopping bg-transparent text-white"></i>
                      </button>

                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className={`theme-btn ${isOutOfStock ? "disabled" : ""}`}
                        style={{
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          opacity: isOutOfStock ? 0.6 : 1,
                          padding: "14px 32px",
                          fontSize: "0.95rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: "#0F172A",
                          borderColor: "#0F172A",
                          color: "#FFFFFF",
                          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.22)",
                        }}
                      >
                        <span>Buy Now</span>
                        <i className="fa-solid fa-bolt bg-transparent text-warning"></i>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className={`theme-btn ${inWishlist ? "" : "style7 border-0"}`}
                        style={{
                          cursor: "pointer",
                          padding: "14px 24px",
                          fontSize: "0.95rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: inWishlist ? "#ECFDF5" : undefined,
                          color: inWishlist ? "#065F46" : undefined,
                        }}
                      >
                        <span>{inWishlist ? "SAVED IN WISHLIST" : "ADD TO WISHLIST"}</span>
                        <i
                          className={`fa-sharp fa-solid fa-heart ${
                            inWishlist ? "text-danger" : ""
                          }`}
                        ></i>
                      </button>

                      {isCustomMode && (
                        <button
                          type="button"
                          onClick={handleSendWhatsApp}
                          className="theme-btn"
                          style={{
                            cursor: "pointer",
                            padding: "14px 24px",
                            fontSize: "0.95rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#25D366",
                            borderColor: "#25D366",
                            color: "#FFFFFF",
                            boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#20BA59";
                            e.currentTarget.style.borderColor = "#20BA59";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#25D366";
                            e.currentTarget.style.borderColor = "#25D366";
                          }}
                          title="Send custom sizing requirements directly to Business Manager on WhatsApp"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          <span>Send to WhatsApp</span>
                        </button>
                      )}
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
                      padding: "14px 24px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: activeTab === "desc" ? "var(--theme)" : "#64748B",
                      borderBottom: activeTab === "desc" ? "3px solid var(--theme)" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
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
                      padding: "14px 24px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: activeTab === "specs" ? "var(--theme)" : "#64748B",
                      borderBottom: activeTab === "specs" ? "3px solid var(--theme)" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
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
                      padding: "14px 24px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: activeTab === "reviews" ? "var(--theme)" : "#64748B",
                      borderBottom: activeTab === "reviews" ? "3px solid var(--theme)" : "none",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
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
