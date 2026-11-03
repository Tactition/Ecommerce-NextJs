"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopProgressBar from "./TopProgressBar";

interface LayoutShellProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export default function LayoutShell({ header, footer, children }: LayoutShellProps) {
  const pathname = usePathname();

  // Exclude public storefront header & footer on all Admin, Dealer, and standalone Auth routes
  const isStandalone =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/dealer") ||
    pathname === "/login" ||
    pathname === "/register";

  if (isStandalone) {
    return (
      <>
        <TopProgressBar />
        <main className="isolated-portal-shell" style={{ minHeight: "100vh" }}>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <TopProgressBar />
      {header}
      <div style={{ flex: 1 }}>{children}</div>
      {footer}
    </>
  );
}
