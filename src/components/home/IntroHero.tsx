"use client";

import React, { useState } from "react";
import Link from "next/link";

interface IntroHeroProps {
  onQuickView?: (product: any) => void;
}

export default function IntroHero({ onQuickView }: IntroHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#770215");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const slides = [
    {
      image: "/assets/images/intro/introThumb1_1.png",
      title: "Bespoke Italian Leather Recliner Lounge",
      subtitle: "Exclusive Interior Collection",
      price: "₹45,500",
      description:
        "Handcrafted Italian top-grain leather with ergonomic contouring and solid kiln-dried hardwood framing.",
    },
    {
      image: "/assets/images/intro/introThumb1_2.png",
      title: "Handcrafted Walnut Executive Desk",
      subtitle: "Artisan Woodcraft Series",
      price: "₹68,000",
      description:
        "Sustainably harvested solid walnut with integrated cable management and brass hardware accents.",
    },
    {
      image: "/assets/images/intro/introThumb1_3.png",
      title: "Architectural 3D Slat Wall Panels",
      subtitle: "Acoustic Wall Paneling",
      price: "₹18,500",
      description:
        "Sound-dampening natural wood veneer slats with high-density recycled acoustic felt backing.",
    },
  ];

  const current = slides[activeSlide];

  return (
    <>
      <section className="intro-section">
        <div className="intro-container-wrapper style1">
          <div className="container">
            <div className="intro-wrapper style1 position-relative">
              {/* Floating Feature Badges */}
              <div className="thumb-shape-wrapper d-none d-md-block">
                <div className="thumbShape thumbShape1" style={{ position: "absolute", top: "20px", right: "20px", zIndex: 3 }}>
                  <span style={{ background: "#FFFFFF", padding: "8px 16px", borderRadius: "30px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: "0.85rem", color: "#FF4035", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    ⭐ 4.9 Rating
                  </span>
                </div>
                <div className="thumbShape thumbShape2" style={{ position: "absolute", top: "120px", right: "5px", zIndex: 3 }}>
                  <span style={{ background: "#FFFFFF", padding: "8px 16px", borderRadius: "30px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: "0.85rem", color: "#0A111E", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    🚀 Express Ship
                  </span>
                </div>
                <div className="thumbShape thumbShape3" style={{ position: "absolute", top: "220px", right: "30px", zIndex: 3 }}>
                  <span style={{ background: "#FFFFFF", padding: "8px 16px", borderRadius: "30px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: "0.85rem", color: "#10B981", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    🛡️ Certified Care
                  </span>
                </div>
              </div>

              <div className="row gy-5 d-flex align-items-center">
                {/* Left Content */}
                <div className="col-xl-6">
                  <div className="intro-content">
                    <div className="subtitle style1 d-inline-flex align-items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <g clipPath="url(#clip0_86_101)">
                          <path
                            d="M12.8333 6.10352e-05H7.98425C7.66347 6.10352e-05 7.21514 0.185895 6.9885 0.412368L0.34046 7.06037C-0.113477 7.51379 -0.113477 8.2572 0.34046 8.71008L5.29046 13.6599C5.74338 14.1133 6.48606 14.1133 6.93966 13.6594L13.5877 7.01242C13.8141 6.78598 14 6.33693 14 6.01684V1.16678C14 0.525228 13.4748 6.10352e-05 12.8333 6.10352e-05ZM10.4998 4.66675C9.85547 4.66675 9.33311 4.14384 9.33311 3.50004C9.33311 2.85517 9.85547 2.33332 10.4998 2.33332C11.1442 2.33332 11.6667 2.85517 11.6667 3.50004C11.6667 4.14384 11.1442 4.66675 10.4998 4.66675Z"
                            fill="#0A111E"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_86_101">
                            <rect width="14" height="14" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span>59% <span className="color-text">discount</span> for all items</span>
                    </div>

                    <h1 className="mt-3">{current.title}</h1>
                    <p>{current.description}</p>

                    <div className="pricing-card d-flex align-items-center flex-wrap gap-4 mt-4">
                      <div className="price-box">
                        <div className="price" style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "#64748B" }}>
                          price
                        </div>
                        <h6 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FF4035", margin: 0 }}>
                          {current.price}
                        </h6>
                      </div>

                      <div className="color-box">
                        <div className="color" style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "#64748B", marginBottom: "6px" }}>
                          color
                        </div>
                        <div className="color-plate d-flex gap-2">
                          {[
                            { color: "#770215", name: "Burgundy" },
                            { color: "#E9CF10", name: "Gold" },
                            { color: "#35424B", name: "Slate" },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setSelectedColor(c.color)}
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: c.color,
                                border: selectedColor === c.color ? "2px solid #000" : "none",
                                cursor: "pointer",
                                padding: 0,
                              }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Video Trigger */}
                      <div className="video-wrap ripple-effect rounded-0">
                        <button
                          type="button"
                          className="play-btn popup-video border-0 bg-transparent"
                          onClick={() => setIsVideoModalOpen(true)}
                          aria-label="Play video showcase"
                          style={{ cursor: "pointer" }}
                        >
                          <img className="playerImg" src="/assets/images/icon/playerIcon1_1.svg" alt="play-icon" />
                        </button>
                      </div>
                    </div>

                    <div className="btn-wrapper d-flex gap-3 mt-4">
                      <Link className="theme-btn style6" href="/shop">
                        Explore Collection
                      </Link>
                      <Link className="theme-btn style7" href="/contact">
                        Trade Inquiries
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Slider Image */}
                <div className="col-xl-6">
                  <div className="thumb-slider position-relative">
                    <div className="intro-thumb text-center">
                      <div style={{ minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={current.image}
                          alt={current.title}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "420px",
                            objectFit: "contain",
                            borderRadius: "24px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                            transition: "all 0.5s ease",
                          }}
                        />
                      </div>

                      {/* Slider Dots */}
                      <div className="d-flex justify-content-center gap-2 mt-4">
                        {slides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            style={{
                              width: activeSlide === idx ? "28px" : "10px",
                              height: "10px",
                              borderRadius: "6px",
                              backgroundColor: activeSlide === idx ? "#FF4035" : "#CBD5E1",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Popup Modal */}
      {isVideoModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "800px",
              aspectRatio: "16/9",
              background: "#000",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                fontSize: "1.2rem",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/f2Gzr8sAGB8?autoplay=1"
              title="Product Showcase Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: "none" }}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
