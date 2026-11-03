import { NextResponse } from "next/server";
import { destroyDealerSession } from "@/lib/auth/dealer";

export async function POST() {
  await destroyDealerSession();
  return NextResponse.json({ success: true, message: "Dealer logged out successfully." });
}

