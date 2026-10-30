import React from "react";
import { Metadata } from "next";
import { getAllFAQs } from "@/lib/actions/faqs";
import FaqsManager from "@/components/dashboard/FaqsManager";

export const metadata: Metadata = {
  title: "FAQs Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function FAQsDashboardPage() {
  const faqs = await getAllFAQs();

  return <FaqsManager initialFaqs={faqs} />;
}
