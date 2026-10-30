import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { AlertTriangle, ArrowLeft, Home, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ padding: "120px 0", textAlign: "center", minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <Container>
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
            }}
          >
            <AlertTriangle size={36} />
          </div>

          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1 }}>
            404
          </h1>
          <h2 style={{ fontSize: "1.6rem", margin: "16px 0 12px 0" }}>Page Not Found</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "32px" }}>
            The requested service, article, or resource could not be found or has been moved.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/" className="abid-btn abid-btn-primary">
              <Home size={18} />
              <span>Back to Home</span>
            </Link>
            <Link href="/shop" className="abid-btn abid-btn-outline">
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
