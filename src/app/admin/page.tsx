import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminGatewayPage() {
  const session = await getSession();

  const isStaff =
    session &&
    (session.role === "admin" ||
      session.role === "editor" ||
      session.role === "manager");

  if (isStaff) {
    redirect("/dashboard");
  }

  redirect("/login?tab=admin&redirectTo=/dashboard");
}

