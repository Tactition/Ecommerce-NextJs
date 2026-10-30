import React from "react";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import { getPublishedCareers } from "@/lib/actions/careers";
import CareersClient from "@/components/careers/CareersClient";

export const metadata: Metadata = {
  title: "Careers & Join Our Team | Wall Street Interiors - Luxury Architecture & Craftsmanship",
  description:
    "Explore career openings at Wall Street Interiors. Join our team of passionate interior architects, custom furniture craftsmen, 3D visualizers, and project managers in Srinagar.",
};

export const revalidate = 60;

export default async function CareersPage() {
  const jobs = await getPublishedCareers();

  return (
    <main className="wsi-careers-page">
      <Breadcrumb title="Careers & Opportunities" category="Company" />
      <CareersClient initialJobs={jobs} />
    </main>
  );
}
