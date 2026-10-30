import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTestimonialById } from "@/lib/actions/testimonials";
import TestimonialForm from "@/components/dashboard/TestimonialForm";

export const metadata: Metadata = {
  title: "Edit Testimonial | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonialId = parseInt(id, 10);
  if (isNaN(testimonialId)) {
    notFound();
  }

  const testimonial = await getTestimonialById(testimonialId);
  if (!testimonial) {
    notFound();
  }

  return <TestimonialForm initialData={testimonial} />;
}
