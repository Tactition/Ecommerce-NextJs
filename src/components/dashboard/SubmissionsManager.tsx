"use client";

import React, { useState } from "react";
import { ContactSubmission, NewsletterSubscriber } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  getAllContactSubmissions,
  updateSubmissionStatusAction,
  deleteSubmissionAction,
  getAllNewsletterSubscribers,
  deleteNewsletterSubscriberAction,
  toggleNewsletterSubscriberStatusAction,
} from "@/lib/actions/contact";
import {
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  AlertCircle,
  Download,
  Users,
  MessageSquareQuote,
  Search,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface SubmissionsManagerProps {
  initialSubmissions: ContactSubmission[];
  initialSubscribers?: NewsletterSubscriber[];
}

export default function SubmissionsManager({
  initialSubmissions,
  initialSubscribers = [],
}: SubmissionsManagerProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "subscribers">("inquiries");

  // Inquiries state
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [deleteSubscriberId, setDeleteSubscriberId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getAllContactSubmissions();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscribers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllNewsletterSubscribers();
      setSubscribers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: "unread" | "read" | "archived") => {
    setIsActionLoading(true);
    const res = await updateSubmissionStatusAction(id, status);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: `Status updated to ${status}.` });
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub({ ...selectedSub, status });
      }
      await refreshInquiries();
    } else {
      setFeedback({ success: false, message: res.error || "Update failed" });
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteSubmissionAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Enquiry record deleted." });
      if (selectedSub && selectedSub.id === deleteTargetId) {
        setSelectedSub(null);
      }
      await refreshInquiries();
    } else {
      setFeedback({ success: false, message: res.error || "Delete failed" });
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!deleteSubscriberId) return;
    setIsActionLoading(true);

    const res = await deleteNewsletterSubscriberAction(deleteSubscriberId);
    setIsActionLoading(false);
    setDeleteSubscriberId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Subscriber removed successfully." });
      await refreshSubscribers();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to remove subscriber" });
    }
  };

  const handleToggleSubscriberStatus = async (id: number, currentStatus: string) => {
    setIsActionLoading(true);
    const res = await toggleNewsletterSubscriberStatusAction(id, currentStatus);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: "Subscriber status updated." });
      await refreshSubscribers();
    } else {
      setFeedback({ success: false, message: res.error || "Status update failed" });
    }
  };

  const exportSubscribersCsv = () => {
    if (subscribers.length === 0) return;
    const headers = ["ID", "Email Address", "Source", "Status", "Subscribed Date"];
    const rows = subscribers.map((s) => [
      s.id,
      `"${s.email}"`,
      `"${s.source || "Homepage Modal"}"`,
      `"${s.status}"`,
      `"${new Date(s.created_at).toLocaleString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  return (
    <div>
      {/* Header with Title and Navigation Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Customer Communications &amp; Leads
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem", margin: 0 }}>
            Manage client inquiries, custom furniture consultations, and collected newsletter email subscribers
          </p>
        </div>

        {activeTab === "subscribers" && subscribers.length > 0 && (
          <button
            onClick={exportSubscribersCsv}
            className="abid-btn abid-btn-secondary"
            style={{ padding: "9px 18px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Download size={16} />
            <span>Export Subscribers CSV</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          borderBottom: "1px solid #E2E8F0",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("inquiries");
            setFeedback(null);
          }}
          className={`abid-btn ${activeTab === "inquiries" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <MessageSquareQuote size={17} />
          <span>Client Inquiries ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("subscribers");
            setFeedback(null);
          }}
          className={`abid-btn ${activeTab === "subscribers" ? "abid-btn-primary" : "abid-btn-secondary"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Mail size={17} />
          <span>Newsletter Subscribers ({subscribers.length})</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: feedback.success ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: feedback.success ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.9rem",
            marginBottom: "20px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: CLIENT INQUIRIES
      ======================================================== */}
      {activeTab === "inquiries" && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service Subject</th>
                <th>Phone &amp; Email</th>
                <th>Date Received</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    Loading enquiries...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    No customer requests received yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} style={{ backgroundColor: sub.status === "unread" ? "#FFFBEB" : "inherit" }}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--color-secondary)" }}>{sub.name}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>{sub.subject}</span>
                    </td>
                    <td>
                      {sub.phone && <div style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>{sub.phone}</div>}
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{sub.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                        {new Date(sub.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} type="submission" />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="abid-btn abid-btn-outline"
                          style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(sub.id)}
                          className="abid-btn"
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "var(--color-danger)",
                            border: "1px solid #FECACA",
                            padding: "6px 10px",
                            fontSize: "0.82rem",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          TAB 2: NEWSLETTER SUBSCRIBERS
      ======================================================== */}
      {activeTab === "subscribers" && (
        <div>
          {/* Search bar & Refresh */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", minWidth: "280px" }}>
              <Search
                size={16}
                color="#94A3B8"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search subscribers by email..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.88rem",
                  width: "100%",
                }}
              />
            </div>

            <button
              onClick={refreshSubscribers}
              className="abid-btn abid-btn-outline"
              style={{ padding: "8px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={14} />
              <span>Refresh List</span>
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Subscriber Email</th>
                  <th>Source</th>
                  <th>Subscribed On</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                      Loading subscribers...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                      {subscriberSearch ? "No subscribers match your search." : "No newsletter subscribers collected yet. Fill out the popup modal on the homepage to test!"}
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>#{sub.id}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Mail size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: 600, color: "var(--color-secondary)", fontSize: "0.95rem" }}>
                            {sub.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            backgroundColor: "#EFF6FF",
                            color: "#2563EB",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {sub.source === "popup_modal" ? "Homepage Offer Modal" : sub.source}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                          {new Date(sub.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleSubscriberStatus(sub.id, sub.status)}
                          className="abid-btn"
                          title="Click to toggle status"
                          style={{
                            padding: "4px 10px",
                            fontSize: "0.78rem",
                            borderRadius: "12px",
                            fontWeight: 700,
                            backgroundColor: sub.status === "active" ? "#DCFCE7" : "#F1F5F9",
                            color: sub.status === "active" ? "#166534" : "#64748B",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {sub.status === "active" ? "● Active" : "○ Unsubscribed"}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => setDeleteSubscriberId(sub.id)}
                          className="abid-btn"
                          title="Delete subscriber"
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "var(--color-danger)",
                            border: "1px solid #FECACA",
                            padding: "6px 10px",
                            fontSize: "0.82rem",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal for Inquiries */}
      {selectedSub && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10, 17, 30, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              width: "100%",
              maxWidth: "560px",
              padding: "32px",
              boxShadow: "var(--shadow-xl)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedSub(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <StatusBadge status={selectedSub.status} type="submission" />
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                {new Date(selectedSub.created_at).toLocaleString()}
              </span>
            </div>

            <h2 style={{ fontSize: "1.4rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
              {selectedSub.name}
            </h2>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "20px" }}>
              {selectedSub.subject}
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "20px" }}>
              {selectedSub.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <Phone size={16} color="var(--color-primary)" />
                  <a href={`tel:${selectedSub.phone}`} style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                    {selectedSub.phone}
                  </a>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <Mail size={16} color="var(--color-primary)" />
                <a href={`mailto:${selectedSub.email}`} style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                  {selectedSub.email}
                </a>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#64748B", marginBottom: "8px" }}>
                Message Content:
              </div>
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--color-surface-border)", borderRadius: "var(--radius-md)", padding: "16px", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-text-main)" }}>
                {selectedSub.message}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderTop: "1px solid var(--color-surface-border)", paddingTop: "20px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleStatusChange(selectedSub.id, "read")}
                  className="abid-btn"
                  style={{ backgroundColor: "#ECFDF5", color: "#059669", padding: "8px 14px", fontSize: "0.85rem" }}
                >
                  Mark Responded
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSub.id, "archived")}
                  className="abid-btn"
                  style={{ backgroundColor: "#F1F5F9", color: "#64748B", padding: "8px 14px", fontSize: "0.85rem" }}
                >
                  Archive
                </button>
              </div>

              <button
                onClick={() => setSelectedSub(null)}
                className="abid-btn abid-btn-outline"
                style={{ padding: "8px 16px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inquiry Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Enquiry?"
        message="Are you sure you want to delete this customer inquiry record?"
        onConfirm={handleDeleteInquiry}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />

      {/* Delete Subscriber Dialog */}
      <ConfirmDialog
        isOpen={deleteSubscriberId !== null}
        title="Delete Subscriber?"
        message="Are you sure you want to remove this subscriber from your newsletter mailing list?"
        onConfirm={handleDeleteSubscriber}
        onCancel={() => setDeleteSubscriberId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
