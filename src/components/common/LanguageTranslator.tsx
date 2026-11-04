"use client";

import React, { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
];

export default function LanguageTranslator() {
  const [selectedCode, setSelectedCode] = useState<string>("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected language from cookie or localStorage
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
      if (match && match[1]) {
        setSelectedCode(match[1].toLowerCase());
      } else {
        const saved = localStorage.getItem("wsi_selected_language");
        if (saved) setSelectedCode(saved);
      }
    } catch (e) {
      // ignore in SSR
    }
  }, []);

  // Inject Google Translate script safely
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedCode === "en" && !isOpen) return;

    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ur,ar,bn,es,de,fr",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [selectedCode, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    setSelectedCode(code);
    setIsOpen(false);

    try {
      // Set translation cookies for root path and current domain
      const host = window.location.hostname;
      document.cookie = `googtrans=/en/${code}; path=/;`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
      localStorage.setItem("wsi_selected_language", code);

      // Attempt to invoke Google Translate directly if combo is mounted
      const selectElem = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (selectElem) {
        selectElem.value = code;
        selectElem.dispatchEvent(new Event("change"));
      } else {
        // Fallback reload so cookie takes effect
        window.location.reload();
      }
    } catch (err) {
      console.error("Language translation trigger error:", err);
      window.location.reload();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];

  return (
    <div className="wsi-lang-selector" ref={dropdownRef} style={{ position: "relative" }}>
      {/* Hidden container for Google Translate Engine */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* Trigger Button with Clear, High-Contrast Visible Text */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="wsi-lang-trigger"
        aria-label="Select Language"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          padding: "4px 10px",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          outline: "none",
        }}
      >
        <span style={{ fontSize: "14px", lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ color: "#FFFFFF", letterSpacing: "0.2px" }}>{currentLang.name}</span>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: "10px",
            color: "#CBD5E1",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        ></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="wsi-lang-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 999999,
            background: "#0F172A",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.45)",
            padding: "6px",
            minWidth: "170px",
            animation: "wsiLangFade 0.18s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "#94A3B8",
              padding: "6px 10px 4px",
            }}
          >
            Translate Website
          </div>

          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    background: isSelected ? "rgba(255, 64, 53, 0.15)" : "transparent",
                    color: isSelected ? "#FF4035" : "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "15px" }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  <span style={{ fontSize: "11px", opacity: 0.6 }}>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
