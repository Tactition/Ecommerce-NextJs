import React from "react";
import { Metadata } from "next";
import { getAllCareers, getCareerApplications } from "@/lib/actions/careers";
import CareersManager from "@/components/dashboard/CareersManager";

export const metadata: Metadata = {
  title: "Careers & Recruitment Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function CareersDashboardPage() {
  const [careers, applications] = await Promise.all([
    getAllCareers(),
    getCareerApplications(),
  ]);

  return (
    <CareersManager
      initialCareers={careers}
      initialApplications={applications}
    />
  );
}
