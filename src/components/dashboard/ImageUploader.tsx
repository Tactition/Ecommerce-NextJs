"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2, Link2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  name?: string;
}

/**
 * Fast client-side image optimizer:
 * Scales large photos (e.g. 5MB-20MB camera/Pexels photos) to max 1920px in ~30ms,
 * reducing payload from 15MB down to ~250KB before uploading to the server.
 */
async function optimizeImageForUpload(file: File): Promise<File | Blob> {
  // If SVG, GIF, or already small (< 600KB), upload as is
  if (file.type === "image/svg+xml" || file.type === "image/gif" || file.size < 600 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const ext = outputType === "image/webp" ? ".webp" : ".jpg";
            const name = file.name.replace(/\.[^/.]+$/, "") + ext;
            const optimizedFile = new File([blob], name, { type: outputType });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        outputType,
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function ImageUploader({
  value,
  onChange,
  label = "Upload or Select Image",
  name = "image",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndUploadFile = async (rawFile: File) => {
    setError(null);
    setIsUploading(true);
    setUploadStatus("Optimizing image...");

    try {
      // 1. Instant local preview
      const localPreviewUrl = URL.createObjectURL(rawFile);
      onChange(localPreviewUrl);

      // 2. Client-side downscaling for instantaneous upload
      const optimized = await optimizeImageForUpload(rawFile);
      setUploadStatus("Uploading to server...");

      const formData = new FormData();
      formData.append("file", optimized);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // 3. Set permanent server URL
      onChange(data.url);
      setUploadStatus("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setError(msg);
      // Revert if error
      onChange("");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue("");
    }
  };

  return (
    <div className="form-group">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <label className="form-label mb-0">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary, #FF4035)",
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 600,
          }}
        >
          <Link2 size={13} />
          <span>{showUrlInput ? "Upload File" : "Paste URL"}</span>
        </button>
      </div>

      {/* Hidden input keeping form value */}
      <input type="hidden" name={name} value={value} />

      {showUrlInput ? (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Paste direct image URL (https://... or /assets/...)"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
          />
          <button type="button" onClick={handleApplyUrl} className="abid-btn abid-btn-primary" style={{ padding: "0 18px", whiteSpace: "nowrap" }}>
            Apply
          </button>
        </div>
      ) : null}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--color-primary, #FF4035)" : "var(--color-surface-border, #E2E8F0)"}`,
          borderRadius: "var(--radius-md, 10px)",
          padding: "20px",
          textAlign: "center",
          backgroundColor: isDragging ? "rgba(255, 64, 53, 0.04)" : "#F8FAFC",
          position: "relative",
          transition: "all 0.2s ease",
        }}
      >
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "var(--radius-md, 10px)",
                overflow: "hidden",
                border: "1px solid var(--color-surface-border, #E2E8F0)",
                backgroundColor: "#FFFFFF",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <img src={value} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {isUploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(10, 17, 30, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Loader2 size={20} className="animate-spin" />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: isUploading ? "var(--color-primary, #FF4035)" : "var(--color-success, #10B981)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isUploading ? (uploadStatus || "Uploading...") : "Image Attached & Ready"}</span>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted, #64748B)",
                  wordBreak: "break-all",
                  maxHeight: "36px",
                  overflow: "hidden",
                }}
              >
                {value}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="abid-btn abid-btn-outline"
                style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              >
                Replace
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => onChange("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-danger, #EF4444)",
                  padding: "6px",
                }}
                title="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary-light, #FFEBEA)",
                color: "var(--color-primary, #FF4035)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px auto",
              }}
            >
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-secondary, #0A111E)", marginBottom: "4px" }}>
              {isUploading ? (uploadStatus || "Uploading to Server...") : "Drag & drop image here, or browse"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748B)", marginBottom: "12px" }}>
              Fast auto-optimized upload • JPG, PNG, WEBP, or SVG
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="abid-btn abid-btn-outline"
              style={{ padding: "8px 20px", fontSize: "0.85rem" }}
            >
              {isUploading ? "Uploading..." : "Choose Image File"}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-danger, #EF4444)", fontSize: "0.82rem", marginTop: "8px" }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
