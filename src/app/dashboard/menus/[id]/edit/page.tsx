import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavMenuItemById, getAllNavMenuItemsAdmin } from "@/lib/actions/menus";
import MenuForm from "@/components/dashboard/MenuForm";

export const metadata: Metadata = {
  title: "Edit Menu or Category Link | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditMenuItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    notFound();
  }

  const [item, allItems] = await Promise.all([
    getNavMenuItemById(numId),
    getAllNavMenuItemsAdmin(),
  ]);

  if (!item) {
    notFound();
  }

  return <MenuForm initialData={item} allMenuItems={allItems} />;
}
