"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Sparkles,
  Eye,
} from "lucide-react";

export interface ProductImageGalleryProps {
  images: string[];
  activeImage: string;
  onSelectImage?: (image: string) => void;
  productName: string;
  badge?: string | null;
  discountPercent?: number;
  height?: number | string;
  compact?: boolean;
}

export default function ProductImageGallery({
  images = [],
  activeImage,
  onSelectImage,
  productName,
  badge,
  discountPercent,
  height = 540,
  compact = false,
}: ProductImageGalleryProps) {
  // Ensure we have a clean array of valid image URLs
  const cleanImages = React.useMemo(() => {
    const list = images.filter(
      (img): img is string => Boolean(img && typeof img === "string" && img.trim() !== "")
    );
    if (list.length === 0 && activeImage && activeImage.trim() !== "") {
      return [activeImage];
    }
    return list;
  }, [images, activeImage]);

  // Current selected image
  const [selectedImage, setSelectedImage] = useState<string>(activeImage || cleanImages[0] || "");

  // Sync when activeImage prop changes externally (e.g., from variation selection)
  useEffect(() => {
    if (activeImage && activeImage.trim() !== "" && activeImage !== selectedImage) {
      setSelectedImage(activeImage);
    }
  }, [activeImage]);

  const currentIndex = Math.max(0, cleanImages.indexOf(selectedImage));

  const handleSelect = (img: string) => {
    setSelectedImage(img);
    if (onSelectImage) {
      onSelectImage(img);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (cleanImages.length <= 1) return;
    const nextIdx = (currentIndex - 1 + cleanImages.length) % cleanImages.length;
    handleSelect(cleanImages[nextIdx]);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (cleanImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % cleanImages.length;
    handleSelect(cleanImages[nextIdx]);
  };

  // --------------------------------------------------------------------------
  // INTERACTIVE HOVER ZOOM LENS STATE & LOGIC
  // --------------------------------------------------------------------------
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(2.5); // Default 2.5x magnification
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const LENS_SIZE = compact ? 150 : 200;

  const updateStageDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setStageDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    updateStageDimensions();
    window.addEventListener("resize", updateStageDimensions);
    return () => window.removeEventListener("resize", updateStageDimensions);
  }, [updateStageDimensions]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    if (stageDimensions.width !== rect.width || stageDimensions.height !== rect.height) {
      setStageDimensions({ width: rect.width, height: rect.height });
    }

    // Mouse coordinates relative to container
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Constrain lens inside container boundaries
    const halfLens = LENS_SIZE / 2;
    const clampedLensX = Math.max(halfLens, Math.min(rect.width - halfLens, clientX));
    const clampedLensY = Math.max(halfLens, Math.min(rect.height - halfLens, clientY));

    setLensPos({ x: clampedLensX, y: clampedLensY });
  }, [LENS_SIZE, stageDimensions]);

  const handleMouseEnter = () => {
    updateStageDimensions();
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // --------------------------------------------------------------------------
  // FULLSCREEN LIGHTBOX INSPECT MODAL
  // --------------------------------------------------------------------------
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxPan, setLightboxPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const openFullscreen = () => {
    setIsFullscreen(true);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === "Escape") closeFullscreen();
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "+" || e.key === "=") setLightboxZoom((z) => Math.min(4, z + 0.5));
        if (e.key === "-") setLightboxZoom((z) => Math.max(1, z - 0.5));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentIndex, cleanImages]);

  // Lightbox pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoom > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - lightboxPan.x, y: e.clientY - lightboxPan.y };
    }
  };

  const handleFullscreenMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lightboxZoom > 1) {
      setLightboxPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="wsi-product-gallery">
      {/* ====================================================================
          1. MAIN PRODUCT STAGE (With Interactive Hover Zoom Lens)
      ==================================================================== */}
      <div
        ref={containerRef}
        className="wsi-gallery-stage"
        style={{
          height: typeof height === "number" ? `${height}px` : height,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Badges */}
        {badge && (
          <span className="wsi-gallery-badge wsi-gallery-badge--custom">
            <Sparkles size={12} className="me-1" />
            {badge}
          </span>
        )}
        {discountPercent !== undefined && discountPercent > 0 && (
          <span className="wsi-gallery-badge wsi-gallery-badge--discount">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Counter Badge */}
        {cleanImages.length > 1 && (
          <div className="wsi-gallery-counter">
            <span>{currentIndex + 1}</span> / <span>{cleanImages.length}</span>
          </div>
        )}

        {/* Fullscreen Expand Action Button */}
        <button
          type="button"
          onClick={openFullscreen}
          className="wsi-gallery-inspect-btn"
          title="Fullscreen High-Resolution Material Inspect"
          aria-label="Fullscreen High-Resolution Material Inspect"
        >
          <Maximize2 size={16} />
        </button>

        {/* The Base Image — Gets blurred on hover so ONLY the circular lens reveals the crisp material */}
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={`${productName} - Detail View ${currentIndex + 1}`}
            fetchPriority="high"
            decoding="async"
            className="wsi-gallery-stage__img"
            style={{
              filter: isHovering ? "blur(4px) brightness(0.88)" : "none",
              transform: "scale(1)",
              transition: "filter 0.28s ease, transform 0.28s ease",
            }}
          />
        ) : (
          <div className="wsi-gallery-placeholder">
            <Eye size={36} color="#94A3B8" />
            <span>No image preview available</span>
          </div>
        )}

        {/* Interactive Hover Zoom Lens with Razor-Sharp Unblurred Magnification */}
        {isHovering && selectedImage && stageDimensions.width > 0 && (
          <div
            className="wsi-gallery-lens"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              left: `${lensPos.x}px`,
              top: `${lensPos.y}px`,
              backgroundImage: `url("${selectedImage}")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${stageDimensions.width * zoomLevel}px ${stageDimensions.height * zoomLevel}px`,
              backgroundPosition: `${-(lensPos.x * zoomLevel - LENS_SIZE / 2)}px ${-(lensPos.y * zoomLevel - LENS_SIZE / 2)}px`,
            }}
          >
            {/* Precision Optical Elements */}
            <div className="wsi-gallery-lens__glare"></div>
            <div className="wsi-gallery-lens__crosshair-h"></div>
            <div className="wsi-gallery-lens__crosshair-v"></div>
            <span className="wsi-gallery-lens__tag">{zoomLevel}x Focus</span>
          </div>
        )}

        {/* Stage Navigation Arrows (When > 1 Image) */}
        {cleanImages.length > 1 && (
          <>
            <button
              type="button"
              className="wsi-gallery-arrow wsi-gallery-arrow--prev"
              onClick={handlePrev}
              aria-label="Previous product image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="wsi-gallery-arrow wsi-gallery-arrow--next"
              onClick={handleNext}
              aria-label="Next product image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Floating Zoom & Material Inspection Tool Bar */}
        <div className="wsi-gallery-toolbar">
          <div className="wsi-gallery-toolbar__hint">
            {isHovering ? (
              <>
                <span className="wsi-live-dot"></span>
                <span>Inspecting texture at {zoomLevel}x • Pan cursor</span>
              </>
            ) : (
              <>
                <ZoomIn size={13} className="text-primary me-1" />
                <span>Hover image to inspect fine texture</span>
              </>
            )}
          </div>

          {/* Zoom Multiplier Selector */}
          <div className="wsi-gallery-zoom-levels" onClick={(e) => e.stopPropagation()}>
            {[2, 2.5, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`wsi-zoom-pill ${zoomLevel === lvl ? "active" : ""}`}
                onClick={() => setZoomLevel(lvl)}
                title={`Set zoom to ${lvl}x magnification`}
              >
                {lvl}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. THUMBNAIL NAVIGATION STRIP
      ==================================================================== */}
      {cleanImages.length > 1 && (
        <div className="wsi-thumbnails-wrapper">
          <div className="wsi-thumbnails-track">
            {cleanImages.map((imgSrc, idx) => {
              const isActive = selectedImage === imgSrc;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(imgSrc)}
                  className={`wsi-thumb-btn ${isActive ? "active" : ""}`}
                  aria-label={`View angle ${idx + 1} of ${cleanImages.length}`}
                  title={`View angle ${idx + 1}`}
                >
                  <img
                    src={imgSrc}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="wsi-thumb-img"
                  />
                  {isActive && <span className="wsi-thumb-active-indicator"></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          3. FULLSCREEN HIGH-RESOLUTION LIGHTBOX MODAL
      ==================================================================== */}
      {isFullscreen && (
        <div className="wsi-lightbox-overlay" onClick={closeFullscreen}>
          <div
            className="wsi-lightbox-container"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleFullscreenMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Top Bar with Title, Controls & Close Button */}
            <div className="wsi-lightbox-header">
              <div className="wsi-lightbox-title-box">
                <h5 className="wsi-lightbox-title">{productName}</h5>
                <span className="wsi-lightbox-counter">
                  Image {currentIndex + 1} of {cleanImages.length}
                </span>
              </div>

              {/* Lightbox Zoom Controls */}
              <div className="wsi-lightbox-controls">
                <button
                  type="button"
                  className="wsi-lightbox-btn"
                  onClick={() => setLightboxZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))))}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  className="wsi-lightbox-btn"
                  onClick={() => {
                    setLightboxZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
                    if (lightboxZoom <= 1.5) setLightboxPan({ x: 0, y: 0 });
                  }}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  className="wsi-lightbox-btn"
                  onClick={() => {
                    setLightboxZoom(1);
                    setLightboxPan({ x: 0, y: 0 });
                  }}
                  title="Reset Zoom & Pan"
                >
                  <RotateCcw size={16} />
                  <span className="ms-1" style={{ fontSize: "0.75rem" }}>
                    {lightboxZoom}x
                  </span>
                </button>
                <button
                  type="button"
                  className="wsi-lightbox-btn wsi-lightbox-btn--close"
                  onClick={closeFullscreen}
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Canvas Area */}
            <div
              className={`wsi-lightbox-stage ${lightboxZoom > 1 ? "is-zoomed" : ""}`}
              style={{ cursor: lightboxZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
            >
              <img
                src={selectedImage}
                alt={productName}
                className="wsi-lightbox-img"
                style={{
                  transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxZoom})`,
                  transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                draggable={false}
              />
            </div>

            {/* Lightbox Previous / Next Navigation */}
            {cleanImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="wsi-lightbox-nav wsi-lightbox-nav--prev"
                  onClick={handlePrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  className="wsi-lightbox-nav wsi-lightbox-nav--next"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Lightbox Bottom Thumbnail Bar */}
            {cleanImages.length > 1 && (
              <div className="wsi-lightbox-footer">
                <div className="wsi-lightbox-thumbs">
                  {cleanImages.map((imgSrc, idx) => {
                    const isActive = selectedImage === imgSrc;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleSelect(imgSrc);
                          setLightboxZoom(1);
                          setLightboxPan({ x: 0, y: 0 });
                        }}
                        className={`wsi-lightbox-thumb ${isActive ? "active" : ""}`}
                      >
                        <img src={imgSrc} alt="" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
