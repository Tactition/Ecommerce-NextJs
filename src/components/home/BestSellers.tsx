"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/actions/products";

interface BestSellersProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function BestSellers({ products, onQuickView, onAddToCart }: BestSellersProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<"latest" | "popular" | "onsale">("latest");
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Filter products according to active tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === "popular") return p.is_popular;
    if (activeTab === "onsale") return p.is_on_sale;
    return true; // "latest" shows all
  });

  const handleAdd = (product: Product) => {
    if (onAddToCart) onAddToCart(product);
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 3000);
  };

  return (
    <section id="best-sellers" className="best-seller-section section-padding fix bg-1" style={{ padding: "80px 0" }}>
      <div className="container">
        {/* Section Top Header */}
        <div className="section-top-wrapper mb-4">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-3">
              <div className="section-title">
                <div className="subtitle style1" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Best deals
                </div>
                <h2 className="title" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                  Best Sellers
                </h2>
              </div>
            </div>
            <div className="col-lg-9 d-flex justify-content-xl-end justify-content-start">
              <div className="best-seller-tab-btn-wrapper d-flex align-items-center flex-wrap gap-2">
                <ul className="nav nav-pills d-flex align-items-center gap-2" role="tablist">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "latest" ? "active" : ""}`}
                      onClick={() => setActiveTab("latest")}
                      type="button"
                    >
                      Latest
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "popular" ? "active" : ""}`}
                      onClick={() => setActiveTab("popular")}
                      type="button"
                    >
                      Popular
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "onsale" ? "active" : ""}`}
                      onClick={() => setActiveTab("onsale")}
                      type="button"
                    >
                      On-sale
                    </button>
                  </li>
                  <li className="nav-item ms-lg-2">
                    <Link className="theme-btn style7" href="/shop" style={{ padding: "8px 20px" }}>
                      View all
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {addedItem && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="fa-solid fa-check-circle"></i>
            <span><strong>{addedItem}</strong> has been added to your shopping cart!</span>
          </div>
        )}

        {/* Product Grid */}
        <div className="best-seller-tab-content-wrapper">
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                <div className="best-seller-one position-relative h-100 d-flex flex-column justify-content-between">
                  <div className="best-seller-one__thumb text-center position-relative" style={{ minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Link href={`/product/${product.slug || product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ maxHeight: "190px", objectFit: "contain", borderRadius: "12px", transition: "transform 0.3s ease" }}
                      />
                    </Link>
                    {product.badge && (
                      <span
                        className="badge position-absolute"
                        style={{
                          top: "12px",
                          left: "12px",
                          backgroundColor: "#FF4035",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          borderRadius: "4px",
                          padding: "4px 8px",
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="best-seller-one__content pt-3">
                    <h4 className="best-seller-one__content-title">
                      <Link href={`/product/${product.slug || product.id}`}>
                        {product.name}
                      </Link>
                    </h4>
                    <div className="best-seller-one__star-wrap d-flex align-items-center gap-2 mb-2">
                      <div className="star" style={{ color: "#F59E0B", fontSize: "13px" }}>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
                        ({product.reviews_count} Reviews)
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-auto">
                      <h4 className="best-seller-one__content-price mb-0">
                        <span className="offer-price" style={{ color: "#FF4035", fontWeight: 700, fontSize: "1.2rem", marginRight: "8px" }}>
                          ₹{product.price.toFixed(2)}
                        </span>
                        {product.original_price && (
                          <span className="original-price" style={{ textDecoration: "line-through", color: "#94A3B8", fontSize: "0.95rem" }}>
                            ₹{product.original_price.toFixed(2)}
                          </span>
                        )}
                      </h4>
                      <div className="best-seller-one__icons d-flex gap-2">
                        <button
                          type="button"
                          className="border-0 bg-transparent text-muted"
                          title="Quick View"
                          onClick={() => onQuickView && onQuickView(product)}
                          style={{ cursor: "pointer", fontSize: "16px" }}
                        >
                          <i className="fa-light fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="border-0 bg-transparent"
                          title="Add to cart"
                          onClick={() => handleAdd(product)}
                          style={{ cursor: "pointer", color: "#FF4035", fontSize: "16px" }}
                        >
                          <i className="fa-light fa-bag-shopping"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
