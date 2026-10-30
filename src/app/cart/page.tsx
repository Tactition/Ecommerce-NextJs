import React from "react";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CartClient from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Shopping Cart | Wall Street Interiors - Luxury Furnishings & Architectural Hardware",
  description:
    "Review your cart items, apply trade discount coupons, calculate logistics, and proceed to secure checkout for your bespoke interior furnishings.",
};

export default function CartPage() {
  return (
    <main>
      {/* Breadcrumb matching cart.html */}
      <Breadcrumb title="Cart List" category="Shop" />

      {/* Interactive Cart Client */}
      <CartClient />
    </main>
  );
}
