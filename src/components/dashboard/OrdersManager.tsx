"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  AdminOrderSummary,
  AdminOrderStats,
  PlacedOrder,
  getAllOrdersAdminAction,
  getOrderDetailsAdminAction,
  updateOrderStatusAction,
  updateOrderPaymentStatusAction,
  deleteOrderAction,
} from "@/lib/actions/orders";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  FileText,
  Phone,
  Mail,
  Building,
  MapPin,
  ExternalLink,
  Download,
  Printer,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  Check,
  Send,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";

interface OrdersManagerProps {
  initialOrders: AdminOrderSummary[];
  initialStats: AdminOrderStats;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; border: string; icon: any }
> = {
  pending: {
    label: "Pending",
    bg: "#FEF3C7",
    color: "#D97706",
    border: "#FDE68A",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
    icon: CheckCircle2,
  },
  processing: {
    label: "In Production",
    bg: "#F5F3FF",
    color: "#7C3AED",
    border: "#DDD6FE",
    icon: Package,
  },
  shipped: {
    label: "Dispatched",
    bg: "#ECFEFF",
    color: "#0891B2",
    border: "#A5F3FC",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "#ECFDF5",
    color: "#059669",
    border: "#A7F3D0",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    icon: XCircle,
  },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI / Online Gateway",
  card: "Credit / Debit Card",
  bank_transfer: "Direct Bank Transfer",
};

export default function OrdersManager({ initialOrders, initialStats }: OrdersManagerProps) {
  // State
  const [orders, setOrders] = useState<AdminOrderSummary[]>(initialOrders);
  const [stats, setStats] = useState<AdminOrderStats>(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Selection & Details Drawer
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<PlacedOrder | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Status Update state in drawer/row
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Confirm delete
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Print Invoice Modal
  const [printOrder, setPrintOrder] = useState<PlacedOrder | null>(null);

  // Ref to track prev count for live notification
  const prevCountRef = useRef(initialOrders.length);

  // Clear feedback after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Sync data from server
  const fetchOrders = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await getAllOrdersAdminAction();
      if (res && res.orders) {
        // Check if new orders arrived
        if (res.orders.length > prevCountRef.current) {
          const diff = res.orders.length - prevCountRef.current;
          setFeedback({
            success: true,
            message: `🔔 ${diff} new order${diff > 1 ? "s" : ""} received in real time!`,
          });
        }
        prevCountRef.current = res.orders.length;
        setOrders(res.orders);
        setStats(res.stats);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Real-time auto-polling every 12 seconds
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoSync]);

  // Fetch full details when an order is opened
  const handleOpenDetails = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsLoadingDetails(true);
    setOrderDetails(null);
    try {
      const data = await getOrderDetailsAdminAction(orderId);
      setOrderDetails(data);
    } catch (e) {
      console.error("Error loading order details:", e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Quick or Drawer status update
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setFeedback({ success: true, message: `Order #${orderId} status updated to ${newStatus}.` });
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (orderDetails && orderDetails.id === orderId) {
          setOrderDetails({ ...orderDetails, order_status: newStatus });
        }
        // Refresh stats
        fetchOrders(true);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update order status." });
      }
    } catch (e: any) {
      setFeedback({ success: false, message: e.message || "Error updating status." });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Payment status update
  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderPaymentStatusAction(orderId, newPaymentStatus);
      if (res.success) {
        setFeedback({
          success: true,
          message: `Payment status updated to ${newPaymentStatus}.`,
        });
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
        );
        if (orderDetails && orderDetails.id === orderId) {
          setOrderDetails({ ...orderDetails, payment_status: newPaymentStatus });
        }
        fetchOrders(true);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update payment status." });
      }
    } catch (e: any) {
      setFeedback({ success: false, message: e.message || "Error updating payment status." });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deleteOrderAction(deleteTargetId);
      if (res.success) {
        setFeedback({ success: true, message: "Order removed from system." });
        if (selectedOrderId === deleteTargetId) {
          setSelectedOrderId(null);
          setOrderDetails(null);
        }
        setDeleteTargetId(null);
        await fetchOrders(false);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to delete order." });
      }
    } catch (e: any) {
      setFeedback({ success: false, message: e.message || "Error deleting order." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Tab filter
        if (activeTab !== "all" && o.order_status !== activeTab) {
          return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.company_name && o.company_name.toLowerCase().includes(q)) ||
          (o.gstin && o.gstin.toLowerCase().includes(q)) ||
          o.city.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "highest") {
          return b.total_amount - a.total_amount;
        }
        if (sortBy === "lowest") {
          return a.total_amount - b.total_amount;
        }
        return 0;
      });
  }, [orders, activeTab, searchQuery, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Company",
      "GSTIN",
      "City",
      "State",
      "Items Count",
      "Subtotal (INR)",
      "Discount (INR)",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_number}"`,
      `"${new Date(o.created_at).toLocaleDateString("en-IN")}"`,
      `"${o.first_name} ${o.last_name}"`,
      `"${o.email}"`,
      `"${o.phone}"`,
      `"${o.company_name || ""}"`,
      `"${o.gstin || ""}"`,
      `"${o.city}"`,
      `"${o.state}"`,
      o.item_count,
      o.subtotal.toFixed(2),
      o.discount_amount.toFixed(2),
      o.total_amount.toFixed(2),
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.order_status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wall_street_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ paddingBottom: "60px", color: "var(--dash-text-main)" }}>
      {/* Top Banner / Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "var(--dash-text-main)" }}>
              Customer Orders
            </h1>
            {/* Live Sync Active Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "9999px",
                backgroundColor: autoSync ? "#ECFDF5" : "#F1F5F9",
                color: autoSync ? "#059669" : "#64748B",
                fontSize: "0.76rem",
                fontWeight: 700,
                border: `1px solid ${autoSync ? "#A7F3D0" : "#E2E8F0"}`,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: autoSync ? "#10B981" : "#94A3B8",
                  boxShadow: autoSync ? "0 0 8px rgba(16, 185, 129, 0.8)" : "none",
                  display: "inline-block",
                }}
              />
              <span>{autoSync ? "Live Real-Time Sync" : "Sync Paused"}</span>
            </div>
          </div>
          <p style={{ color: "var(--dash-text-muted)", fontSize: "0.92rem", margin: 0 }}>
            Real-time fulfillment command center • Manage bespoke orders, custom specifications, customer logistics & invoices
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Auto Sync Toggle */}
          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            className="btn btn-sm btn-outline-secondary"
            style={{
              borderRadius: "10px",
              padding: "8px 14px",
              fontWeight: 600,
              fontSize: "0.82rem",
              backgroundColor: autoSync ? "#FFFFFF" : "#F8FAFC",
            }}
            title={autoSync ? "Click to pause real-time auto-sync" : "Click to enable real-time auto-sync"}
          >
            {autoSync ? "Pause Live Sync" : "Enable Live Sync"}
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => fetchOrders(false)}
            disabled={isRefreshing}
            className="btn btn-sm btn-outline-dark"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? "spin-animation" : ""} />
            <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-sm text-white"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "0.82rem",
              backgroundColor: "#0F172A",
              border: "1px solid #0F172A",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Real-time Feedback Toast */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "12px",
            backgroundColor: feedback.success ? "#ECFDF5" : "#FEF2F2",
            color: feedback.success ? "#065F46" : "#991B1B",
            fontSize: "0.9rem",
            fontWeight: 600,
            marginBottom: "20px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Total Orders */}
        <div className="col-xl-3 col-sm-6">
          <div
            className="p-3 rounded-4 bg-white shadow-sm"
            style={{ border: "1px solid #E2E8F0", height: "100%" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                Total Orders
              </span>
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", backgroundColor: "#F1F5F9", color: "#0F172A" }}
              >
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h3 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
                {stats.totalOrders}
              </h3>
              {stats.todayOrders > 0 && (
                <span className="badge bg-success-subtle text-success small">
                  +{stats.todayOrders} today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="col-xl-3 col-sm-6">
          <div
            className="p-3 rounded-4 bg-white shadow-sm"
            style={{ border: "1px solid #E2E8F0", height: "100%" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                Gross Revenue
              </span>
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", backgroundColor: "#ECFDF5", color: "#059669" }}
              >
                <DollarSign size={18} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h3 className="fw-bold mb-0" style={{ color: "#059669" }}>
                ₹{stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Pending / Attention */}
        <div className="col-xl-3 col-sm-6">
          <div
            className="p-3 rounded-4 bg-white shadow-sm"
            style={{ border: "1px solid #E2E8F0", height: "100%" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                Pending Review
              </span>
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", backgroundColor: "#FEF3C7", color: "#D97706" }}
              >
                <Clock size={18} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h3 className="fw-bold mb-0" style={{ color: "#D97706" }}>
                {stats.pendingCount}
              </h3>
              <span className="text-muted small">Need verification</span>
            </div>
          </div>
        </div>

        {/* In Production & Dispatched */}
        <div className="col-xl-3 col-sm-6">
          <div
            className="p-3 rounded-4 bg-white shadow-sm"
            style={{ border: "1px solid #E2E8F0", height: "100%" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                Active Fulfillment
              </span>
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", backgroundColor: "#EFF6FF", color: "#1D4ED8" }}
              >
                <Truck size={18} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h3 className="fw-bold mb-0" style={{ color: "#1D4ED8" }}>
                {stats.confirmedCount + stats.processingCount + stats.shippedCount}
              </h3>
              <span className="text-muted small">
                ({stats.processingCount} in prod • {stats.shippedCount} in transit)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className="bg-white rounded-4 p-3 mb-4 shadow-sm"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Status Tabs */}
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Orders", count: stats.totalOrders },
              { id: "pending", label: "Pending", count: stats.pendingCount },
              { id: "confirmed", label: "Confirmed", count: stats.confirmedCount },
              { id: "processing", label: "In Production", count: stats.processingCount },
              { id: "shipped", label: "Dispatched", count: stats.shippedCount },
              { id: "delivered", label: "Delivered", count: stats.deliveredCount },
              { id: "cancelled", label: "Cancelled", count: stats.cancelledCount },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm ${isActive ? "btn-dark text-white fw-bold" : "btn-light text-secondary"}`}
                  style={{
                    borderRadius: "9999px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}{" "}
                  <span
                    className={`badge rounded-pill ms-1 ${
                      isActive ? "bg-white text-dark" : "bg-secondary-subtle text-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style={{ minWidth: "300px" }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search order #, customer, phone, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="bg-white rounded-4 shadow-sm overflow-hidden"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: "0.88rem" }}>
            <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <tr className="text-muted text-uppercase" style={{ fontSize: "0.74rem", letterSpacing: "0.6px" }}>
                <th style={{ padding: "14px 18px" }}>Order Ref</th>
                <th style={{ padding: "14px 18px" }}>Customer & B2B</th>
                <th style={{ padding: "14px 18px" }}>Items Preview</th>
                <th style={{ padding: "14px 18px" }}>Total & Payment</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div style={{ maxWidth: "340px", margin: "0 auto", color: "#64748B" }}>
                      <ShoppingBag size={42} strokeWidth={1.5} className="mb-2 text-muted" />
                      <h5 className="fw-bold mb-1" style={{ color: "#0F172A" }}>
                        No Orders Found
                      </h5>
                      <p className="small text-muted mb-0">
                        {searchQuery
                          ? `No orders matching "${searchQuery}". Clear your search or try another query.`
                          : activeTab !== "all"
                          ? `No orders with status "${activeTab}".`
                          : "Orders submitted through the website checkout will automatically sync and appear here in real time."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConf.icon;
                  const isPaid = order.payment_status === "paid";

                  return (
                    <tr
                      key={order.id}
                      style={{
                        transition: "background 0.15s",
                        cursor: "pointer",
                      }}
                      className="hover-row"
                      onClick={() => handleOpenDetails(order.id)}
                    >
                      {/* Order Number & Timestamp */}
                      <td style={{ padding: "16px 18px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold" style={{ color: "#0F172A", fontSize: "0.92rem" }}>
                            {order.order_number}
                          </span>
                        </div>
                        <div className="text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          •{" "}
                          {new Date(order.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Customer & B2B */}
                      <td style={{ padding: "16px 18px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="fw-semibold" style={{ color: "#0F172A" }}>
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small mt-1" style={{ fontSize: "0.78rem" }}>
                          <a
                            href={`mailto:${order.email}`}
                            className="text-decoration-none text-muted"
                            title="Send email"
                          >
                            <Mail size={12} className="me-1" />
                            {order.email}
                          </a>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: "0.78rem" }}>
                          <Phone size={12} className="me-1" />
                          <span>{order.phone}</span>
                          {/* WhatsApp Quick Link */}
                          <a
                            href={`https://api.whatsapp.com/send?phone=91${order.phone.replace(/\D/g, "")}&text=Hello%20${encodeURIComponent(
                              order.first_name
                            )},%20regarding%20your%20Wall%20Street%20Interiors%20order%20${order.order_number}...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge bg-success-subtle text-success text-decoration-none px-1 py-0"
                            style={{ fontSize: "0.7rem" }}
                            title="Message on WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>

                        {order.company_name && (
                          <div className="mt-1">
                            <span className="badge bg-light text-dark border small" style={{ fontSize: "0.7rem" }}>
                              <Building size={10} className="me-1" />
                              {order.company_name}
                              {order.gstin ? ` • ${order.gstin}` : ""}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Items Preview */}
                      <td style={{ padding: "16px 18px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center">
                            {order.item_preview.map((p, idx) => (
                              <div
                                key={idx}
                                className="rounded-circle overflow-hidden border"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#F1F5F9",
                                  marginLeft: idx > 0 ? "-10px" : "0",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                                title={`${p.name} (${p.quantity}x)`}
                              >
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">
                                    <Package size={14} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="small text-muted fw-semibold">
                            {order.item_count} {order.item_count === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>

                      {/* Grand Total & Payment */}
                      <td style={{ padding: "16px 18px" }}>
                        <div className="fw-bold" style={{ color: "#0F172A", fontSize: "0.95rem" }}>
                          ₹{order.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="d-flex align-items-center gap-1 mt-1">
                          <span
                            className="badge border small fw-normal"
                            style={{
                              fontSize: "0.72rem",
                              backgroundColor: "#F8FAFC",
                              color: "#334155",
                            }}
                          >
                            {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                          </span>
                          <span
                            className={`badge small fw-semibold ${
                              isPaid ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                            }`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </td>

                      {/* Order Status with Inline Changer */}
                      <td style={{ padding: "16px 18px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center gap-2">
                          <select
                            className="form-select form-select-sm"
                            style={{
                              backgroundColor: statusConf.bg,
                              color: statusConf.color,
                              border: `1px solid ${statusConf.border}`,
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              borderRadius: "9999px",
                              paddingTop: "4px",
                              paddingBottom: "4px",
                              cursor: "pointer",
                              minWidth: "135px",
                            }}
                            value={order.order_status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={isUpdatingStatus}
                          >
                            <option value="pending">● Pending</option>
                            <option value="confirmed">● Confirmed</option>
                            <option value="processing">● In Production</option>
                            <option value="shipped">● Dispatched</option>
                            <option value="delivered">● Delivered</option>
                            <option value="cancelled">● Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 18px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(order.id)}
                            className="btn btn-sm btn-light border"
                            style={{ borderRadius: "8px", padding: "6px 10px" }}
                            title="View Full Order & Customer Details"
                          >
                            <Eye size={14} className="text-secondary" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(order.id)}
                            className="btn btn-sm btn-light border"
                            style={{ borderRadius: "8px", padding: "6px 10px" }}
                            title="Delete Order Record"
                          >
                            <Trash2 size={14} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div
          className="d-flex justify-content-between align-items-center p-3 text-muted small"
          style={{ backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
        >
          <span>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> total orders
          </span>
          <span>
            Last synced: {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER: ORDER & CUSTOMER DETAILS */}
      {selectedOrderId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              height: "100vh",
              backgroundColor: "#FFFFFF",
              boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              className="p-4 border-bottom d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
            >
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h4 className="fw-bold mb-0 text-white">Order Details</h4>
                  {orderDetails && (
                    <span className="badge bg-warning text-dark fw-bold">
                      {orderDetails.order_number}
                    </span>
                  )}
                </div>
                {orderDetails && (
                  <p className="small text-white-50 mb-0 mt-1">
                    Placed on{" "}
                    {new Date(orderDetails.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                {orderDetails && (
                  <button
                    type="button"
                    onClick={() => setPrintOrder(orderDetails)}
                    className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                    title="Print A4 Tax Invoice"
                  >
                    <Printer size={14} />
                    <span>Print Invoice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="btn btn-sm btn-dark text-white rounded-circle p-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "none" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto flex-grow-1" style={{ backgroundColor: "#F8FAFC" }}>
              {isLoadingDetails ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading details...</span>
                  </div>
                  <p className="text-muted mt-2 small">Loading order & specification breakdown...</p>
                </div>
              ) : !orderDetails ? (
                <div className="text-center py-5 text-danger">Failed to load order information.</div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {/* Status Management Bar */}
                  <div className="bg-white rounded-4 p-3 shadow-sm border">
                    <div className="row g-3 align-items-center">
                      <div className="col-sm-6">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">
                          Order Fulfillment Status
                        </label>
                        <select
                          className="form-select"
                          value={orderDetails.order_status}
                          onChange={(e) => handleUpdateStatus(orderDetails.id, e.target.value)}
                          disabled={isUpdatingStatus}
                          style={{ fontWeight: 700 }}
                        >
                          <option value="pending">⏳ Pending Verification</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="processing">🔨 In Production</option>
                          <option value="shipped">🚚 Dispatched / In Transit</option>
                          <option value="delivered">🎉 Delivered to Site</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>

                      <div className="col-sm-6">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">
                          Payment Settlement
                        </label>
                        <select
                          className="form-select"
                          value={orderDetails.payment_status}
                          onChange={(e) => handleUpdatePaymentStatus(orderDetails.id, e.target.value)}
                          disabled={isUpdatingStatus}
                          style={{ fontWeight: 700 }}
                        >
                          <option value="pending">⌛ Payment Pending</option>
                          <option value="paid">💵 Paid / Settled</option>
                          <option value="failed">⚠️ Payment Failed</option>
                          <option value="refunded">↩️ Refunded</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="bg-white rounded-4 p-4 shadow-sm border">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <h6 className="fw-bold mb-0 text-dark">Customer & Contact Information</h6>
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${orderDetails.phone.replace(
                          /\D/g,
                          ""
                        )}&text=Hello%20${encodeURIComponent(
                          orderDetails.first_name
                        )},%20this%20is%20Wall%20Street%20Interiors%20regarding%20your%20order%20${
                          orderDetails.order_number
                        }.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
                      >
                        <Send size={12} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>

                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="text-muted small">Customer Name</div>
                        <div className="fw-bold text-dark fs-6">
                          {orderDetails.first_name} {orderDetails.last_name}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="text-muted small">Phone Number</div>
                        <div className="fw-bold text-dark">
                          <a href={`tel:${orderDetails.phone}`} className="text-decoration-none text-dark">
                            {orderDetails.phone}
                          </a>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="text-muted small">Email Address</div>
                        <div className="fw-semibold text-dark">
                          <a href={`mailto:${orderDetails.email}`} className="text-decoration-none">
                            {orderDetails.email}
                          </a>
                        </div>
                      </div>
                      {orderDetails.company_name && (
                        <div className="col-sm-6">
                          <div className="text-muted small">Company / Studio</div>
                          <div className="fw-bold text-dark">{orderDetails.company_name}</div>
                        </div>
                      )}
                      {orderDetails.gstin && (
                        <div className="col-sm-6">
                          <div className="text-muted small">GSTIN (B2B Tax Invoice)</div>
                          <div className="badge bg-light text-dark border fw-bold">{orderDetails.gstin}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address & Site Logistics Card */}
                  <div className="bg-white rounded-4 p-4 shadow-sm border">
                    <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark">Delivery & Architectural Logistics</h6>

                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="text-muted small fw-semibold text-uppercase">Billing Address</div>
                        <div className="mt-1 small text-dark">
                          <div>{orderDetails.address_line1}</div>
                          {orderDetails.address_line2 && <div>{orderDetails.address_line2}</div>}
                          <div>
                            {orderDetails.city}, {orderDetails.state} - {orderDetails.postal_code}
                          </div>
                          <div className="text-muted">{orderDetails.country}</div>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="text-muted small fw-semibold text-uppercase">
                          {orderDetails.ship_to_different ? "Shipping Site Address" : "Shipping Address"}
                        </div>
                        <div className="mt-1 small text-dark">
                          {orderDetails.ship_to_different ? (
                            <>
                              <div className="fw-bold">
                                {orderDetails.shipping_first_name} {orderDetails.shipping_last_name}
                              </div>
                              <div>{orderDetails.shipping_address_line1}</div>
                              {orderDetails.shipping_address_line2 && <div>{orderDetails.shipping_address_line2}</div>}
                              <div>
                                {orderDetails.shipping_city}, {orderDetails.shipping_state} -{" "}
                                {orderDetails.shipping_postal_code}
                              </div>
                              <div className="text-muted">{orderDetails.shipping_country}</div>
                            </>
                          ) : (
                            <div className="text-muted">Same as billing address</div>
                          )}
                        </div>
                      </div>

                      {orderDetails.order_notes && (
                        <div className="col-12 mt-2 pt-2 border-top">
                          <div className="text-muted small fw-semibold text-uppercase">
                            Architectural Site Instructions
                          </div>
                          <div className="p-2 rounded bg-light border small text-dark mt-1">
                            "{orderDetails.order_notes}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordered Items with Custom Sizing Breakdown */}
                  <div className="bg-white rounded-4 p-4 shadow-sm border">
                    <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark">
                      Ordered Products & Bespoke Specifications ({orderDetails.items.length})
                    </h6>

                    <div className="d-flex flex-column gap-3">
                      {orderDetails.items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-3 border bg-light-subtle">
                          <div className="d-flex gap-3 align-items-start">
                            <div
                              className="rounded overflow-hidden border flex-shrink-0"
                              style={{ width: "64px", height: "64px", backgroundColor: "#FFFFFF" }}
                            >
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="flex-grow-1 min-w-0">
                              <h6 className="mb-0 fw-bold text-dark">{item.product_name}</h6>
                              {item.sku && (
                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                  SKU: {item.sku}
                                </div>
                              )}

                              {/* Attributes */}
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                  {Object.entries(item.attributes).map(([k, v]) => (
                                    <span key={k} className="badge bg-white text-dark border small fw-normal">
                                      <strong>{k}:</strong> {v}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Custom Sizing Callout */}
                              {item.custom_details && (
                                <div
                                  className="mt-2 p-2 rounded small"
                                  style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E" }}
                                >
                                  <div className="fw-bold d-flex align-items-center gap-1">
                                    <span>📐 Bespoke Custom Dimension Calculation:</span>
                                  </div>
                                  <div className="mt-1">
                                    • Measurement:{" "}
                                    <strong>
                                      {item.custom_details.billableMeasurement} {item.custom_details.unitLabel}
                                    </strong>{" "}
                                    (
                                    {item.custom_details.lengthFeet} ft {item.custom_details.lengthInches || 0} in
                                    {item.custom_details.widthFeet !== undefined
                                      ? ` × ${item.custom_details.widthFeet} ft ${item.custom_details.widthInches || 0} in`
                                      : ""}
                                    )
                                  </div>
                                  <div>• Rate: ₹{item.custom_details.rate} / {item.custom_details.unitLabel}</div>
                                  {item.custom_details.formulaSummary && (
                                    <div>• Formula: {item.custom_details.formulaSummary}</div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-end flex-shrink-0">
                              <div className="small text-muted">
                                {item.quantity} × ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </div>
                              <div className="fw-bold text-dark fs-6">
                                ₹{item.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>Subtotal</span>
                        <span className="fw-semibold text-dark">
                          ₹{orderDetails.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {orderDetails.discount_amount > 0 && (
                        <div className="d-flex justify-content-between mb-2 small text-success">
                          <span>
                            Discount Applied {orderDetails.coupon_code ? `(${orderDetails.coupon_code})` : ""}
                          </span>
                          <span className="fw-semibold">
                            - ₹{orderDetails.discount_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>Pan-India Logistics</span>
                        <span className="text-success fw-semibold">Complimentary White-Glove (₹0.00)</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top mt-2">
                        <span className="fw-bold text-dark fs-6">Grand Total</span>
                        <span className="fw-bold fs-5" style={{ color: "#0F172A" }}>
                          ₹{orderDetails.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-top bg-white d-flex justify-content-between align-items-center">
              {orderDetails && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(orderDetails.id)}
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>Delete Order</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="btn btn-sm btn-dark px-4"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {printOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 15, 30, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1100,
            overflowY: "auto",
            padding: "30px 15px",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => setPrintOrder(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
              color: "#0F172A",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom print-hide">
              <h5 className="fw-bold mb-0">Invoice Preview</h5>
              <div className="d-flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-dark btn-sm d-flex align-items-center gap-1"
                >
                  <Printer size={14} />
                  <span>Print / Save as PDF</span>
                </button>
                <button onClick={() => setPrintOrder(null)} className="btn btn-outline-secondary btn-sm">
                  Close
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="printable-invoice">
              {/* Invoice Header */}
              <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                <div>
                  <h2 className="fw-bold mb-1" style={{ color: "#0F172A", letterSpacing: "1px" }}>
                    WALL STREET INTERIORS
                  </h2>
                  <p className="text-muted small mb-0">
                    Bespoke Luxury Furnishings & Architectural Hardware
                  </p>
                  <p className="text-muted small mb-0">
                    Official Tax Invoice
                  </p>
                </div>

                <div className="text-end">
                  <span className="badge bg-dark text-white px-3 py-2 text-uppercase" style={{ letterSpacing: "1px" }}>
                    Tax Invoice / Order Slip
                  </span>
                  <div className="fw-bold mt-2 fs-6">{printOrder.order_number}</div>
                  <div className="text-muted small">
                    Date: {new Date(printOrder.created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="row mb-4">
                <div className="col-6">
                  <h6 className="text-uppercase text-muted fw-bold small" style={{ letterSpacing: "0.5px" }}>
                    Billed To:
                  </h6>
                  <p className="fw-bold mb-1">{printOrder.first_name} {printOrder.last_name}</p>
                  {printOrder.company_name && <p className="mb-0 small"><strong>Company:</strong> {printOrder.company_name}</p>}
                  {printOrder.gstin && <p className="mb-0 small"><strong>GSTIN:</strong> {printOrder.gstin}</p>}
                  <p className="mb-0 small">{printOrder.email}</p>
                  <p className="mb-0 small">{printOrder.phone}</p>
                  <p className="mb-0 small">
                    {printOrder.address_line1}, {printOrder.city}, {printOrder.state} - {printOrder.postal_code}
                  </p>
                </div>

                <div className="col-6 text-end">
                  <h6 className="text-uppercase text-muted fw-bold small" style={{ letterSpacing: "0.5px" }}>
                    Logistics & Payment:
                  </h6>
                  <p className="mb-1 small">
                    <strong>Payment Method:</strong> {PAYMENT_METHOD_LABELS[printOrder.payment_method] || printOrder.payment_method}
                  </p>
                  <p className="mb-1 small">
                    <strong>Payment Status:</strong>{" "}
                    <span className="text-capitalize fw-bold">{printOrder.payment_status}</span>
                  </p>
                  <p className="mb-1 small">
                    <strong>Order Status:</strong>{" "}
                    <span className="text-capitalize fw-bold">{printOrder.order_status}</span>
                  </p>
                  <p className="mb-0 small text-muted">
                    White-Glove Pan-India Architectural Logistics
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="table table-bordered mb-4" style={{ fontSize: "0.88rem" }}>
                <thead style={{ backgroundColor: "#F8FAFC" }}>
                  <tr>
                    <th>Item & Bespoke Specification</th>
                    <th className="text-center" style={{ width: "80px" }}>Qty</th>
                    <th className="text-end" style={{ width: "130px" }}>Rate</th>
                    <th className="text-end" style={{ width: "130px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="fw-bold">{it.product_name}</div>
                        {it.sku && <div className="text-muted small">SKU: {it.sku}</div>}
                        {it.attributes && Object.keys(it.attributes).length > 0 && (
                          <div className="small text-muted">
                            {Object.entries(it.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" | ")}
                          </div>
                        )}
                        {it.custom_details && (
                          <div className="small text-secondary mt-1">
                            • Dimensions: {it.custom_details.billableMeasurement} {it.custom_details.unitLabel}
                          </div>
                        )}
                      </td>
                      <td className="text-center fw-semibold">{it.quantity}</td>
                      <td className="text-end">
                        ₹{it.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-end fw-bold">
                        ₹{it.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="row justify-content-end mb-4">
                <div className="col-5">
                  <div className="d-flex justify-content-between mb-1 small text-muted">
                    <span>Subtotal</span>
                    <span>₹{printOrder.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {printOrder.discount_amount > 0 && (
                    <div className="d-flex justify-content-between mb-1 small text-success">
                      <span>Discount ({printOrder.coupon_code})</span>
                      <span>- ₹{printOrder.discount_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-1 small text-muted">
                    <span>White-Glove Delivery</span>
                    <span>Complimentary (₹0.00)</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-6 mt-2">
                    <span>Grand Total</span>
                    <span>₹{printOrder.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Terms footer */}
              <div className="pt-3 border-top text-center text-muted small" style={{ fontSize: "0.75rem" }}>
                Thank you for patronizing Wall Street Interiors. For architectural design inquiries, trade customization, or delivery assistance, please reach our customer support team.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Order Record"
        message="Are you sure you want to delete this order? All associated line items will be removed permanently from the database."
        confirmLabel="Yes, Delete Order"
        cancelLabel="Cancel"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
