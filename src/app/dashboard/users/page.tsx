import { getAllUsers, getAvailableRoles } from "@/lib/actions/users";
import { requirePermission } from "@/lib/rbac";
import UsersManager from "@/components/dashboard/UsersManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team & Access Control | Wall Street Admin",
};

export const dynamic = "force-dynamic";

export default async function UsersDashboardPage() {
  const session = await requirePermission("users", "view");

  const [users, availableRoles] = await Promise.all([
    getAllUsers(),
    getAvailableRoles(),
  ]);

  return (
    <UsersManager
      initialUsers={users}
      currentUser={session}
      availableRoles={availableRoles}
    />
  );
}
