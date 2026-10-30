import React from "react";
import { Metadata } from "next";
import { getAllProducts } from "@/lib/actions/products";
import WishlistClient from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist | Wall Street Interiors",
  description: "View and manage your saved bespoke furniture, architectural lighting, and interior finishes.",
};

export const revalidate = 60;

export default async function WishlistPage() {
  const products = await getAllProducts();

  return <WishlistClient initialProducts={products} />;
}
