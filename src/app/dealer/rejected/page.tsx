import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { getDealerSession } from "@/lib/auth/dealer";
import { redirect } from "next/navigation";
import DealerLogoutButton from "@/components/dealer/DealerLogoutButton";

export const dynamic = "force-dynamic";

export default async function DealerRejectedPage() {
  const session = await getDealerSession();

  if (session && session.approvalStatus === "APPROVED") {
    redirect("/dealer");
  }

  if (session && session.approvalStatus === "PENDING") {
    redirect("/dealer/pending");
  }

  if (session && session.approvalStatus === "SUSPENDED") {
    redirect("/dealer/suspended");
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
            background: "#DC2626",
          }}
        />

        <div
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "#FEF2F2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            border: "1.5px solid #FECACA",
          }}
        >
          <XCircle size={32} color="#DC2626" />
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
          Application Not Approved
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "24px" }}>
          We were unable to approve your wholesale trade account with the details provided. This may be due to unverified GST registration or mismatched trade documentation.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href="https://wa.me/919419012345?text=Hello,%20my%20dealer%20application%20was%20rejected,%20could%20you%20help?"
            target="_blank"
            rel="noreferrer"
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-block",
              boxSizing: "border-box",
            }}
          >
            Contact Support Desk
          </a>
          <Link
            href="/"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "1.5px solid #E2E8F0",
              boxSizing: "border-box",
            }}
          >
            <ArrowLeft size={16} /> Return to Homepage
          </Link>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "center" }}>
            <DealerLogoutButton variant="link" label="Log Out / Switch Account" />
          </div>
        </div>
      </div>
    </div>
  );
}
