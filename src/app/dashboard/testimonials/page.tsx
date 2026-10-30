import React from "react";
import { Metadata } from "next";
import { getAllTestimonials } from "@/lib/actions/testimonials";
import TestimonialsManager from "@/components/dashboard/TestimonialsManager";

export const metadata: Metadata = {
  title: "Client Testimonials Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function TestimonialsDashboardPage() {
  const testimonials = await getAllTestimonials();

  return <TestimonialsManager initialTestimonials={testimonials} />;
}
