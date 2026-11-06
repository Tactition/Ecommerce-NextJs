"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DealerSessionPayload, DealerStatus } from "@/lib/auth/tokens/dealerToken";
import { logoutDealerAction } from "@/lib/actions/dealerAuth";

interface DealerAuthContextType {
  dealer: DealerSessionPayload | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  approvalStatus: DealerStatus | null;
  tierId?: number;
  creditLimit?: number;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultContext: DealerAuthContextType = {
  dealer: null,
  isAuthenticated: false,
  isApproved: false,
  approvalStatus: null,
  logout: async () => {},
  refreshSession: async () => {},
};

const DealerAuthContext = createContext<DealerAuthContextType>(defaultContext);

export function DealerAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: DealerSessionPayload | null;
}) {
  const router = useRouter();
  const [dealer, setDealer] = useState<DealerSessionPayload | null>(initialSession ?? null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/dealer/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated && data?.dealer) {
          setDealer({
            dealerId: data.dealer.id,
            companyName: data.dealer.companyName,
            contactName: data.dealer.contactName,
            email: data.dealer.email,
            gstNumber: data.dealer.gstNumber,
            approvalStatus: data.dealer.approvalStatus,
            tierId: data.dealer.tierId,
            creditLimit: data.dealer.creditLimit,
            role: "dealer",
            aud: "dealer",
          });
          return;
        }
      }
      // If not authenticated
      if (!initialSession) {
        setDealer(null);
      }
    } catch (e) {
      // Quiet fail
    }
  }, [initialSession]);

  useEffect(() => {
    if (initialSession !== undefined && initialSession !== null) {
      setDealer(initialSession);
      return;
    }
    refreshSession();
  }, [initialSession, refreshSession]);

  const isAuthenticated = !!dealer;
  const isApproved = dealer?.approvalStatus === "APPROVED";
  const approvalStatus = dealer?.approvalStatus || null;

  const logout = useCallback(async () => {
    try {
      await logoutDealerAction();
      setDealer(null);
      router.push("/dealer/login");
      router.refresh();
    } catch (err) {
      console.error("Dealer logout failed:", err);
    }
  }, [router]);

  return (
    <DealerAuthContext.Provider
      value={{
        dealer,
        isAuthenticated,
        isApproved,
        approvalStatus,
        tierId: dealer?.tierId,
        creditLimit: dealer?.creditLimit,
        logout,
        refreshSession,
      }}
    >
      {children}
    </DealerAuthContext.Provider>
  );
}

export function useDealerAuth() {
  const context = useContext(DealerAuthContext);
  if (!context) {
    return defaultContext;
  }
  return context;
}

