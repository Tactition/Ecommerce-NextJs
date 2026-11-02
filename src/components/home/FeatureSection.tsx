"use client";

import React from "react";
import { FeatureItem } from "@/types";

interface FeatureSectionProps {
  enabled?: number | boolean;
  featuresJson?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: "f1",
    icon: "fa-solid fa-award",
    title: "High Quality",
    description: "Crafted from top materials",
  },
  {
    id: "f2",
    icon: "fa-solid fa-shield-halved",
    title: "Warranty Protection",
    description: "Over 2 years guaranteed",
  },
  {
    id: "f3",
    icon: "fa-solid fa-truck-fast",
    title: "Free Shipping",
    description: "Order over ₹15,000",
  },
  {
    id: "f4",
    icon: "fa-solid fa-headset",
    title: "24 / 7 Support",
    description: "Dedicated concierge desk",
  },
];

/**
 * Dynamically formats and renders Font Awesome icons or image icons
 */
function renderDynamicFeatureIcon(iconVal?: string) {
  if (!iconVal) {
    return <i className="fa-solid fa-gem" style={{ fontSize: "24px", color: "#D4AF37" }} />;
  }

  const trimmed = iconVal.trim();

  // If user provided a direct image URL (SVG / PNG / etc.)
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".webp")
  ) {
    return (
      <img
        src={trimmed}
        alt="Feature Icon"
        loading="lazy"
        style={{
          width: "32px",
          height: "32px",
          objectFit: "contain",
        }}
      />
    );
  }

  // Format Font Awesome class name dynamically
  let fullClass = trimmed;
  if (
    !fullClass.includes("fa-solid") &&
    !fullClass.includes("fa-regular") &&
    !fullClass.includes("fa-brands") &&
    !fullClass.includes("fa-light")
  ) {
    if (fullClass.startsWith("fa-")) {
      fullClass = `fa-solid ${fullClass}`;
    } else {
      fullClass = `fa-solid fa-${fullClass}`;
    }
  }

  return (
    <i
      className={fullClass}
      style={{
        fontSize: "25px",
        color: "#D4AF37",
        display: "inline-block",
        lineHeight: 1,
      }}
    />
  );
}

export default function FeatureSection({ enabled = 1, featuresJson }: FeatureSectionProps) {
  // If explicitly disabled in admin panel, do not render
  if (enabled === 0 || enabled === false) {
    return null;
  }

  let items: FeatureItem[] = DEFAULT_FEATURES;
  if (featuresJson) {
    try {
      const parsed = typeof featuresJson === "string" ? JSON.parse(featuresJson) : featuresJson;
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    } catch {
      items = DEFAULT_FEATURES;
    }
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      className="feature-section section-padding2 fix gsap-scroll-section"
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #F1F5F9",
        borderBottom: "1px solid #F1F5F9",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="container">
        <div className="row g-4 g-xl-5 justify-content-center">
          {items.map((item) => (
            <div key={item.id} className="col-xl-3 col-md-6 col-sm-6">
              <div
                className="feature-box-item-three"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  padding: "20px 22px",
                  borderRadius: "18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 23, 42, 0.09)";
                  e.currentTarget.style.borderColor = "#D4AF37";
                  const iconWrap = e.currentTarget.querySelector(".feature-box-item-three__icon") as HTMLElement;
                  if (iconWrap) {
                    iconWrap.style.transform = "scale(1.1) rotate(-4deg)";
                    iconWrap.style.borderColor = "#D4AF37";
                    iconWrap.style.backgroundColor = "rgba(212, 175, 55, 0.18)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(15, 23, 42, 0.03)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  const iconWrap = e.currentTarget.querySelector(".feature-box-item-three__icon") as HTMLElement;
                  if (iconWrap) {
                    iconWrap.style.transform = "scale(1) rotate(0deg)";
                    iconWrap.style.borderColor = "rgba(212, 175, 55, 0.25)";
                    iconWrap.style.backgroundColor = "";
                  }
                }}
              >
                <div
                  className="feature-box-item-three__icon"
                  style={{
                    width: "56px",
                    height: "56px",
                    minWidth: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(255, 64, 53, 0.06) 100%)",
                    border: "1.5px solid rgba(212, 175, 55, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.35s ease",
                  }}
                >
                  {renderDynamicFeatureIcon(item.icon)}
                </div>
                <div className="feature-box-item-three__content" style={{ flex: 1, minWidth: 0 }}>
                  <h6
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "1.02rem",
                      fontWeight: 700,
                      color: "#0A111E",
                      fontFamily: "var(--font-heading, inherit)",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </h6>
                  <p
                    className="feature-box-item-three__content--text"
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#64748B",
                      lineHeight: 1.45,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
