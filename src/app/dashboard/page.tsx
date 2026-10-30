import React from "react";
import { Metadata } from "next";
import DashboardV2 from "@/components/dashboard/DashboardV2";
import { getDashboardStats } from "@/lib/actions/settings";
import { getRecentContactSubmissions } from "@/lib/actions/contact";
import { getRecentProductsAdmin } from "@/lib/actions/products";

export const metadata: Metadata = {
  title: "Dashboard v2 | Wall Street Interiors Master Admin",
  description: "Real-time command center for Wall Street Interiors retail inventory, category taxonomies, navigation menus, and client inquiries.",
};

export const revalidate = 0; // Always real-time in admin control panel

export default async function DashboardOverviewPage() {
  const [stats, submissions, products] = await Promise.all([
    getDashboardStats(),
    getRecentContactSubmissions(5),
    getRecentProductsAdmin(5),
  ]);

  return (
    <DashboardV2
      stats={stats}
      recentSubmissions={submissions}
      recentProducts={products}
    />
  );
}
