"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname changes, complete progress bar smoothly and fade out
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept internal link clicks to start instant visual progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, blank targets, hash links, mailto, tel, modifier keys
      if (
        target.getAttribute("target") === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) {
          const currentUrl = window.location.pathname + window.location.search;
          const targetUrl = url.pathname + url.search;
          if (currentUrl !== targetUrl) {
            setVisible(true);
            setProgress(30);
            setTimeout(() => setProgress((p) => (p >= 30 && p < 75 ? 75 : p)), 100);
            setTimeout(() => setProgress((p) => (p >= 75 && p < 90 ? 88 : p)), 300);
          }
        }
      } catch {
        // invalid URL ignore
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 99999999,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #FF4035 0%, #FF7849 50%, #FFB020 100%)",
          boxShadow: "0 0 12px rgba(255, 64, 53, 0.8), 0 0 6px rgba(255, 64, 53, 0.6)",
          transition: progress === 100 ? "width 0.15s ease-out, opacity 0.25s ease-out 0.1s" : "width 0.3s ease",
          opacity: visible ? 1 : 0,
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
