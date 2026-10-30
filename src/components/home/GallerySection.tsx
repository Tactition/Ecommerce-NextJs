import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { WorkGallery } from "@/types";
import { Camera, ArrowRight, Eye } from "lucide-react";

interface GallerySectionProps {
  gallery: WorkGallery[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  return (
    <section className="abid-section" style={{ backgroundColor: "#FFFFFF" }}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px auto" }}>
          <div className="abid-badge">
            <Camera size={15} />
            <span>Proven Technical Craft</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "14px" }}>
            Our Laboratory & Field Engineering Gallery
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.02rem" }}>
            Take an inside look at our certified workshop, precision microsoldering stations, and real-world installations.
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {gallery.map((item) => (
            <div
              key={item.id}
              className="gallery-card"
              style={{
                position: "relative",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                height: "290px",
                boxShadow: "var(--shadow-sm)",
                backgroundColor: "#0A111E",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(10, 17, 30, 0.92) 0%, rgba(10, 17, 30, 0.2) 60%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "24px",
                  color: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-primary)",
                    color: "#FFFFFF",
                    marginBottom: "8px",
                  }}
                >
                  {item.category}
                </span>

                <h4 style={{ fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "6px", lineHeight: 1.3 }}>
                  {item.title}
                </h4>

                <p style={{ fontSize: "0.82rem", color: "#CBD5E1", lineHeight: 1.4, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/gallery" className="abid-btn abid-btn-outline" style={{ padding: "12px 30px" }}>
            <span>View Complete Work Gallery</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
