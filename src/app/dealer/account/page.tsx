import { requireApprovedDealer } from "@/lib/auth/dealer";
import { getDealerProfileData } from "@/lib/actions/dealerAccount";
import DealerAccountClient from "./DealerAccountClient";

export const dynamic = "force-dynamic";

export default async function DealerAccountPage() {
  await requireApprovedDealer();
  const data = await getDealerProfileData();

  return <DealerAccountClient dealer={data.dealer} addresses={data.addresses} />;
}
