import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import "@/app/dashboard.css";

export const metadata = {
  title: "Admin Dashboard | Wall Street Interiors",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const isStaff =
    session.role === "admin" ||
    session.role === "editor" ||
    session.role === "manager";

  if (!isStaff) {
    redirect("/profile");
  }

  return (
    <DashboardShell user={session}>
      {children}
    </DashboardShell>
  );
}
