"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  Heart,
  CheckCircle2,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/";
  const reason = searchParams.get("reason");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const submission = new FormData();
    submission.set("name", formData.name.trim());
    submission.set("email", formData.email.trim());
    if (formData.phone) submission.set("phone", formData.phone.trim());
    submission.set("password", formData.password);
    submission.set("confirmPassword", formData.confirmPassword);
    submission.set("redirectTo", redirectTo);

    try {
      const res = await registerAction(null, submission);

      if (!res.success) {
        setError(res.error || "Unable to register. Please try again.");
        setIsLoading(false);
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const getReasonBanner = () => {
    if (reason === "cart") {
      return {
        icon: <ShoppingBag size={18} color="#FF4035" />,
        text: "Create your account to save items in your cart and proceed with your order.",
      };
    }
    if (reason === "wishlist") {
      return {
        icon: <Heart size={18} color="#FF4035" />,
        text: "Create an account to keep your favorite furniture pieces saved across all devices.",
      };
    }
    if (reason === "checkout") {
      return {
        icon: <CheckCircle2 size={18} color="#FF4035" />,
        text: "Create your customer account to complete secure checkout and track delivery.",
      };
    }
    return null;
  };

  const reasonBanner = getReasonBanner();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "490px",
        background: "#FFFFFF",
        borderRadius: "24px",
        padding: "44px 38px",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "26px" }}>
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #FF4035 0%, #B91C1C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            margin: "0 auto 14px auto",
            boxShadow: "0 10px 25px rgba(255, 64, 53, 0.35)",
          }}
        >
          <Sparkles size={28} />
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
          Create Account
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.9rem", margin: 0 }}>
          Join Wall Street Interiors for bespoke luxury furnishings
        </p>
      </div>

      {/* Contextual Reason Notice */}
      {reasonBanner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "#FFF1F0",
            color: "#991B1B",
            fontSize: "0.86rem",
            fontWeight: 600,
            marginBottom: "20px",
            border: "1px solid #FECACA",
          }}
        >
          <span style={{ flexShrink: 0 }}>{reasonBanner.icon}</span>
          <span>{reasonBanner.text}</span>
        </div>
      )}

      {/* Error Alert */}
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="form-group" style={{ marginBottom: "16px" }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.86rem",
              marginBottom: "6px",
            }}
          >
            Full Name <span style={{ color: "#FF4035" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
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
            />
            <User
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

        {/* Email Address */}
        <div className="form-group" style={{ marginBottom: "16px" }}>
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
            Email Address <span style={{ color: "#FF4035" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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

        {/* Phone Number (Optional) */}
        <div className="form-group" style={{ marginBottom: "16px" }}>
          <label
            htmlFor="phone"
            style={{
              display: "block",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.86rem",
              marginBottom: "6px",
            }}
          >
            Phone Number <span style={{ color: "#94A3B8", fontWeight: 400 }}>(Optional)</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
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
            />
            <Phone
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

        {/* Password */}
        <div className="form-group" style={{ marginBottom: "16px" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.86rem",
              marginBottom: "6px",
            }}
          >
            Password <span style={{ color: "#FF4035" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
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
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group" style={{ marginBottom: "26px" }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: "block",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.86rem",
              marginBottom: "6px",
            }}
          >
            Confirm Password <span style={{ color: "#FF4035" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            height: "48px",
            backgroundColor: "#FF4035",
            color: "#FFFFFF",
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: "12px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            boxShadow: "0 8px 20px rgba(255, 64, 53, 0.25)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Register & Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Link to Login */}
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#64748B",
        }}
      >
        Already have an account?{" "}
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}${reason ? `&reason=${reason}` : ""}`}
          style={{
            color: "#FF4035",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
            Loading registration...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
