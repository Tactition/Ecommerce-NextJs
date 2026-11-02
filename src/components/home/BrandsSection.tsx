import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { PartnerBrand } from "@/types";
import { Award, ArrowRight } from "lucide-react";

interface BrandsSectionProps {
  brands: PartnerBrand[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="abid-section" style={{ backgroundColor: "#FFFFFF" }}>
      <Container>
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 46px auto" }}>
          <div className="abid-badge">
            <Award size={15} />
            <span>Authorized Network</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", marginBottom: "14px" }}>
            Authorized Interior Hardware & Materials Network
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.02rem" }}>
            We collaborate with premier architectural fittings and surface manufacturers to supply certified European hardware, premium veneers, and designer finishes.
          </p>
        </div>

        {/* Brands Logo Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "20px",
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand.id}
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--color-surface-border)",
                borderRadius: "var(--radius-md)",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
                transition: "all 0.3s ease",
              }}
              className="brand-card-hover"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                style={{
                  maxHeight: "44px",
                  maxWidth: "130px",
                  objectFit: "contain",
                  filter: "grayscale(100%) opacity(75%)",
                  transition: "all 0.3s ease",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginTop: "10px",
                  textAlign: "center",
                }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link
            href="/brands"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-primary)",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            <span>Explore All 12+ Certified Brand Partnerships</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
