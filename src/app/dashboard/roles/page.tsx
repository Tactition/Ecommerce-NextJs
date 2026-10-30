import React from "react";
import { getAllRolesAction } from "@/lib/actions/roles";
import { requirePermission } from "@/lib/rbac";
import RolesManager from "@/components/dashboard/RolesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Access Control | Wall Street Admin",
};

export const dynamic = "force-dynamic";

export default async function RolesDashboardPage() {
  const session = await requirePermission("roles", "view");
  const roles = await getAllRolesAction();

  return <RolesManager initialRoles={roles} currentUser={session} />;
}
