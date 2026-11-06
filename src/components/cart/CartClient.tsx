"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getCart,
  saveCart,
  updateCartQuantity,
  setExactCartQuantity,
  removeFromCart,
  CartItem,
} from "@/lib/cart";
import { validateCustomPriceAction } from "@/lib/actions/products";

export default function CartClient() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [updateMsg, setUpdateMsg] = useState("");
  const [revalidating, setRevalidating] = useState(false);
  const [serverRevalidated, setServerRevalidated] = useState(false);

  // Server-side revalidation of custom sizing prices
  const revalidateCustomPrices = async (currentItems: CartItem[]) => {
    const customItems = currentItems.filter((i) => i.customDetails?.isCustom);
    if (customItems.length === 0) {
      setServerRevalidated(true);
      return;
    }

    setRevalidating(true);
    let changed = false;
    const verifiedItems = await Promise.all(
      currentItems.map(async (item) => {
        if (!item.customDetails?.isCustom) return item;
        try {
          const res = await validateCustomPriceAction({
            productId: item.productId,
            lengthFeet: item.customDetails.lengthFeet,
            lengthInches: item.customDetails.lengthInches,
            widthFeet: item.customDetails.widthFeet,
            widthInches: item.customDetails.widthInches,
          });
          if (res.valid && res.calculatedPrice !== item.price) {
            changed = true;
            return {
              ...item,
              price: res.calculatedPrice,
              customDetails: {
                ...item.customDetails,
                rate: res.rate,
                minPrice: res.minPrice,
                minPriceApplied: res.minPriceApplied,
                calculatedPrice: res.calculatedPrice,
                billableMeasurement: res.billableMeasurement,
              },
            };
          }
        } catch (e) {
          console.error("Revalidation error for item", item.id, e);
        }
        return item;
      })
    );

    if (changed) {
      setItems(verifiedItems);
      saveCart(verifiedItems);
      setUpdateMsg("Custom sizing prices revalidated and synced with the latest server rates.");
    }
    setRevalidating(false);
    setServerRevalidated(true);
  };

  useEffect(() => {
    try {
      const stored = getCart();
      const safeStored = Array.isArray(stored) ? stored : [];
      setItems(safeStored);
      revalidateCustomPrices(safeStored);
    } catch (e) {
      console.error("Cart load error:", e);
    } finally {
      setIsLoaded(true);
    }

    const handleCartUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setItems(e.detail);
      } else {
        const stored = getCart();
        setItems(Array.isArray(stored) ? stored : []);
      }
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  const handleQuantityDelta = (id: string, delta: number) => {
    const updated = updateCartQuantity(id, delta);
    setItems(updated);
  };

  const handleManualQuantity = (id: string, val: number) => {
    const cleanVal = isNaN(val) || val < 1 ? 1 : val;
    const updated = setExactCartQuantity(id, cleanVal);
    setItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = removeFromCart(id);
    setItems(updated);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: "error", msg: "Please enter a coupon code." });
      return;
    }

    if (code === "DISCOUNT20" || code === "SAVE20" || code === "WALLSTREET20") {
      setDiscountPercent(20);
      setCouponFeedback({ type: "success", msg: "Coupon applied! 20% discount granted." });
    } else if (code === "LUXURY30" || code === "SAVE30") {
      setDiscountPercent(30);
      setCouponFeedback({ type: "success", msg: "Coupon applied! 30% discount granted." });
    } else {
      setDiscountPercent(0);
      setCouponFeedback({ type: "error", msg: "Invalid or expired coupon code. Try 'WALLSTREET20'." });
    }
  };

  const handleUpdateCart = () => {
    setUpdateMsg("Cart quantities updated successfully!");
    setTimeout(() => setUpdateMsg(""), 3000);
  };

  // Safe Calculations
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce(
    (acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = 0; // Complimentary white glove delivery
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  if (!isLoaded) {
    return (
      <div className="cart-wrapper section-padding fix bg-white">
        <div className="container text-center py-5">
          <p style={{ color: "#64748B" }}>Loading cart contents...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-wrapper section-padding fix bg-white">
        <div className="container text-center py-5">
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <div style={{ fontSize: "3.8rem", color: "#CBD5E1", marginBottom: "20px" }}>
              <i className="fa-sharp fa-light fa-cart-shopping"></i>
            </div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px", color: "#0F172A" }}>
              Your Cart is Empty
            </h3>
            <p style={{ color: "#64748B", marginBottom: "30px", lineHeight: 1.6 }}>
              You have not added any bespoke luxury furniture pieces or architectural acoustic panels to your cart yet.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link href="/shop" className="theme-btn">
                <span>Explore Products</span>
                <i className="fa-solid fa-arrow-right-long ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrapper section-padding fix bg-white">
      <div className="container">
        {updateMsg && (
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #10B981",
              fontWeight: 500,
            }}
          >
            <i className="fa-solid fa-circle-check me-2"></i>
            {updateMsg}
          </div>
        )}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="table_desc">
              <div className="table_page table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th className="product_name text-start">Product</th>
                      <th className="product-price">Price</th>
                      <th className="product_quantity">Quantity</th>
                      <th className="product_total">Subtotal</th>
                      <th className="product_remove">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const itemTotal = item.price * item.quantity;
                      return (
                        <tr key={item.id}>
                          <td className="product_thumb d-flex align-items-center">
                            <Link href={`/product/${item.slug}`}>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px" }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "70px",
                                    height: "70px",
                                    backgroundColor: "#F1F5F9",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#94A3B8",
                                  }}
                                >
                                  <i className="fa-solid fa-box" style={{ fontSize: "20px" }}></i>
                                </div>
                              )}
                            </Link>
                            <div className="ms-3 text-start">
                              <Link
                                className="product-name"
                                href={`/product/${item.slug}`}
                                style={{ fontWeight: 600, color: "#0F172A", display: "block" }}
                              >
                                {item.name}
                              </Link>
                              {item.customDetails?.isCustom ? (
                                <div className="mt-2" style={{ backgroundColor: "var(--bg-1, #FFF5F4)", border: "1px solid rgba(255, 64, 53, 0.22)", borderRadius: "8px", padding: "8px 12px", maxWidth: "420px" }}>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ fontSize: "0.74rem", backgroundColor: "var(--theme, #FF4035)", color: "#FFFFFF", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                                      📐 Custom Sizing
                                    </span>
                                    <span style={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}>
                                      {item.customDetails.lengthFeet} ft {item.customDetails.lengthInches > 0 ? `${item.customDetails.lengthInches} in` : "0 in"}
                                      {item.customDetails.widthFeet !== undefined
                                        ? ` ${item.customDetails.pricingMethod === "sq_ft" ? "×" : "+"} ${item.customDetails.widthFeet} ft ${item.customDetails.widthInches ? `${item.customDetails.widthInches} in` : "0 in"}`
                                        : ""}
                                    </span>
                                  </div>
                                  <div className="d-flex flex-wrap gap-2" style={{ fontSize: "0.73rem", color: "#64748B" }}>
                                    <span>Billable: <strong style={{ color: "var(--theme, #FF4035)" }}>{item.customDetails.billableMeasurement} {item.customDetails.unitLabel}</strong></span>
                                    <span>•</span>
                                    <span>Rate: <strong style={{ color: "#0F172A" }}>₹{item.customDetails.rate.toFixed(2)}/{item.customDetails.unitLabel}</strong></span>
                                    {item.customDetails.minPriceApplied && (
                                      <>
                                        <span>•</span>
                                        <span style={{ color: "#B45309", fontWeight: 600 }}>Min Charge Applied</span>
                                      </>
                                    )}
                                  </div>
                                  {serverRevalidated && (
                                    <div style={{ fontSize: "0.72rem", color: "var(--theme, #FF4035)", marginTop: "3px", fontWeight: 600 }}>
                                      <i className="fa-solid fa-shield-check me-1"></i> Server Price Verified: ₹{item.price.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              ) : item.attributes && Object.keys(item.attributes).length > 0 ? (
                                <div className="mt-1 d-flex flex-wrap gap-2">
                                  {Object.entries(item.attributes).map(([attrName, attrVal]) => (
                                    <span
                                      key={attrName}
                                      style={{
                                        fontSize: "0.76rem",
                                        background: "#F1F5F9",
                                        color: "#475569",
                                        padding: "2px 8px",
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {attrName}: <strong>{attrVal}</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {item.sku && (
                                <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "4px" }}>
                                  SKU: {item.sku}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="product-price">₹{Number(item.price).toFixed(2)}</td>
                          <td className="product_quantity">
                            <div className="plus-minus-input d-inline-flex align-items-center">
                              <div className="input-group-button">
                                <button
                                  type="button"
                                  className="button"
                                  onClick={() => handleQuantityDelta(item.id, -1)}
                                  aria-label="Decrease quantity"
                                >
                                  <i className="fa fa-minus" aria-hidden="true"></i>
                                </button>
                              </div>
                              <input
                                className="form-control text-center mx-1"
                                type="number"
                                min={1}
                                max={item.maxStock || 99}
                                value={item.quantity}
                                onChange={(e) => handleManualQuantity(item.id, parseInt(e.target.value, 10))}
                                style={{ width: "60px", height: "40px" }}
                              />
                              <div className="input-group-button">
                                <button
                                  type="button"
                                  className="button"
                                  onClick={() => handleQuantityDelta(item.id, 1)}
                                  aria-label="Increase quantity"
                                >
                                  <i className="fa fa-plus" aria-hidden="true"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="product_total">₹{itemTotal.toFixed(2)}</td>
                          <td className="product_remove">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <g clipPath="url(#clip0_229_10585)">
                                  <path
                                    d="M12 23C18.0748 23 23 18.0748 23 12C23 5.92525 18.0748 1 12 1C5.92525 1 1 5.92525 1 12C1 18.0748 5.92525 23 12 23Z"
                                    stroke="#E5E5E5"
                                    strokeMiterlimit="10"
                                  />
                                  <path d="M16 8L8 16" stroke="#5F5F5F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M16 16L8 8" stroke="#5F5F5F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                  <clipPath id="clip0_229_10585">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupon and Update Cart */}
            <div className="coupon-inner">
              <div className="coupon-left">
                <h4>Coupon:</h4>
                <div className="coupon-input d-flex flex-wrap gap-2 align-items-center">
                  <input
                    className="mb-2"
                    placeholder="Coupon code (e.g. WALLSTREET20)"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ minWidth: "260px" }}
                  />
                  <button type="button" onClick={handleApplyCoupon} className="theme-btn style6 mb-2">
                    Apply coupon
                  </button>
                </div>
                {couponFeedback && (
                  <div
                    style={{
                      fontSize: "0.88rem",
                      marginTop: "6px",
                      color: couponFeedback.type === "success" ? "#10B981" : "#EF4444",
                      fontWeight: 600,
                    }}
                  >
                    {couponFeedback.msg}
                  </div>
                )}
              </div>
              <div className="coupon-right">
                <div className="cart_submit">
                  <button className="theme-btn style6" type="button" onClick={handleUpdateCart}>
                    Update cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Summary Wrapper */}
        <div className="cart-checkout-wrapper">
          <div className="coupon_code right">
            <h3>Cart Totals</h3>
            <div className="coupon_inner">
              <div className="cart-subtotal d-flex justify-content-between">
                <p>Subtotal</p>
                <p className="cart_amount">₹{subtotal.toFixed(2)}</p>
              </div>

              {discountPercent > 0 && (
                <div className="cart-subtotal d-flex justify-content-between" style={{ color: "#10B981" }}>
                  <p>Coupon Discount ({discountPercent}%)</p>
                  <p className="cart_amount">-₹{discountAmount.toFixed(2)}</p>
                </div>
              )}

              <div className="cart_subtotal d-flex justify-content-between">
                <p>Delivery Service</p>
                <p className="cart-location pt-2 text-end" style={{ maxWidth: "260px", fontSize: "0.9rem" }}>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>
                    White-Glove Pan-India Delivery Included
                  </span>
                </p>
              </div>

              <div className="cart-subtotal d-flex justify-content-between pt-3" style={{ borderTop: "2px solid #E2E8F0" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>Total</p>
                <p className="cart_amount" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--theme)" }}>
                  ₹{total.toFixed(2)}
                </p>
              </div>

              <div className="checkout-btn mt-4">
                <button
                  type="button"
                  onClick={() => {
                    requireAuth("checkout", () => router.push("/checkout"));
                  }}
                  className="theme-btn style6 text-center w-100"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
