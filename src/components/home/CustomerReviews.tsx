"use client";

import React from "react";
import { Testimonial } from "@/lib/actions/testimonials";

interface CustomerReviewsProps {
  testimonials: Testimonial[];
}

export default function CustomerReviews({ testimonials }: CustomerReviewsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const reviews = testimonials.map((t) => ({
    id: t.id,
    name: t.customer_name,
    role: t.customer_role,
    avatar: t.avatar || "",
    content: t.content,
    rating: t.rating,
  }));

  return (
    <section id="testimonials" className="testimonial-section fix section-padding margin-bottom-40" style={{ padding: "80px 0" }}>
      <div className="container">
        <div className="section-title text-center mb-50">
          <div className="subtitle style1" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Testimonial
          </div>
          <h2 className="title" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            What our clients say
          </h2>
        </div>

        <div className="row g-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="col-lg-4 col-md-6">
              <div
                className="testimonial-card-items-one h-100 d-flex flex-column justify-content-between"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "36px 30px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                  transition: "all 0.3s ease",
                }}
              >
                <p style={{ color: "#475569", fontSize: "0.98rem", lineHeight: 1.7, marginBottom: "26px" }}>
                  &ldquo;{rev.content}&rdquo;
                </p>

                <div className="client-info-wrapper d-flex align-items-center justify-content-between pt-3 border-top">
                  <div className="client-info d-flex align-items-center gap-3">
                    <div
                      className="client-img position-relative"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#F1F5F9",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {rev.avatar ? (
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--theme, #FF4035)" }}>
                          {rev.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="content">
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0A111E" }}>
                        {rev.name}
                      </h3>
                      <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
                        {rev.role || "Customer"}
                      </span>
                      <div className="star mt-1" style={{ color: "#F59E0B", fontSize: "12px" }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <i key={i} className="fa-solid fa-star me-1"></i>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
