import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import AdminAccountClient from "@/components/dashboard/AdminAccountClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Profile & Security | Wall Street Interiors Console",
  description: "Manage administrator credentials, email, and password.",
};

export default async function AdminAccountPage() {
  const session = await requireAuth();

  const isStaff =
    session.role === "admin" ||
    session.role === "editor" ||
    session.role === "manager";

  if (!isStaff) {
    redirect("/login?error=admin_required");
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    [session.userId]
  );

  if (!rows || rows.length === 0) {
    redirect("/login");
  }

  const currentUser = {
    id: Number(rows[0].id),
    name: String(rows[0].name || session.name || "Administrator"),
    email: String(rows[0].email || session.email),
    role: String(rows[0].role || session.role),
  };

  return <AdminAccountClient currentUser={currentUser} />;
}

