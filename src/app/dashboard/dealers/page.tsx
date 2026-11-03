import { requireAdmin } from "@/lib/auth/admin";
import { getAdminDealersAction } from "@/lib/actions/adminDealers";
import AdminDealersClient from "./AdminDealersClient";

export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const data = await getAdminDealersAction(status);

  return <AdminDealersClient dealers={data.dealers} tiers={data.tiers} currentStatus={status || "ALL"} />;
}
