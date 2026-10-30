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
  const isDashboardOrAuth = pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register";

  if (isDashboardOrAuth) {
    return (
      <>
        <TopProgressBar />
        <main className="admin-root-shell" style={{ minHeight: "100vh" }}>{children}</main>
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


