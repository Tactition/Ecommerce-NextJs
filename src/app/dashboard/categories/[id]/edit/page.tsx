import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryByIdAdmin, getAllCategoriesAdmin } from "@/lib/actions/categories";
import CategoryForm from "@/components/dashboard/CategoryForm";

export const metadata: Metadata = {
  title: "Edit Category | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (isNaN(categoryId)) {
    notFound();
  }

  const [category, allCategories] = await Promise.all([
    getCategoryByIdAdmin(categoryId),
    getAllCategoriesAdmin(),
  ]);

  if (!category) {
    notFound();
  }

  const parentCategories = allCategories.filter((c) => !c.parent_id);

  return <CategoryForm initialCategory={category} parentCategories={parentCategories} />;
}
