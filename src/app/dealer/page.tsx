import Link from "next/link";
import { requireApprovedDealer } from "@/lib/auth/dealer";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { 
  Building2, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  Percent, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import DealerLogoutButton from "@/components/dealer/DealerLogoutButton";

export const dynamic = "force-dynamic";

export default async function DealerDashboardPage() {
  const session = await requireApprovedDealer();
  const dealerId = session.dealerId || 0;

  // Fetch dealer profile info
  const [dealers] = await pool.execute<RowDataPacket[]>(
    `SELECT d.*, 
            d.company_name as business_name, 
            d.contact_name as contact_person, 
            d.phone as business_phone, 
            d.email as business_email, 
            d.gst_number as tax_number, 
            dt.name as tier_name, 
            dt.discount_percent as tier_discount
     FROM dealers d
     LEFT JOIN dealer_tiers dt ON dt.id = d.tier_id
     WHERE d.id = ?`,
    [dealerId]
  );

  const dealer = dealers[0];

  // Fetch recent dealer orders
  const [recentOrders] = await pool.execute<RowDataPacket[]>(
    `SELECT id, order_number, total_amount as total, payment_method, payment_status, order_status as status, created_at
     FROM orders
     WHERE dealer_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [dealerId]
  );

  // Fetch summary stats
  const [stats] = await pool.execute<RowDataPacket[]>(
    `SELECT 
       COUNT(*) as total_orders,
       COALESCE(SUM(total_amount), 0) as total_spend
     FROM orders
     WHERE dealer_id = ? AND order_status != 'cancelled'`,
    [dealerId]
  );

  return (
    <div className="b2b-portal-wrapper">
      <div className="b2b-container">
        {/* Top Header Card */}
        <div className="b2b-header-card">
          <div>
            <div className={`b2b-badge ${
              dealer?.approval_status === "APPROVED" 
                ? "b2b-badge-success" 
                : dealer?.approval_status === "PENDING"
                ? "b2b-badge-pending"
                : "b2b-badge-danger"
            }`}>
              <ShieldCheck size={14} /> {
                dealer?.approval_status === "APPROVED"
                  ? "Approved Trade Partner"
                  : dealer?.approval_status === "PENDING"
                  ? "Application Under Review"
                  : dealer?.approval_status === "SUSPENDED"
                  ? "Account Suspended"
                  : "Application Rejected"
              }
            </div>
            <h1 className="b2b-header-title">{dealer?.business_name || "Dealer Portal"}</h1>
            <p className="b2b-header-sub">
              GST: <strong style={{ color: "#E2E8F0", fontFamily: "monospace" }}>{dealer?.tax_number}</strong> &bull; Contact: {dealer?.contact_person} ({dealer?.business_phone})
            </p>
          </div>

          <div className="b2b-header-actions">
            <Link href="/shop" className="b2b-btn-primary">
              <ShoppingBag size={18} />
              <span>Browse Catalog at Wholesale Rates</span>
            </Link>
            <Link href="/dealer/account" className="b2b-btn-secondary">
              <span>Account Settings</span>
            </Link>
            <DealerLogoutButton />
          </div>
        </div>

        {/* Trade Metrics Grid */}
        <div className="b2b-metrics-grid">
          <div className="b2b-metric-card">
            <div className="b2b-metric-head">
              <span>Assigned Tier</span>
              <Percent size={18} color="#F59E0B" />
            </div>
            <div className="b2b-metric-value">{dealer?.tier_name || "Standard Dealer"}</div>
            <p className="b2b-metric-sub" style={{ color: "#059669", fontWeight: 700 }}>
              {dealer?.tier_discount ? `${dealer.tier_discount}% Default Catalog Discount` : "Custom Wholesale Rates"}
            </p>
          </div>

          <div className="b2b-metric-card">
            <div className="b2b-metric-head">
              <span>Credit Terms</span>
              <CreditCard size={18} color="#0284C7" />
            </div>
            <div className="b2b-metric-value">
              {dealer?.allow_credit_terms ? `Net ${dealer.credit_days} Days` : "Pay on Order"}
            </div>
            <p className="b2b-metric-sub">
              {dealer?.allow_credit_terms ? `Credit Line: ₹${Number(dealer.credit_limit).toLocaleString()}` : "Advance invoice or online payment"}
            </p>
          </div>

          <div className="b2b-metric-card">
            <div className="b2b-metric-head">
              <span>Total B2B Orders</span>
              <Package size={18} color="#7C3AED" />
            </div>
            <div className="b2b-metric-value">{stats[0]?.total_orders || 0}</div>
            <p className="b2b-metric-sub">Trade orders placed to date</p>
          </div>

          <div className="b2b-metric-card">
            <div className="b2b-metric-head">
              <span>Total Trade Spend</span>
              <Building2 size={18} color="#FF4035" />
            </div>
            <div className="b2b-metric-value">₹{Number(stats[0]?.total_spend || 0).toLocaleString()}</div>
            <p className="b2b-metric-sub">Net wholesale billing volume</p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="b2b-card">
          <div className="b2b-card-header">
            <div>
              <h2 className="b2b-card-title">Recent Wholesale Orders</h2>
              <p className="b2b-card-sub">Track shipments, download tax invoices, and reorder</p>
            </div>
            <Link
              href="/dealer/orders"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#FF4035",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <Package size={44} color="#CBD5E1" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: "#334155", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 4px 0" }}>
                No wholesale orders placed yet.
              </p>
              <p style={{ color: "#64748B", fontSize: "0.82rem", margin: "0 0 16px 0" }}>
                Browse our wallpapers, flooring, PVC, and blinds at importer-direct rates to place your first trade order.
              </p>
              <Link href="/shop" className="b2b-btn-primary">
                Browse Wholesale Products
              </Link>
            </div>
          ) : (
            <div className="b2b-table-responsive">
              <table className="b2b-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 800, fontFamily: "monospace", color: "#0F172A" }}>
                        {ord.order_number || `#ORD-${ord.id}`}
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
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: ord.payment_status === "paid" ? "#16A34A" : "#D97706" }}>
                          {ord.payment_status?.toUpperCase()}
                        </span>
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
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#0F172A",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Invoice <ExternalLink size={13} />
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
