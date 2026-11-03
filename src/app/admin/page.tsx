import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal Login | Wall Street Interiors",
  description: "Secure administrator and staff login portal for Wall Street Interiors management console.",
  robots: {
    index: false,
    follow: false,
  },
};

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

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
          }}
        >
          Loading Admin Portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
