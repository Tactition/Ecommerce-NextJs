import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllProducts, getProductCategories } from "@/lib/actions/products";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Products & Replacement Parts",
  description: "Browse certified electronic devices, diagnostic tools, and precision replacement components with warranty protection.",
};

export const revalidate = 60;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getProductCategories(),
  ]);

  return (
    <Suspense fallback={<div className="container py-5 text-center"><p className="text-muted">Loading catalog...</p></div>}>
      <ShopClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
