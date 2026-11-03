import { NextResponse } from "next/server";
import { getDealerSession } from "@/lib/auth/dealer";

export async function GET() {
  const session = await getDealerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, dealer: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    dealer: {
      id: session.dealerId,
      companyName: session.companyName,
      contactName: session.contactName,
      email: session.email,
      gstNumber: session.gstNumber,
      approvalStatus: session.approvalStatus,
      tierId: session.tierId,
      creditLimit: session.creditLimit,
    },
  });
}

