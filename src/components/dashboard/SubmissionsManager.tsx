"use client";

import React, { useState } from "react";
import { ContactSubmission } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  getAllContactSubmissions,
  updateSubmissionStatusAction,
  deleteSubmissionAction,
} from "@/lib/actions/contact";
import { Mail, Phone, Trash2, CheckCircle2, Eye, X, AlertCircle } from "lucide-react";

interface SubmissionsManagerProps {
  initialSubmissions: ContactSubmission[];
}

export default function SubmissionsManager({ initialSubmissions }: SubmissionsManagerProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllContactSubmissions();
    setSubmissions(data);
    setIsLoading(false);
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
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Update failed" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteSubmissionAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Enquiry deleted." });
      if (selectedSub && selectedSub.id === deleteTargetId) {
        setSelectedSub(null);
      }
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Delete failed" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Client Inquiries & Project Requests
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Review client project requirements, bespoke furniture specs, and contact details
          </p>
        </div>
      </div>

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

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service Subject</th>
              <th>Phone & Email</th>
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
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>{sub.phone}</div>
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

      {/* View Modal */}
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "0.9rem" }}>
                <Phone size={16} color="var(--color-primary)" />
                <a href={`tel:${selectedSub.phone}`} style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                  {selectedSub.phone}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <Mail size={16} color="var(--color-primary)" />
                <a href={`mailto:${selectedSub.email}`} style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                  {selectedSub.email}
                </a>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#64748B", marginBottom: "8px" }}>
                Project Requirements / Message:
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

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Enquiry?"
        message="Are you sure you want to delete this customer inquiry record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
