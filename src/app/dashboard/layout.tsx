import React from "react";
import { getAdminSession } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AdminAuthProvider } from "@/components/auth/AdminAuthProvider";
import "@/app/dashboard.css";

export const metadata = {
  title: "Admin Console | Wall Street Interiors",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const isStaff =
    admin.role === "superadmin" ||
    admin.role === "manager" ||
    admin.role === "editor" ||
    admin.role === "support";

  if (!isStaff) {
    redirect("/admin/login?error=unauthorized_staff");
  }

  return (
    <AdminAuthProvider initialSession={admin}>
      <DashboardShell
        user={{
          id: admin.adminId,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions:
            admin.permissions && admin.permissions.length > 0
              ? admin.permissions
              : admin.role === "superadmin"
              ? ["*"]
              : [],
        }}
      >
        {children}
      </DashboardShell>
    </AdminAuthProvider>
  );
}
