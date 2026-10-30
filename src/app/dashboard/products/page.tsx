import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllProductsAdmin, getProductCategories } from "@/lib/actions/products";
import ProductsManager from "@/components/dashboard/ProductsManager";

export const metadata: Metadata = {
  title: "Products Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function DashboardProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProductsAdmin(),
    getProductCategories(),
  ]);

  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading product catalog...</div>}>
      <ProductsManager initialProducts={products} categories={categories} />
    </Suspense>
  );
}
