import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedDealer } from "@/lib/auth/dealer";
import { getDealerOrderDetailAction } from "@/lib/actions/dealerOrders";
import { ArrowLeft } from "lucide-react";
import OrderDetailPrintButton from "./OrderDetailPrintButton";

export const dynamic = "force-dynamic";

export default async function DealerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireApprovedDealer();
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) notFound();

  let orderData;
  try {
    orderData = await getDealerOrderDetailAction(orderId);
  } catch {
    notFound();
  }

  const { order, items, dealer } = orderData;

  return (
    <div className="b2b-portal-wrapper">
      <div className="b2b-container" style={{ maxWidth: "900px" }}>
        {/* Navigation & Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }} className="no-print">
          <Link
            href="/dealer/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#64748B",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} /> Back to All Orders
          </Link>
          <OrderDetailPrintButton />
        </div>

        {/* Printable Tax Invoice Card */}
        <div className="b2b-invoice-box">
          {/* Header */}
          <div style={{ borderBottom: "1.5px solid #E2E8F0", paddingBottom: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                B2B Tax Invoice
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0", fontFamily: "var(--font-heading)" }}>
                Wall Street Interiors
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                Importer-Direct Interior Materials House<br />
                Near New Habba Kadal Bridge, Srinagar, J&K 190001<br />
                GSTIN: 01AABBW9876C1Z4 &bull; WhatsApp: +91 9018454526
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", display: "block" }}>
                Invoice Number
              </span>
              <p style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "#0F172A", margin: "4px 0" }}>
                {order.order_number || `#ORD-${order.id}`}
              </p>
              <p style={{ color: "#64748B", fontSize: "0.82rem", margin: 0 }}>
                Date: {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {order.purchase_order_number && (
                <p style={{ color: "#0284C7", fontWeight: 700, fontSize: "0.82rem", marginTop: "4px" }}>
                  PO: {order.purchase_order_number}
                </p>
              )}
            </div>
          </div>

          {/* Parties Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px 0", borderBottom: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Billed To (Trade Partner)
              </span>
              <strong style={{ fontSize: "1rem", color: "#0F172A", display: "block" }}>{dealer.business_name}</strong>
              <p style={{ fontFamily: "monospace", fontWeight: 700, color: "#334155", margin: "2px 0 6px 0" }}>
                GSTIN: {dealer.tax_number}
              </p>
              <p style={{ color: "#64748B", margin: 0 }}>Attn: {dealer.contact_person}</p>
              <p style={{ color: "#64748B", margin: 0 }}>{dealer.business_phone} | {dealer.business_email}</p>
              <p style={{ color: "#64748B", margin: "4px 0 0 0" }}>{dealer.business_address}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Shipment Destination
              </span>
              <strong style={{ fontSize: "1rem", color: "#0F172A", display: "block" }}>{order.first_name} {order.last_name}</strong>
              <p style={{ color: "#64748B", margin: "2px 0" }}>{order.phone}</p>
              <p style={{ color: "#64748B", margin: 0 }}>{order.address_line1}</p>
              <p style={{ color: "#64748B", margin: 0 }}>{order.city}, {order.state} - {order.postal_code}</p>
              <div style={{ marginTop: "8px" }}>
                <span className="b2b-badge b2b-badge-pending" style={{ margin: 0 }}>
                  Terms: {order.invoice_terms || order.payment_method?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: "24px 0" }}>
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>SKU</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Wholesale Rate</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: "#0F172A", display: "block" }}>{item.product_name}</strong>
                    </td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", color: "#64748B" }}>
                      {item.sku || `WSI-${item.product_id}`}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{Number(item.price).toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "#0F172A" }}>
                      ₹{Number(item.total_price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ borderTop: "1.5px solid #E2E8F0", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748B", maxWidth: "400px" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: 700, color: "#334155" }}>Terms & Conditions:</p>
              <p style={{ margin: 0 }}>
                1. Importer-direct trade supply is subject to standard manufacturer warranty.<br />
                2. Subject to Srinagar jurisdiction only.<br />
                3. Computer-generated wholesale tax invoice.
              </p>
            </div>

            <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 700 }}>₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                <span>Delivery:</span>
                <span style={{ fontWeight: 700 }}>Included</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #E2E8F0", paddingTop: "8px", fontSize: "1.1rem", fontWeight: 800, color: "#0F172A" }}>
                <span>Total Payable:</span>
                <span>₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
