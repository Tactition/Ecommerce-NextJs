import React from "react";
import Link from "next/link";

export default function PromoSection() {
  return (
    <section className="promo-section section-padding fix pt-0" style={{ padding: "40px 0 60px" }}>
      <div className="container">
        <div className="promo-wrapper style1">
          <div className="row g-4">
            {/* Promo Card 1 */}
            <div className="col-lg-5">
              <div
                className="promo-card promo-card_1 position-relative overflow-hidden"
                style={{
                  background: "#F2F5F8",
                  borderRadius: "20px",
                  padding: "40px 30px",
                  minHeight: "260px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className="promo-content" style={{ zIndex: 2, maxWidth: "60%" }}>
                  <div className="promo-info">
                    <p
                      className="offer-text"
                      style={{
                        color: "#FF4035",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "6px",
                      }}
                    >
                      GET 30% OFF
                    </p>
                    <h3
                      className="promo-title"
                      style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0A111E", lineHeight: 1.2 }}
                    >
                      New Power Double
                    </h3>
                  </div>
                  <div className="promo-btn-wrapper mt-3">
                    <Link className="theme-btn style5" href="/shop" style={{ padding: "8px 22px" }}>
                      View All
                    </Link>
                  </div>
                </div>
                <div className="thumb position-absolute" style={{ right: "10px", bottom: "10px", maxHeight: "200px" }}>
                  <img
                    src="/assets/images/offer/promo1.png"
                    alt="New Power Double Promo"
                    loading="lazy"
                    decoding="async"
                    style={{ maxHeight: "180px", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>

            {/* Promo Card 2 */}
            <div className="col-lg-7">
              <div
                className="promo-card promo-card_2 position-relative overflow-hidden"
                style={{
                  background: "#FCEFEF",
                  borderRadius: "20px",
                  padding: "40px 35px",
                  minHeight: "260px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className="promo-content" style={{ zIndex: 2, maxWidth: "60%" }}>
                  <div className="promo-info">
                    <p
                      className="offer-text"
                      style={{
                        color: "#FF4035",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "6px",
                      }}
                    >
                      LIMITED OFFER
                    </p>
                    <h3
                      className="promo-title"
                      style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0A111E", lineHeight: 1.2 }}
                    >
                      Don&apos;t Miss 25% Off On All Items
                    </h3>
                  </div>
                  <div className="promo-btn-wrapper mt-3">
                    <Link className="theme-btn style5" href="/shop" style={{ padding: "8px 22px" }}>
                      View All
                    </Link>
                  </div>
                </div>
                <div className="thumb position-absolute" style={{ right: "15px", bottom: "10px", maxHeight: "220px" }}>
                  <img
                    src="/assets/images/offer/promo2.png"
                    alt="Limited Offer Promo"
                    loading="lazy"
                    decoding="async"
                    style={{ maxHeight: "200px", objectFit: "contain" }}
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
