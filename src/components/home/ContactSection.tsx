"use client";

import React, { useState } from "react";
import Container from "@/components/layout/Container";
import { SiteSettings } from "@/types";
import { submitContactFormAction } from "@/lib/actions/contact";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, Wrench } from "lucide-react";

interface ContactSectionProps {
  settings: SiteSettings;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const [status, setStatus] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactFormAction(null, formData);

    setIsSubmitting(false);
    if (result.success) {
      setStatus({ success: true, message: result.message });
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus({ success: false, error: result.error });
    }
  };

  return (
    <section className="abid-section" style={{ backgroundColor: "#F8FAFC" }} id="contact-section">
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px auto" }}>
          <div className="abid-badge">
            <Send size={15} />
            <span>Design Consultation & Trade Quotes</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "14px" }}>
            Book An Architectural Consultation or Trade Enquiry
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.02rem" }}>
            Submit your project details below. Our senior interior design consultants will contact you to discuss project layouts, material finishes, and 3D visual mockups.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Contact Information Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #0A111E 0%, #162032 100%)",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                color: "#FFFFFF",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <h3 style={{ color: "#FFFFFF", fontSize: "1.3rem", marginBottom: "16px" }}>
                Priority Contractor & Trade Desk
              </h3>
              <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
                Need bulk quotes or fast material delivery for architectural projects? Connect directly with our wholesale trade desk.
              </p>
              {settings.emergency_contact ? (
                <a
                  href={`tel:${settings.emergency_contact.replace(/\s+/g, "")}`}
                  className="abid-btn abid-btn-primary"
                  style={{ width: "100%", padding: "12px 20px" }}
                >
                  <Phone size={18} />
                  <span>Call Trade Desk: {settings.emergency_contact}</span>
                </a>
              ) : null}
            </div>

            {settings.company_address ? (
              <div className="abid-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "var(--color-primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Design Studio & Workshop</h4>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {settings.company_address}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {(settings.company_phone || settings.working_hours) ? (
              <div className="abid-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#EFF6FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563EB",
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Customer Service & Consultations</h4>
                    {settings.company_phone ? (
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                        {settings.company_phone}
                      </p>
                    ) : null}
                    {settings.working_hours ? (
                      <p style={{ color: "#94A3B8", fontSize: "0.82rem" }}>
                        {settings.working_hours}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {settings.company_email ? (
              <div className="abid-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10B981",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Direct Studio Email</h4>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {settings.company_email}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Interactive Enquiry Form */}
          <div className="abid-card" style={{ padding: "36px" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>Request Interior Consultation or Quote</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem", marginBottom: "24px" }}>
              Share your architectural requirements or bespoke furniture specs. We respond within 24 hours.
            </p>

            {status?.success && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-success-bg)",
                  color: "var(--color-success)",
                  fontSize: "0.92rem",
                  marginBottom: "20px",
                  border: "1px solid #A7F3D0",
                }}
              >
                <CheckCircle2 size={20} />
                <span>{status.message}</span>
              </div>
            )}

            {status?.error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  fontSize: "0.92rem",
                  marginBottom: "20px",
                  border: "1px solid #FECACA",
                }}
              >
                <AlertCircle size={20} />
                <span>{status.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Robert Smith"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    placeholder="Your Phone Number"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Your Email Address"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Service / Project Requirement *
                </label>
                <select id="subject" name="subject" required className="form-select">
                  <option value="">Select a service category...</option>
                  <option value="Interior Architecture & Space Planning">Interior Architecture & Space Planning</option>
                  <option value="Bespoke Handcrafted Furniture">Bespoke Handcrafted Furniture</option>
                  <option value="Acoustic Slat Wood Paneling">Acoustic Slat Wood Wall Paneling</option>
                  <option value="Luxury Modular Kitchen & Wardrobes">Luxury Modular Kitchen & Wardrobes</option>
                  <option value="Architectural Lighting Design">Architectural Lighting & Ceiling Fixtures</option>
                  <option value="B2B Wholesale Trade Supply">B2B Wholesale Trade & Dealership Supply</option>
                  <option value="Turnkey Interior Contracting">Turnkey Interior Contracting</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Project Details / Specifications *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Please describe your property type (villa, apartment, hotel, corporate), approximate dimensions, preferred finish (wood, veneer, fabric), or custom furniture requirements..."
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="abid-btn abid-btn-primary"
                style={{ width: "100%", padding: "14px 24px", fontSize: "1rem" }}
              >
                {isSubmitting ? (
                  <span>Recording Your Request...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Service Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
