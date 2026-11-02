"use client";

import React, { useState, Suspense } from "react";
import { loginAction } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Loader2,
  ShoppingBag,
  Heart,
  CreditCard,
  User,
  KeyRound,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/";
  const reason = searchParams.get("reason");
  const wasUnauthorized =
    searchParams.get("unauthorized") === "1" ||
    searchParams.get("error") === "admin_required" ||
    searchParams.get("reason") === "admin_login_required";
  const tabParam = searchParams.get("tab");

  // Determine initial mode based on URL hints
  const initialIsAdmin =
    tabParam === "admin" ||
    searchParams.get("role") === "admin" ||
    rawRedirect.startsWith("/dashboard") ||
    wasUnauthorized;

  const [activeTab, setActiveTab] = useState<"customer" | "admin">(
    initialIsAdmin ? "admin" : "customer"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine effective destination based on mode
  const effectiveRedirect =
    activeTab === "admin"
      ? rawRedirect.startsWith("/dashboard")
        ? rawRedirect
        : "/dashboard"
      : rawRedirect.startsWith("/dashboard")
      ? "/profile"
      : rawRedirect;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", effectiveRedirect);

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
    if (wasUnauthorized && activeTab === "admin") {
      return {
        icon: <ShieldAlert size={18} color="#DC2626" />,
        text: "Staff authorization required: Please sign in with an administrator account to access the dashboard.",
        bg: "#FEF2F2",
        color: "#DC2626",
        border: "#FECACA",
      };
    }
    if (reason === "cart" && activeTab === "customer") {
      return {
        icon: <ShoppingBag size={18} color="#FF4035" />,
        text: "Please sign in to add products to your cart and customize your selections.",
        bg: "#FFF1F0",
        color: "#991B1B",
        border: "#FECACA",
      };
    }
    if (reason === "wishlist" && activeTab === "customer") {
      return {
        icon: <Heart size={18} color="#FF4035" />,
        text: "Please sign in to save products to your personal wishlist.",
        bg: "#FFF1F0",
        color: "#991B1B",
        border: "#FECACA",
      };
    }
    if ((reason === "checkout" || reason === "checkout_login_required") && activeTab === "customer") {
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
        maxWidth: "480px",
        background: "#FFFFFF",
        borderRadius: "24px",
        padding: "36px 36px 40px",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Interactive Mode Switcher: Customer vs Admin */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#F1F5F9",
          padding: "4px",
          borderRadius: "14px",
          marginBottom: "24px",
          border: "1px solid #E2E8F0",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("customer");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            fontSize: "0.88rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            backgroundColor: activeTab === "customer" ? "#FFFFFF" : "transparent",
            color: activeTab === "customer" ? "#0F172A" : "#64748B",
            boxShadow: activeTab === "customer" ? "0 2px 8px rgba(15, 23, 42, 0.08)" : "none",
          }}
        >
          <User size={16} />
          <span>Customer Login</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("admin");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            fontSize: "0.88rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            backgroundColor: activeTab === "admin" ? "#0F172A" : "transparent",
            color: activeTab === "admin" ? "#FFFFFF" : "#64748B",
            boxShadow: activeTab === "admin" ? "0 4px 12px rgba(15, 23, 42, 0.25)" : "none",
          }}
        >
          <ShieldCheck size={16} color={activeTab === "admin" ? "#FF4035" : "#64748B"} />
          <span>Admin Panel</span>
        </button>
      </div>

      {/* Header Icon & Title */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background:
              activeTab === "admin"
                ? "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
                : "linear-gradient(135deg, #FF4035 0%, #B91C1C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            margin: "0 auto 14px auto",
            boxShadow:
              activeTab === "admin"
                ? "0 10px 25px rgba(15, 23, 42, 0.3)"
                : "0 10px 25px rgba(255, 64, 53, 0.35)",
            transition: "all 0.3s ease",
          }}
        >
          {activeTab === "admin" ? (
            <KeyRound size={26} color="#FF4035" />
          ) : (
            <User size={26} />
          )}
        </div>

        <h1
          style={{
            fontSize: "1.65rem",
            color: "#0F172A",
            fontWeight: 800,
            marginBottom: "6px",
            letterSpacing: "-0.02em",
          }}
        >
          {activeTab === "admin" ? "Staff & Admin Portal" : "Welcome Back"}
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0 }}>
          {activeTab === "admin"
            ? "Wall Street Interiors \u2022 Secure Console Access"
            : "Sign in to track orders, manage your wishlist, and checkout"}
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

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="redirectTo" value={effectiveRedirect} />

        <div className="form-group" style={{ marginBottom: "18px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.86rem",
              marginBottom: "6px",
            }}
          >
            {activeTab === "admin" ? "Admin Email Address" : "Email Address"}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                paddingLeft: "42px",
                paddingRight: "14px",
                height: "46px",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                fontSize: "0.92rem",
                color: "#0F172A",
                outline: "none",
                backgroundColor: "#F8FAFC",
              }}
              placeholder={activeTab === "admin" ? "Enter your administrator email" : "Enter your email"}
            />
            <Mail
              size={18}
              color="#94A3B8"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "26px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#334155",
                fontWeight: 600,
                fontSize: "0.86rem",
                margin: 0,
              }}
            >
              Password
            </label>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                paddingLeft: "42px",
                paddingRight: "42px",
                height: "46px",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                fontSize: "0.92rem",
                color: "#0F172A",
                outline: "none",
                backgroundColor: "#F8FAFC",
              }}
              placeholder="••••••••••••"
            />
            <Lock
              size={18}
              color="#94A3B8"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "4px",
              }}
              title={showPassword ? "Hide password" : "Show password"}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            height: "48px",
            backgroundColor: activeTab === "admin" ? "#0F172A" : "#FF4035",
            color: "#FFFFFF",
            fontSize: "0.96rem",
            fontWeight: 700,
            borderRadius: "12px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            boxShadow:
              activeTab === "admin"
                ? "0 8px 20px rgba(15, 23, 42, 0.25)"
                : "0 8px 20px rgba(255, 64, 53, 0.25)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{activeTab === "admin" ? "Authenticating Admin..." : "Signing in..."}</span>
            </>
          ) : (
            <>
              <span>{activeTab === "admin" ? "Access Admin Console" : "Sign In to Store"}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer Links based on Mode */}
      {activeTab === "customer" ? (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#64748B",
          }}
        >
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/register?redirectTo=${encodeURIComponent(effectiveRedirect)}${reason ? `&reason=${reason}` : ""}`}
            style={{
              color: "#FF4035",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Create an Account
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "#64748B",
            lineHeight: 1.4,
          }}
        >
          <Lock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
          Restricted Area &bull; Administrative console access is monitored and strictly reserved for authorized staff.
        </div>
      )}
    </div>
  );
}

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
        <LoginForm />
      </Suspense>
    </div>
  );
}
