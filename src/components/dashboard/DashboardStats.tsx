import React from "react";
import Link from "next/link";
import { DashboardStats as StatsType } from "@/types";
import {
  Briefcase,
  Award,
  Users,
  MessageSquareQuote,
  HelpCircle,
  BookOpen,
  Mail,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DashboardStatsProps {
  stats: StatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      label: "Open Careers",
      count: stats.careersCount ?? 0,
      href: "/dashboard/careers",
      icon: Briefcase,
      color: "#FF4035",
      bg: "#FFEBEA",
      note: "Published role openings",
    },
    {
      label: "Partner Brands",
      count: stats.brandsCount,
      href: "/dashboard/brands",
      icon: Award,
      color: "#2563EB",
      bg: "#EFF6FF",
      note: "Authorized manufacturers",
    },
    {
      label: "Job Applications",
      count: stats.careerApplicationsCount ?? 0,
      href: "/dashboard/careers",
      icon: Users,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      note: "Received candidate resumes",
    },
    {
      label: "Customer Reviews",
      count: stats.testimonialsCount,
      href: "/dashboard/testimonials",
      icon: MessageSquareQuote,
      color: "#10B981",
      bg: "#ECFDF5",
      note: "5-Star verified feedback",
    },
    {
      label: "Published FAQs",
      count: stats.faqsCount,
      href: "/dashboard/faqs",
      icon: HelpCircle,
      color: "#F59E0B",
      bg: "#FFFBEB",
      note: "Help & answers",
    },
    {
      label: "Blog Articles",
      count: stats.blogCount,
      href: "/dashboard/blog",
      icon: BookOpen,
      color: "#06B6D4",
      bg: "#ECFEFF",
      note: "Engineering publications",
    },
    {
      label: "Service Enquiries",
      count: stats.totalSubmissionsCount,
      badge: stats.unreadSubmissionsCount > 0 ? `${stats.unreadSubmissionsCount} Unread` : undefined,
      href: "/dashboard/submissions",
      icon: Mail,
      color: stats.unreadSubmissionsCount > 0 ? "#FF4035" : "#64748B",
      bg: stats.unreadSubmissionsCount > 0 ? "#FFEBEA" : "#F1F5F9",
      note: "Customer diagnostic requests",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "24px",
        marginBottom: "40px",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={card.href}
            className="abid-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  backgroundColor: card.bg,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={24} />
              </div>

              {card.badge && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: "var(--color-danger)",
                    color: "#FFFFFF",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>

            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.1, marginBottom: "4px" }}>
              {card.count}
            </div>

            <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
              {card.label}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--color-surface-border)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{card.note}</span>
              <ArrowRight size={15} color={card.color} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
