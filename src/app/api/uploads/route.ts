import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["superadmin", "editor", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported image format. Allowed: JPG, PNG, WEBP, GIF, SVG" }, { status: 400 });
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds max size of 15MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const randomHash = crypto.randomBytes(8).toString("hex");
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const fileName = `${Date.now()}_${cleanBase}_${randomHash}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    // Store in media table
    try {
      await pool.execute(
        `INSERT INTO media (file_name, storage_key, url, mime_type, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [file.name, fileName, publicUrl, file.type, file.size]
      );
    } catch (dbErr) {
      console.warn("Could not save media metadata to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const msg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
