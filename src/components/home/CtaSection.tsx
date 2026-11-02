import React from "react";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="cta-section fix bg-color2" style={{ padding: "60px 0" }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div
              className="wsi-bundle-banner position-relative overflow-hidden"
              style={{
                backgroundImage: "url(/assets/images/cta/ctaBg1_1.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "24px",
                padding: "48px 50px",
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              }}
            >
              <div className="row align-items-center w-100 g-4" style={{ margin: 0, zIndex: 2 }}>
                <div className="col-lg-7 col-md-6 col-12" style={{ padding: "8px" }}>
                  <div style={{ maxWidth: "520px", textAlign: "left" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        borderRadius: "50px",
                        padding: "6px 18px",
                        marginBottom: "16px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                        }}
                      >
                        25% OFF
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: "clamp(2rem, 3.2vw, 2.7rem)",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        lineHeight: 1.2,
                        marginBottom: "14px",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Get Bundle Products Offer
                    </h2>

                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.92)",
                        fontSize: "1.05rem",
                        lineHeight: 1.6,
                        marginBottom: "26px",
                        maxWidth: "480px",
                      }}
                    >
                      Curated device ecosystem packages with integrated wireless charging, protective cases, and multi-year priority care.
                    </p>

                    <div>
                      <Link
                        className="theme-btn style6"
                        href="/shop"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "13px 32px",
                          borderRadius: "50px",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                          textDecoration: "none",
                        }}
                      >
                        View All Bundles
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.85rem" }}></i>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5 col-md-6 col-12 d-flex justify-content-center justify-content-md-end align-items-center" style={{ padding: "8px" }}>
                  <div
                    style={{
                      position: "relative",
                      maxWidth: "460px",
                      width: "100%",
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                      border: "3px solid rgba(255, 255, 255, 0.22)",
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }}
                  >
                    <img
                      src="/assets/images/cta/ctaThumb1_1.png"
                      alt="Bundle Gadgets"
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "280px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
