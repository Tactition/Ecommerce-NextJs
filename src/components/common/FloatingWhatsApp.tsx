"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export default function FloatingWhatsApp({ whatsappNumber = "+919018454526" }: FloatingWhatsAppProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Do not display in admin dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const cleanNumber = (whatsappNumber || "+919018454526").replace(/[^0-9]/g, "");
  const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(
    "Hi Wall Street Interiors, I am browsing your website and would like a quote / assistance with interior materials."
  )}`;

  return (
    <aside
      aria-label="WhatsApp quick inquiry"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* Tooltip / Prompt Badge */}
      <div
        style={{
          backgroundColor: "#0F172A",
          color: "#FFFFFF",
          padding: "8px 14px",
          borderRadius: "20px",
          fontSize: "0.82rem",
          fontWeight: 600,
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          letterSpacing: "0.02em",
          pointerEvents: "none",
          transition: "all 0.25s ease",
          opacity: isHovered ? 1 : 0.9,
          transform: isHovered ? "translateX(0)" : "translateX(2px)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        className="d-none d-sm-flex"
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#22C55E",
            display: "inline-block",
          }}
        />
        <span>WhatsApp Srinagar Showroom</span>
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Wall Street Interiors on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#25D366",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease",
          transform: isHovered ? "scale(1.08)" : "scale(1)",
          textDecoration: "none",
        }}
      >
        <i className="fa-brands fa-whatsapp" />
      </a>
    </aside>
  );
}

