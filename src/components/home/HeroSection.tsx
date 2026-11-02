import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { HomepageSettings } from "@/types";
import { ShieldCheck, Award, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  settings: HomepageSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section
      style={{
        position: "relative",
        background: "radial-gradient(circle at top right, #1E293B 0%, #0A111E 100%)",
        color: "#FFFFFF",
        paddingTop: "90px",
        paddingBottom: "100px",
        overflow: "hidden",
      }}
    >
      {/* Decorative ambient glowing circles */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 64, 53, 0.22) 0%, rgba(255, 64, 53, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "5%",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Text & CTA */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              className="abid-badge abid-badge-dark"
              style={{
                border: "1px solid rgba(255, 64, 53, 0.4)",
                backgroundColor: "rgba(255, 64, 53, 0.12)",
                color: "#FF8A82",
              }}
            >
              <ShieldCheck size={16} color="#FF6B61" />
              <span>{settings.hero_badge || "Certified Electronic Repair & Retailers"}</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.15,
                marginBottom: "24px",
                letterSpacing: "-0.02em",
              }}
            >
              {settings.hero_title || "Bespoke Interior Architecture & Luxury Furnishing Solutions"}
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#CBD5E1",
                marginBottom: "36px",
                maxWidth: "600px",
              }}
            >
              {settings.hero_subtitle ||
                "From acoustic slat wood wall systems and luxury modular kitchens to handcrafted leather furnishings and turnkey architectural contracting—Wall Street Interiors brings master European craftsmanship to Kashmir."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "48px" }}>
              <Link
                href={settings.hero_button_link || "/services"}
                className="abid-btn abid-btn-primary"
                style={{ padding: "14px 32px", fontSize: "1rem" }}
              >
                <span>{settings.hero_button_text || "Explore Services"}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href={settings.hero_secondary_button_link || "/contact"}
                className="abid-btn"
                style={{
                  padding: "14px 30px",
                  fontSize: "1rem",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                }}
              >
                <span>{settings.hero_secondary_button_text || "Book Consultation"}</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                paddingTop: "28px",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {settings.years_experience ? (
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF" }}>
                    {settings.years_experience}+
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Years Experience</div>
                </div>
              ) : null}
              {settings.repairs_completed ? (
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-primary)" }}>
                    {settings.repairs_completed}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Completed Projects</div>
                </div>
              ) : null}
              {settings.satisfaction_rate ? (
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10B981" }}>
                    {settings.satisfaction_rate}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Satisfaction Rate</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "#1E293B",
              }}
            >
              <img
                src={settings.hero_image || "/assets/images/about-us/aboutThumb1_1.jpg"}
                alt="Wall Street Interiors Architectural Studio"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ width: "100%", height: "460px", objectFit: "cover" }}
              />

              {/* Floating diagnostic badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "24px",
                  right: "24px",
                  background: "rgba(10, 17, 30, 0.88)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(212, 175, 55, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#E5C158",
                    }}
                  >
                    <Award size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>
                      Bespoke Interior & Architectural Studio
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      Master Woodcraft & 10-Year Structural Guarantee
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "0.85rem", fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Premium Grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
