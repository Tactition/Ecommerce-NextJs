"use client";

import React, { useState } from "react";
import { Service } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { getAllServices, saveServiceAction, deleteServiceAction } from "@/lib/actions/services";
import { Plus, Edit2, Trash2, X, Search, CheckCircle2, AlertCircle } from "lucide-react";

interface ServicesManagerProps {
  initialServices: Service[];
}

export default function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [search, setSearch] = useState("");

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllServices();
    setServices(data);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setImageUrl("/assets/images/best-seller/bestSellerProductThumb2_1.png");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setImageUrl(s.image || "");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActionLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl);

    const res = await saveServiceAction(formData);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: "Service successfully saved!" });
      setIsModalOpen(false);
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to save service" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteServiceAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Service deleted successfully." });
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to delete" });
    }
  };

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Service Management
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Create, update, and publish interior architecture, furniture, and contracting services
          </p>
        </div>

        <button onClick={openCreateModal} className="abid-btn abid-btn-primary" style={{ padding: "10px 20px" }}>
          <Plus size={18} />
          <span>Add New Service</span>
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

      {/* Search Bar */}
      <div style={{ marginBottom: "20px", position: "relative", maxWidth: "380px" }}>
        <input
          type="text"
          placeholder="Search services by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: "38px" }}
        />
        <Search size={18} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
      </div>

      {/* Data Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service Details</th>
              <th>Slug / URL</th>
              <th>Price Guide</th>
              <th>Status</th>
              <th>Sort</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading services...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No services found.
                </td>
              </tr>
            ) : (
              filtered.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#0A111E", flexShrink: 0 }}>
                        <img src={service.image} alt={service.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-secondary)" }}>{service.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {service.short_description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.82rem", backgroundColor: "#F1F5F9", padding: "3px 6px", borderRadius: "4px" }}>
                      /services/{service.slug}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--color-secondary)", fontSize: "0.88rem" }}>
                      {service.price_range}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={service.is_published} type="published" />
                  </td>
                  <td>{service.sort_order}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(service)}
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                        title="Edit service"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(service.id)}
                        className="abid-btn"
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "var(--color-danger)",
                          border: "1px solid #FECACA",
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                        }}
                        title="Delete service"
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

      {/* Modal Dialog for Create/Edit */}
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
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
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

            <h2 style={{ fontSize: "1.45rem", marginBottom: "6px", color: "var(--color-secondary)" }}>
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
              Configure service details and pricing to appear across the website
            </p>

            <form onSubmit={handleFormSubmit}>
              {editingService && <input type="hidden" name="id" value={editingService.id} />}

              <div className="form-group">
                <label className="form-label" htmlFor="title">Service Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  defaultValue={editingService?.title || ""}
                  placeholder="e.g. Acoustic Slat Wood Wall Paneling"
                  className="form-input"
                  onChange={(e) => {
                    if (!editingService) {
                      const slugInput = document.getElementById("slug") as HTMLInputElement;
                      if (slugInput) {
                        slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      }
                    }
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="slug">URL Slug *</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    defaultValue={editingService?.slug || ""}
                    placeholder="e.g. acoustic-wood-wall-paneling"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="price_range">Price Range Guide</label>
                  <input
                    type="text"
                    id="price_range"
                    name="price_range"
                    defaultValue={editingService?.price_range || "Starts from ₹12,000"}
                    placeholder="e.g. ₹280 / sq. ft. or Starts from ₹25,000"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="short_description">Short Overview *</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  required
                  rows={2}
                  defaultValue={editingService?.short_description || ""}
                  placeholder="Brief 1-2 sentence description for homepage cards..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Detailed Description (HTML/Text) *</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  defaultValue={editingService?.description || ""}
                  placeholder="Comprehensive service details, process steps, diagnostic capabilities..."
                  className="form-textarea"
                />
              </div>

              {/* Image Uploader */}
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="Service Illustration Image"
                name="image"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="is_published">Publication Status</label>
                  <select
                    id="is_published"
                    name="is_published"
                    defaultValue={editingService ? String(editingService.is_published) : "1"}
                    className="form-select"
                  >
                    <option value="1">Published (Visible to Visitors)</option>
                    <option value="0">Draft (Hidden)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sort_order">Display Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    defaultValue={editingService?.sort_order ?? 0}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="abid-btn abid-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="abid-btn abid-btn-primary"
                >
                  {isActionLoading ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Service Offering?"
        message="Are you sure you want to permanently delete this service? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
