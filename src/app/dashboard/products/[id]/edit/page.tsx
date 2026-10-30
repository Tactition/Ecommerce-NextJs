import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByIdAdmin, getProductCategories } from "@/lib/actions/products";
import { getAllAttributesWithValues, getProductVariations } from "@/lib/actions/variations";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = {
  title: "Edit Product | Wall Street Interiors Admin",
};

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    notFound();
  }

  const [product, categories, attributes, variations] = await Promise.all([
    getProductByIdAdmin(productId),
    getProductCategories(),
    getAllAttributesWithValues(),
    getProductVariations(productId, true),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialProduct={product}
      categories={categories}
      attributes={attributes}
      initialVariations={variations}
    />
  );
}
