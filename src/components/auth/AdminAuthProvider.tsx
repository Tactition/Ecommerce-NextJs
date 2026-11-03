"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminSessionPayload, AdminRole } from "@/lib/auth/tokens/adminToken";
import { logoutAdminAction } from "@/lib/actions/adminAuth";

interface AdminAuthContextType {
  admin: AdminSessionPayload | null;
  isAuthenticated: boolean;
  role: AdminRole | null;
  permissions: string[];
  hasPermission: (module: string, action?: string) => boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isAuthenticated: false,
  role: null,
  permissions: [],
  hasPermission: () => false,
  logout: async () => {},
});

export function AdminAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AdminSessionPayload | null;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSessionPayload | null>(initialSession);

  const isAuthenticated = !!admin;
  const role = admin?.role || null;
  const permissions = admin?.permissions || [];

  const hasPermission = useCallback(
    (module: string, action: string = "view"): boolean => {
      if (!admin) return false;
      if (admin.role === "superadmin") return true;

      const perms = admin.permissions || [];
      if (perms.includes("*")) return true;
      if (perms.includes(`${module}:*`)) return true;
      if (perms.includes(`${module}:${action}`)) return true;

      return false;
    },
    [admin]
  );

  const logout = useCallback(async () => {
    try {
      await logoutAdminAction();
      setAdmin(null);
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Admin logout failed:", err);
    }
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        role,
        permissions,
        hasPermission,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

