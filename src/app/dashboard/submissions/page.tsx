import { getAllContactSubmissions } from "@/lib/actions/contact";
import SubmissionsManager from "@/components/dashboard/SubmissionsManager";

export const dynamic = "force-dynamic";

export default async function SubmissionsDashboardPage() {
  const submissions = await getAllContactSubmissions();

  return <SubmissionsManager initialSubmissions={submissions} />;
}

