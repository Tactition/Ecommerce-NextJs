"use client";

import React, { useState } from "react";
import { FAQ } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { getAllFAQs, saveFAQAction, deleteFAQAction } from "@/lib/actions/faqs";
import { Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";

interface FaqsManagerProps {
  initialFaqs: FAQ[];
}

export default function FaqsManager({ initialFaqs }: FaqsManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [answer, setAnswer] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllFAQs();
    setFaqs(data);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingFAQ(null);
    setAnswer("");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const openEditModal = (f: FAQ) => {
    setEditingFAQ(f);
    setAnswer(f.answer || "");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActionLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await saveFAQAction(formData);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: "FAQ saved successfully!" });
      setIsModalOpen(false);
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to save FAQ" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteFAQAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "FAQ deleted." });
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
            FAQ Management
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Manage common customer questions and transparent answers
          </p>
        </div>

        <button onClick={openCreateModal} className="abid-btn abid-btn-primary" style={{ padding: "10px 20px" }}>
          <Plus size={18} />
          <span>Add New FAQ</span>
        </button>
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
              <th>Question & Answer</th>
              <th>Status</th>
              <th>Sort Order</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading FAQs...
                </td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No FAQs found.
                </td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--color-secondary)", marginBottom: "4px" }}>
                      {faq.question}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", maxWidth: "560px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {faq.answer}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={faq.is_published} type="published" />
                  </td>
                  <td>{faq.sort_order}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(faq)}
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(faq.id)}
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

      {isModalOpen && (
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
              maxWidth: "580px",
              padding: "32px",
              boxShadow: "var(--shadow-xl)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
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

            <h2 style={{ fontSize: "1.45rem", marginBottom: "6px" }}>
              {editingFAQ ? "Edit FAQ" : "New FAQ"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
              Define the question and comprehensive answer
            </p>

            <form onSubmit={handleFormSubmit}>
              {editingFAQ && <input type="hidden" name="id" value={editingFAQ.id} />}

              <div className="form-group">
                <label className="form-label" htmlFor="question">Question *</label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  required
                  defaultValue={editingFAQ?.question || ""}
                  placeholder="e.g. Do you use genuine manufacturer-certified spare parts?"
                  className="form-input"
                />
              </div>

              <input type="hidden" name="answer" value={answer} />
              <RichTextEditor
                label="Answer"
                value={answer}
                onChange={setAnswer}
                placeholder="Comprehensive clear answer detailing policies, warranty, and technician procedures..."
                minHeight={120}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="is_published">Status</label>
                  <select
                    id="is_published"
                    name="is_published"
                    defaultValue={editingFAQ ? String(editingFAQ.is_published) : "1"}
                    className="form-select"
                  >
                    <option value="1">Published</option>
                    <option value="0">Draft</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sort_order">Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    defaultValue={editingFAQ?.sort_order ?? 0}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="abid-btn abid-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isActionLoading} className="abid-btn abid-btn-primary">
                  {isActionLoading ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete FAQ?"
        message="Are you sure you want to delete this FAQ entry?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
