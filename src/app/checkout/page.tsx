import React from "react";
import { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout | Wall Street Interiors - Luxury Furnishings & Bespoke Architectural Hardware",
  description:
    "Complete your bespoke luxury furnishing order with white-glove Pan-India delivery, B2B GST invoicing, and secure payment processing.",
};

export default function CheckoutPage() {
  return (
    <main>
      {/* Breadcrumb Navigation */}
      <Breadcrumb title="Checkout" category="Shop" />

      {/* Main Luxury Checkout Flow */}
      <CheckoutClient />
    </main>
  );
}
