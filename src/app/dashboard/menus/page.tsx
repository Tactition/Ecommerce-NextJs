import React from "react";
import { Metadata } from "next";
import { getAllNavMenuItemsAdmin } from "@/lib/actions/menus";
import MenusManager from "@/components/dashboard/MenusManager";

export const metadata: Metadata = {
  title: "Menu Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function DashboardMenusPage() {
  const menuItems = await getAllNavMenuItemsAdmin();

  return <MenusManager initialMenuItems={menuItems} />;
}
