import React from "react";
import { Metadata } from "next";
import { getAllCategoriesAdmin } from "@/lib/actions/categories";
import CategoryForm from "@/components/dashboard/CategoryForm";

export const metadata: Metadata = {
  title: "Create Category | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function CreateCategoryPage() {
  const allCategories = await getAllCategoriesAdmin();
  // Filter for top-level main categories (parent_id is null)
  const parentCategories = allCategories.filter((c) => !c.parent_id);

  return <CategoryForm parentCategories={parentCategories} />;
}
