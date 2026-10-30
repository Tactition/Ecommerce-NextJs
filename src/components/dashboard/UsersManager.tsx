"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { User } from "@/types";
import { SessionPayload } from "@/lib/token";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/users";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Edit2,
  Trash2,
  Mail,
  User as UserIcon,
  Lock,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

interface UsersManagerProps {
  initialUsers: User[];
  currentUser: SessionPayload;
  availableRoles?: { slug: string; name: string }[];
}

export default function UsersManager({
  initialUsers,
  currentUser,
  availableRoles = [
    { slug: "admin", name: "Super Administrator" },
    { slug: "editor", name: "Content Editor" },
    { slug: "manager", name: "Store Manager" },
  ],
}: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const otherCount = users.filter((u) => u.role !== "admin" && u.role !== "editor").length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleSlug: string, roleName?: string) => {
    const label = roleName || roleSlug;
    if (roleSlug === "admin") {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>
          <ShieldCheck size={14} />
          <span>{label}</span>
        </div>
      );
    }
    if (roleSlug === "editor") {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>
          <Shield size={14} />
          <span>{label}</span>
        </div>
      );
    }
    if (roleSlug === "manager") {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>
          <Shield size={14} />
          <span>{label}</span>
        </div>
      );
    }
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>
        <Shield size={14} />
        <span>{label}</span>
      </div>
    );
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createUserAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: "New team member account created successfully!" });
        setIsCreateOpen(false);
        const selectedSlug = String(formData.get("role") || "editor");
        const matchedRole = availableRoles.find((r) => r.slug === selectedSlug);
        const newUser: User = {
          id: res.userId || Date.now(),
          name: String(formData.get("name")),
          email: String(formData.get("email")).toLowerCase(),
          role: selectedSlug,
          role_name: matchedRole ? matchedRole.name : selectedSlug,
          created_at: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, newUser]);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to create user." });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("id", String(editingUser.id));

    startTransition(async () => {
      const res = await updateUserAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: "User account updated successfully!" });
        const updatedRoleSlug = String(formData.get("role") || editingUser.role);
        const matchedRole = availableRoles.find((r) => r.slug === updatedRoleSlug);
        const updatedName = String(formData.get("name"));
        const updatedEmail = String(formData.get("email")).toLowerCase();

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: updatedName,
                  email: updatedEmail,
                  role: updatedRoleSlug,
                  role_name: matchedRole ? matchedRole.name : updatedRoleSlug,
                }
              : u
          )
        );
        setEditingUser(null);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update user." });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteUserAction(deleteTarget.id);
      if (res.success) {
        setFeedback({ success: true, message: `Account for ${deleteTarget.name} has been removed.` });
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setFeedback({ success: false, message: res.error || "Failed to delete user." });
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
              Team &amp; User Access Control
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
              RBAC Enabled
            </span>
          </div>
          <p style={{ color: "#64748B", fontSize: "0.92rem", margin: 0 }}>
            Manage staff accounts, assign dynamic roles, and enforce granular permission policies across modules.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard/roles"
            className="abid-btn abid-btn-secondary"
            style={{ padding: "10px 18px", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <KeyRound size={17} />
            <span>Manage Roles &amp; Matrix</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setIsCreateOpen(true);
            }}
            className="abid-btn abid-btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <UserPlus size={18} />
            <span>Add Team Member</span>
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

      {/* Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div
          className="abid-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#334155",
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>TOTAL ACCOUNTS</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A" }}>{users.length}</div>
          </div>
        </div>

        <div
          className="abid-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 64, 53, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF4035",
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>ADMINISTRATORS</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FF4035" }}>{adminCount}</div>
          </div>
        </div>

        <div
          className="abid-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3B82F6",
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>CONTENT EDITORS</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#3B82F6" }}>{editorCount}</div>
          </div>
        </div>

        <div
          className="abid-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#F8FAFC",
            border: "1px dashed #CBD5E1",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "1.2rem",
            }}
          >
            {currentUser.name ? currentUser.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>ACTIVE SESSION</div>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0F172A" }}>{currentUser.name}</div>
            <div style={{ fontSize: "0.76rem", color: "#10B981", fontWeight: 700 }}>
              Logged in as {currentUser.role.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="abid-card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "38px",
                height: "40px",
                background: "#FFFFFF",
                fontSize: "0.88rem",
                borderRadius: "8px",
              }}
            />
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`abid-btn ${roleFilter === "all" ? "abid-btn-primary" : "abid-btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
          >
            All ({users.length})
          </button>
          {availableRoles.map((role) => {
            const count = users.filter((u) => u.role === role.slug).length;
            return (
              <button
                key={role.slug}
                type="button"
                onClick={() => setRoleFilter(role.slug)}
                className={`abid-btn ${roleFilter === role.slug ? "abid-btn-primary" : "abid-btn-secondary"}`}
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                {role.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="abid-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="abid-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>USER</th>
                <th style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>EMAIL</th>
                <th style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>ROLE / PRIVILEGES</th>
                <th style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>CREATED</th>
                <th style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#64748B", fontWeight: 700, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.userId;
                  const isAdmin = user.role === "admin";

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: isCurrent ? "#F0FDF4" : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              backgroundColor: isAdmin ? "#FEF2F2" : "#EFF6FF",
                              color: isAdmin ? "#EF4444" : "#3B82F6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "1rem",
                              border: `1px solid ${isAdmin ? "#FECACA" : "#BFDBFE"}`,
                            }}
                          >
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span
                                  style={{
                                    backgroundColor: "#DCFCE7",
                                    color: "#15803D",
                                    fontSize: "0.7rem",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#64748B" }}>ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px", color: "#334155", fontSize: "0.9rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={14} color="#94A3B8" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        {getRoleBadge(user.role, user.role_name)}
                      </td>

                      <td style={{ padding: "14px 20px", color: "#64748B", fontSize: "0.82rem" }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </td>

                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="abid-btn abid-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.8rem", gap: "4px" }}
                            title="Edit user details or password"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            disabled={isCurrent || (isAdmin && adminCount <= 1)}
                            onClick={() => setDeleteTarget(user)}
                            className="abid-btn"
                            style={{
                              padding: "6px 10px",
                              fontSize: "0.8rem",
                              background: isCurrent || (isAdmin && adminCount <= 1) ? "#F1F5F9" : "transparent",
                              color: isCurrent || (isAdmin && adminCount <= 1) ? "#94A3B8" : "#EF4444",
                              border: "1px solid transparent",
                              cursor: isCurrent || (isAdmin && adminCount <= 1) ? "not-allowed" : "pointer",
                            }}
                            title={
                              isCurrent
                                ? "Cannot delete your own active account"
                                : isAdmin && adminCount <= 1
                                ? "Cannot delete the sole Administrator account"
                                : "Delete user"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
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
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#FEF2F2", color: "#FF4035", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserPlus size={20} />
                </div>
                <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: "#0F172A" }}>
                  Add Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Full Name *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full Name"
                    className="form-input"
                    style={{ paddingLeft: "36px", fontSize: "0.9rem" }}
                  />
                  <UserIcon size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Email Address *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    className="form-input"
                    style={{ paddingLeft: "36px", fontSize: "0.9rem" }}
                  />
                  <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Password * (min 6 characters)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    className="form-input"
                    style={{ paddingLeft: "36px", fontSize: "0.9rem" }}
                  />
                  <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Assigned Dynamic Role *
                </label>
                <select
                  name="role"
                  defaultValue="editor"
                  className="form-input"
                  style={{ fontSize: "0.9rem", height: "42px" }}
                >
                  {availableRoles.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: "0.76rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                  Access permissions will be automatically mapped from the role&apos;s permission matrix.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="abid-btn abid-btn-secondary"
                  style={{ padding: "10px 18px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="abid-btn abid-btn-primary"
                  style={{ padding: "10px 22px" }}
                >
                  {isPending ? "Creating Account..." : "Create Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
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
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit2 size={18} />
                </div>
                <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: "#0F172A" }}>
                  Edit User: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingUser.name}
                  className="form-input"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingUser.email}
                  className="form-input"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Reset Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  placeholder="Leave empty to retain existing password"
                  className="form-input"
                  style={{ fontSize: "0.9rem" }}
                />
                <span style={{ fontSize: "0.76rem", color: "#64748B", display: "block", marginTop: "4px" }}>
                  Only enter a value if you wish to reset this user&apos;s password.
                </span>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                  Assigned Dynamic Role *
                </label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  className="form-input"
                  style={{ fontSize: "0.9rem", height: "42px" }}
                >
                  {availableRoles.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="abid-btn abid-btn-secondary"
                  style={{ padding: "10px 18px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="abid-btn abid-btn-primary"
                  style={{ padding: "10px 22px" }}
                >
                  {isPending ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Team Member"
        message={`Are you sure you want to permanently delete the account for "${deleteTarget?.name}" (${deleteTarget?.email})? This action cannot be undone.`}
        confirmLabel="Yes, Delete Account"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isPending}
      />
    </div>
  );
}
