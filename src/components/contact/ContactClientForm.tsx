"use client";

import React, { useState, useTransition } from "react";
import { submitContactFormAction } from "@/lib/actions/contact";

export default function ContactClientForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Valued Customer";
    formData.append("name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("subject", subject);
    formData.append("message", message);

    startTransition(async () => {
      try {
        const res = await submitContactFormAction(null, formData);
        setResult(res);
        if (res.success) {
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setMessage("");
        }
      } catch (err) {
        setResult({
          success: false,
          error: "An unexpected error occurred. Please try again or call our customer line.",
        });
      }
    });
  };

  return (
    <div className="contact-form-items-1">
      {result && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            backgroundColor: result.success ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${result.success ? "#10B981" : "#EF4444"}`,
            color: result.success ? "#065F46" : "#991B1B",
          }}
        >
          <strong>{result.success ? "Success!" : "Notice:"}</strong>{" "}
          {result.message || result.error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="contact-form-1">
        <div className="row g-4">
          <div className="col-xl-6 wow fadeInUp" data-wow-delay=".3s">
            <div className="form-clt-1 mb-3">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-xl-6 wow fadeInUp" data-wow-delay=".3s">
            <div className="form-clt-1 mb-3">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-xl-6 wow fadeInUp mb-4" data-wow-delay=".5s">
            <div className="form-clt-1">
              <label htmlFor="contact_email">Email</label>
              <input
                type="email"
                name="email"
                id="contact_email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-xl-6 wow fadeInUp mb-4" data-wow-delay=".7s">
            <div className="form-clt-1">
              <label htmlFor="contact_phone">Phone Number</label>
              <input
                type="tel"
                name="phone"
                id="contact_phone"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="col-xl-12">
            <div className="subjects">
              <h6>Select Inquiry Subject</h6>
              <div className="checkbox d-flex flex-wrap gap-4 pt-1 pb-3">
                {[
                  "General Inquiry",
                  "Repair Diagnostic",
                  "Genuine Parts & Stock",
                  "Warranty Claim",
                ].map((s) => (
                  <label
                    key={s}
                    className="checkbox-single d-inline-flex align-items-center gap-2"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="radio"
                      name="subject_choice"
                      value={s}
                      checked={subject === s}
                      onChange={() => setSubject(s)}
                      style={{ accentColor: "var(--theme)", width: "18px", height: "18px" }}
                    />
                    <span className="text" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--title)" }}>
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="col-xl-12 wow fadeInUp" data-wow-delay=".3s">
            <div className="form-clt-1">
              <label htmlFor="contact_message">Message</label>
              <textarea
                name="message"
                id="contact_message"
                placeholder="Describe your device fault, model number, or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              ></textarea>
            </div>
          </div>

          <div className="col-xl-12 d-flex justify-content-end pt-2">
            <button
              type="submit"
              className="theme-btn style6"
              disabled={isPending}
              style={{
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? "not-allowed" : "pointer",
                padding: "14px 34px",
                border: "none",
              }}
            >
              <span>{isPending ? "Sending..." : "Send Message"}</span>
              <i className="fa-solid fa-arrow-right-long ms-2"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
