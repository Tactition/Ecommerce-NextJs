import React from "react";
import Container from "@/components/layout/Container";
import { Testimonial } from "@/types";
import { Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="abid-section" style={{ backgroundColor: "#F8FAFC" }}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px auto" }}>
          <div className="abid-badge">
            <MessageSquareQuote size={15} />
            <span>Verified Customer Reviews</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "14px" }}>
            Trusted by Homeowners & Commercial Facilities
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.02rem" }}>
            See why architects, interior contractors, and luxury homeowners across Srinagar trust Wall Street Interiors for bespoke interior architecture and turnkey craftsmanship.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
          }}
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="abid-card"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Star Rating */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              {/* Review Text */}
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--color-text-main)",
                  fontStyle: "italic",
                  marginBottom: "24px",
                  flex: 1,
                }}
              >
                &ldquo;{item.content}&rdquo;
              </p>

              {/* Customer Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-surface-border)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#F1F5F9",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.customer_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--theme, #FF4035)" }}>
                      {item.customer_name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{item.customer_name}</span>
                    <CheckCircle2 size={15} color="#10B981" />
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                    {item.customer_role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
