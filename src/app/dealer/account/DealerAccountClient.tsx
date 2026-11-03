"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  updateDealerContactAction, 
  changeDealerPasswordAction, 
  addDealerAddressAction, 
  deleteDealerAddressAction 
} from "@/lib/actions/dealerAccount";
import { 
  Building2, 
  Lock, 
  MapPin, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2 
} from "lucide-react";

export default function DealerAccountClient({ dealer, addresses }: { dealer: any; addresses: any[] }) {
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  async function handleContactUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);
    setContactSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateDealerContactAction(formData);

    setContactLoading(false);
    if (!res.success) {
      setContactError(res.error || "Update failed");
    } else {
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 3000);
    }
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwError(null);
    setPwSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changeDealerPasswordAction(formData);

    setPwLoading(false);
    if (!res.success) {
      setPwError(res.error || "Password change failed");
    } else {
      setPwSuccess(true);
      form.reset();
      setTimeout(() => setPwSuccess(false), 3000);
    }
  }

  async function handleAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddrLoading(true);
    setAddrError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await addDealerAddressAction(formData);

    setAddrLoading(false);
    if (!res.success) {
      setAddrError(res.error || "Failed to add address");
    } else {
      setShowAddressModal(false);
      form.reset();
    }
  }

  async function handleDeleteAddress(id: number) {
    if (!confirm("Are you sure you want to remove this delivery destination?")) return;
    await deleteDealerAddressAction(id);
  }

  return (
    <div className="b2b-portal-wrapper">
      <div className="b2b-container" style={{ maxWidth: "900px" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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
            }}
          >
            <ArrowLeft size={16} /> Back to Dealer Desk
          </Link>
          <span className={`b2b-badge ${
            (dealer.approval_status || dealer.status) === "APPROVED"
              ? "b2b-badge-success"
              : (dealer.approval_status || dealer.status) === "PENDING"
              ? "b2b-badge-pending"
              : "b2b-badge-danger"
          }`}>
            Status: {(dealer.approval_status || dealer.status) === "APPROVED" ? "Approved Trade Partner" : (dealer.approval_status || dealer.status)}
          </span>
        </div>

        {/* Section 1: Business Profile (Locked Fields) */}
        <div className="b2b-card">
          <div className="b2b-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", backgroundColor: "#F1F5F9", borderRadius: "10px", color: "#0F172A" }}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="b2b-card-title">Verified Business Profile</h2>
                <p className="b2b-card-sub">Official entity information linked to your trade license & GST registration</p>
              </div>
            </div>
          </div>

          <div className="b2b-card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                backgroundColor: "#F8FAFC",
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  Legal Firm Name
                </span>
                <p style={{ fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>{dealer.business_name}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  GST / Tax Identification
                </span>
                <p style={{ fontWeight: 800, fontFamily: "monospace", color: "#0F172A", margin: "4px 0 0 0" }}>
                  {dealer.tax_number}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  Assigned Wholesale Tier
                </span>
                <p style={{ fontWeight: 800, color: "#B45309", margin: "4px 0 0 0" }}>
                  {dealer.tier_name} ({dealer.tier_discount_percent}% Discount)
                </p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  Business Entity Type
                </span>
                <p style={{ fontWeight: 600, color: "#334155", margin: "4px 0 0 0", textTransform: "capitalize" }}>
                  {dealer.business_type}
                </p>
              </div>
            </div>
            <p style={{ fontSize: "0.76rem", color: "#94A3B8", marginTop: "12px", fontStyle: "italic", margin: "12px 0 0 0" }}>
              * To update your registered firm name or GST credentials, please contact your trade account manager.
            </p>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="b2b-card">
          <div className="b2b-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", backgroundColor: "#F1F5F9", borderRadius: "10px", color: "#0F172A" }}>
                <User size={20} />
              </div>
              <div>
                <h2 className="b2b-card-title">Contact & Dispatch Representative</h2>
                <p className="b2b-card-sub">Primary point of contact for order delivery notifications</p>
              </div>
            </div>
          </div>

          <div className="b2b-card-body">
            {contactSuccess && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "10px", color: "#065F46", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} /> Contact details updated successfully.
              </div>
            )}
            {contactError && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", color: "#991B1B", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={16} /> {contactError}
              </div>
            )}

            <form onSubmit={handleContactUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    defaultValue={dealer.contact_person}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={dealer.business_phone}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button type="submit" disabled={contactLoading} className="b2b-btn-primary" style={{ padding: "10px 20px" }}>
                {contactLoading && <Loader2 size={16} className="animate-spin" />}
                Save Contact Information
              </button>
            </form>
          </div>
        </div>

        {/* Section 3: Multiple Delivery Addresses */}
        <div className="b2b-card">
          <div className="b2b-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", backgroundColor: "#F1F5F9", borderRadius: "10px", color: "#0F172A" }}>
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="b2b-card-title">Delivery Destinations & Godowns</h2>
                <p className="b2b-card-sub">Manage sites and warehouse addresses for multi-project dispatch</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="b2b-btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.82rem" }}
            >
              <Plus size={14} /> Add Location
            </button>
          </div>

          <div className="b2b-card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#0F172A" }}>{addr.label}</strong>
                      {addr.is_default === 1 && (
                        <span className="b2b-badge b2b-badge-success" style={{ margin: 0 }}>
                          Default
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 4px 0", fontWeight: 600 }}>
                      {addr.recipient_name} ({addr.phone})
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #E2E8F0", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#DC2626",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Security / Password */}
        <div className="b2b-card">
          <div className="b2b-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", backgroundColor: "#F1F5F9", borderRadius: "10px", color: "#0F172A" }}>
                <Lock size={20} />
              </div>
              <div>
                <h2 className="b2b-card-title">Change Portal Password</h2>
                <p className="b2b-card-sub">Keep your wholesale trade account access secure</p>
              </div>
            </div>
          </div>

          <div className="b2b-card-body">
            {pwSuccess && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "10px", color: "#065F46", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} /> Password changed successfully.
              </div>
            )}
            {pwError && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", color: "#991B1B", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={16} /> {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ maxWidth: "420px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                  New Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button type="submit" disabled={pwLoading} className="b2b-btn-primary" style={{ padding: "10px 20px", alignSelf: "flex-start" }}>
                {pwLoading && <Loader2 size={16} className="animate-spin" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
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
              borderRadius: "20px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0" }}>
              Add Delivery Destination
            </h3>

            {addrError && (
              <div style={{ marginBottom: "14px", padding: "10px", backgroundColor: "#FEF2F2", color: "#DC2626", borderRadius: "8px", fontSize: "0.85rem" }}>
                {addrError}
              </div>
            )}

            <form onSubmit={handleAddAddress} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                  Location Label (e.g., Fateh Kadal Godown, Lal Chowk Site)
                </label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="Main Warehouse"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                    Recipient Contact Name
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    required
                    defaultValue={dealer.contact_person}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                    Recipient Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={dealer.business_phone}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                  Street Address
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue="Srinagar"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>State</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue="Jammu and Kashmir"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>PIN</label>
                  <input
                    type="text"
                    name="postalCode"
                    defaultValue="190001"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", background: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={addrLoading} className="b2b-btn-primary" style={{ padding: "10px 20px" }}>
                  {addrLoading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
