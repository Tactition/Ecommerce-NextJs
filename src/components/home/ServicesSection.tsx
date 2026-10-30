import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { Service } from "@/types";
import { Wrench, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="abid-section" style={{ backgroundColor: "#F8FAFC" }}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 50px auto" }}>
          <div className="abid-badge">
            <Wrench size={15} />
            <span>Turnkey Architectural Craft</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "16px" }}>
            Bespoke Interior Design & Architectural Woodwork
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem" }}>
            From acoustic wood wall paneling and modular kitchens to custom handcrafted furniture and B2B contractor trade supply across Kashmir.
          </p>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "30px",
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              className="abid-card"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "0",
              }}
            >
              {/* Card Image */}
              <div style={{ position: "relative", height: "220px", overflow: "hidden", background: "#0A111E" }}>
                <img
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "rgba(10, 17, 30, 0.8)",
                    backdropFilter: "blur(6px)",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {service.price_range}
                </div>
              </div>

              {/* Card Content */}
              <div style={{ padding: "26px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "12px", color: "var(--color-secondary)" }}>
                  {service.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                    marginBottom: "24px",
                    flex: 1,
                  }}
                >
                  {service.short_description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--color-surface-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "0.82rem", fontWeight: 600 }}>
                    <ShieldCheck size={16} />
                    <span>180-Day Warranty</span>
                  </div>

                  <Link
                    href={`/services/${service.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>View Details</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Link href="/services" className="abid-btn abid-btn-secondary" style={{ padding: "14px 34px" }}>
            <span>View All Engineering Services</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
