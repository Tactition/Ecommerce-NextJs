import React from "react";
import { Metadata } from "next";
import TestimonialForm from "@/components/dashboard/TestimonialForm";

export const metadata: Metadata = {
  title: "Add Testimonial | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default function CreateTestimonialPage() {
  return <TestimonialForm initialData={null} />;
}
