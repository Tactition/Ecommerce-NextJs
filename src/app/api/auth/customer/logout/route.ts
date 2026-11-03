import { NextResponse } from "next/server";
import { destroyCustomerSession } from "@/lib/auth/customer";

export async function POST() {
  await destroyCustomerSession();
  return NextResponse.json({ success: true, message: "Customer logged out successfully." });
}

