import Link from "next/link";
import { ShieldAlert, ArrowLeft, Clock } from "lucide-react";
import { getDealerSession } from "@/lib/auth/dealer";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DealerPendingPage() {
  const session = await getDealerSession();

  // If dealer has been approved, automatically route them to the active dealer desk!
  if (session && session.approvalStatus === "APPROVED") {
    redirect("/dealer");
  }

  if (session && session.approvalStatus === "SUSPENDED") {
    redirect("/dealer/suspended");
  }

  if (session && session.approvalStatus === "REJECTED") {
    redirect("/dealer/rejected");
  }
  return (
    <div
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at top right, #1E293B 0%, #0A111E 100%)",
        fontFamily: "var(--font-primary, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #F59E0B 0%, #FF4035 100%)",
          }}
        />

        <div
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "#FFFBEB",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            border: "1.5px solid #FDE68A",
          }}
        >
          <Clock size={32} color="#D97706" />
        </div>

        <h1
          style={{
            fontSize: "1.65rem",
            fontWeight: 800,
            color: "#0F172A",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-heading, sans-serif)",
          }}
        >
          Application Under Review
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "24px" }}>
          Thank you for applying for a Wall Street Interiors Dealer account. Our trade verification team is currently verifying your business credentials and GST/Tax ID.
        </p>

        <div
          style={{
            backgroundColor: "#FFFBEB",
            borderRadius: "14px",
            padding: "16px",
            textAlign: "left",
            border: "1px solid #FDE68A",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <ShieldAlert size={18} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.8rem", color: "#92400E", lineHeight: 1.5 }}>
              <strong style={{ display: "block", marginBottom: "4px" }}>What happens next?</strong>
              <div>• Trade verification takes up to 1 business day.</div>
              <div>• Once approved, you gain access to wholesale pricing and tier discounts.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            href="/"
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxSizing: "border-box",
            }}
          >
            <ArrowLeft size={16} /> Return to Wall Street Interiors
          </Link>
          <a
            href="https://wa.me/919419012345?text=Hello,%20I%20applied%20for%20a%20dealer%20account"
            target="_blank"
            rel="noreferrer"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-block",
              border: "1.5px solid #E2E8F0",
              boxSizing: "border-box",
            }}
          >
            Chat with Trade Team on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
