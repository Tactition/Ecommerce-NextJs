"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/actions/products";
import { addToCart } from "@/lib/cart";
import { useAuth } from "@/components/auth/AuthProvider";

interface WishlistClientProps {
  initialProducts: Product[];
}

export default function WishlistClient({ initialProducts }: WishlistClientProps) {
  const { requireAuth } = useAuth();
  // Use initial active products from DB or default to first 4
  const [items, setItems] = useState<Product[]>(() => {
    return initialProducts.slice(0, 4);
  });
  const [notification, setNotification] = useState<string | null>(null);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showNotification("Item removed from your wishlist.");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddToCart = (product: Product) => {
    if (!requireAuth("cart")) return;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.original_price,
      quantity: 1,
      image: product.image,
      maxStock: product.stock,
    });
    showNotification(`"${product.name}" was added to your shopping cart!`);
  };

  const restoreDemoItems = () => {
    setItems(initialProducts.slice(0, 4));
    showNotification("Wishlist restored!");
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

          {items.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ fontSize: "4.5rem", color: "#CBD5E1", marginBottom: "20px" }}>
                  <i className="fa-sharp fa-light fa-heart-crack"></i>
                </div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "12px", color: "#1E293B" }}>
                  Your Wishlist is Empty
                </h3>
                <p style={{ color: "#64748B", marginBottom: "30px", lineHeight: 1.6 }}>
                  You don&apos;t have any products saved in your wishlist yet. Explore our electronic collection and save your favorite devices!
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={restoreDemoItems}
                    className="theme-btn"
                    style={{ cursor: "pointer" }}
                  >
                    Restore Demo Items
                  </button>
                  <Link href="/shop" className="theme-btn style6">
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
                      <tr key={item.id} className="cart_item" style={{ verticalAlign: "middle" }}>
                        <td className="product" data-title="Product" style={{ padding: "20px 15px" }}>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
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
                              {item.price.toFixed(2)}
                            </bdi>
                          </span>
                        </td>

                        <td data-title="Total" style={{ textAlign: "center", fontWeight: 700, color: "var(--theme)" }}>
                          <span className="amount">
                            <bdi>
                              <span>₹</span>
                              {item.price.toFixed(2)}
                            </bdi>
                          </span>
                        </td>

                        <td data-title="stock" style={{ textAlign: "center" }}>
                          {item.stock > 0 ? (
                            <span className="stock" style={{ color: "#10B981", fontWeight: 600 }}>
                              <i className="fa-solid fa-circle-check me-1"></i> In stock ({item.stock})
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
                  onClick={() => {
                    setItems([]);
                    showNotification("Wishlist cleared.");
                  }}
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
