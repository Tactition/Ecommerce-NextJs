"use client";

import React, { useState, Suspense } from "react";
import { loginAction } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShoppingBag,
  Heart,
  CreditCard,
  User,
} from "lucide-react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Safe redirect for customers (never let customer redirect to admin dashboard)
  const safeRedirect = rawRedirect.startsWith("/dashboard") ? "/profile" : rawRedirect;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", safeRedirect);

    try {
      const res = await loginAction(null, formData);

      setIsLoading(false);
      if (!res.success) {
        setError(res.error || "Authentication failed. Please check your credentials.");
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  const getReasonBanner = () => {
    if (reason === "cart") {
      return {
        icon: <ShoppingBag size={18} color="#FF4035" />,
        text: "Please sign in to add products to your cart and customize your selections.",
        bg: "#FFF1F0",
        color: "#991B1B",
        border: "#FECACA",
      };
    }
    if (reason === "wishlist") {
      return {
        icon: <Heart size={18} color="#FF4035" />,
        text: "Please sign in to save products to your personal wishlist.",
        bg: "#FFF1F0",
        color: "#991B1B",
        border: "#FECACA",
      };
    }
    if (reason === "checkout" || reason === "checkout_login_required") {
      return {
        icon: <CreditCard size={18} color="#FF4035" />,
        text: "Please sign in or create an account to proceed to secure checkout.",
        bg: "#FFF1F0",
        color: "#991B1B",
        border: "#FECACA",
      };
    }
    return null;
  };

  const reasonBanner = getReasonBanner();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "460px",
        background: "#FFFFFF",
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        position: "relative",
      }}
    >
      {/* Header Icon & Title */}
      <div style={{ textAlign: "center", marginBottom: "26px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #FF4035 0%, #B91C1C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            margin: "0 auto 16px auto",
            boxShadow: "0 10px 25px rgba(255, 64, 53, 0.35)",
          }}
        >
          <User size={26} />
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
          Welcome Back
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
          Sign in to your customer account to track orders, manage your wishlist, and checkout
        </p>
      </div>

      {/* Contextual Notice */}
      {reasonBanner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: reasonBanner.bg,
            color: reasonBanner.color,
            fontSize: "0.86rem",
            fontWeight: 600,
            marginBottom: "20px",
            border: `1px solid ${reasonBanner.border}`,
          }}
        >
          <span style={{ flexShrink: 0 }}>{reasonBanner.icon}</span>
          <span>{reasonBanner.text}</span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
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

      {/* Customer Login Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "0.84rem",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "7px",
            }}
          >
            Email Address
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
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
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

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: "0.84rem",
                fontWeight: 700,
                color: "#334155",
                margin: 0,
              }}
            >
              Password
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
                alignItems: "center",
              }}
            >
              <Lock size={17} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "12px 44px 12px 42px",
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
            padding: "13px 20px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#FF4035",
            color: "#FFFFFF",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 10px 20px rgba(255, 64, 53, 0.3)",
            transition: "all 0.2s ease",
            opacity: isLoading ? 0.75 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget.style.backgroundColor = "#E0352A");
          }}
          onMouseLeave={(e) => {
            if (!isLoading) (e.currentTarget.style.backgroundColor = "#FF4035");
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Customer Registration & Dealer Links */}
      <div
        style={{
          marginTop: "26px",
          paddingTop: "20px",
          borderTop: "1px solid #E2E8F0",
          textAlign: "center",
          fontSize: "0.88rem",
          color: "#64748B",
        }}
      >
        <span>Don&apos;t have an account yet? </span>
        <Link
          href="/register"
          style={{
            color: "#FF4035",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Create an Account
        </Link>

        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>Trade contractor, retailer, or architect? </span>
          <Link
            href="/dealer/login"
            style={{
              color: "#0F172A",
              fontWeight: 700,
              fontSize: "0.82rem",
              textDecoration: "none",
            }}
          >
            B2B Dealer Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at top right, #1E293B 0%, #0A111E 100%)",
      }}
    >
      <Suspense
        fallback={
          <div style={{ color: "#FFFFFF", padding: "40px", textAlign: "center" }}>
            Loading login...
          </div>
        }
      >
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
