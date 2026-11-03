import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import AdminAccountClient from "@/components/dashboard/AdminAccountClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Profile & Security | Wall Street Interiors Console",
  description: "Manage administrator credentials, email, and password.",
};

export default async function AdminAccountPage() {
  const admin = await requireAdmin();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, role FROM admin_users WHERE id = ? LIMIT 1",
    [admin.adminId]
  );

  if (!rows || rows.length === 0) {
    redirect("/admin/login");
  }

  const currentUser = {
    id: Number(rows[0].id),
    name: String(rows[0].name || admin.name || "Administrator"),
    email: String(rows[0].email || admin.email),
    role: String(rows[0].role || admin.role),
  };

  return <AdminAccountClient currentUser={currentUser} />;
}

