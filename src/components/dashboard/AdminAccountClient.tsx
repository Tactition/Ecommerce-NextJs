"use client";

import React, { useState, useTransition } from "react";
import { updateAdminCredentialsAction } from "@/lib/actions/users";
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AdminAccountClientProps {
  currentUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminAccountClient({ currentUser }: AdminAccountClientProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);

    startTransition(async () => {
      const res = await updateAdminCredentialsAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: res.message || "Admin identity updated successfully!" });
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update profile." });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ success: false, message: "Please enter your current password to authorize this change." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ success: false, message: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ success: false, message: "New password and password confirmation do not match." });
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      const res = await updateAdminCredentialsAction(formData);
      if (res.success) {
        setFeedback({ success: true, message: res.message || "Admin password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setFeedback({ success: false, message: res.error || "Failed to update password." });
      }
    });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#FEF2F2",
              color: "#FF4035",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #FECACA",
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.85rem", color: "#0F172A", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Admin Profile &amp; Security
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.92rem", margin: 0 }}>
              Update your administrator identity, email address, and console access password.
            </p>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            borderRadius: "14px",
            marginBottom: "24px",
            backgroundColor: feedback.success ? "#F0FDF4" : "#FEF2F2",
            color: feedback.success ? "#166534" : "#B91C1C",
            border: `1px solid ${feedback.success ? "#BBF7D0" : "#FECACA"}`,
            fontSize: "0.92rem",
            fontWeight: 600,
          }}
        >
          {feedback.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Current Admin Identity Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: "18px",
          padding: "24px 28px",
          color: "#FFFFFF",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#FF4035",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(255, 64, 53, 0.4)",
            }}
          >
            {currentUser.name ? currentUser.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{currentUser.name}</span>
              <span
                style={{
                  backgroundColor: "rgba(255, 64, 53, 0.2)",
                  color: "#FF4035",
                  border: "1px solid rgba(255, 64, 53, 0.4)",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {currentUser.role}
              </span>
            </div>
            <div style={{ color: "#94A3B8", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={14} />
              <span>{currentUser.email}</span>
              <span style={{ margin: "0 4px" }}>&bull;</span>
              <span>Account ID #{currentUser.id}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "0.82rem",
              color: "#CBD5E1",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Full Console Privileges
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns for Identity & Password */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Card 1: Administrator Identity & Contact Email */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Administrator Identity
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Update your display name and login email address
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  marginBottom: "6px",
                }}
              >
                Full Name <span style={{ color: "#FF4035" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wall Street Admin"
                  className="form-input"
                  style={{
                    paddingLeft: "40px",
                    height: "44px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    width: "100%",
                  }}
                />
                <UserIcon
                  size={17}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  marginBottom: "6px",
                }}
              >
                Admin Email Address <span style={{ color: "#FF4035" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wallstreetinteriors.com"
                  className="form-input"
                  style={{
                    paddingLeft: "40px",
                    height: "44px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    width: "100%",
                  }}
                />
                <Mail
                  size={17}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
              <span style={{ display: "block", fontSize: "0.78rem", color: "#64748B", marginTop: "6px" }}>
                This email is used to log into the admin console. Changing it will update your login credentials.
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="abid-btn abid-btn-primary"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Save size={17} />
              <span>{isPending ? "Saving Profile..." : "Save Identity Details"}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Admin Password & Security */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#FEF2F2",
                color: "#FF4035",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Console Access Password
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Update your admin console authentication password
              </span>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            {/* Current Password */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  marginBottom: "6px",
                }}
              >
                Current Password <span style={{ color: "#FF4035" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="form-input"
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    height: "44px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    width: "100%",
                  }}
                />
                <Lock
                  size={17}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  marginBottom: "6px",
                }}
              >
                New Password <span style={{ color: "#FF4035" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="form-input"
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    height: "44px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    width: "100%",
                  }}
                />
                <KeyRound
                  size={17}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  marginBottom: "6px",
                }}
              >
                Confirm New Password <span style={{ color: "#FF4035" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="Re-type new password"
                  className="form-input"
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    height: "44px",
                    fontSize: "0.92rem",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    width: "100%",
                  }}
                />
                <Lock
                  size={17}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="abid-btn"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.92rem",
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <KeyRound size={17} />
              <span>{isPending ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
