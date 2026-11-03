import Link from "next/link";
import { requireApprovedDealer } from "@/lib/auth/dealer";
import { getDealerOrdersAction } from "@/lib/actions/dealerOrders";
import { Package, ArrowLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DealerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireApprovedDealer();
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const status = resolvedParams.status || "ALL";

  const { orders } = await getDealerOrdersAction(page, status);

  return (
    <div className="b2b-portal-wrapper">
      <div className="b2b-container">
        {/* Header Breadcrumbs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <Link
              href="/dealer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#64748B",
                textDecoration: "none",
                marginBottom: "8px",
              }}
            >
              <ArrowLeft size={16} /> Back to Dealer Desk
            </Link>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "var(--font-heading)" }}>
              Wholesale Order History
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
              Complete log of all trade orders, shipments, GST invoices, and credit terms
            </p>
          </div>
          <Link href="/shop" className="b2b-btn-primary">
            Create New Wholesale Order
          </Link>
        </div>

        {/* Orders Table Container */}
        <div className="b2b-card">
          {orders.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <Package size={48} color="#CBD5E1" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: "#0F172A", fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>No wholesale orders found</p>
              <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                You haven&apos;t placed any orders matching the current filter.
              </p>
            </div>
          ) : (
            <div className="b2b-table-responsive">
              <table className="b2b-table">
                <thead>
                  <tr>
                    <th>Order / PO Number</th>
                    <th>Order Date</th>
                    <th>Payment & Terms</th>
                    <th>Fulfillment Status</th>
                    <th>Total Amount</th>
                    <th style={{ textAlign: "right" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord: any) => (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#0F172A", display: "block" }}>
                          {ord.order_number || `#ORD-${ord.id}`}
                        </strong>
                        {ord.purchase_order_number && (
                          <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                            PO: {ord.purchase_order_number}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "#64748B" }}>
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontWeight: 600, display: "block" }}>
                          {ord.payment_method?.replace(/_/g, " ")}
                        </span>
                        {ord.invoice_terms && (
                          <span style={{ fontSize: "0.72rem", color: "#0284C7", fontWeight: 700, display: "block" }}>
                            Terms: {ord.invoice_terms}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="b2b-badge b2b-badge-success" style={{ margin: 0 }}>
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: "#0F172A" }}>
                        ₹{Number(ord.total).toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          href={`/dealer/orders/${ord.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 14px",
                            backgroundColor: "#F1F5F9",
                            color: "#0F172A",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          View Invoice <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
