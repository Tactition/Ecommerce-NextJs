import React from "react";
import { Metadata } from "next";
import GalleryForm from "@/components/dashboard/GalleryForm";

export const metadata: Metadata = {
  title: "New Gallery Entry | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default function CreateGalleryPage() {
  return <GalleryForm initialData={null} />;
}
