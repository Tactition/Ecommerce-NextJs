import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer";
import { getUserProfileAction, getUserOrdersAction } from "@/lib/actions/profile";
import { getSiteSettings } from "@/lib/actions/settings";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "My Profile & Orders",
  description: "View and manage your Wall Street Interiors customer profile, track order deliveries, review purchases, and update contact information.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getCustomerSession();

  if (!session || !session.customerId) {
    redirect("/login?redirectTo=/profile");
  }

  const [profileResult, ordersResult, settings] = await Promise.all([
    getUserProfileAction(),
    getUserOrdersAction(),
    getSiteSettings(),
  ]);

  if (!profileResult.profile) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <ProfileClient
      initialProfile={profileResult.profile}
      initialOrders={ordersResult.orders}
      stats={ordersResult.stats}
      companyPhone={settings.company_phone || ""}
      companyEmail={settings.company_email || ""}
      companyAddress={settings.company_address || ""}
    />
  );
}
