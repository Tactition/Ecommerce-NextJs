import React from "react";
import Container from "@/components/layout/Container";
import { getActiveBrands } from "@/lib/actions/brands";
import { Award, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Brands & Authorized Manufacturer Network | Wall Street Interiors",
  description: "Explore the world-class interior hardware, architectural surfaces, and luxury fittings partners supported by Wall Street Interiors including Hafele, Hettich, Blum, Saint-Gobain, and Asian Paints.",
};

export const revalidate = 60;

export default async function BrandsPage() {
  const brands = await getActiveBrands();

  return (
    <main style={{ paddingBottom: "90px" }}>
      {/* Header */}
      <div
        style={{
          background: "radial-gradient(circle at top right, #1E293B 0%, #0A111E 100%)",
          color: "#FFFFFF",
          padding: "70px 0",
          marginBottom: "60px",
        }}
      >
        <Container>
          <div style={{ maxWidth: "720px" }}>
            <div
              className="abid-badge abid-badge-dark"
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                color: "#E5C158",
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              <Award size={14} />
              <span>Certified Ecosystem</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)", color: "#FFFFFF", marginBottom: "16px" }}>
              Authorized Partner Brands
            </h1>
            <p style={{ color: "#CBD5E1", fontSize: "1.1rem", lineHeight: 1.6 }}>
              We maintain direct authorized supply chains and dealership partnerships with the world&apos;s leading architectural fittings, surface finishes, and luxury interior hardware manufacturers.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "28px",
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="abid-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "36px 24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  width: "100%",
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxHeight: "56px",
                    maxWidth: "160px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{brand.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "0.82rem", fontWeight: 600, marginBottom: "18px" }}>
                <CheckCircle2 size={16} />
                <span>Authorized Service & Parts</span>
              </div>

              {brand.website_url && brand.website_url !== "#" && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginTop: "auto",
                  }}
                >
                  <span>Official Website</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
