import React from "react";
import { Metadata } from "next";
import { getAllBrands } from "@/lib/actions/brands";
import BrandsManager from "@/components/dashboard/BrandsManager";

export const metadata: Metadata = {
  title: "Partner Brands Management | Wall Street Interiors Admin",
};

export const revalidate = 0;

export default async function BrandsDashboardPage() {
  const brands = await getAllBrands();

  return <BrandsManager initialBrands={brands} />;
}
