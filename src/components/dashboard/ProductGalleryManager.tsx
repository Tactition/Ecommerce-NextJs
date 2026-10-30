"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  Link2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Star,
  Plus,
  Images,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ProductGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  mainImage?: string;
  onSetMainImage?: (image: string) => void;
}

/**
 * Client-side image optimizer for fast uploading of multi-megabyte images
 */
async function optimizeImageForUpload(file: File): Promise<File | Blob> {
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

export default function ProductGalleryManager({
  images = [],
  onChange,
  mainImage,
  onSetMainImage,
}: ProductGalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload a single file to /api/uploads
  const uploadSingleFile = async (rawFile: File): Promise<string> => {
    const optimized = await optimizeImageForUpload(rawFile);
    const formData = new FormData();
    formData.append("file", optimized);

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Upload failed for ${rawFile.name}`);
    }
    return data.url;
  };

  // Process batch upload of multiple files
  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress({ current: 0, total: fileList.length });

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        setUploadProgress({ current: i + 1, total: fileList.length });
        const url = await uploadSingleFile(fileList[i]);
        uploadedUrls.push(url);
      }

      // Append newly uploaded images to the gallery list without duplicates
      const updated = Array.from(new Set([...images, ...uploadedUrls]));
      onChange(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading gallery photos";
      setError(msg);
      // Even if some failed, retain the ones that succeeded
      if (uploadedUrls.length > 0) {
        const updated = Array.from(new Set([...images, ...uploadedUrls]));
        onChange(updated);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    const cleanUrl = urlInputValue.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("/")) {
      setError("Please provide a valid URL starting with http://, https:// or /");
      return;
    }

    if (!images.includes(cleanUrl)) {
      onChange([...images, cleanUrl]);
    }
    setUrlInputValue("");
    setShowUrlInput(false);
    setError(null);
  };

  const handleDelete = (indexToDelete: number) => {
    const updated = images.filter((_, idx) => idx !== indexToDelete);
    onChange(updated);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const handleSetCover = (imgUrl: string) => {
    if (onSetMainImage) {
      onSetMainImage(imgUrl);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        padding: "18px 20px",
        marginTop: "16px",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Images size={18} style={{ color: "#2563EB" }} />
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#0F172A",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Product Gallery Photos
          </h4>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              backgroundColor: images.length > 0 ? "#EFF6FF" : "#F1F5F9",
              color: images.length > 0 ? "#1D4ED8" : "#64748B",
              padding: "2px 8px",
              borderRadius: "12px",
              border: `1px solid ${images.length > 0 ? "#BFDBFE" : "#E2E8F0"}`,
            }}
          >
            {images.length} {images.length === 1 ? "Photo" : "Photos"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Link2 size={13} />
            {showUrlInput ? "Hide URL Input" : "Paste Photo URL"}
          </button>

          {images.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to remove all gallery images?")) {
                  onChange([]);
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#DC2626",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          color: "#64748B",
          margin: "0 0 14px 0",
          lineHeight: 1.45,
        }}
      >
        Upload multiple high-resolution photos showcasing material textures, alternate angles, and room styling. Customers can navigate these in the storefront thumbnail strip and inspect fine details using the hover-zoom loupe.
      </p>

      {/* URL Input Form Drawer */}
      {showUrlInput && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "14px",
            padding: "10px 12px",
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
          }}
        >
          <input
            type="text"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Paste image URL (e.g. /uploads/... or https://...)"
            style={{
              flex: 1,
              padding: "7px 11px",
              fontSize: "0.82rem",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            style={{
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 12px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "7px",
            color: "#991B1B",
            fontSize: "0.8rem",
            marginBottom: "12px",
          }}
        >
          <AlertCircle size={15} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#991B1B",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{
          border: isDragging ? "2px dashed #2563EB" : "2px dashed #CBD5E1",
          borderRadius: "10px",
          backgroundColor: isDragging ? "#EFF6FF" : isUploading ? "#F8FAFC" : "#F8FAFC",
          padding: "20px 16px",
          textAlign: "center",
          cursor: isUploading ? "wait" : "pointer",
          transition: "all 0.18s ease",
          marginBottom: "16px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "#2563EB" }} />
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>
              Uploading photos...
            </p>
            {uploadProgress && (
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                Processing {uploadProgress.current} of {uploadProgress.total} images
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
                marginBottom: "2px",
              }}
            >
              <UploadCloud size={20} />
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>
              Click to browse or drop multiple product photos here
            </p>
            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
              Select multiple files simultaneously. Automatically optimized to high-resolution web formats.
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {images.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {images.map((imgUrl, index) => {
            const isMainCover = mainImage === imgUrl;
            return (
              <div
                key={`${imgUrl}-${index}`}
                style={{
                  position: "relative",
                  border: isMainCover ? "2px solid #D97706" : "1px solid #E2E8F0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Image Container with 1:1 Aspect Ratio */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "100%",
                    backgroundColor: "#F1F5F9",
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Product gallery photo ${index + 1}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Top-left sequence chip */}
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      backgroundColor: "rgba(15, 23, 42, 0.75)",
                      color: "#FFFFFF",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backdropFilter: "blur(4px)",
                      lineHeight: 1,
                    }}
                  >
                    #{index + 1}
                  </span>

                  {/* Main Cover Indicator Badge */}
                  {isMainCover && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        left: "6px",
                        backgroundColor: "#D97706",
                        color: "#FFFFFF",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Star size={10} fill="#FFFFFF" /> Cover
                    </span>
                  )}

                  {/* Top-right delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    title="Remove this image"
                    aria-label="Remove this image"
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      color: "#FFFFFF",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Bottom Card Controls: Move Left, Set Cover, Move Right */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    backgroundColor: "#F8FAFC",
                    borderTop: "1px solid #F1F5F9",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveLeft(index)}
                    title="Move earlier"
                    aria-label="Move earlier"
                    style={{
                      background: "none",
                      border: "none",
                      color: index === 0 ? "#CBD5E1" : "#475569",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowLeft size={13} />
                  </button>

                  {onSetMainImage && !isMainCover ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(imgUrl)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#D97706",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "2px 4px",
                        borderRadius: "3px",
                      }}
                      title="Set as product main photo"
                    >
                      Set Main
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                      {isMainCover ? "Main Photo" : ""}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => handleMoveRight(index)}
                    title="Move later"
                    aria-label="Move later"
                    style={{
                      background: "none",
                      border: "none",
                      color: index === images.length - 1 ? "#CBD5E1" : "#475569",
                      cursor: index === images.length - 1 ? "not-allowed" : "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
            textAlign: "center",
            color: "#94A3B8",
            fontSize: "0.78rem",
          }}
        >
          No additional gallery photos added yet. Upload photos to show alternate angles and closeups in the storefront loupe.
        </div>
      )}
    </div>
  );
}
