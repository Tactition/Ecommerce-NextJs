"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/actions/products";
import { addToCart } from "@/lib/cart";
import {
  getWishlist,
  saveWishlist,
  removeFromWishlist,
  clearWishlist,
  WishlistItem,
} from "@/lib/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";

interface WishlistClientProps {
  initialProducts?: Product[];
}

export default function WishlistClient({ initialProducts = [] }: WishlistClientProps) {
  const { requireAuth } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const stored = getWishlist();

    // Auto-sync with initialProducts if available to refresh prices/stock and prune deleted items
    if (initialProducts.length > 0 && stored.length > 0) {
      const activeIds = new Set(initialProducts.map((p) => p.id));
      const validStored = stored.filter((item) => activeIds.has(item.productId));

      const refreshed = validStored.map((item) => {
        const live = initialProducts.find((p) => p.id === item.productId);
        if (!live) return item;
        return {
          ...item,
          name: live.name,
          slug: live.slug,
          price: live.price,
          originalPrice: live.original_price,
          image: live.image,
          stock: live.stock,
          categoryName: live.category_name,
        };
      });

      if (validStored.length !== stored.length) {
        saveWishlist(refreshed);
      }
      setItems(refreshed);
    } else {
      setItems(stored);
    }

    setIsLoaded(true);

    const handleWishlistUpdate = (e: any) => {
      const updated = e.detail || getWishlist();
      setItems(updated);
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "wallstreet_wishlist_v1") handleWishlistUpdate({});
    });

    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, [initialProducts]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const removeItem = (productId: number) => {
    const updated = removeFromWishlist(productId);
    setItems(updated);
    showNotification("Item removed from your wishlist.");
  };

  const handleClearWishlist = () => {
    clearWishlist();
    setItems([]);
    showNotification("Wishlist cleared.");
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!requireAuth("cart")) return;
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
      image: item.image,
      maxStock: item.stock || 99,
    });
    showNotification(`"${item.name}" was added to your shopping cart!`);
  };

  return (
    <>
      {/* Breadcrumb Section */}
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
                <Link href="/shop">Shop</Link>
              </li>
              <li>
                <i className="fa-solid fa-chevron-right"></i>
              </li>
              <li>Wishlist</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="wishlist-wrapper section-padding fix bg-white">
        <div className="container">
          {notification && (
            <div
              style={{
                padding: "14px 20px",
                backgroundColor: "#ECFDF5",
                color: "#065F46",
                borderRadius: "8px",
                marginBottom: "24px",
                border: "1px solid #10B981",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <i className="fa-solid fa-circle-check text-success"></i>
              <span>{notification}</span>
            </div>
          )}

          {!isLoaded ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading wishlist...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ fontSize: "4.5rem", color: "#CBD5E1", marginBottom: "20px" }}>
                  <i className="fa-sharp fa-light fa-heart-crack"></i>
                </div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px", color: "#1E293B" }}>
                  Your Wishlist is Empty
                </h3>
                <p style={{ color: "#64748B", marginBottom: "30px", lineHeight: 1.6 }}>
                  You don&apos;t have any products saved in your wishlist yet. Explore our bespoke blinds, curtains, and interior collections and save your favorite items!
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link href="/shop" className="theme-btn style6">
                    <i className="fa-solid fa-bag-shopping me-2"></i>
                    Explore Shop
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="woocommerce-cart-form">
              <div className="table-responsive">
                <table className="wishlist_table table">
                  <thead>
                    <tr>
                      <th className="cart-col-image" style={{ textAlign: "left", paddingLeft: "30px" }}>
                        Product
                      </th>
                      <th className="cart-col-price">Unit Price</th>
                      <th className="cart-col-total">Sub total</th>
                      <th className="cart-col-stock">Stock Status</th>
                      <th className="cart-col-action" style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId} className="cart_item" style={{ verticalAlign: "middle" }}>
                        <td className="product" data-title="Product" style={{ padding: "20px 15px" }}>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              marginRight: "15px",
                              color: "#94A3B8",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4035")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                            aria-label="Remove item"
                            title="Remove from wishlist"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>

                          <Link className="cartimage me-3" href={`/product/${item.slug}`}>
                            <img
                              width={80}
                              height={80}
                              src={item.image}
                              alt={item.name}
                              style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                            />
                          </Link>

                          <Link
                            href={`/product/${item.slug}`}
                            style={{
                              fontWeight: 600,
                              color: "#1E293B",
                              textDecoration: "none",
                            }}
                          >
                            {item.name}
                          </Link>
                        </td>

                        <td data-title="Price" style={{ textAlign: "center", fontWeight: 600 }}>
                          <span className="amount">
                            <bdi>
                              <span>₹</span>
                              {Number(item.price).toFixed(2)}
                            </bdi>
                          </span>
                        </td>

                        <td data-title="Total" style={{ textAlign: "center", fontWeight: 700, color: "var(--theme)" }}>
                          <span className="amount">
                            <bdi>
                              <span>₹</span>
                              {Number(item.price).toFixed(2)}
                            </bdi>
                          </span>
                        </td>

                        <td data-title="stock" style={{ textAlign: "center" }}>
                          {(item.stock ?? 10) > 0 ? (
                            <span className="stock" style={{ color: "#10B981", fontWeight: 600 }}>
                              <i className="fa-solid fa-circle-check me-1"></i> In stock
                            </span>
                          ) : (
                            <span className="stock_out" style={{ color: "#EF4444", fontWeight: 600 }}>
                              <i className="fa-solid fa-circle-xmark me-1"></i> Out of stock
                            </span>
                          )}
                        </td>

                        <td data-title="Action" style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="theme-btn"
                            style={{
                              padding: "10px 22px",
                              fontSize: "0.88rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span>Add To Cart</span>
                            <i className="fa-regular fa-bag-shopping"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 flex-wrap gap-3">
                <Link href="/shop" className="theme-btn style6">
                  <i className="fa-solid fa-arrow-left-long me-2"></i>
                  Continue Shopping
                </Link>

                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="theme-btn style7 border-0"
                  style={{ cursor: "pointer", background: "#F1F5F9", color: "#475569" }}
                >
                  <i className="fa-regular fa-trash-can me-2"></i>
                  Clear Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
