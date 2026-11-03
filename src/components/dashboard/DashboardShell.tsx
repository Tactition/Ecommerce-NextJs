"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { ShieldAlert, X } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
    permissions?: string[];
  } | null;
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unauthorizedAlert, setUnauthorizedAlert] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("abid_admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("unauthorized") === "1") {
        setUnauthorizedAlert(
          "Access Denied: You do not have Administrator privileges to access that section. You have been redirected to the dashboard."
        );
        // Clean URL parameter without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("abid_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div
      className={`dashboard-container ${isCollapsed ? "sidebar-collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={closeMobile}
          aria-label="Close mobile sidebar"
        />
      )}

      {/* Premium Collapsible & Responsive Sidebar */}
      <DashboardSidebar
        user={user}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        closeMobile={closeMobile}
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        <DashboardHeader
          user={user}
          toggleMobile={toggleMobile}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        {unauthorizedAlert && (
          <div
            style={{
              margin: "20px 24px 0 24px",
              padding: "14px 18px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              color: "#B91C1C",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, color: "#EF4444" }} />
              <span>{unauthorizedAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setUnauthorizedAlert(null)}
              style={{
                background: "none",
                border: "none",
                color: "#B91C1C",
                cursor: "pointer",
                padding: "2px",
              }}
              aria-label="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
