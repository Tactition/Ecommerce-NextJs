import { requireAdmin } from "@/lib/auth/admin";
import { getAdminWholesalePricesAction } from "@/lib/actions/adminDealers";
import AdminWholesalePricesClient from "./AdminWholesalePricesClient";

export default async function AdminWholesalePricesPage() {
  await requireAdmin();
  const data = await getAdminWholesalePricesAction();

  return (
    <AdminWholesalePricesClient
      products={data.products}
      tiers={data.tiers}
      overrides={data.overrides}
    />
  );
}
