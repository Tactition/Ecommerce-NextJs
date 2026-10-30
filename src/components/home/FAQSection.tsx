"use client";

import React, { useState } from "react";
import Container from "@/components/layout/Container";
import { FAQ } from "@/types";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQSectionProps {
  faqs: FAQ[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="abid-section" style={{ backgroundColor: "#FFFFFF" }}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px auto" }}>
          <div className="abid-badge">
            <HelpCircle size={15} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "14px" }}>
            Got Questions? We Have Transparent Answers
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.02rem" }}>
            Everything you need to know about our certified warranty, response times, replacement parts, and upfront pricing.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                style={{
                  border: "1px solid",
                  borderColor: isOpen ? "var(--color-primary)" : "var(--color-surface-border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isOpen ? "var(--color-surface)" : "#F8FAFC",
                  transition: "all 0.2s ease",
                  overflow: "hidden",
                  boxShadow: isOpen ? "var(--shadow-md)" : "none",
                }}
              >
                <button
                  onClick={() => toggle(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--color-secondary)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ paddingRight: "16px" }}>{faq.question}</span>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: isOpen ? "var(--color-primary-light)" : "rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "var(--color-primary)" : "var(--color-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px 24px",
                      color: "var(--color-text-muted)",
                      fontSize: "0.96rem",
                      lineHeight: 1.7,
                      borderTop: "1px dashed var(--color-surface-border)",
                      marginTop: "4px",
                      paddingTop: "16px",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
