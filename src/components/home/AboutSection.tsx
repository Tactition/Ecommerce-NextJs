import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { HomepageSettings } from "@/types";
import { CheckCircle2, Cpu, Wrench, Shield, ArrowRight } from "lucide-react";

interface AboutSectionProps {
  settings: HomepageSettings;
}

export default function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section className="abid-section" style={{ backgroundColor: "#0A111E", color: "#FFFFFF" }}>
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "60px",
            alignItems: "center",
          }}
        >
          {/* Left: Interactive image composition */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={settings.about_image || "/assets/images/about-us/aboutThumb1_2.jpg"}
                alt="Wall Street Interiors Bespoke Workshop"
                style={{ width: "100%", height: "480px", objectFit: "cover" }}
              />
            </div>

            {/* Experience Badge Overlay */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                background: "linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(212,175,55,0.4)",
                textAlign: "center",
                minWidth: "160px",
              }}
            >
              <div style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1 }}>
                {settings.years_experience || 12}+
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>
                Years of Master Craftsmanship
              </div>
            </div>
          </div>

          {/* Right: Content & Highlights */}
          <div>
            <div
              className="abid-badge abid-badge-dark"
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                color: "#E5C158",
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              <Cpu size={15} />
              <span>Architectural Excellence</span>
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                color: "#FFFFFF",
                marginBottom: "20px",
                lineHeight: 1.2,
              }}
            >
              {settings.about_heading || "Bespoke Interior Craftsmanship & Architectural Execution"}
            </h2>

            <p style={{ color: "#CBD5E1", fontSize: "1.02rem", lineHeight: 1.7, marginBottom: "32px" }}>
              {settings.about_text ||
                "Founded in Srinagar, Wall Street Interiors delivers premium architectural interior design, handcrafted luxury furniture, acoustic slat wood wall solutions, and turnkey modular kitchens. Our master artisans and site engineers transform discerning residences, boutique hotels, and corporate workspaces with uncompromising European standards."}
            </p>

            {/* Feature Checkpoints */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#D4AF37" />
                <span style={{ fontSize: "0.95rem", color: "#E2E8F0" }}>Architectural Slat Wood Paneling</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#D4AF37" />
                <span style={{ fontSize: "0.95rem", color: "#E2E8F0" }}>European Soft-Close Hardware</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#D4AF37" />
                <span style={{ fontSize: "0.95rem", color: "#E2E8F0" }}>Turnkey Modular Kitchens & Closets</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#D4AF37" />
                <span style={{ fontSize: "0.95rem", color: "#E2E8F0" }}>10-Year Structural Craft Warranty</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/contact" className="abid-btn abid-btn-primary" style={{ padding: "12px 28px" }}>
                <span>Schedule An Assessment</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/gallery"
                className="abid-btn"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                }}
              >
                <span>View Workshop</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
