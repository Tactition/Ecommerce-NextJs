"use client";

import React, { useState, useEffect } from "react";
import { subscribeNewsletterAction } from "@/lib/actions/contact";
import { HomepageSettings } from "@/types";

interface NewsletterOfferModalProps {
  settings?: HomepageSettings | null;
}

export default function NewsletterOfferModal({ settings }: NewsletterOfferModalProps) {
  const isEnabled = settings?.newsletter_modal_enabled !== 0 && settings?.newsletter_modal_enabled !== false;
  const modalImage = settings?.newsletter_modal_image || "/assets/images/modal/common-modal.jpg";
  const modalTitle = settings?.newsletter_modal_title || "Subcribe to Our Newsletter";
  const modalSubtitle = settings?.newsletter_modal_subtitle || "Subscribe to our newsletter and Save your 20% money with discount code today.";
  const modalCode = settings?.newsletter_modal_code || "WALLSTREET20";

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [doNotShow, setDoNotShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    // Only suppress if the user explicitly checked "Do not show this window"
    const optOut = localStorage.getItem("wsi_newsletter_optout");
    if (!optOut) {
      // Pops up cleanly on every refresh after 700ms
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    if (doNotShow) {
      localStorage.setItem("wsi_newsletter_optout", "true");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await subscribeNewsletterAction(email);
      if (res.success) {
        setSuccessMsg(res.message || `Thank you for subscribing! Your 20% discount code is: ${modalCode}`);
        if (doNotShow) {
          localStorage.setItem("wsi_newsletter_optout", "true");
        }
        setTimeout(() => {
          setIsOpen(false);
        }, 3500);
      } else {
        setErrorMsg(res.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !isEnabled) return null;

  return (
    <div
      className="modal fade show common-newsletter-modal"
      id="exampleModal"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1055,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
        style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content overflow-hidden position-relative"
          style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <button
            type="button"
            className="close border-0 bg-transparent"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "18px",
              fontSize: "28px",
              lineHeight: 1,
              color: "#64748B",
              cursor: "pointer",
              zIndex: 10,
              padding: "4px 8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <div className="modal-body modal1 modal-bg p-0">
            <div className="row g-0 align-items-center">
              <div className="col-lg-5 col-md-12 d-none d-lg-block" style={{ alignSelf: "stretch" }}>
                <div className="offer-modal-img" style={{ height: "100%", width: "100%" }}>
                  <img
                    src={modalImage}
                    alt={modalTitle}
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "380px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-7 col-md-12">
                <div className="offer-modal-right" style={{ padding: "40px 36px 36px" }}>
                  <h3 style={{ fontSize: "2.1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 12px", lineHeight: 1.2 }}>
                    {modalTitle}
                  </h3>
                  <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "0 0 24px", lineHeight: 1.5 }}>
                    {modalSubtitle.includes("20% money") ? (
                      <>
                        {modalSubtitle.split("20% money")[0]}
                        <span style={{ color: "var(--color-primary, #FF4035)", fontWeight: 700 }}>20% money</span>
                        {modalSubtitle.split("20% money")[1]}
                      </>
                    ) : (
                      modalSubtitle
                    )}
                  </p>

                  {successMsg ? (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#F0FDF4",
                        border: "1px solid #BBF7D0",
                        borderRadius: "12px",
                        color: "#166534",
                        fontSize: "0.92rem",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>🎉 Subscription Confirmed!</div>
                      <div>Use code <strong style={{ color: "#FF4035", fontSize: "1.05rem" }}>{modalCode}</strong> at checkout for 20% off.</div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="input-group mb-3 position-relative" style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{
                            height: "50px",
                            borderRadius: "100px",
                            padding: "0 130px 0 22px",
                            border: "1px solid #CBD5E1",
                            fontSize: "0.95rem",
                            width: "100%",
                            outline: "none",
                            boxShadow: "none",
                          }}
                        />
                        <div
                          className="input-group-append"
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "4px",
                            zIndex: 5,
                          }}
                        >
                          <button
                            type="submit"
                            disabled={loading}
                            className="theme-btn style6"
                            style={{
                              height: "42px",
                              padding: "0 24px",
                              borderRadius: "100px",
                              backgroundColor: "var(--color-primary, #FF4035)",
                              color: "#FFFFFF",
                              fontWeight: 700,
                              border: "none",
                              fontSize: "0.9rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {loading ? "Subscribing..." : "Subscribe"}
                          </button>
                        </div>
                      </div>

                      {errorMsg && (
                        <div style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: "-6px", marginBottom: "12px", textAlign: "left" }}>
                          {errorMsg}
                        </div>
                      )}

                      <div className="check_boxed_modal d-flex align-items-center justify-content-center gap-2" style={{ marginTop: "24px" }}>
                        <input
                          type="checkbox"
                          id="vehicle1"
                          name="vehicle1"
                          value="Bike"
                          checked={doNotShow}
                          onChange={(e) => setDoNotShow(e.target.checked)}
                          style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--color-primary, #FF4035)" }}
                        />
                        <label
                          htmlFor="vehicle1"
                          style={{ fontSize: "0.88rem", color: "#64748B", cursor: "pointer", userSelect: "none", margin: 0 }}
                        >
                          Do not show this window
                        </label>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
