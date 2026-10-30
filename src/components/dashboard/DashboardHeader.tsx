"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  ShieldCheck,
  User,
  Sparkles,
} from "lucide-react";

interface DashboardHeaderProps {
  user: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
  } | null;
  toggleMobile: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function DashboardHeader({
  user,
  toggleMobile,
  isCollapsed,
  toggleCollapse,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      {/* Left side: Mobile Toggle, Desktop Collapse & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobile}
          className="dashboard-mobile-menu-btn d-mobile-only"
          aria-label="Open mobile navigation"
        >
          <Menu size={22} />
        </button>

        {/* Desktop Quick Collapse Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="dashboard-header-collapse-btn d-none-mobile"
          title={isCollapsed ? "Expand sidebar (Icon mode)" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 className="dashboard-header-title">Admin Management Console</h2>
            <span className="session-status-badge">
              <span className="session-status-dot" />
              <span>Live V2</span>
            </span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
            Wall Street Interiors Control Center
          </div>
        </div>
      </div>

      {/* Right side: View Site & User Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link
          href="/"
          target="_blank"
          className="dashboard-view-site-btn"
          title="Open live website in new tab"
        >
          <ExternalLink size={15} />
          <span className="d-none-mobile">View Store</span>
        </Link>

        {/* User Profile Card */}
        <div className="dashboard-user-card" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="dashboard-user-avatar"
            style={{
              backgroundColor: user?.role === "admin" ? "#FF4035" : "#3B82F6",
              color: "#FFFFFF",
              fontWeight: 800,
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="d-none-mobile" style={{ lineHeight: 1.25 }}>
            <div className="dashboard-user-name" style={{ fontWeight: 700 }}>
              {user?.name || "Administrator"}
            </div>
            <div
              className="dashboard-user-role"
              style={{
                color: user?.role === "admin" ? "#EF4444" : "#3B82F6",
                fontWeight: 600,
                fontSize: "0.74rem",
              }}
            >
              {user?.role === "admin" ? "Super Admin" : "Content Editor"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
