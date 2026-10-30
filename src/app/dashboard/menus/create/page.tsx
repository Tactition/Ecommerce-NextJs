import React from "react";
import { Metadata } from "next";
import { getAllNavMenuItemsAdmin } from "@/lib/actions/menus";
import MenuForm from "@/components/dashboard/MenuForm";

export const metadata: Metadata = {
  title: "Add Menu or Category Link | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function CreateMenuItemPage() {
  const allItems = await getAllNavMenuItemsAdmin();

  return <MenuForm allMenuItems={allItems} />;
}
