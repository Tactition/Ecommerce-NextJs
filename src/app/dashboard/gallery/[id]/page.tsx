import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGalleryById } from "@/lib/actions/gallery";
import GalleryForm from "@/components/dashboard/GalleryForm";

export const metadata: Metadata = {
  title: "Edit Gallery Entry | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  const { id } = await params;
  const galleryId = parseInt(id, 10);
  if (isNaN(galleryId)) {
    notFound();
  }

  const item = await getGalleryById(galleryId);
  if (!item) {
    notFound();
  }

  return <GalleryForm initialData={item} />;
}
