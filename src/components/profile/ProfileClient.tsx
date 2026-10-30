"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Printer,
  Edit3,
  Key,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  LogOut,
  ArrowRight,
  FileText,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  UserProfileData,
  UserOrder,
  UserProfileStats,
  updateUserProfileAction,
  changeUserPasswordAction,
  cancelUserOrderAction,
} from "@/lib/actions/profile";
import { logoutAction } from "@/lib/actions/auth";

interface ProfileClientProps {
  initialProfile: UserProfileData;
  initialOrders: UserOrder[];
  stats: UserProfileStats;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
}

export default function ProfileClient({
  initialProfile,
  initialOrders,
  stats,
  companyPhone = "",
  companyEmail = "",
  companyAddress = "",
}: ProfileClientProps) {
  const router = useRouter();

  // Active Tab: 'orders' | 'profile' | 'security' | 'support'
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "security" | "support">("orders");

  // Orders Filter and Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<UserOrder | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);
  const [profileForm, setProfileForm] = useState({
    name: initialProfile.name || "",
    phone: initialProfile.phone || "",
    addressLine1: initialProfile.address_line1 || "",
    city: initialProfile.city || "",
    state: initialProfile.state || "",
    postalCode: initialProfile.postal_code || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Copy feedback
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // 1. Status Filter
      if (orderStatusFilter === "active") {
        const s = order.order_status.toLowerCase();
        if (s === "delivered" || s === "cancelled") return false;
      } else if (orderStatusFilter === "delivered") {
        if (order.order_status.toLowerCase() !== "delivered") return false;
      } else if (orderStatusFilter === "cancelled") {
        if (order.order_status.toLowerCase() !== "cancelled") return false;
      }

      // 2. Search query filter
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesCity = order.city.toLowerCase().includes(q);
        const matchesItems = order.items.some(
          (it) => it.product_name.toLowerCase().includes(q) || (it.sku && it.sku.toLowerCase().includes(q))
        );
        return matchesNumber || matchesCity || matchesItems;
      }

      return true;
    });
  }, [initialOrders, orderStatusFilter, orderSearchQuery]);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);

    const res = await updateUserProfileAction(profileForm);
    setIsSavingProfile(false);

    if (res.success) {
      setProfileFeedback({ type: "success", message: res.message || "Profile updated successfully." });
      setProfile((prev) => ({
        ...prev,
        name: profileForm.name,
        phone: profileForm.phone || null,
        address_line1: profileForm.addressLine1 || null,
        city: profileForm.city || null,
        state: profileForm.state || null,
        postal_code: profileForm.postalCode || null,
      }));
      router.refresh();
    } else {
      setProfileFeedback({ type: "error", message: res.error || "Failed to save profile." });
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New passwords do not match." });
      setIsChangingPassword(false);
      return;
    }

    const res = await changeUserPasswordAction(passwordForm);
    setIsChangingPassword(false);

    if (res.success) {
      setPasswordFeedback({ type: "success", message: res.message || "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPasswordFeedback({ type: "error", message: res.error || "Failed to update password." });
    }
  };

  // Handle Order Cancel
  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    setCancelError(null);

    const res = await cancelUserOrderAction(cancellingOrder.id, cancelReason);
    setIsCancelling(false);

    if (res.success) {
      setCancellingOrder(null);
      setCancelReason("");
      router.refresh();
    } else {
      setCancelError(res.error || "Could not cancel this order.");
    }
  };

  // Copy Order Number
  const copyOrderNumber = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedOrderId(num);
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Print Invoice
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // User Initials
  const initials = profile.name
    ? profile.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "U";

  // Helpers for Status Badges
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "delivered":
        return {
          bg: "#ECFDF5",
          color: "#059669",
          border: "#A7F3D0",
          icon: <CheckCircle2 size={13} className="me-1" />,
          label: "Delivered",
        };
      case "shipped":
        return {
          bg: "#EFF6FF",
          color: "#2563EB",
          border: "#BFDBFE",
          icon: <Truck size={13} className="me-1" />,
          label: "Out for Delivery / Shipped",
        };
      case "processing":
        return {
          bg: "#FEF3C7",
          color: "#D97706",
          border: "#FDE68A",
          icon: <Clock size={13} className="me-1" />,
          label: "Crafting & Processing",
        };
      case "confirmed":
        return {
          bg: "#EEF2FF",
          color: "#4F46E5",
          border: "#C7D2FE",
          icon: <CheckCircle2 size={13} className="me-1" />,
          label: "Order Confirmed",
        };
      case "cancelled":
        return {
          bg: "#FEF2F2",
          color: "#DC2626",
          border: "#FECACA",
          icon: <XCircle size={13} className="me-1" />,
          label: "Cancelled",
        };
      default:
        return {
          bg: "#FFF7ED",
          color: "#EA580C",
          border: "#FFEDD5",
          icon: <Clock size={13} className="me-1" />,
          label: "Payment & Order Pending",
        };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return { bg: "#ECFDF5", color: "#059669", label: "Paid" };
    }
    if (s === "refunded") {
      return { bg: "#F3F4F6", color: "#4B5563", label: "Refunded" };
    }
    return { bg: "#FEF3C7", color: "#B45309", label: "Pending Payment" };
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Breadcrumb Section */}
      <div
        style={{
          backgroundColor: "#0F172A",
          color: "#FFFFFF",
          padding: "36px 0 32px 0",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                <Link href="/" style={{ color: "#CBD5E1", textDecoration: "none" }}>
                  Home
                </Link>
                <span>/</span>
                <span style={{ color: "#FF4035", fontWeight: 600 }}>My Account</span>
              </div>
              <h1 style={{ color: "#FFFFFF", fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>
                Customer Account Dashboard
              </h1>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                href="/shop"
                className="theme-btn"
                style={{
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Profile Card Banner */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "24px 28px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            marginBottom: "24px",
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF4035 0%, #B91C1C 100%)",
                  color: "#FFFFFF",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 16px -4px rgba(255, 64, 53, 0.4)",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#0F172A" }}>
                    {profile.name}
                  </h3>
                  <span
                    style={{
                      background: profile.role === "admin" ? "#FEF2F2" : "#F1F5F9",
                      color: profile.role === "admin" ? "#DC2626" : "#475569",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {profile.role === "admin" ? "Store Administrator" : "Verified Customer"}
                  </span>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-3 mt-1" style={{ fontSize: "0.85rem", color: "#64748B" }}>
                  <span className="d-flex align-items-center gap-1">
                    <Mail size={14} color="#94A3B8" /> {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="d-flex align-items-center gap-1">
                      <Phone size={14} color="#94A3B8" /> {profile.phone}
                    </span>
                  )}
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={14} color="#94A3B8" /> Joined {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {profile.role === "admin" && (
                <Link
                  href="/dashboard"
                  style={{
                    backgroundColor: "#0F172A",
                    color: "#FFFFFF",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={15} color="#FFD700" /> Admin Command Center
                </Link>
              )}
              <button
                type="button"
                onClick={() => logoutAction("/login")}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #CBD5E1",
                  color: "#475569",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEE2E2";
                  e.currentTarget.style.color = "#DC2626";
                  e.currentTarget.style.borderColor = "#FCA5A5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#475569";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="row g-3 mt-3 pt-3 border-top">
            <div className="col-6 col-md-3">
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "#EFF6FF",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Orders
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                    {stats.totalOrders}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                    In Transit
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                    {stats.activeOrders}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                    Delivered
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                    {stats.completedOrders}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "#FFF1F0",
                    color: "#FF4035",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Spent
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                    ₹{stats.totalSpent.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "2px solid #E2E8F0",
            marginBottom: "28px",
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: "transparent",
              color: activeTab === "orders" ? "#FF4035" : "#64748B",
              fontWeight: activeTab === "orders" ? 700 : 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              borderBottom: activeTab === "orders" ? "3px solid #FF4035" : "3px solid transparent",
              marginBottom: "-2px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Package size={18} />
            My Orders ({initialOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: "transparent",
              color: activeTab === "profile" ? "#FF4035" : "#64748B",
              fontWeight: activeTab === "profile" ? 700 : 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              borderBottom: activeTab === "profile" ? "3px solid #FF4035" : "3px solid transparent",
              marginBottom: "-2px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <User size={18} />
            Personal Details & Address
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: "transparent",
              color: activeTab === "security" ? "#FF4035" : "#64748B",
              fontWeight: activeTab === "security" ? 700 : 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              borderBottom: activeTab === "security" ? "3px solid #FF4035" : "3px solid transparent",
              marginBottom: "-2px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Key size={18} />
            Password & Security
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("support")}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: "transparent",
              color: activeTab === "support" ? "#FF4035" : "#64748B",
              fontWeight: activeTab === "support" ? 700 : 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              borderBottom: activeTab === "support" ? "3px solid #FF4035" : "3px solid transparent",
              marginBottom: "-2px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck size={18} />
            Help & Concierge
          </button>
        </div>

        {/* TAB 1: MY ORDERS */}
        {activeTab === "orders" && (
          <div>
            {/* Filter and Search Bar */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              {/* Status filter buttons */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "active", label: "Active / In Transit" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(tab.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      border: orderStatusFilter === tab.id ? "1px solid #FF4035" : "1px solid #E2E8F0",
                      backgroundColor: orderStatusFilter === tab.id ? "#FF4035" : "#F8FAFC",
                      color: orderStatusFilter === tab.id ? "#FFFFFF" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search
                  size={16}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search order #, product..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Orders Listing */}
            {filteredOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "#F1F5F9",
                    color: "#94A3B8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Package size={36} />
                </div>
                <h4 style={{ color: "#0F172A", fontWeight: 700, marginBottom: "8px" }}>
                  {initialOrders.length === 0 ? "You haven't placed any orders yet" : "No orders match your filter"}
                </h4>
                <p style={{ color: "#64748B", maxWidth: "460px", margin: "0 auto 24px auto", fontSize: "0.92rem" }}>
                  {initialOrders.length === 0
                    ? "Explore our luxury furniture, architectural wall paneling, and bespoke decor collections handcrafted for timeless spaces."
                    : "Try resetting your search query or selecting a different status filter."}
                </p>
                {initialOrders.length === 0 ? (
                  <Link href="/shop" className="theme-btn" style={{ padding: "10px 26px", fontSize: "0.9rem" }}>
                    Start Shopping <ArrowRight size={16} className="ms-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter("all");
                      setOrderSearchQuery("");
                    }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      backgroundColor: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      color: "#334155",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.order_status);
                  const payBadge = getPaymentStatusBadge(order.payment_status);
                  const canCancel =
                    order.order_status.toLowerCase() === "pending" ||
                    order.order_status.toLowerCase() === "confirmed";

                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "14px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Order Card Top Bar */}
                      <div
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                          padding: "16px 20px",
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                              Order Reference
                            </span>
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.98rem" }}>
                                {order.order_number}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyOrderNumber(order.order_number)}
                                title="Copy Order Number"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: copiedOrderId === order.order_number ? "#059669" : "#94A3B8",
                                  cursor: "pointer",
                                  padding: "2px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {copiedOrderId === order.order_number ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          <div style={{ height: "24px", width: "1px", backgroundColor: "#CBD5E1" }} className="d-none d-sm-block" />

                          <div>
                            <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                              Date Placed
                            </span>
                            <span style={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>
                              {new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          {/* Payment status */}
                          <span
                            style={{
                              backgroundColor: payBadge.bg,
                              color: payBadge.color,
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {order.payment_method?.toUpperCase()} • {payBadge.label}
                          </span>

                          {/* Order Status Badge */}
                          <span
                            style={{
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.color,
                              border: `1px solid ${statusBadge.border}`,
                              padding: "4px 12px",
                              borderRadius: "14px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview List */}
                      <div style={{ padding: "20px" }}>
                        <div className="row g-3">
                          <div className="col-12 col-lg-8">
                            <div className="d-flex flex-column gap-3">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="d-flex align-items-center justify-content-between gap-3 pb-2"
                                  style={{ borderBottom: "1px dashed #F1F5F9" }}
                                >
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        backgroundColor: "#F1F5F9",
                                        flexShrink: 0,
                                        border: "1px solid #E2E8F0",
                                      }}
                                    >
                                      {item.product_image ? (
                                        <img
                                          src={item.product_image}
                                          alt={item.product_name}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                                          <Package size={22} />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <Link
                                        href={`/product/${item.product_slug}`}
                                        style={{
                                          color: "#0F172A",
                                          fontWeight: 600,
                                          fontSize: "0.92rem",
                                          textDecoration: "none",
                                          display: "block",
                                        }}
                                      >
                                        {item.product_name}
                                      </Link>
                                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                                        <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                                          {Object.entries(item.attributes)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(" | ")}
                                        </div>
                                      )}
                                      <div style={{ fontSize: "0.82rem", color: "#94A3B8", marginTop: "2px" }}>
                                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ textAlign: "right", fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>
                                    ₹{Number(item.total_price).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary & Actions Column */}
                          <div className="col-12 col-lg-4">
                            <div
                              style={{
                                backgroundColor: "#F8FAFC",
                                borderRadius: "10px",
                                padding: "16px",
                                border: "1px solid #E2E8F0",
                              }}
                            >
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.85rem", color: "#64748B" }}>
                                <span>Subtotal:</span>
                                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                              </div>
                              {order.discount_amount > 0 && (
                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.85rem", color: "#059669" }}>
                                  <span>Discount ({order.coupon_code || "Promo"}):</span>
                                  <span>-₹{order.discount_amount.toLocaleString("en-IN")}</span>
                                </div>
                              )}
                              <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.85rem", color: "#64748B" }}>
                                <span>White-Glove Shipping:</span>
                                <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
                              </div>
                              <div
                                className="d-flex justify-content-between pt-2 border-top"
                                style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}
                              >
                                <span>Total Paid:</span>
                                <span style={{ color: "#FF4035" }}>₹{order.total_amount.toLocaleString("en-IN")}</span>
                              </div>

                              <div className="mt-3 d-flex flex-column gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  style={{
                                    backgroundColor: "#0F172A",
                                    color: "#FFFFFF",
                                    border: "none",
                                    padding: "9px 14px",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Eye size={15} /> View Full Order & Invoice
                                </button>

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => setCancellingOrder(order)}
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "#DC2626",
                                      border: "1px solid #FECACA",
                                      padding: "7px 14px",
                                      borderRadius: "8px",
                                      fontSize: "0.82rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Request Cancellation
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address snippet */}
                        <div
                          className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2"
                          style={{ fontSize: "0.82rem", color: "#64748B" }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <MapPin size={15} color="#94A3B8" />
                            <span>
                              Shipping to:{" "}
                              <strong style={{ color: "#334155" }}>
                                {order.first_name} {order.last_name}
                              </strong>{" "}
                              — {order.address_line1}, {order.city}, {order.state} - {order.postal_code}
                            </span>
                          </div>

                          <div style={{ color: "#94A3B8" }}>
                            Contact: {order.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE DETAILS & ADDRESS */}
        {activeTab === "profile" && (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  padding: "28px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <User size={22} color="#FF4035" />
                  <h4 style={{ margin: 0, fontWeight: 700, color: "#0F172A" }}>
                    Personal Information & Default Address
                  </h4>
                </div>
                <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "24px" }}>
                  Keep your contact info and default shipping destination up to date for expedited luxury delivery.
                </p>

                {profileFeedback && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      backgroundColor: profileFeedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
                      color: profileFeedback.type === "success" ? "#065F46" : "#991B1B",
                      border: `1px solid ${profileFeedback.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {profileFeedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {profileFeedback.message}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        Email Address
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="email"
                          disabled
                          value={profile.email}
                          style={{
                            width: "100%",
                            padding: "10px 36px 10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            backgroundColor: "#F8FAFC",
                            color: "#64748B",
                            fontSize: "0.92rem",
                            cursor: "not-allowed",
                          }}
                        />
                        <span title="Verified Account Email" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "inline-flex" }}>
                          <ShieldCheck size={18} color="#059669" />
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "4px", display: "block" }}>
                        Primary login email cannot be changed directly.
                      </span>
                    </div>

                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        Town / City
                      </label>
                      <input
                        type="text"
                        placeholder="Town / City"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>

                    <div className="col-12">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        Default Delivery Address Line
                      </label>
                      <input
                        type="text"
                        placeholder="Street address / Landmark"
                        value={profileForm.addressLine1}
                        onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        State / Province
                      </label>
                      <input
                        type="text"
                        placeholder="State / Province"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                        PIN / Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="PIN / Postal Code"
                        value={profileForm.postalCode}
                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "0.92rem",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="theme-btn"
                      style={{
                        padding: "10px 24px",
                        fontSize: "0.92rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isSavingProfile ? (
                        <>Saving Changes...</>
                      ) : (
                        <>
                          <Check size={16} /> Save Profile Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  padding: "24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <h5 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>
                  Account Security Status
                </h5>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#ECFDF5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0F172A" }}>
                        Encrypted Authentication
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                        Protected with bcrypt cryptographic hashing and HTTP-only session tokens.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#EFF6FF",
                        color: "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0F172A" }}>
                        Saved Delivery Address
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                        {profile.address_line1
                          ? `${profile.address_line1}, ${profile.city || ""}`
                          : "No address saved yet. Update your address on the left."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    style={{
                      width: "100%",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      padding: "9px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Key size={15} /> Change Account Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PASSWORD & SECURITY */}
        {activeTab === "security" && (
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  padding: "32px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Key size={22} color="#FF4035" />
                  <h4 style={{ margin: 0, fontWeight: 700, color: "#0F172A" }}>
                    Change Password
                  </h4>
                </div>
                <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "24px" }}>
                  Ensure your account is using a long, random password to stay secure.
                </p>

                {passwordFeedback && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      backgroundColor: passwordFeedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
                      color: passwordFeedback.type === "success" ? "#065F46" : "#991B1B",
                      border: `1px solid ${passwordFeedback.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {passwordFeedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {passwordFeedback.message}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.92rem",
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                      New Password * (Min. 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.92rem",
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.92rem",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="theme-btn w-100"
                    style={{
                      padding: "11px",
                      fontSize: "0.92rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isChangingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HELP & CONCIERGE */}
        {activeTab === "support" && (
          <div className="row g-4">
            {companyPhone ? (
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    padding: "28px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "#FFF1F0",
                      color: "#FF4035",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Phone size={24} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                    Direct Phone Support
                  </h5>
                  <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "16px" }}>
                    Speak directly with our client care representatives regarding orders, custom finishes, or delivery schedules.
                  </p>
                  <a
                    href={`tel:${companyPhone.replace(/\s+/g, "")}`}
                    style={{
                      color: "#FF4035",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "1rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {companyPhone} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : null}

            {companyEmail ? (
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    padding: "28px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "#EFF6FF",
                      color: "#2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Mail size={24} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                    Email Concierge
                  </h5>
                  <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "16px" }}>
                    Send us your inquiries, floor plans, or invoice requests.
                  </p>
                  <a
                    href={`mailto:${companyEmail}`}
                    style={{
                      color: "#2563EB",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {companyEmail} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : null}

            {companyAddress ? (
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    padding: "28px",
                    height: "100%",
                  }}
                >
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
                      marginBottom: "16px",
                    }}
                  >
                    <MapPin size={24} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                    Design Studio & Atelier
                  </h5>
                  <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "16px" }}>
                    {companyAddress}
                  </p>
                  <Link
                    href="/contact"
                    style={{
                      color: "#059669",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Book In-Person Consultation <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* MODAL 1: FULL ORDER DETAILS & INVOICE MODAL */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div>
                <span style={{ fontSize: "0.78rem", color: "#64748B", textTransform: "uppercase" }}>
                  Tax Invoice & Order Receipt
                </span>
                <h4 style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: "1.25rem" }}>
                  {selectedOrder.order_number}
                </h4>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#334155",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={15} /> Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "4px 8px",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }} id="printable-invoice">
              {/* Top Banner Info */}
              <div className="row g-4 mb-4 pb-4 border-bottom">
                <div className="col-6 col-md-3">
                  <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                    Order Date
                  </span>
                  <span style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.92rem" }}>
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="col-6 col-md-3">
                  <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                    Order Status
                  </span>
                  <span
                    style={{
                      ...getStatusBadge(selectedOrder.order_status),
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      marginTop: "2px",
                    }}
                  >
                    {selectedOrder.order_status?.toUpperCase()}
                  </span>
                </div>

                <div className="col-6 col-md-3">
                  <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                    Payment Method
                  </span>
                  <span style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.92rem", textTransform: "uppercase" }}>
                    {selectedOrder.payment_method}
                  </span>
                </div>

                <div className="col-6 col-md-3">
                  <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", display: "block" }}>
                    Payment Status
                  </span>
                  <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.92rem", textTransform: "uppercase" }}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Addresses */}
              <div className="row g-4 mb-4 pb-4 border-bottom">
                <div className="col-12 col-md-6">
                  <h6 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px", fontSize: "0.9rem" }}>
                    Billing Details
                  </h6>
                  <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6 }}>
                    <strong>{selectedOrder.first_name} {selectedOrder.last_name}</strong>
                    <br />
                    {selectedOrder.email}
                    <br />
                    Phone: {selectedOrder.phone}
                    <br />
                    {selectedOrder.address_line1}
                    {selectedOrder.address_line2 ? `, ${selectedOrder.address_line2}` : ""}
                    <br />
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postal_code}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <h6 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px", fontSize: "0.9rem" }}>
                    Shipping Address
                  </h6>
                  <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6 }}>
                    {selectedOrder.ship_to_different ? (
                      <>
                        <strong>
                          {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}
                        </strong>
                        <br />
                        {selectedOrder.shipping_address_line1}
                        {selectedOrder.shipping_address_line2 ? `, ${selectedOrder.shipping_address_line2}` : ""}
                        <br />
                        {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_postal_code}
                      </>
                    ) : (
                      <>Same as billing address</>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <h6 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "12px", fontSize: "0.95rem" }}>
                Purchased Articles ({selectedOrder.items.length})
              </h6>
              <div className="table-responsive mb-4">
                <table className="table align-middle" style={{ margin: 0 }}>
                  <thead style={{ backgroundColor: "#F8FAFC", fontSize: "0.78rem", textTransform: "uppercase", color: "#64748B" }}>
                    <tr>
                      <th style={{ padding: "10px 14px" }}>Item Description</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Unit Price</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div className="d-flex align-items-center gap-2">
                            {it.product_image ? (
                              <img
                                src={it.product_image}
                                alt={it.product_name}
                                style={{ width: "42px", height: "42px", borderRadius: "6px", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: "42px", height: "42px", borderRadius: "6px", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                                <Package size={18} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>
                                {it.product_name}
                              </div>
                              {it.attributes && Object.keys(it.attributes).length > 0 && (
                                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                                  {Object.entries(it.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                </div>
                              )}
                              {it.sku && (
                                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                                  SKU: {it.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "0.88rem", color: "#475569" }}>
                          ₹{it.price.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "0.88rem", fontWeight: 600 }}>
                          {it.quantity}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontSize: "0.92rem", fontWeight: 700, color: "#0F172A" }}>
                          ₹{it.total_price.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Calculations */}
              <div className="d-flex justify-content-end mb-4">
                <div style={{ width: "280px" }}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.88rem", color: "#64748B" }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>
                      ₹{selectedOrder.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {selectedOrder.discount_amount > 0 && (
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.88rem", color: "#059669" }}>
                      <span>Discount ({selectedOrder.coupon_code || "Applied"}):</span>
                      <span style={{ fontWeight: 600 }}>
                        -₹{selectedOrder.discount_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.88rem", color: "#64748B" }}>
                    <span>White-Glove Shipping:</span>
                    <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
                  </div>

                  <div
                    className="d-flex justify-content-between pt-2 border-top"
                    style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A" }}
                  >
                    <span>Grand Total:</span>
                    <span style={{ color: "#FF4035" }}>
                      ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Notes if present */}
              {selectedOrder.order_notes && (
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    fontSize: "0.85rem",
                    color: "#475569",
                  }}
                >
                  <strong style={{ color: "#0F172A", display: "block", marginBottom: "4px" }}>
                    Order Instructions / Activity Notes:
                  </strong>
                  <div style={{ whiteSpace: "pre-wrap" }}>{selectedOrder.order_notes}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER CANCELLATION REQUEST */}
      {cancellingOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setCancellingOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={26} />
            </div>

            <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
              Cancel Order {cancellingOrder.order_number}?
            </h4>
            <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "20px" }}>
              Are you sure you want to cancel this order? Once cancelled, the manufacturing and delivery process will be immediately halted.
            </p>

            {cancelError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                }}
              >
                {cancelError}
              </div>
            )}

            <div className="mb-4">
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>
                Reason for Cancellation (Optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.88rem",
                  marginBottom: "8px",
                }}
              >
                <option value="">Select a reason...</option>
                <option value="Changed mind / Ordered by mistake">Changed mind / Ordered by mistake</option>
                <option value="Need to change delivery address or dimensions">Need to change delivery address or dimensions</option>
                <option value="Found alternative product">Found alternative product</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
