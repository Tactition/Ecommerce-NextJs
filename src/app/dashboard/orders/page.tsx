import React, { Suspense } from "react";
import { Metadata } from "next";
import { getAllOrdersAdminAction } from "@/lib/actions/orders";
import OrdersManager from "@/components/dashboard/OrdersManager";

export const metadata: Metadata = {
  title: "Customer Orders & Fulfillment | Wall Street Interiors Admin",
  description: "Real-time command center for customer orders, custom sizing details, status updates & invoices.",
};

export const revalidate = 0; // Always real-time in admin control panel

export default async function DashboardOrdersPage() {
  const { orders, stats } = await getAllOrdersAdminAction();

  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
          Loading real-time order fulfillment console...
        </div>
      }
    >
      <OrdersManager initialOrders={orders} initialStats={stats} />
    </Suspense>
  );
}
