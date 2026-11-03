import React from "react";
import { Metadata } from "next";
import { getAllGallery } from "@/lib/actions/gallery";
import GalleryManager from "@/components/dashboard/GalleryManager";

export const metadata: Metadata = {
  title: "Work Gallery Portfolio | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function DashboardGalleryPage() {
  const items = await getAllGallery();
  return <GalleryManager initialGallery={items} />;
}
