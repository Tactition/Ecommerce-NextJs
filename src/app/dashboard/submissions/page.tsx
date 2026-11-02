import { getAllContactSubmissions, getAllNewsletterSubscribers } from "@/lib/actions/contact";
import SubmissionsManager from "@/components/dashboard/SubmissionsManager";

export const dynamic = "force-dynamic";

export default async function SubmissionsDashboardPage() {
  const [submissions, subscribers] = await Promise.all([
    getAllContactSubmissions(),
    getAllNewsletterSubscribers(),
  ]);

  return <SubmissionsManager initialSubmissions={submissions} initialSubscribers={subscribers} />;
}
