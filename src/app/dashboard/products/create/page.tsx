import React from "react";
import { Metadata } from "next";
import { getProductCategories } from "@/lib/actions/products";
import { getAllAttributesWithValues } from "@/lib/actions/variations";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = {
  title: "Add Product | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function CreateProductPage() {
  const [categories, attributes] = await Promise.all([
    getProductCategories(),
    getAllAttributesWithValues(),
  ]);
  return <ProductForm categories={categories} attributes={attributes} />;
}
