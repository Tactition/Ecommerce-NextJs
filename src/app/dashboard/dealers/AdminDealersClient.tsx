"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateDealerStatusAction } from "@/lib/actions/adminDealers";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  ExternalLink,
  CreditCard,
  Percent,
  Sliders,
  Loader2,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
  Ban
} from "lucide-react";

export default function AdminDealersClient({
  dealers,
  tiers,
  currentStatus,
}: {
  dealers: any[];
  tiers: any[];
  currentStatus: string;
}) {
  const router = useRouter();
  const [selectedDealer, setSelectedDealer] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"status" | null>(null);
  const [statusVal, setStatusVal] = useState<any>("APPROVED");
  const [reasonVal, setReasonVal] = useState("");
  const [tierVal, setTierVal] = useState<number>(tiers[0]?.id || 1);
  const [allowCredit, setAllowCredit] = useState(false);
  const [creditLimit, setCreditLimit] = useState(0);
  const [creditDays, setCreditDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDealers = dealers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.business_name?.toLowerCase().includes(q) ||
      d.contact_person?.toLowerCase().includes(q) ||
      d.tax_number?.toLowerCase().includes(q) ||
      d.business_email?.toLowerCase().includes(q)
    );
  });

  function openStatusModal(dealer: any) {
    setSelectedDealer(dealer);
    setStatusVal(dealer.status);
    setReasonVal(dealer.rejection_reason || "");
    setTierVal(dealer.tier_id || tiers[0]?.id || 1);
    setAllowCredit(Boolean(dealer.allow_credit_terms));
    setCreditLimit(Number(dealer.credit_limit || 0));
    setCreditDays(Number(dealer.credit_days || 30));
    setModalMode("status");
  }

  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDealer) return;
    setLoading(true);

    await updateDealerStatusAction(
      selectedDealer.id,
      statusVal,
      reasonVal,
      tierVal,
      allowCredit,
      creditLimit,
      creditDays,
      `Status updated via Admin Console to ${statusVal}`
    );

    setLoading(false);
    setModalMode(null);
    router.refresh();
  }

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 4px",
              fontFamily: "var(--font-heading, sans-serif)",
            }}
          >
            B2B Trade Dealers & Wholesalers
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.82rem", margin: 0 }}>
            Review GST credentials, approve trade accounts, set credit lines, and assign wholesale tiers
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/dashboard/pricing/wholesale"
            className="b2b-btn-primary"
            style={{ fontSize: "0.8rem", padding: "10px 18px", borderRadius: "10px" }}
          >
            <Sliders size={14} /> Wholesale Pricing & MOQs
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div
        className="b2b-card"
        style={{
          padding: "12px 18px",
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Dealers" },
            { id: "PENDING", label: "Pending Review" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
            { id: "SUSPENDED", label: "Suspended" },
          ].map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/dashboard/dealers?status=${tab.id}`}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  backgroundColor: isActive ? "#0F172A" : "#F1F5F9",
                  color: isActive ? "#FFFFFF" : "#475569",
                  border: isActive ? "1px solid #0F172A" : "1px solid #E2E8F0",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
            }}
          />
          <input
            type="text"
            placeholder="Search business, GST, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              fontSize: "0.8rem",
              color: "#0F172A",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Dealers Table Card */}
      <div className="b2b-card">
        <div className="b2b-table-responsive">
          <table className="b2b-table">
            <thead>
              <tr>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>Firm / Contact</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>GST / Tax ID</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>Status</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>Assigned Tier</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>Credit Terms</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem" }}>Registered</th>
                <th style={{ padding: "12px 18px", fontSize: "0.72rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                    No dealer accounts found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredDealers.map((d) => (
                  <tr key={d.id}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                        {d.business_name}
                      </div>
                      <div style={{ color: "#64748B", fontSize: "0.78rem", marginTop: "2px" }}>
                        {d.contact_person} • {d.business_phone}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: "0.72rem" }}>{d.business_email}</div>
                    </td>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                      {d.tax_number}
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          color: "#94A3B8",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-primary, sans-serif)",
                          marginTop: "2px",
                        }}
                      >
                        {d.business_type}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        className={`b2b-badge ${
                          d.status === "APPROVED"
                            ? "b2b-badge-success"
                            : d.status === "PENDING"
                            ? "b2b-badge-pending"
                            : "b2b-badge-danger"
                        }`}
                        style={{ margin: 0, fontSize: "0.68rem", padding: "3px 9px" }}
                      >
                        {d.status === "APPROVED" && <CheckCircle size={11} />}
                        {d.status === "PENDING" && <Clock size={11} />}
                        {d.status === "SUSPENDED" && <Ban size={11} />}
                        {d.status === "REJECTED" && <XCircle size={11} />}
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.8rem", fontWeight: 600, color: "#1E293B" }}>
                      {d.tier_name ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ color: "#0F172A", fontWeight: 700 }}>{d.tier_name}</span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 6px",
                              backgroundColor: "rgba(255, 64, 53, 0.08)",
                              color: "#FF4035",
                              borderRadius: "4px",
                              fontWeight: 700,
                            }}
                          >
                            {d.tier_discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#94A3B8" }}>Standard Retail</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.8rem" }}>
                      {d.allow_credit_terms ? (
                        <span style={{ color: "#0284C7", fontWeight: 700 }}>
                          Net {d.credit_days}d (₹{Number(d.credit_limit).toLocaleString()})
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "0.78rem" }}>Pay on Order</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748B", fontSize: "0.76rem" }}>
                      {new Date(d.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        onClick={() => openStatusModal(d)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          borderRadius: "7px",
                          backgroundColor: "#0F172A",
                          color: "#FFFFFF",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <Sliders size={12} /> Review / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {modalMode === "status" && selectedDealer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px 24px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 64, 53, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FF4035",
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: 0,
                    fontFamily: "var(--font-heading, sans-serif)",
                  }}
                >
                  Review Dealer Account
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0 }}>
                  {selectedDealer.business_name} (GST: {selectedDealer.tax_number})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "5px" }}>
                  Account Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "9px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    outline: "none",
                  }}
                >
                  <option value="APPROVED">APPROVED (Full Wholesale Access)</option>
                  <option value="PENDING">PENDING (Awaiting Review)</option>
                  <option value="REJECTED">REJECTED (Declined)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily On Hold)</option>
                </select>
              </div>

              {statusVal === "REJECTED" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "5px" }}>
                    Rejection Reason (Emailed to applicant)
                  </label>
                  <input
                    type="text"
                    value={reasonVal}
                    onChange={(e) => setReasonVal(e.target.value)}
                    placeholder="e.g. GST registration details could not be verified"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      backgroundColor: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "9px",
                      fontSize: "0.82rem",
                      color: "#0F172A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "5px" }}>
                  Assign Wholesale Discount Tier
                </label>
                <select
                  value={tierVal}
                  onChange={(e) => setTierVal(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "9px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    outline: "none",
                  }}
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.discount_percent}% Tier Discount)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="checkbox"
                    id="allowCreditCheck"
                    checked={allowCredit}
                    onChange={(e) => setAllowCredit(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#FF4035", cursor: "pointer" }}
                  />
                  <label htmlFor="allowCreditCheck" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F172A", cursor: "pointer" }}>
                    Allow Credit Terms / Pay on Invoice
                  </label>
                </div>

                {allowCredit && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingLeft: "12px", borderLeft: "2px solid #E2E8F0" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>
                        Credit Limit (₹)
                      </label>
                      <input
                        type="number"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(Number(e.target.value))}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>
                        Payment Days (Net)
                      </label>
                      <input
                        type="number"
                        value={creditDays}
                        onChange={(e) => setCreditDays(Number(e.target.value))}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#64748B",
                    backgroundColor: "#F1F5F9",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 18px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    background: "linear-gradient(135deg, #FF4035 0%, #D9251A 100%)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(255, 64, 53, 0.3)",
                  }}
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
