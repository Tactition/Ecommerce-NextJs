import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth/customer";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, customer: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    customer: {
      id: session.customerId,
      email: session.email,
      name: session.name,
      phone: session.phone,
    },
  });
}

