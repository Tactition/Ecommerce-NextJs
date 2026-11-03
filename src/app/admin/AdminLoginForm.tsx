"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/lib/actions/adminAuth";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
  const errorParam = searchParams.get("error");
  const reasonParam = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", rawRedirect);

    try {
      const res = await loginAdminAction(null, formData);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || "Authentication failed. Access denied.");
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during admin authentication.");
      setIsLoading(false);
    }
  };

  const showStaffNotice =
    errorParam === "admin_required" ||
    reasonParam === "admin_login_required" ||
    searchParams.get("unauthorized") === "1";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at 50% 20%, #1E293B 0%, #0F172A 50%, #090D16 100%)",
        fontFamily: "var(--font-primary, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "44px 38px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Crimson Accent Bar on top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #FF4035 0%, #D4AF37 50%, #FF4035 100%)",
          }}
        />

        {/* Security Badge */}
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
              margin: "0 auto 16px auto",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <KeyRound size={28} color="#FF4035" />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "#F1F5F9",
              color: "#475569",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            <ShieldCheck size={14} color="#FF4035" />
            <span>Internal Control Console</span>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              color: "#0F172A",
              fontWeight: 800,
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Panel Login
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
            Authorized personnel login for Wall Street Interiors management &amp; control
          </p>
        </div>

        {/* Staff Authorization Notice (if redirected from /dashboard without admin role) */}
        {showStaffNotice && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "12px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "20px",
              border: "1px solid #FECACA",
              lineHeight: 1.45,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              Staff credentials required: Please sign in with an authorized administrator account to access the dashboard.
            </span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "12px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              fontSize: "0.88rem",
              marginBottom: "20px",
              border: "1px solid #FECACA",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="admin_email"
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "7px",
              }}
            >
              Administrator Email
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
                  alignItems: "center",
                }}
              >
                <Mail size={17} />
              </div>
              <input
                id="admin_email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wallstreetinteriors.com"
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.92rem",
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF4035";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255, 64, 53, 0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#CBD5E1";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              htmlFor="admin_password"
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: "7px",
              }}
            >
              Master Password
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
                  alignItems: "center",
                }}
              >
                <Lock size={17} />
              </div>
              <input
                id="admin_password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 42px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.92rem",
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF4035";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255, 64, 53, 0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#CBD5E1";
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
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 10px 20px rgba(15, 23, 42, 0.25)",
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) (e.currentTarget.style.backgroundColor = "#1E293B");
            }}
            onMouseLeave={(e) => {
              if (!isLoading) (e.currentTarget.style.backgroundColor = "#0F172A");
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Security Compliance Footer */}
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #E2E8F0",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#94A3B8",
              fontSize: "0.76rem",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Protected by Multi-Factor Session Shield. All access requests are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
