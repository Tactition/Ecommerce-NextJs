"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function GsapScrollAnimation() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Target all sections marked with .gsap-scroll-section
    const sections = gsap.utils.toArray<HTMLElement>(".gsap-scroll-section");
    if (!sections || sections.length === 0) return;

    // Prevent horizontal overflow / scrollbars during left-right fly-ins
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    const ctx = gsap.context(() => {
      sections.forEach((sec, idx) => {
        // Alternating sides:
        // odd indices (1, 3, 5...) come from LEFT (-85px)
        // even indices (2, 4, 6...) come from RIGHT (+85px)
        const isFromLeft = idx % 2 === 1;
        const initialX = isFromLeft ? -85 : 85;

        // Check if element is already within the visible viewport on initial load
        const rect = sec.getBoundingClientRect();
        const isInInitialView = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;

        if (idx === 0 || isInInitialView) {
          // Keep initial above-the-fold content immediately 100% visible
          gsap.set(sec, { opacity: 1, x: 0, y: 0 });
          return;
        }

        // Set starting state for below-the-fold elements
        gsap.set(sec, {
          opacity: 0,
          x: initialX,
          y: 0,
        });

        ScrollTrigger.create({
          trigger: sec,
          start: "top 88%",
          once: true,
          // When scrolling into view: enters from left/right with smooth fade-in and remains permanently visible
          onEnter: () => {
            gsap.fromTo(
              sec,
              { opacity: 0, x: initialX },
              {
                opacity: 1,
                x: 0,
                duration: 0.85,
                ease: "power2.out",
                overwrite: "auto",
                clearProps: "transform,opacity",
              }
            );
          },
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
