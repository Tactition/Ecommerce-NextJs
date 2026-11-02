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
    <section id="best-sellers" className="best-seller-product-items-section section-padding2 bg-color3 fix">
      <div className="best-seller-product-items-container-wrapper style4">
        <div className="container">
          <div className="best-seller-product-items-wrapper style1 text-center mb-30">
            <div className="section-title">
              <div className="subtitle style1">Trendy Items</div>
              <h3 className="title">our trendy fasion products</h3>
            </div>
          </div>

          <div className="feature-flex-tab-wrapper">
            <div className="feature-tab-btn-wrapper">
              <ul className="nav nav-pills" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "latest" ? "active" : ""}`}
                    onClick={() => setActiveTab("latest")}
                    type="button"
                    role="tab"
                  >
                    All
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "popular" ? "active" : ""}`}
                    onClick={() => setActiveTab("popular")}
                    type="button"
                    role="tab"
                  >
                    Popular
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "onsale" ? "active" : ""}`}
                    onClick={() => setActiveTab("onsale")}
                    type="button"
                    role="tab"
                  >
                    On-Sale
                  </button>
                </li>
              </ul>
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
          <div className="tab-content" id="pills-tabContent">
            <div className="tab-pane fade show active" role="tabpanel">
              <div className="row g-4">
                {filteredProducts.map((product) => {
                  const badgeText =
                    product.discount_percent && product.discount_percent > 0
                      ? `${product.discount_percent}% off`
                      : product.is_popular
                      ? "TRANDING"
                      : product.is_featured
                      ? "NEW"
                      : product.badge || null;

                  return (
                    <div key={product.id} className="col-xl-3 col-md-6">
                      <div className="best-seller-product-items-two">
                        <div className="icon-box2">
                          <button
                            type="button"
                            onClick={() => onQuickView && onQuickView(product)}
                            title="Quick View"
                            aria-label="Quick View"
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          <Link href={`/product/${product.slug || product.id}`} title="View Product" aria-label="View Product">
                            <i className="fa-regular fa-heart"></i>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleAdd(product)}
                            title="Add to Cart"
                            aria-label="Add to Cart"
                          >
                            <i className="fa-light fa-bag-shopping"></i>
                          </button>
                        </div>

                        {badgeText && (
                          <div className="best-seller-product-items-two__badge1">
                            {badgeText}
                          </div>
                        )}

                        <div className="best-seller-product-items-two__thumb">
                          <Link href={`/product/${product.slug || product.id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              style={{ maxHeight: "220px", height: "220px", width: "100%", objectFit: "contain" }}
                            />
                          </Link>
                        </div>

                        <div className="best-seller-product-items-two__content">
                          <div className="best-seller-product-items-two__details">
                            <p className="best-seller-product-items-two__details--subtitle">
                              {product.category_name || "INTERIORS"}
                            </p>
                            <h6 className="best-seller-product-items-two__details--title">
                              <Link href={`/product/${product.slug || product.id}`}>
                                {product.name}
                              </Link>
                            </h6>
                            <div className="best-seller-product-items-two__details--price">
                              <span className="offer-price">₹{Number(product.price).toFixed(2)}</span>
                              {product.original_price && (
                                <span className="original-price">
                                  ₹{Number(product.original_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
