"use client";

// Re-export isolated customer auth provider and hooks for backwards compatibility
export {
  CustomerAuthProvider as AuthProvider,
  useCustomerAuth as useAuth,
  useCustomerAuth,
} from "./CustomerAuthProvider";
