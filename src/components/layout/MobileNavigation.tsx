"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail, ShieldCheck } from "lucide-react";
import { SiteSettings } from "@/types";

interface MobileNavProps {
  settings: SiteSettings;
}

export default function MobileNavigation({ settings }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-nav-wrapper" style={{ display: "none" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          color: "var(--color-secondary)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 9999,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "var(--shadow-xl)",
            overflowY: "auto",
          }}
        >
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}
          >
            Home
          </Link>
          <Link
            href="/brands"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}
          >
            Brands
          </Link>
          <Link
            href="/careers"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}
          >
            Careers
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}
          >
            Contact
          </Link>

          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #E2E8F0" }}>
            {settings.company_phone ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "#64748B", fontSize: "0.9rem" }}>
                <Phone size={16} />
                <span>{settings.company_phone}</span>
              </div>
            ) : null}
            {settings.company_email ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#64748B", fontSize: "0.9rem" }}>
                <Mail size={16} />
                <span>{settings.company_email}</span>
              </div>
            ) : null}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="abid-btn abid-btn-primary"
              style={{ width: "100%" }}
            >
              Consultation & Quote
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 991px) {
          .mobile-nav-wrapper {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
