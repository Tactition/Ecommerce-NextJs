"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Role, RBAC_MODULES, RbacModuleDefinition, RbacAction } from "@/types/rbac";
import { SessionPayload } from "@/lib/token";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/lib/actions/roles";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  KeyRound,
  ShieldCheck,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  HelpCircle,
} from "lucide-react";

interface RolesManagerProps {
  initialRoles: Role[];
  currentUser: SessionPayload;
}

export default function RolesManager({ initialRoles, currentUser }: RolesManagerProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const openCreateModal = () => {
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setSelectedPerms(new Set());
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (role: Role) => {
    setFormName(role.name);
    setFormSlug(role.slug);
    setFormDescription(role.description || "");

    if (role.slug === "admin" || role.permissions.includes("*")) {
      // Admin has all permissions
      const all = new Set<string>();
      RBAC_MODULES.forEach((mod) => {
        mod.actions.forEach((act) => all.add(`${mod.id}:${act}`));
      });
      setSelectedPerms(all);
    } else {
      setSelectedPerms(new Set(role.permissions));
    }

    setFeedback(null);
    setEditingRole(role);
  };

  const togglePermission = (modId: string, action: string) => {
    const key = `${modId}:${action}`;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleModuleAll = (mod: RbacModuleDefinition) => {
    const allModuleKeys = mod.actions.map((act) => `${mod.id}:${act}`);
    const hasAll = allModuleKeys.every((k) => selectedPerms.has(k));

    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (hasAll) {
        allModuleKeys.forEach((k) => next.delete(k));
      } else {
        allModuleKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  // Preset Toggles
  const applyPreset = (preset: "all" | "readonly" | "editor" | "clear") => {
    if (preset === "clear") {
      setSelectedPerms(new Set());
      return;
    }

    const next = new Set<string>();

    if (preset === "all") {
      RBAC_MODULES.forEach((mod) => {
        mod.actions.forEach((act) => next.add(`${mod.id}:${act}`));
      });
    } else if (preset === "readonly") {
      RBAC_MODULES.forEach((mod) => {
        if (mod.actions.includes("view")) {
          next.add(`${mod.id}:view`);
        }
      });
    } else if (preset === "editor") {
      const contentModules = ["products", "categories", "services", "brands", "gallery", "testimonials", "faqs", "blog"];
      RBAC_MODULES.forEach((mod) => {
        if (contentModules.includes(mod.id)) {
          mod.actions.forEach((act) => {
            if (act !== "delete") next.add(`${mod.id}:${act}`);
          });
        } else if (mod.id === "submissions") {
          next.add("submissions:view");
        }
      });
    }

    setSelectedPerms(next);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingRole) {
      // Auto-slugify
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(autoSlug);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData();
    formData.set("name", formName);
    formData.set("slug", formSlug);
    formData.set("description", formDescription);
    formData.set("permissions", JSON.stringify(Array.from(selectedPerms)));

    startTransition(async () => {
      const res = await createRoleAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: `Role '${formName}' created successfully!` });
        setIsCreateOpen(false);
        const newRole: Role = {
          id: res.roleId || Date.now(),
          name: formName,
          slug: formSlug,
          description: formDescription || null,
          is_system: 0,
          permissions: Array.from(selectedPerms),
          user_count: 0,
          created_at: new Date().toISOString(),
        };
        setRoles((prev) => [...prev, newRole]);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to create role." });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRole) return;
    setFeedback(null);

    const formData = new FormData();
    formData.set("id", String(editingRole.id));
    formData.set("name", formName);
    formData.set("description", formDescription);
    formData.set("permissions", JSON.stringify(Array.from(selectedPerms)));

    startTransition(async () => {
      const res = await updateRoleAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: `Role '${formName}' updated successfully!` });
        const updatedPerms = editingRole.slug === "admin" ? ["*"] : Array.from(selectedPerms);

        setRoles((prev) =>
          prev.map((r) =>
            r.id === editingRole.id
              ? {
                  ...r,
                  name: formName,
                  description: formDescription || null,
                  permissions: updatedPerms,
                }
              : r
          )
        );
        setEditingRole(null);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update role." });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteRoleAction(deleteTarget.id);
      if (res.success) {
        setFeedback({ success: true, message: `Role '${deleteTarget.name}' has been deleted.` });
        setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to delete role." });
        setDeleteTarget(null);
      }
    });
  };

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.85rem", color: "#0F172A", fontWeight: 800, margin: 0 }}>
              Roles &amp; Permission Access Control
            </h1>
            <span
              style={{
                backgroundColor: "#FEF2F2",
                color: "#EF4444",
                border: "1px solid #FECACA",
                borderRadius: "20px",
                padding: "2px 10px",
                fontSize: "0.74rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Dynamic Matrix
            </span>
          </div>
          <p style={{ color: "#64748B", fontSize: "0.92rem", margin: 0 }}>
            Create custom staff roles, toggle module permissions (View, Create, Edit, Delete), and safeguard sensitive modules.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard/users"
            className="abid-btn abid-btn-secondary"
            style={{ padding: "10px 18px", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Users size={17} />
            <span>View Team Members</span>
          </Link>

          <button
            type="button"
            onClick={openCreateModal}
            className="abid-btn abid-btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={18} />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "12px",
            backgroundColor: feedback.success ? "#ECFDF5" : "#FEF2F2",
            color: feedback.success ? "#059669" : "#DC2626",
            fontSize: "0.92rem",
            fontWeight: 600,
            marginBottom: "24px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Roles Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "22px",
          marginBottom: "36px",
        }}
      >
        {roles.map((role) => {
          const isSuperAdmin = role.slug === "admin";
          const permCount = isSuperAdmin ? "All (Full Access)" : `${role.permissions.length} actions`;

          return (
            <div
              key={role.id}
              className="abid-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                background: "#FFFFFF",
                border: isSuperAdmin ? "1.5px solid #FECACA" : "1px solid #E2E8F0",
                boxShadow: isSuperAdmin ? "0 4px 20px rgba(255, 64, 53, 0.08)" : "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: isSuperAdmin ? "#FEF2F2" : role.slug === "editor" ? "#EFF6FF" : "#F8FAFC",
                      color: isSuperAdmin ? "#EF4444" : role.slug === "editor" ? "#3B82F6" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${isSuperAdmin ? "#FECACA" : "#E2E8F0"}`,
                    }}
                  >
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      {role.name}
                    </h3>
                    <code style={{ fontSize: "0.78rem", color: "#64748B" }}>slug: {role.slug}</code>
                  </div>
                </div>

                {role.is_system === 1 ? (
                  <span
                    style={{
                      backgroundColor: "#FEF2F2",
                      color: "#B91C1C",
                      border: "1px solid #FECACA",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Lock size={11} />
                    <span>System Role</span>
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    Custom Role
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "#64748B",
                  lineHeight: 1.55,
                  minHeight: "44px",
                  margin: "0 0 18px 0",
                }}
              >
                {role.description || "No description provided for this role."}
              </p>

              {/* Badges / Stats */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  marginBottom: "20px",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155", fontWeight: 600 }}>
                  <Users size={15} color="#64748B" />
                  <span>{role.user_count || 0} Member(s)</span>
                </div>
                <span style={{ color: "#CBD5E1" }}>&bull;</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isSuperAdmin ? "#EF4444" : "#0284C7", fontWeight: 600 }}>
                  <ShieldCheck size={15} />
                  <span>{permCount}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => openEditModal(role)}
                  className="abid-btn abid-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "0.82rem", gap: "6px" }}
                >
                  <Edit2 size={13} />
                  <span>Configure Permissions</span>
                </button>

                {role.is_system !== 1 && (
                  <button
                    type="button"
                    disabled={Boolean(role.user_count && role.user_count > 0)}
                    onClick={() => setDeleteTarget(role)}
                    className="abid-btn"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.82rem",
                      background: role.user_count && role.user_count > 0 ? "#F1F5F9" : "transparent",
                      color: role.user_count && role.user_count > 0 ? "#94A3B8" : "#EF4444",
                      border: "1px solid transparent",
                      cursor: role.user_count && role.user_count > 0 ? "not-allowed" : "pointer",
                    }}
                    title={
                      role.user_count && role.user_count > 0
                        ? "Cannot delete role while members are assigned"
                        : "Delete role"
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE OR EDIT ROLE MODAL WITH PERMISSION MATRIX */}
      {(isCreateOpen || editingRole) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "36px",
              width: "100%",
              maxWidth: "860px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "18px",
                borderBottom: "1px solid #E2E8F0",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor: editingRole ? "#EFF6FF" : "#FEF2F2",
                    color: editingRole ? "#3B82F6" : "#FF4035",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyRound size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    {editingRole ? `Configure Role: ${editingRole.name}` : "Create New Dynamic Role"}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                    Select fine-grained action permissions per platform module.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingRole(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form
              onSubmit={editingRole ? handleEditSubmit : handleCreateSubmit}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}
            >
              <div style={{ overflowY: "auto", paddingRight: "10px", flex: 1 }}>
                {/* Role Details Inputs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                      Role Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Inventory Supervisor"
                      value={formName}
                      onChange={handleNameChange}
                      className="form-input"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                      Unique Identifier Slug *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(editingRole)}
                      placeholder="e.g. inventory-supervisor"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      className="form-input"
                      style={{
                        fontSize: "0.9rem",
                        backgroundColor: editingRole ? "#F1F5F9" : "#FFFFFF",
                        cursor: editingRole ? "not-allowed" : "text",
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                    Role Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of duties and authorization scope"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-input"
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                {/* Preset Quick Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                    padding: "10px 14px",
                    backgroundColor: "#F8FAFC",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
                    <Sliders size={16} color="#0284C7" />
                    <span>Quick Permission Presets:</span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => applyPreset("all")}
                      className="abid-btn abid-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                    >
                      Full Access (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("readonly")}
                      className="abid-btn abid-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                    >
                      Read Only
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("editor")}
                      className="abid-btn abid-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                    >
                      Content Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("clear")}
                      className="abid-btn"
                      style={{ padding: "4px 10px", fontSize: "0.78rem", color: "#EF4444", background: "none", border: "1px solid #FECACA" }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Permission Matrix Table */}
                <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                    <thead>
                      <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #CBD5E1", textAlign: "left" }}>
                        <th style={{ padding: "12px 16px", color: "#334155", fontWeight: 700 }}>MODULE</th>
                        <th style={{ padding: "12px 10px", color: "#334155", fontWeight: 700, textAlign: "center", width: "90px" }}>VIEW</th>
                        <th style={{ padding: "12px 10px", color: "#334155", fontWeight: 700, textAlign: "center", width: "90px" }}>CREATE</th>
                        <th style={{ padding: "12px 10px", color: "#334155", fontWeight: 700, textAlign: "center", width: "90px" }}>EDIT</th>
                        <th style={{ padding: "12px 10px", color: "#334155", fontWeight: 700, textAlign: "center", width: "90px" }}>DELETE</th>
                        <th style={{ padding: "12px 14px", color: "#334155", fontWeight: 700, textAlign: "right", width: "100px" }}>TOGGLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RBAC_MODULES.map((mod) => {
                        const canView = mod.actions.includes("view");
                        const canCreate = mod.actions.includes("create");
                        const canEdit = mod.actions.includes("edit");
                        const canDelete = mod.actions.includes("delete");

                        const hasView = selectedPerms.has(`${mod.id}:view`);
                        const hasCreate = selectedPerms.has(`${mod.id}:create`);
                        const hasEdit = selectedPerms.has(`${mod.id}:edit`);
                        const hasDelete = selectedPerms.has(`${mod.id}:delete`);

                        const isAllModule = mod.actions.every((a) => selectedPerms.has(`${mod.id}:${a}`));

                        return (
                          <tr
                            key={mod.id}
                            style={{
                              borderBottom: "1px solid #F1F5F9",
                              backgroundColor: isAllModule ? "#F0FDF4" : "transparent",
                            }}
                          >
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: 700, color: "#0F172A" }}>{mod.label}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{mod.description}</div>
                            </td>

                            {/* View Action Checkbox */}
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                              {canView ? (
                                <input
                                  type="checkbox"
                                  checked={hasView}
                                  onChange={() => togglePermission(mod.id, "view")}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#FF4035" }}
                                />
                              ) : (
                                <span style={{ color: "#CBD5E1" }}>&mdash;</span>
                              )}
                            </td>

                            {/* Create Action Checkbox */}
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                              {canCreate ? (
                                <input
                                  type="checkbox"
                                  checked={hasCreate}
                                  onChange={() => togglePermission(mod.id, "create")}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#FF4035" }}
                                />
                              ) : (
                                <span style={{ color: "#CBD5E1" }}>&mdash;</span>
                              )}
                            </td>

                            {/* Edit Action Checkbox */}
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                              {canEdit ? (
                                <input
                                  type="checkbox"
                                  checked={hasEdit}
                                  onChange={() => togglePermission(mod.id, "edit")}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#FF4035" }}
                                />
                              ) : (
                                <span style={{ color: "#CBD5E1" }}>&mdash;</span>
                              )}
                            </td>

                            {/* Delete Action Checkbox */}
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                              {canDelete ? (
                                <input
                                  type="checkbox"
                                  checked={hasDelete}
                                  onChange={() => togglePermission(mod.id, "delete")}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#FF4035" }}
                                />
                              ) : (
                                <span style={{ color: "#CBD5E1" }}>&mdash;</span>
                              )}
                            </td>

                            {/* Row Module Toggle */}
                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => toggleModuleAll(mod)}
                                style={{
                                  background: isAllModule ? "#DCFCE7" : "#F1F5F9",
                                  border: `1px solid ${isAllModule ? "#BBF7D0" : "#CBD5E1"}`,
                                  color: isAllModule ? "#15803D" : "#475569",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.74rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                {isAllModule ? "Deselect" : "Select All"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "18px",
                  borderTop: "1px solid #E2E8F0",
                  marginTop: "10px",
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "#64748B" }}>
                  Selected: <strong style={{ color: "#0F172A" }}>{selectedPerms.size}</strong> permissions
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingRole(null);
                    }}
                    className="abid-btn abid-btn-secondary"
                    style={{ padding: "10px 20px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="abid-btn abid-btn-primary"
                    style={{ padding: "10px 24px" }}
                  >
                    {isPending
                      ? "Saving Role..."
                      : editingRole
                      ? "Update Role & Permissions"
                      : "Create Role"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Role"
        message={`Are you sure you want to permanently delete the custom role "${deleteTarget?.name}"? Any permission mappings for this role will be removed.`}
        confirmLabel="Yes, Delete Role"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isPending}
      />
    </div>
  );
}
