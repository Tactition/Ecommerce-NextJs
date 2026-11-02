"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Award,
  Camera,
  MessageSquareQuote,
  HelpCircle,
  BookOpen,
  Mail,
  Settings,
  ExternalLink,
  Package,
  FolderTree,
  Compass,
  Shield,
  ShieldCheck,
  Users,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

interface DashboardSidebarProps {
  user?: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
    permissions?: string[];
  } | null;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export default function DashboardSidebar({
  user,
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const userPerms = user?.permissions || [];

  const links = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Customer Orders", href: "/dashboard/orders", icon: ShoppingBag, module: "orders" },
    { label: "Products", href: "/dashboard/products", icon: Package, module: "products" },
    { label: "Categories", href: "/dashboard/categories", icon: FolderTree, module: "categories" },
    { label: "Menu Management", href: "/dashboard/menus", icon: Compass, module: "menus" },
    { label: "Careers & Jobs", href: "/dashboard/careers", icon: Briefcase, module: "careers" },
    { label: "Partner Brands", href: "/dashboard/brands", icon: Award, module: "brands" },
    { label: "Testimonials", href: "/dashboard/testimonials", icon: MessageSquareQuote, module: "testimonials" },
    { label: "FAQs", href: "/dashboard/faqs", icon: HelpCircle, module: "faqs" },
    { label: "Blog Posts", href: "/dashboard/blog", icon: BookOpen, module: "blog" },
    { label: "Enquiries & Subscribers", href: "/dashboard/submissions", icon: Mail, module: "submissions" },
    { label: "Users & Team", href: "/dashboard/users", icon: Users, module: "users", adminOnly: true },
    { label: "Roles & Access", href: "/dashboard/roles", icon: KeyRound, module: "roles", adminOnly: true },
    { label: "Website Settings", href: "/dashboard/settings", icon: Settings, module: "settings", adminOnly: true },
    { label: "Profile & Security", href: "/dashboard/account", icon: ShieldCheck },
  ];

  // Dynamically filter links based on user module:view permissions
  const visibleLinks = links.filter((link) => {
    if (!link.module) return true; // Overview is always visible
    if (isAdmin) return true;
    if (userPerms.includes("*") || userPerms.includes("*:*")) return true;
    if (userPerms.includes(`${link.module}:*`) || userPerms.includes(`${link.module}:view`)) return true;
    return false;
  });

  return (
    <aside
      className={`dashboard-sidebar ${isCollapsed ? "collapsed" : ""}`}
      aria-label="Admin Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="sidebar-brand-link"
          title="Wall Street Admin Console"
        >
          <div className="sidebar-brand-icon">
            <Shield size={20} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-title">WALL STREET</div>
              <div className="sidebar-brand-subtitle">Interiors Console</div>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="sidebar-collapse-btn d-none-mobile"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={closeMobile}
          className="sidebar-mobile-close-btn d-mobile-only"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav-container">
        {!isCollapsed && (
          <div className="sidebar-section-heading">MANAGEMENT</div>
        )}

        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              onClick={closeMobile}
              className={`dashboard-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-icon-wrap" style={{ position: "relative" }}>
                <Icon size={19} />
              </div>
              {!isCollapsed && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span className="nav-label-text">{link.label}</span>
                  {link.adminOnly && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        backgroundColor: isAdmin ? "rgba(255, 64, 53, 0.15)" : "#F1F5F9",
                        color: isAdmin ? "#FF4035" : "#64748B",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
              )}

              {/* Floating Animated Tooltip in Collapsed Mode */}
              <div className="sidebar-tooltip">
                <span>{link.label} {link.adminOnly ? "(Admin)" : ""}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Footer Actions (Pinned at bottom) */}
      <div className="sidebar-footer-wrapper">
        {!isCollapsed && user && (
          <div
            style={{
              padding: "10px 12px",
              marginBottom: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: isAdmin ? "#FF4035" : "#3B82F6",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.88rem",
                flexShrink: 0,
              }}
            >
              {user.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div style={{ overflow: "hidden", lineHeight: 1.2 }}>
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {user.name || "User"}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: isAdmin ? "#FCA5A5" : "#93C5FD",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {user.role === "admin" ? "Super Admin" : user.role}
              </div>
            </div>
          </div>
        )}

        <Link
          href="/"
          target="_blank"
          className="dashboard-nav-item sidebar-live-btn"
          title="View Live Storefront"
        >
          <div className="nav-icon-wrap">
            <ExternalLink size={18} />
          </div>
          {!isCollapsed && <span>View Live Site</span>}
          <div className="sidebar-tooltip">
            <span>View Live Site</span>
          </div>
        </Link>

        <form action={logoutAction} style={{ width: "100%" }}>
          <button
            type="submit"
            className="sidebar-signout-btn"
            title="Sign out of Admin Dashboard"
          >
            <div className="nav-icon-wrap">
              <LogOut size={18} />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
            <div className="sidebar-tooltip">
              <span>Sign Out</span>
            </div>
          </button>
        </form>
      </div>
    </aside>
  );
}
