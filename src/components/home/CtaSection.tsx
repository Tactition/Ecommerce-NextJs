import React from "react";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="cta-section fix bg-color2" style={{ padding: "60px 0" }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div
              className="cta-wrapper style1 position-relative overflow-hidden"
              style={{
                backgroundImage: "url(/assets/images/cta/ctaBg1_1.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "24px",
                padding: "60px 50px",
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div className="cta-main-content" style={{ zIndex: 2, maxWidth: "560px" }}>
                <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0A111E", textTransform: "capitalize", lineHeight: 1.15 }}>
                  Get Bundle Products Offer
                </h2>
                <p style={{ color: "#64748B", fontSize: "1.05rem", margin: "18px 0 26px", lineHeight: 1.6 }}>
                  Curated device ecosystem packages with integrated wireless charging, protective cases, and multi-year priority care.
                </p>
                <div className="promo-btn-wrapper">
                  <Link className="theme-btn style5" href="/shop" style={{ padding: "12px 32px" }}>
                    View All Bundles
                  </Link>
                </div>
              </div>

              {/* Decorative shapes and floating badges */}
              <div
                className="shape-1 position-absolute d-none d-lg-block"
                style={{ right: "320px", top: "40px" }}
              >
                <div className="thumb position-relative">
                  <img
                    src="/assets/images/cta/cta-shape1_1.jpg"
                    alt="Shape"
                    style={{ borderRadius: "50%", width: "110px", height: "110px", objectFit: "cover" }}
                  />
                  <div
                    className="badge position-absolute"
                    style={{
                      bottom: "-10px",
                      right: "-10px",
                      background: "#FF4035",
                      color: "#fff",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                    }}
                  >
                    25% OFF
                  </div>
                </div>
              </div>

              <div
                className="shape-2 position-absolute d-none d-md-block"
                style={{ right: "30px", bottom: "0px", maxHeight: "330px" }}
              >
                <div className="thumb">
                  <img
                    src="/assets/images/cta/ctaThumb1_1.png"
                    alt="Bundle Gadgets"
                    style={{ maxHeight: "320px", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
