"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DealerSessionPayload, DealerStatus } from "@/lib/auth/tokens/dealerToken";
import { logoutDealerAction } from "@/lib/actions/dealerAuth";

interface DealerAuthContextType {
  dealer: DealerSessionPayload | null;
  isAuthenticated: boolean;
  approvalStatus: DealerStatus | null;
  tierId?: number;
  creditLimit?: number;
  logout: () => Promise<void>;
}

const DealerAuthContext = createContext<DealerAuthContextType>({
  dealer: null,
  isAuthenticated: false,
  approvalStatus: null,
  logout: async () => {},
});

export function DealerAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: DealerSessionPayload | null;
}) {
  const router = useRouter();
  const [dealer, setDealer] = useState<DealerSessionPayload | null>(initialSession);

  const isAuthenticated = !!dealer;
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
        approvalStatus,
        tierId: dealer?.tierId,
        creditLimit: dealer?.creditLimit,
        logout,
      }}
    >
      {children}
    </DealerAuthContext.Provider>
  );
}

export function useDealerAuth() {
  const context = useContext(DealerAuthContext);
  if (!context) {
    throw new Error("useDealerAuth must be used within DealerAuthProvider");
  }
  return context;
}

