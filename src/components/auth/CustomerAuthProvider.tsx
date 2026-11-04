"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, ShoppingBag, Heart, CreditCard, X, ArrowRight, UserPlus } from "lucide-react";
import { CustomerSessionPayload } from "@/lib/auth/tokens/customerToken";
import { logoutCustomerAction } from "@/lib/actions/customerAuth";

type AuthReason = "cart" | "wishlist" | "checkout" | "general";

interface AuthModalState {
  isOpen: boolean;
  reason: AuthReason;
  customMessage?: string;
  onSuccess?: () => void;
}

interface CustomerAuthContextType {
  customer: CustomerSessionPayload | null;
  user: CustomerSessionPayload | null; // Backwards compatibility for storefront components
  isAuthenticated: boolean;
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

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer: null,
  user: null,
  isAuthenticated: false,
  logout: async () => {},
  requireAuth: () => false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function CustomerAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: CustomerSessionPayload | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [customer, setCustomer] = useState<CustomerSessionPayload | null>(initialSession ?? null);
  const [modalState, setModalState] = useState<AuthModalState>({
    isOpen: false,
    reason: "general",
  });

  const isAuthenticated = !!customer;

  useEffect(() => {
    if (initialSession !== undefined && initialSession !== null) return;
    let isMounted = true;
    fetch("/api/auth/customer/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.authenticated && data?.customer) {
          setCustomer(data.customer);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [initialSession]);

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
      if (isAuthenticated) {
        if (callback) callback();
        return true;
      }
      openAuthModal(reason, callback, customMessage);
      return false;
    },
    [isAuthenticated, openAuthModal]
  );

  const logout = useCallback(
    async (redirectTo: string = "/login") => {
      try {
        await logoutCustomerAction();
        setCustomer(null);
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        console.error("Logout failed:", err);
      }
    },
    [router]
  );

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        user: customer,
        isAuthenticated,
        logout,
        requireAuth,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}

      {/* Customer Storefront Auth Modal */}
      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
          }}
          onClick={closeAuthModal}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Close dialog"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>

            <div style={{ padding: "32px 28px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  color: "var(--color-primary, #FF4035)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                {modalState.reason === "cart" && <ShoppingBag size={30} />}
                {modalState.reason === "wishlist" && <Heart size={30} />}
                {modalState.reason === "checkout" && <CreditCard size={30} />}
                {modalState.reason === "general" && <Lock size={30} />}
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                Sign In Required
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#64748b", lineHeight: 1.5, marginBottom: "24px" }}>
                {modalState.customMessage || "Please sign in to access your saved items and secure checkout."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href={`/login?redirectTo=${encodeURIComponent(getCurrentUrl())}`}
                  onClick={closeAuthModal}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "13px 20px",
                    borderRadius: "12px",
                    backgroundColor: "var(--color-primary, #FF4035)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  <Lock size={16} />
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={`/register?redirectTo=${encodeURIComponent(getCurrentUrl())}`}
                  onClick={closeAuthModal}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  <UserPlus size={16} />
                  <span>Create An Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}

// Backwards-compatible alias for existing storefront components
export const useAuth = useCustomerAuth;

