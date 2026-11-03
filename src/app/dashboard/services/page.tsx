import React from "react";
import { Metadata } from "next";
import { getAllServices } from "@/lib/actions/services";
import ServicesManager from "@/components/dashboard/ServicesManager";

export const metadata: Metadata = {
  title: "Studio Services Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function DashboardServicesPage() {
  const services = await getAllServices();
  return <ServicesManager initialServices={services} />;
}
