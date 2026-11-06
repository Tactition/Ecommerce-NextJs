"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutDealerAction } from "@/lib/actions/dealerAuth";

interface DealerLogoutButtonProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "button" | "link" | "outline";
  showIcon?: boolean;
  label?: string;
  redirectTo?: string;
}

export default function DealerLogoutButton({
  className,
  style,
  variant = "outline",
  showIcon = true,
  label = "Log Out",
  redirectTo = "/dealer/login",
}: DealerLogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutDealerAction();
      router.push(redirectTo);
      router.refresh();
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Dealer logout error:", error);
      try {
        await fetch("/api/dealer/auth/logout", { method: "POST" });
      } catch {}
      window.location.href = redirectTo;
    } finally {
      setLoading(false);
    }
  };

  const defaultStyles: React.CSSProperties =
    variant === "outline"
      ? {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "12px",
          border: "1.5px solid rgba(220, 38, 38, 0.4)",
          backgroundColor: "rgba(220, 38, 38, 0.08)",
          color: "#EF4444",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          ...style,
        }
      : variant === "link"
      ? {
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          padding: 0,
          color: "#EF4444",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          ...style,
        }
      : {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "12px",
          border: "none",
          backgroundColor: "#DC2626",
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          ...style,
        };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
      style={defaultStyles}
      title="Log out of Trade Dealer Account"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        showIcon && <LogOut size={16} />
      )}
      <span>{loading ? "Logging out..." : label}</span>
    </button>
  );
}
