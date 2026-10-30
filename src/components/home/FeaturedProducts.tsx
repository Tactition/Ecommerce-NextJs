"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/actions/products";

interface FeaturedProductsProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function FeaturedProducts({
  products,
  onQuickView,
  onAddToCart,
}: FeaturedProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const categories = [
    { label: "All", value: "all" },
    { label: "Oven", value: "oven" },
    { label: "Computer", value: "computer" },
    { label: "Watch", value: "watch" },
    { label: "Camera", value: "camera" },
    { label: "Drone", value: "drone" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "all" ||
      p.category_slug.toLowerCase() === selectedCategory.toLowerCase();
    const matchBrand =
      selectedBrand === "all" ||
      (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    return matchCategory && matchBrand;
  });

  const handleAdd = (product: Product) => {
    if (onAddToCart) onAddToCart(product);
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 3000);
  };

  return (
    <section id="featured-products" className="featured-product-section section-padding fix" style={{ padding: "80px 0" }}>
      <div className="container">
        <div className="featured-product-wrapper style1">
          {/* Header Title */}
          <div className="top-deals-wrapper style1 text-center mb-30">
            <div className="section-title">
              <div className="subtitle style1" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                featured products
              </div>
              <h2 className="title" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                Our featured products
              </h2>
            </div>
          </div>

          {/* Filter Tabs and Brand Filter */}
          <div className="feature-flex-tab-wrapper d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div className="feature-tab-btn-wrapper">
              <ul className="nav nav-pills d-flex align-items-center gap-2" role="tablist">
                {categories.map((cat) => (
                  <li key={cat.value} className="nav-item">
                    <button
                      className={`nav-link ${selectedCategory === cat.value ? "active" : ""}`}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="feature-select">
              <select
                className="form-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  borderRadius: "20px",
                  padding: "8px 16px",
                  borderColor: "#CBD5E1",
                  fontSize: "0.9rem",
                }}
              >
                <option value="all">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Dell">Dell</option>
                <option value="LG">LG</option>
                <option value="ASUS">ASUS</option>
                <option value="DJI">DJI</option>
                <option value="Canon">Canon</option>
                <option value="Sony">Sony</option>
              </select>
            </div>
          </div>

          {/* Added Item Toast Alert */}
          {addedItem && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="fa-solid fa-check-circle"></i>
              <span><strong>{addedItem}</strong> has been added to your shopping cart!</span>
            </div>
          )}

          {/* Product Grid */}
          <div className="feature-tab-content">
            <div className="row g-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="featured-product-item-one h-100 d-flex flex-column justify-content-between">
                    <div
                      className="featured-product-item-one__thumb position-relative text-center"
                      style={{
                        minHeight: "230px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#F8FAFC",
                        borderRadius: "12px",
                        padding: "20px",
                      }}
                    >
                      <Link href={`/product/${product.slug || product.id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ maxHeight: "180px", objectFit: "contain", borderRadius: "10px", transition: "transform 0.3s ease" }}
                        />
                      </Link>
                      {product.badge && (
                        <div
                          className="badge position-absolute"
                          style={{
                            top: "12px",
                            left: "12px",
                            backgroundColor: "#FF4035",
                            color: "#fff",
                            fontSize: "0.75rem",
                            borderRadius: "4px",
                            padding: "4px 8px",
                          }}
                        >
                          {product.badge}
                        </div>
                      )}
                      <div className="icon">
                        <button
                          type="button"
                          onClick={() => onQuickView && onQuickView(product)}
                          aria-label="Quick view"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdd(product)}
                          aria-label="Add to cart"
                        >
                          <i className="fa-light fa-bag-shopping"></i>
                        </button>
                      </div>
                    </div>

                    <div className="featured-product-item-one__content pt-3">
                      <div className="featured-product-item-one__content--details-wrapper">
                        <div className="price">
                          <h6 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                            <Link href={`/product/${product.slug || product.id}`}>
                              {product.name}
                            </Link>
                          </h6>
                          <div className="star-wrapper d-flex align-items-center gap-1 my-1" style={{ color: "#F59E0B", fontSize: "12px" }}>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <span style={{ color: "#94A3B8", marginLeft: "4px", fontSize: "0.8rem" }}>
                              ({product.reviews_count} Reviews)
                            </span>
                          </div>
                          <div className="d-flex align-items-baseline gap-2 mt-2">
                            <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0A111E" }}>
                              ₹{product.price.toFixed(2)}
                            </span>
                            {product.original_price && (
                              <small style={{ textDecoration: "line-through", color: "#94A3B8" }}>
                                ₹{product.original_price.toFixed(2)}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
