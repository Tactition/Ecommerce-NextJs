"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { WorkGallery } from "@/types";
import FlexCarousel, { FlexCarouselItem } from "@/components/common/FlexCarousel";
import TextType from "@/components/common/TextType";
import { Sparkles, ArrowRight, MousePointerClick, MoveHorizontal } from "lucide-react";

interface HomeGallerySectionProps {
  galleryItems?: WorkGallery[];
}

export default function HomeGallerySection({ galleryItems = [] }: HomeGallerySectionProps) {
  const items: FlexCarouselItem[] = useMemo(() => {
    if (galleryItems && galleryItems.length > 0) {
      return galleryItems
        .filter((g) => g.image && g.image.trim() !== "")
        .map((g) => ({
          src: g.image,
          alt: g.title,
          title: g.title,
          subtitle: g.category || "Project Showcase"
        }));
    }
    return [];
  }, [galleryItems]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery-showcase"
      className="gallery-carousel-section fix section-padding gsap-scroll-section"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, var(--color-surface-subtle, #F8FAFC) 100%)",
        borderTop: "1px solid var(--color-surface-border, #E2E8F0)",
        borderBottom: "1px solid var(--color-surface-border, #E2E8F0)",
        padding: "85px 0 95px 0",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div className="container">
        {/* Header Area */}
        <div className="wsi-section-header-split">
          <div className="wsi-section-title-wrap" style={{ maxWidth: "680px" }}>
            <div className="wsi-section-subtitle">
              <Sparkles size={14} />
              <span>Featured Project Portfolio</span>
            </div>
            <TextType
              as="h2"
              className="wsi-section-title"
              text={[
                "Craftsmanship In Every Detail",
                "Transformative Interior Work",
                "Architectural Spaces & Custom Living"
              ]}
              typingSpeed={55}
              pauseDuration={2400}
              deletingSpeed={32}
              deleteMode="backspace"
              typeEffect="fade"
              cursorStyle="bar"
              cursorColor="var(--color-primary, #FF4035)"
              cursorGlide
              showCursor
            />
            <p
              style={{
                color: "var(--color-text-muted, #64748B)",
                fontSize: "15px",
                lineHeight: 1.65,
                maxWidth: "580px",
                margin: "8px 0 0 0"
              }}
            >
              Explore our executed luxury residences, bespoke joinery, acoustic panels, and architectural installations.
            </p>
          </div>

          <div className="wsi-section-header-right">
            <div className="d-inline-flex flex-wrap align-items-center gap-3">
              <div
                className="d-none d-md-inline-flex align-items-center gap-2"
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted, #64748B)",
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  border: "1px solid var(--color-surface-border, #E2E8F0)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                }}
              >
                <MoveHorizontal size={14} style={{ color: "var(--color-primary, #FF4035)" }} />
                <span>Drag to pan</span>
                <span style={{ opacity: 0.3 }}>•</span>
                <MousePointerClick size={14} style={{ color: "var(--color-primary, #FF4035)" }} />
                <span>Click to zoom</span>
              </div>

              <Link
                href="/gallery"
                className="theme-btn"
                style={{
                  backgroundColor: "var(--color-secondary, #0A111E)",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
              >
                <span>View Full Gallery</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* WebGL Flex Carousel Showcase Container */}
        <div
          className="carousel-stage-wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: "580px",
            background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.6) 100%)",
            borderRadius: "var(--radius-xl, 24px)",
            border: "1px solid var(--color-surface-border, #E2E8F0)",
            boxShadow: "0 20px 40px -15px rgba(10, 17, 30, 0.07)",
            overflow: "hidden"
          }}
        >
          <FlexCarousel
            items={items}
            preset="liquid"
            intro="rise"
            cardHeight={0.52}
            gap={16}
            radius={14}
            squeeze={0.22}
            focusOnClick={true}
            captions={true}
            autoplay={true}
            interval={4}
            captureWheel={true}
          />
        </div>
      </div>
    </section>
  );
}
