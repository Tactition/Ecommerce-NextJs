import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
      permissions: session.permissions,
    },
  });
}

