"use client";

import { Printer } from "lucide-react";

export default function OrderDetailPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="b2b-btn-primary"
      style={{ padding: "8px 16px", fontSize: "0.82rem" }}
    >
      <Printer size={15} /> Print Tax Invoice
    </button>
  );
}
