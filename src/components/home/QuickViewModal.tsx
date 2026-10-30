"use client";

import React, { useState } from "react";
import { Product } from "@/lib/actions/products";
import ProductImageGallery from "@/components/shop/ProductImageGallery";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    if (onAddToCart) onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="modal-backdrop-custom"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="modal-content-custom"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "18px",
            color: "#64748B",
          }}
        >
          ✕
        </button>

        <div className="shop-details">
          <div className="row gx-5 align-items-center">
            {/* Product Image Gallery with Zoom Loupe */}
            <div className="col-lg-6 mb-4 mb-lg-0 text-center">
              <ProductImageGallery
                images={
                  product
                    ? Array.from(
                        new Set(
                          [product.image, ...(product.gallery_images || [])].filter(
                            (x): x is string => Boolean(x && typeof x === "string" && x.trim() !== "")
                          )
                        )
                      )
                    : []
                }
                activeImage={product?.image || ""}
                productName={product?.name || "Product"}
                badge={product?.badge}
                discountPercent={product?.discount_percent}
                height={400}
                compact={true}
              />
            </div>

            {/* Product Info */}
            <div className="col-lg-6">
              <div className="product-about">
                <div className="rating d-flex align-items-center gap-2 mb-2">
                  <ul className="star d-flex gap-1 list-unstyled mb-0" style={{ color: "#F59E0B" }}>
                    <li><i className="fa-solid fa-star"></i></li>
                    <li><i className="fa-solid fa-star"></i></li>
                    <li><i className="fa-solid fa-star"></i></li>
                    <li><i className="fa-solid fa-star"></i></li>
                    <li><i className="fa-solid fa-star"></i></li>
                  </ul>
                  <h6 style={{ fontSize: "0.85rem", color: "#64748B", margin: 0 }}>
                    ({product.reviews_count || 12} customer reviews)
                  </h6>
                </div>

                <h6 className="product-price" style={{ color: "#FF4035", fontSize: "1.6rem", fontWeight: 800 }}>
                  ₹{product.price.toFixed(2)}
                  {product.original_price && (
                    <small style={{ color: "#94A3B8", textDecoration: "line-through", fontSize: "1rem", marginLeft: "10px" }}>
                      ₹{product.original_price.toFixed(2)}
                    </small>
                  )}
                </h6>

                <h2 className="product-title" style={{ fontSize: "1.8rem", fontWeight: 800, margin: "10px 0" }}>
                  {product.name}
                </h2>

                <p className="text" style={{ color: "#64748B", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  {product.short_description ||
                    "Premium certified device engineered for maximum performance, long battery life, and complete manufacturer warranty."}
                </p>

                {/* Specs / Options */}
                <div className="product-details my-3">
                  <div className="size d-flex align-items-center gap-2 mb-3">
                    <span className="title font-weight-bold" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Spec:</span>
                    {["Standard", "Pro 256GB", "Max 512GB"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          border: selectedSize === sz ? "2px solid #FF4035" : "1px solid #CBD5E1",
                          background: selectedSize === sz ? "#FFEBEA" : "#FFF",
                          color: selectedSize === sz ? "#FF4035" : "#0F172A",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="color d-flex align-items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Color:</span>
                    {["#0A111E", "#FF4035", "#CBD5E1"].map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(i)}
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: c,
                          border: selectedColor === i ? "3px solid #64748B" : "none",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="actions d-flex align-items-center gap-3 my-4">
                  <div className="quantity d-flex align-items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Qty:</span>
                    <div
                      className="qty-wrapper d-flex align-items-center border rounded"
                      style={{ overflow: "hidden" }}
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: "32px", height: "36px", border: "none", background: "#F1F5F9" }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="qty-input text-center"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                        style={{ width: "45px", height: "36px", border: "none", fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        style={{ width: "32px", height: "36px", border: "none", background: "#F1F5F9" }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="product-details-footer d-flex align-items-center flex-wrap gap-3">
                  <button
                    className="theme-btn"
                    type="button"
                    onClick={handleAdd}
                    style={{ padding: "10px 28px", cursor: "pointer", border: "none" }}
                  >
                    {added ? "Added to Cart!" : "Add to Cart"}
                    <i className="fa-regular fa-cart-shopping ms-2"></i>
                  </button>

                  <div className="share ms-auto">
                    <ul className="social-media d-flex gap-2 list-unstyled mb-0">
                      <li>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-circle">
                          <i className="fa-brands fa-facebook-f"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.x.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-circle">
                          <i className="fa-brands fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-circle">
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
