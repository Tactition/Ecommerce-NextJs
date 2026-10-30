"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardStats, ContactSubmission } from "@/types";
import { Product } from "@/lib/actions/products";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  TrendingUp,
  Package,
  FolderTree,
  Compass,
  Mail,
  IndianRupee,
  Activity,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  Server,
  Zap,
  X,
  ShoppingBag,
} from "lucide-react";

interface DashboardV2Props {
  stats: DashboardStats;
  recentSubmissions: ContactSubmission[];
  recentProducts: Product[];
}

export default function DashboardV2({ stats, recentSubmissions, recentProducts }: DashboardV2Props) {
  const searchParams = useSearchParams();
  const unauthorizedModule = searchParams?.get("unauthorized");
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    if (unauthorizedModule) {
      setShowUnauthorizedAlert(true);
    }
  }, [unauthorizedModule]);

  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<"revenue" | "diagnostics">("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 600);
  };

  // Mock revenue & service activity points for SVG animated chart
  const weeklyData = [
    { day: "Mon", revenue: 14200, diagnostics: 18 },
    { day: "Tue", revenue: 18900, diagnostics: 24 },
    { day: "Wed", revenue: 16400, diagnostics: 21 },
    { day: "Thu", revenue: 22800, diagnostics: 32 },
    { day: "Fri", revenue: 29500, diagnostics: 41 },
    { day: "Sat", revenue: 34100, diagnostics: 48 },
    { day: "Sun", revenue: 21600, diagnostics: 29 },
  ];

  const maxVal = chartMetric === "revenue" ? 38000 : 55;

  return (
    <div style={{ color: "#0F172A", paddingBottom: "40px" }}>
      {/* Unauthorized Access Alert */}
      {showUnauthorizedAlert && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "14px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            marginBottom: "24px",
            boxShadow: "0 4px 14px rgba(239, 68, 68, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} color="#DC2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#991B1B" }}>
                Restricted Access
              </div>
              <div style={{ fontSize: "0.85rem", color: "#B91C1C", marginTop: "2px" }}>
                Your current role lacks view privileges for the <strong>{unauthorizedModule !== "1" ? unauthorizedModule : "requested"}</strong> module. Contact an administrator to request access.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUnauthorizedAlert(false)}
            style={{
              background: "none",
              border: "none",
              color: "#991B1B",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
            title="Dismiss notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* V2 Top Real-Time Command Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A111E 0%, #172554 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          color: "#FFFFFF",
          marginBottom: "32px",
          boxShadow: "0 12px 35px rgba(10, 17, 30, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 64, 53, 0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(16, 185, 129, 0.18)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#34D399",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    boxShadow: "0 0 10px #10B981",
                    display: "inline-block",
                  }}
                />
                Live Real-Time Engine v2
              </span>

              <span style={{ fontSize: "0.82rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={13} /> {timeStr || "Synchronizing..."}
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.3rem)", fontWeight: 800, margin: 0, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              Wall Street Command Center <span style={{ color: "#D4AF37", fontSize: "1.2rem", verticalAlign: "super" }}>PRO</span>
            </h1>
            <p style={{ color: "#CBD5E1", fontSize: "0.95rem", margin: "6px 0 0 0" }}>
              Full operational control over storefront inventory, categories, navigation menus, and client inquiries.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={handleManualRefresh}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                padding: "10px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.88rem",
                fontWeight: 600,
                backdropFilter: "blur(6px)",
                transition: "all 0.2s ease",
              }}
            >
              <RefreshCw size={15} className={isRefreshing ? "spin-animation" : ""} />
              <span>Sync Now</span>
            </button>

            <Link
              href="/dashboard/products"
              className="abid-btn"
              style={{
                backgroundColor: "#FF4035",
                color: "#FFFFFF",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.88rem",
                boxShadow: "0 4px 15px rgba(255, 64, 53, 0.4)",
              }}
            >
              <Plus size={16} />
              <span>New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (6 Top Cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* KPI 0: Customer Orders */}
        <Link
          href="/dashboard/orders"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={24} />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#059669",
                  backgroundColor: "#D1FAE5",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                }}
              >
                {stats.pendingOrdersCount ? `${stats.pendingOrdersCount} Pending` : "Real-Time Sync"}
              </span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1 }}>
              {stats.ordersCount || 0}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#64748B", marginTop: "4px" }}>
              Customer Orders
            </div>
            <div style={{ fontSize: "0.78rem", color: "#059669", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpRight size={14} /> ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Revenue
            </div>
          </div>
        </Link>

        {/* KPI 1: Products */}
        <Link
          href="/dashboard/products"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#EEF2FF",
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={24} />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#10B981",
                  backgroundColor: "#ECFDF5",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                }}
              >
                Live Catalog
              </span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1 }}>
              {stats.productsCount}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#64748B", marginTop: "4px" }}>
              Store Products
            </div>
            <div style={{ fontSize: "0.78rem", color: "#10B981", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpRight size={14} /> Controlled via Admin Panel
            </div>
          </div>
        </Link>

        {/* KPI 2: Categories */}
        <Link
          href="/dashboard/categories"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FolderTree size={24} />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#D97706",
                  backgroundColor: "#FFFBEB",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                }}
              >
                Storefront Taxonomies
              </span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1 }}>
              {stats.categoriesCount}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#64748B", marginTop: "4px" }}>
              Active Categories
            </div>
            <div style={{ fontSize: "0.78rem", color: "#D97706", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpRight size={14} /> Powers Homepage Sliders
            </div>
          </div>
        </Link>

        {/* KPI 3: Menus */}
        <Link
          href="/dashboard/menus"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#F3E8FF",
                  color: "#9333EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Compass size={24} />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#9333EA",
                  backgroundColor: "#FAF5FF",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                }}
              >
                Header & Footer
              </span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1 }}>
              {stats.menusCount}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#64748B", marginTop: "4px" }}>
              Nav Menu Links
            </div>
            <div style={{ fontSize: "0.78rem", color: "#9333EA", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpRight size={14} /> Zero Page Reload Routing
            </div>
          </div>
        </Link>

        {/* KPI 4: Inquiries & Submissions */}
        <Link
          href="/dashboard/submissions"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: stats.unreadSubmissionsCount > 0 ? "#FFEBEA" : "#F1F5F9",
                  color: stats.unreadSubmissionsCount > 0 ? "#FF4035" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail size={24} />
              </div>
              {stats.unreadSubmissionsCount > 0 ? (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: "#FF4035",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  {stats.unreadSubmissionsCount} New
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748B",
                    backgroundColor: "#F1F5F9",
                    padding: "4px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  All Read
                </span>
              )}
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1 }}>
              {stats.totalSubmissionsCount}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#64748B", marginTop: "4px" }}>
              Diagnostic Inquiries
            </div>
            <div style={{ fontSize: "0.78rem", color: "#FF4035", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpRight size={14} /> Customer Contact Forms
            </div>
          </div>
        </Link>
      </div>

      {/* Real-time Analytics Visualizer (SVG Chart + Distribution) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Left Chart Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "18px",
            padding: "28px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-secondary)", margin: 0 }}>
                Weekly Interior Furnishing & Trade Orders Velocity
              </h3>
              <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                Real-time transaction tracking and service requests
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "8px" }}>
              <button
                onClick={() => setChartMetric("revenue")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: chartMetric === "revenue" ? "#FFFFFF" : "transparent",
                  color: chartMetric === "revenue" ? "var(--color-primary)" : "#64748B",
                  boxShadow: chartMetric === "revenue" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric("diagnostics")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: chartMetric === "diagnostics" ? "#FFFFFF" : "transparent",
                  color: chartMetric === "diagnostics" ? "var(--color-primary)" : "#64748B",
                  boxShadow: chartMetric === "diagnostics" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Inquiries
              </button>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div style={{ height: "220px", width: "100%", position: "relative" }}>
            <svg viewBox="0 0 700 220" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4035" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF4035" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line key={y} x1="30" y1={y} x2="680" y2={y} stroke="#F1F5F9" strokeWidth="1" />
              ))}

              {/* Area path */}
              <path
                d={
                  `M 30,${200 - (weeklyData[0][chartMetric] / maxVal) * 160} ` +
                  weeklyData
                    .slice(1)
                    .map((d, i) => {
                      const x = 30 + ((i + 1) * 650) / 6;
                      const y = 200 - (d[chartMetric] / maxVal) * 160;
                      return `L ${x},${y} `;
                    })
                    .join("") +
                  `L 680,200 L 30,200 Z`
                }
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <path
                d={
                  `M 30,${200 - (weeklyData[0][chartMetric] / maxVal) * 160} ` +
                  weeklyData
                    .slice(1)
                    .map((d, i) => {
                      const x = 30 + ((i + 1) * 650) / 6;
                      const y = 200 - (d[chartMetric] / maxVal) * 160;
                      return `L ${x},${y} `;
                    })
                    .join("")
                }
                fill="none"
                stroke="#FF4035"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {weeklyData.map((d, i) => {
                const x = 30 + (i * 650) / 6;
                const y = 200 - (d[chartMetric] / maxVal) * 160;
                const isHovered = activeChartPoint === i;

                return (
                  <g key={i} onMouseEnter={() => setActiveChartPoint(i)} onMouseLeave={() => setActiveChartPoint(null)} style={{ cursor: "pointer" }}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 4.5}
                      fill={isHovered ? "#FF4035" : "#FFFFFF"}
                      stroke="#FF4035"
                      strokeWidth="2.5"
                      style={{ transition: "all 0.2s ease" }}
                    />
                    <text x={x} y="218" textAnchor="middle" fontSize="12" fill="#64748B" fontWeight="600">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {activeChartPoint !== null && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#0A111E",
                  color: "#FFFFFF",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  pointerEvents: "none",
                }}
              >
                <strong>{weeklyData[activeChartPoint].day}:</strong>{" "}
                {chartMetric === "revenue"
                  ? `₹${weeklyData[activeChartPoint].revenue.toLocaleString()}`
                  : `${weeklyData[activeChartPoint].diagnostics} diagnostic requests`}
              </div>
            )}
          </div>
        </div>

        {/* Right Distribution Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "18px",
            padding: "28px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-secondary)", margin: 0 }}>
                Inventory & Taxonomies
              </h3>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#10B981" }}>99.2% Health</span>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "20px" }}>
              Product distribution across active departments
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { name: "Luxury Furniture & Lounges", pct: 34, color: "#D4AF37" },
                { name: "Acoustic Wood Panels & 3D Walls", pct: 28, color: "#4F46E5" },
                { name: "Modular Kitchens & Closets", pct: 20, color: "#10B981" },
                { name: "Architectural Lighting Fixtures", pct: 12, color: "#F59E0B" },
                { name: "B2B Hardware & European Fittings", pct: 6, color: "#8B5CF6" },
              ].map((item) => (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                    <span>{item.name}</span>
                    <span style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: "7px", borderRadius: "9999px", backgroundColor: "#F1F5F9", overflow: "hidden" }}>
                    <div style={{ width: `${item.pct}%`, height: "100%", backgroundColor: item.color, borderRadius: "9999px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px", borderTop: "1px solid #F1F5F9", marginTop: "20px" }}>
            <Link
              href="/dashboard/categories"
              className="abid-btn abid-btn-secondary"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
            >
              <FolderTree size={15} />
              <span>Manage Categories</span>
            </Link>
            <Link
              href="/dashboard/menus"
              className="abid-btn abid-btn-secondary"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
            >
              <Compass size={15} />
              <span>Manage Navigation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Tables Row: Recent Products & Inquiries */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
        {/* Table 1: Recent Products */}
        <div className="data-table-wrapper" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-secondary)", margin: 0 }}>
                Storefront Inventory
              </h4>
              <p style={{ color: "#64748B", fontSize: "0.82rem", margin: "2px 0 0 0" }}>
                Latest items loaded from database
              </p>
            </div>
            <Link
              href="/dashboard/products"
              style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>View All ({stats.productsCount})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#F1F5F9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Package size={16} color="#94A3B8" />
                        )}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--color-secondary)" }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "var(--color-secondary)" }}>₹{p.price.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", background: "#F1F5F9", padding: "2px 8px", borderRadius: "4px" }}>
                      {p.category_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: p.stock > 0 ? "#10B981" : "#EF4444" }}>
                      {p.stock} units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Recent Customer Submissions */}
        <div className="data-table-wrapper" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-secondary)", margin: 0 }}>
                Live Customer Inquiries
              </h4>
              <p style={{ color: "#64748B", fontSize: "0.82rem", margin: "2px 0 0 0" }}>
                Diagnostic requests submitted via website
              </p>
            </div>
            <Link
              href="/dashboard/submissions"
              style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>View All ({stats.totalSubmissionsCount})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.slice(0, 5).map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--color-secondary)" }}>{sub.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{sub.phone}</div>
                  </td>
                  <td>
                    <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                      {sub.subject}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={sub.status} type="submission" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
