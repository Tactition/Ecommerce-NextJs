"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerDealerAction } from "@/lib/actions/dealerAuth";
import {
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Percent,
} from "lucide-react";

export default function DealerRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerDealerAction(formData);

    if (!result.success) {
      setError(result.error || "Application submission failed. Please try again.");
      setLoading(false);
    } else if (result.redirect) {
      router.push(result.redirect);
      router.refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
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
          maxWidth: "760px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Luxury Accent Strip on top */}
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

        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: "#0F172A",
            padding: "36px 36px 32px 36px",
            color: "#FFFFFF",
            position: "relative",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 64, 53, 0.15)",
              border: "1px solid rgba(255, 64, 53, 0.35)",
              color: "#FF4035",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <Briefcase size={13} />
            <span>Direct Importer Trade Registration</span>
          </div>

          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: "0 0 8px 0",
              fontFamily: "var(--font-heading, sans-serif)",
            }}
          >
            Apply for B2B Dealer Wholesale Access
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", margin: 0, lineHeight: 1.5, maxWidth: "600px" }}>
            Register your business for importer-direct trade rates on Wallpapers, Wooden Flooring, PVC Panels, and Custom Blinds across Kashmir.
          </p>

          {/* 3 Key Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#E2E8F0",
              }}
            >
              <Percent size={16} color="#FF4035" />
              <span>Up to 25% Off Retail MSRP</span>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#E2E8F0",
              }}
            >
              <FileText size={16} color="#F59E0B" />
              <span>Full GST Tax Credit Invoicing</span>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#E2E8F0",
              }}
            >
              <MapPin size={16} color="#10B981" />
              <span>Direct Valley Site Delivery</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ padding: "36px 36px 40px 36px" }}>
          {error && (
            <div
              style={{
                marginBottom: "24px",
                padding: "14px 18px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#DC2626",
                fontSize: "0.88rem",
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Section 1: Business Details */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#FF4035",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "1.5px solid #F1F5F9",
                }}
              >
                <Building2 size={16} />
                <span>1. Business & Tax Information</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Registered Business / Firm Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="e.g. Kashmir Interior Solutions LLP"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    GST / Tax Identification Number *
                  </label>
                  <div style={{ position: "relative" }}>
                    <FileText size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      name="taxNumber"
                      required
                      placeholder="01AAAAA0000A1Z5"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        textTransform: "uppercase",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Business Category *
                  </label>
                  <select
                    name="businessType"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#FF4035"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; }}
                  >
                    <option value="retailer">Retail Showroom / Store Owner</option>
                    <option value="contractor">Fit-Out Contractor / Builder</option>
                    <option value="designer">Interior Designer / Architect</option>
                    <option value="wholesaler">Wholesale Trade Distributor</option>
                    <option value="other">Hospitality / Hotel Procurement</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#FF4035",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "1.5px solid #F1F5F9",
                }}
              >
                <User size={16} />
                <span>2. Authorized Contact Representative</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Full Contact Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      placeholder="e.g. Farooq Ahmad"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    WhatsApp / Direct Phone Number *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 94190 00000"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Official Business Email Address *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="procurement@company.com"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Showroom / Godown Location */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#FF4035",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "1.5px solid #F1F5F9",
                }}
              >
                <MapPin size={16} />
                <span>3. Business Location & Godown Address</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Registered Showroom / Godown Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Shop/Building No., Road, Landmark"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue="Srinagar"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    State / UT *
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue="Jammu and Kashmir"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Postal / PIN Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    defaultValue="190001"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Security Credentials */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#FF4035",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "1.5px solid #F1F5F9",
                }}
              >
                <Lock size={16} />
                <span>4. Portal Security Credentials</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Set Portal Password (Min 6 chars) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="••••••••••••"
                      style={{
                        width: "100%",
                        padding: "12px 42px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
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
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Confirm Portal Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      placeholder="••••••••••••"
                      style={{
                        width: "100%",
                        padding: "12px 42px 12px 42px",
                        borderRadius: "10px",
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.9rem",
                        color: "#0F172A",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#FF4035"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.backgroundColor = "#F8FAFC"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ paddingTop: "12px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #FF4035 0%, #D92318 100%)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 8px 20px rgba(255, 64, 53, 0.35)",
                  transition: "all 0.2s ease",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Transmitting Trade Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Dealer Application</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#64748B", marginTop: "16px" }}>
                Already have an approved wholesale account?{" "}
                <Link
                  href="/dealer/login"
                  style={{ color: "#FF4035", fontWeight: 700, textDecoration: "none" }}
                >
                  Log in to Dealer Desk
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
