"use client";

import React, { useState } from "react";
import { PartnerBrand } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { getAllBrands, saveBrandAction, deleteBrandAction } from "@/lib/actions/brands";
import { Plus, Edit2, Trash2, X, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface BrandsManagerProps {
  initialBrands: PartnerBrand[];
}

export default function BrandsManager({ initialBrands }: BrandsManagerProps) {
  const [brands, setBrands] = useState<PartnerBrand[]>(initialBrands);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrand | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllBrands();
    setBrands(data);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setLogoUrl("/assets/images/brand-logo/brand-logo1_1.png");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const openEditModal = (b: PartnerBrand) => {
    setEditingBrand(b);
    setLogoUrl(b.logo || "");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActionLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("logo", logoUrl);

    const res = await saveBrandAction(formData);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: "Partner brand saved successfully!" });
      setIsModalOpen(false);
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to save brand" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteBrandAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Brand removed successfully." });
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
            Partner Brand Management
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Manage architectural finishes, surface suppliers, and hardware manufacturer partnerships
          </p>
        </div>

        <button onClick={openCreateModal} className="abid-btn abid-btn-primary" style={{ padding: "10px 20px" }}>
          <Plus size={18} />
          <span>Add Brand</span>
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
              <th>Brand Logo & Name</th>
              <th>Website URL</th>
              <th>Status</th>
              <th>Sort Order</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading partner brands...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No brands configured.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "40px",
                          backgroundColor: "#F8FAFC",
                          border: "1px solid var(--color-surface-border)",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                        }}
                      >
                        <img src={brand.logo} alt={brand.name} style={{ maxHeight: "32px", maxWidth: "52px", objectFit: "contain" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--color-secondary)" }}>{brand.name}</span>
                    </div>
                  </td>
                  <td>
                    {brand.website_url && brand.website_url !== "#" ? (
                      <a href={brand.website_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-accent)", fontSize: "0.85rem" }}>
                        <span>{brand.website_url}</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>No Link</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={brand.is_active} type="active" />
                  </td>
                  <td>{brand.sort_order}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(brand)}
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(brand.id)}
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

      {/* Modal */}
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
              maxWidth: "520px",
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
              {editingBrand ? "Edit Partner Brand" : "Add Partner Brand"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
              Upload logo image and configure manufacturer details
            </p>

            <form onSubmit={handleFormSubmit}>
              {editingBrand && <input type="hidden" name="id" value={editingBrand.id} />}

              <div className="form-group">
                <label className="form-label" htmlFor="name">Brand Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={editingBrand?.name || ""}
                  placeholder="e.g. Sony Corporation"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="website_url">Website URL</label>
                <input
                  type="text"
                  id="website_url"
                  name="website_url"
                  defaultValue={editingBrand?.website_url || "#"}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>

              <ImageUploader
                value={logoUrl}
                onChange={setLogoUrl}
                label="Brand Logo Graphic"
                name="logo"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="is_active">Status</label>
                  <select
                    id="is_active"
                    name="is_active"
                    defaultValue={editingBrand ? String(editingBrand.is_active) : "1"}
                    className="form-select"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sort_order">Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    defaultValue={editingBrand?.sort_order ?? 0}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="abid-btn abid-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isActionLoading} className="abid-btn abid-btn-primary">
                  {isActionLoading ? "Saving..." : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Remove Partner Brand?"
        message="Are you sure you want to remove this partner brand from the active showcase?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
