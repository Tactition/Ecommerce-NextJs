"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginDealerAction } from "@/lib/actions/dealerAuth";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function DealerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const result = await loginDealerAction(formData);

    if (!result.success) {
      setError(result.error || "Authentication failed");
      setLoading(false);
    } else if (result.redirect) {
      router.push(result.redirect);
      router.refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        background: "radial-gradient(ellipse at top right, #1E293B 0%, #0A111E 100%)",
        fontFamily: "var(--font-primary, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 36px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Luxury Accent Strip on top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #FF4035 0%, #F59E0B 50%, #FF4035 100%)",
          }}
        />

        {/* Portal Pill Indicator */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 64, 53, 0.08)",
              border: "1px solid rgba(255, 64, 53, 0.2)",
              color: "#FF4035",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Briefcase size={13} />
            <span>Authorized Trade Portal</span>
          </div>
        </div>

        {/* Header Icon & Title */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              margin: "0 auto 16px auto",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Building2 size={28} color="#FF4035" />
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              color: "#0F172A",
              fontWeight: 800,
              marginBottom: "6px",
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-heading, sans-serif)",
            }}
          >
            Dealer Desk Sign In
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0 }}>
            Importer-direct trade access for Kashmir&apos;s verified contractors, architects & retailers
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#DC2626",
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Email Field */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "7px",
              }}
            >
              Registered Business Email
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  display: "flex",
                  pointerEvents: "none",
                }}
              >
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="procurement@company.com"
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 44px",
                  borderRadius: "12px",
                  border: "1.5px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  color: "#0F172A",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF4035";
                  e.target.style.backgroundColor = "#FFFFFF";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 64, 53, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.backgroundColor = "#F8FAFC";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                Portal Password
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  display: "flex",
                  pointerEvents: "none",
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 44px",
                  borderRadius: "12px",
                  border: "1.5px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  color: "#0F172A",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF4035";
                  e.target.style.backgroundColor = "#FFFFFF";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 64, 53, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.backgroundColor = "#F8FAFC";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "6px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #FF4035 0%, #D92318 100%)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 8px 20px rgba(255, 64, 53, 0.35)",
              transition: "all 0.2s ease",
              opacity: loading ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating Trade Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dealer Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Benefits Strip */}
        <div
          style={{
            marginTop: "26px",
            padding: "14px",
            backgroundColor: "#F8FAFC",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            fontSize: "0.78rem",
            color: "#475569",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="#16A34A" />
            <span>Importer Rates</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="#16A34A" />
            <span>Net Credit Terms</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="#16A34A" />
            <span>GST Tax Invoices</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="#16A34A" />
            <span>Site Dispatch J&K</span>
          </div>
        </div>

        {/* Registration Link Footer */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #F1F5F9",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "#64748B",
          }}
        >
          Don&apos;t have an approved trade account yet?{" "}
          <Link
            href="/dealer/register"
            style={{
              color: "#FF4035",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Apply for Dealer Access →
          </Link>
          <div style={{ marginTop: "14px" }}>
            <Link
              href="/login"
              style={{
                color: "#94A3B8",
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              ← Back to Regular Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
