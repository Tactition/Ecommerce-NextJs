"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, ShoppingBag, Heart, CreditCard, X, ArrowRight, UserPlus } from "lucide-react";
import { SessionPayload } from "@/lib/token";
import { logoutAction } from "@/lib/actions/auth";

type AuthReason = "cart" | "wishlist" | "checkout" | "general";

interface AuthModalState {
  isOpen: boolean;
  reason: AuthReason;
  customMessage?: string;
  onSuccess?: () => void;
}

interface AuthContextType {
  user: SessionPayload | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  logout: (redirectTo?: string) => Promise<void>;
  requireAuth: (
    reason?: AuthReason,
    callback?: () => void,
    customMessage?: string
  ) => boolean;
  openAuthModal: (
    reason?: AuthReason,
    callback?: () => void,
    customMessage?: string
  ) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isStaff: false,
  logout: async () => {},
  requireAuth: () => false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: SessionPayload | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<SessionPayload | null>(initialSession);
  const [modalState, setModalState] = useState<AuthModalState>({
    isOpen: false,
    reason: "general",
  });

  const isAuthenticated = !!user;
  const isStaff = !!(
    user &&
    (user.role === "admin" || user.role === "editor" || user.role === "manager")
  );

  const getCurrentUrl = useCallback(() => {
    if (typeof window === "undefined") return pathname || "/";
    return window.location.pathname + window.location.search;
  }, [pathname]);

  const openAuthModal = useCallback(
    (
      reason: AuthReason = "general",
      callback?: () => void,
      customMessage?: string
    ) => {
      setModalState({
        isOpen: true,
        reason,
        customMessage,
        onSuccess: callback,
      });
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const requireAuth = useCallback(
    (
      reason: AuthReason = "general",
      callback?: () => void,
      customMessage?: string
    ): boolean => {
      if (user) {
        if (callback) callback();
        return true;
      }

      openAuthModal(reason, callback, customMessage);
      return false;
    },
    [user, openAuthModal]
  );

  const logout = useCallback(
    async (redirectTo: string = "/") => {
      setUser(null);
      await logoutAction(redirectTo);
    },
    []
  );

  const getReasonConfig = (reason: AuthReason) => {
    switch (reason) {
      case "cart":
        return {
          title: "Sign In to Add to Cart",
          subtitle:
            "Please sign in or create an account to add items to your cart, access custom sizing quotes, and proceed to checkout.",
          icon: <ShoppingBag size={28} color="#FF4035" />,
          accentBg: "#FFF1F0",
        };
      case "wishlist":
        return {
          title: "Sign In to Save Wishlist",
          subtitle:
            "Please sign in to keep your curated interior selections saved across all your devices.",
          icon: <Heart size={28} color="#FF4035" />,
          accentBg: "#FFF1F0",
        };
      case "checkout":
        return {
          title: "Sign In to Complete Purchase",
          subtitle:
            "Please sign in or create a customer account to securely process your order and track shipment updates.",
          icon: <CreditCard size={28} color="#FF4035" />,
          accentBg: "#FFF1F0",
        };
      default:
        return {
          title: "Authentication Required",
          subtitle:
            "Please sign in with your customer account or register to access this feature.",
          icon: <Lock size={28} color="#FF4035" />,
          accentBg: "#FFF1F0",
        };
    }
  };

  const currentUrl = getCurrentUrl();
  const config = getReasonConfig(modalState.reason);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isStaff,
        logout,
        requireAuth,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}

      {/* Auth Prompt Modal */}
      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 17, 30, 0.72)",
            backdropFilter: "blur(6px)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={closeAuthModal}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              maxWidth: "460px",
              width: "100%",
              padding: "36px 32px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              position: "relative",
              textAlign: "center",
              animation: "authModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeAuthModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
                transition: "all 0.2s",
              }}
              aria-label="Close auth dialog"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                backgroundColor: config.accentBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              {config.icon}
            </div>

            {/* Title & Description */}
            <h3
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              {config.title}
            </h3>
            <p
              style={{
                fontSize: "0.92rem",
                color: "#64748B",
                lineHeight: "1.55",
                marginBottom: "28px",
              }}
            >
              {modalState.customMessage || config.subtitle}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                href={`/login?redirectTo=${encodeURIComponent(currentUrl)}&reason=${modalState.reason}`}
                onClick={closeAuthModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 24px",
                  backgroundColor: "#FF4035",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                <span>Sign In to Continue</span>
                <ArrowRight size={17} />
              </Link>

              <Link
                href={`/register?redirectTo=${encodeURIComponent(currentUrl)}&reason=${modalState.reason}`}
                onClick={closeAuthModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 24px",
                  backgroundColor: "#F8FAFC",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  border: "1.5px solid #E2E8F0",
                  transition: "all 0.2s",
                }}
              >
                <UserPlus size={17} color="#475569" />
                <span>Create New Account</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              style={{
                marginTop: "18px",
                background: "none",
                border: "none",
                color: "#94A3B8",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Continue browsing products
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
