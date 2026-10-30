import React from "react";
import { Metadata } from "next";
import { getAllCategoriesAdmin } from "@/lib/actions/categories";
import CategoriesManager from "@/components/dashboard/CategoriesManager";

export const metadata: Metadata = {
  title: "Categories Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function DashboardCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return <CategoriesManager initialCategories={categories} />;
}
