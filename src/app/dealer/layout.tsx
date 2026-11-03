import React from "react";
import { getDealerSession } from "@/lib/auth/dealer";
import { DealerAuthProvider } from "@/components/auth/DealerAuthProvider";

export const metadata = {
  title: "B2B Trade Partner Portal | Wall Street Interiors",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dealerSession = await getDealerSession();

  return (
    <DealerAuthProvider initialSession={dealerSession}>
      {children}
    </DealerAuthProvider>
  );
}

