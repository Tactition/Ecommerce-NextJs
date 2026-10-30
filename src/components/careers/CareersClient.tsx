"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  SquareArrowOutUpRight,
  Check,
  X,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Briefcase,
  Clock,
  Coins,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";
import { Career } from "@/types";
import { submitCareerApplicationAction } from "@/lib/actions/careers";

interface CareersClientProps {
  initialJobs: Career[];
}

export default function CareersClient({ initialJobs }: CareersClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [shareSuccessId, setShareSuccessId] = useState<number | null>(null);

  // Application Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Career | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Fields State
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState("");

  // Dynamically compute categories and count per category
  const { categories, categoryCounts } = useMemo(() => {
    const cats: { id: string; label: string }[] = [{ id: "all", label: "All Roles" }];
    const counts: Record<string, number> = { all: initialJobs.length };
    const seen = new Set<string>();

    for (const job of initialJobs) {
      const catId = job.category_id || job.department.toLowerCase().replace(/\s+/g, "-");
      counts[catId] = (counts[catId] || 0) + 1;

      if (!seen.has(catId)) {
        seen.add(catId);
        cats.push({ id: catId, label: job.department });
      }
    }
    return { categories: cats, categoryCounts: counts };
  }, [initialJobs]);

  const filteredJobs = useMemo(() => {
    if (activeCategory === "all") return initialJobs;
    return initialJobs.filter(
      (job) =>
        job.category_id === activeCategory ||
        job.department.toLowerCase().replace(/\s+/g, "-") === activeCategory
    );
  }, [initialJobs, activeCategory]);

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = async (job: Career) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at Wall Street Interiors`,
          text: `Check out this opening for ${job.title} (${job.department})`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareSuccessId(job.id);
      setTimeout(() => setShareSuccessId(null), 2500);
    }
  };

  const openApplyModal = (job: Career | null) => {
    setSelectedJob(job);
    setFormFeedback(null);
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    if (isPending) return;
    setIsModalOpen(false);
    setSelectedJob(null);
    setFormFeedback(null);
  };

  const handleSubmitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormFeedback(null);

    const formData = new FormData();
    if (selectedJob?.id) {
      formData.append("career_id", selectedJob.id.toString());
      formData.append("job_title", selectedJob.title);
    } else {
      formData.append("job_title", "General Candidate Resume Submission");
    }

    formData.append("applicant_name", applicantName);
    formData.append("applicant_email", applicantEmail);
    formData.append("applicant_phone", applicantPhone);
    if (portfolioUrl.trim()) formData.append("portfolio_url", portfolioUrl.trim());
    if (resumeUrl.trim()) formData.append("resume_url", resumeUrl.trim());
    if (resumeFile) formData.append("resume_file", resumeFile);
    if (coverNote.trim()) formData.append("cover_note", coverNote.trim());

    startTransition(async () => {
      const res = await submitCareerApplicationAction(formData);
      if (res.success) {
        setFormFeedback({
          type: "success",
          message: res.message || "Thank you! Your application has been received by our recruitment team.",
        });
        setApplicantName("");
        setApplicantEmail("");
        setApplicantPhone("");
        setPortfolioUrl("");
        setResumeUrl("");
        setResumeFile(null);
        setCoverNote("");
      } else {
        setFormFeedback({
          type: "error",
          message: res.error || "Failed to submit. Please check your inputs.",
        });
      }
    });
  };

  return (
    <div className="wsi-careers-page">
      {/* Main Job Openings Section */}
      <section className="section-padding fix" style={{ padding: "40px 0 90px 0" }}>
        <div className="container" style={{ maxWidth: "980px" }}>
          {/* Category Tabs */}
          <div className="d-flex align-items-center justify-content-start justify-content-md-center gap-2 mb-40 wsi-scrollable-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`wsi-career-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
              >
                <span>{cat.label}</span>
                <span className="wsi-career-tab-count">
                  {categoryCounts[cat.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Job Cards List */}
          <div className="d-flex flex-column gap-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const isShared = shareSuccessId === job.id;

              return (
                <article key={job.id} className="wsi-career-card">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <span className="wsi-career-dept-badge">
                      <Briefcase size={13} />
                      {job.department}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text, #64748B)", fontWeight: 500 }}>
                      Posted {job.posted_at || "Recently"}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.55rem",
                      fontWeight: 700,
                      color: "var(--title, #0A111E)",
                      marginBottom: "10px",
                      fontFamily: "var(--font-heading, 'Outfit'), sans-serif",
                    }}
                  >
                    {job.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.96rem",
                      lineHeight: 1.68,
                      color: "var(--text, #64748B)",
                      marginBottom: "16px",
                    }}
                  >
                    {job.description}
                  </p>

                  {job.requirements && (
                    <div
                      style={{
                        padding: "14px 18px",
                        background: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        fontSize: "0.86rem",
                        color: "#334155",
                        marginBottom: "20px",
                      }}
                    >
                      <strong style={{ color: "var(--title, #0A111E)", display: "block", marginBottom: "4px" }}>
                        Key Qualifications:
                      </strong>
                      {job.requirements}
                    </div>
                  )}

                  {/* Meta row and Actions */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top border-slate-100">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className="wsi-career-meta-pill">
                        <Clock size={14} style={{ color: "var(--theme, #FF4035)" }} />
                        {job.job_type}
                      </span>
                      <span className="wsi-career-meta-pill">
                        <Coins size={14} style={{ color: "var(--theme, #FF4035)" }} />
                        {job.salary}
                      </span>
                      {job.location && (
                        <span className="wsi-career-meta-pill">
                          <MapPin size={14} style={{ color: "var(--theme, #FF4035)" }} />
                          {job.location}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openApplyModal(job)}
                        className="wsi-career-btn-apply"
                      >
                        <span>Apply For Position</span>
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job.id)}
                        className="wsi-career-btn-icon"
                        title={isSaved ? "Saved to favorites" : "Save this opening"}
                        style={{
                          color: isSaved ? "var(--theme, #FF4035)" : "#475569",
                          borderColor: isSaved ? "var(--theme, #FF4035)" : "var(--color-surface-border, #E2E8F0)",
                        }}
                      >
                        <Bookmark size={16} className={isSaved ? "fill-current text-theme" : ""} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(job)}
                        className="wsi-career-btn-icon"
                        title="Share opening link"
                      >
                        {isShared ? (
                          <Check size={16} style={{ color: "#16A34A" }} />
                        ) : (
                          <SquareArrowOutUpRight size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Zero State if empty */}
            {filteredJobs.length === 0 && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--bg-1, #FFF5F4)",
                    color: "var(--theme, #FF4035)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Briefcase size={26} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--title, #0A111E)", marginBottom: "8px" }}>
                  No open positions in this category right now
                </h3>
                <p style={{ color: "var(--text, #64748B)", maxWidth: "460px", margin: "0 auto 20px" }}>
                  We are regularly looking for new craft talent. Submit a general resume and we will contact you when a matching opening arises.
                </p>
                <button
                  type="button"
                  onClick={() => openApplyModal(null)}
                  className="wsi-career-btn-apply"
                >
                  <span>Submit General Application</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* "Don't See Your Role?" General Resume Card */}
          <div
            style={{
              marginTop: "50px",
              background: "linear-gradient(135deg, #0A111E 0%, #162032 100%)",
              borderRadius: "20px",
              padding: "44px 36px",
              color: "#FFFFFF",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              boxShadow: "0 20px 40px -12px rgba(10, 17, 30, 0.25)",
            }}
          >
            <div style={{ maxWidth: "560px" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#FF8A82",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Talent Community
              </span>
              <h3 style={{ fontSize: "1.65rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>
                Don&apos;t see the exact role you are looking for?
              </h3>
              <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                We are always expanding our design atelier. Send us your resume and portfolio, and our creative directors will reach out when a new opening aligns with your strengths.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openApplyModal(null)}
              style={{
                background: "linear-gradient(135deg, #FF4035 0%, #D9251A 100%)",
                color: "#FFFFFF",
                padding: "14px 28px",
                borderRadius: "9999px",
                fontSize: "0.95rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 18px rgba(255, 64, 53, 0.35)",
                whiteSpace: "nowrap",
              }}
            >
              <span>Send Us Your Resume</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Candidate Application Modal */}
      {isModalOpen && (
        <div
          className="wsi-career-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeApplyModal();
          }}
        >
          <div className="wsi-career-modal-content">
            {/* Modal Header */}
            <div className="d-flex align-items-start justify-content-between pb-3 border-bottom border-slate-100">
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--theme, #FF4035)",
                    display: "block",
                  }}
                >
                  Candidate Application
                </span>
                <h3
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--title, #0A111E)",
                    margin: "4px 0 0 0",
                    fontFamily: "var(--font-heading, 'Outfit'), sans-serif",
                  }}
                >
                  {selectedJob ? selectedJob.title : "General Resume Submission"}
                </h3>
                {selectedJob && (
                  <p style={{ fontSize: "0.82rem", color: "var(--text, #64748B)", margin: "4px 0 0 0" }}>
                    {selectedJob.department} • {selectedJob.location || "Srinagar"} • {selectedJob.job_type}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  padding: "4px",
                  borderRadius: "50%",
                }}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            {formFeedback?.type === "success" ? (
              <div style={{ padding: "40px 10px", textAlign: "center" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#ECFDF5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--title, #0A111E)", marginBottom: "8px" }}>
                  Application Received!
                </h3>
                <p style={{ color: "var(--text, #64748B)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto 24px" }}>
                  {formFeedback.message}
                </p>
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="wsi-career-btn-apply"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} style={{ marginTop: "20px" }}>
                {formFeedback?.type === "error" && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "#FEF2F2",
                      color: "#DC2626",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{formFeedback.message}</span>
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                    Full Name <span style={{ color: "var(--theme, #FF4035)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Full Name"
                    className="wsi-career-input"
                  />
                </div>

                <div className="row g-3" style={{ marginBottom: "16px" }}>
                  <div className="col-sm-6">
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                      Email Address <span style={{ color: "var(--theme, #FF4035)" }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="Email Address"
                      className="wsi-career-input"
                    />
                  </div>
                  <div className="col-sm-6">
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                      Phone Number <span style={{ color: "var(--theme, #FF4035)" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="wsi-career-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                    Portfolio / LinkedIn / Behance URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://behance.net/portfolio or LinkedIn"
                    className="wsi-career-input"
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                    Resume / CV (File Upload or Link)
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label className="wsi-career-file-drop">
                      <UploadCloud size={24} style={{ color: "var(--theme, #FF4035)", margin: "0 auto 8px" }} />
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--title, #0A111E)" }}>
                        {resumeFile ? resumeFile.name : "Click or drag your Resume here"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                        Accepts PDF, DOCX, DOC (Up to 20MB)
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    {resumeFile && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#059669", background: "#ECFDF5", padding: "6px 12px", borderRadius: "8px" }}>
                        <span>Attached: {resumeFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setResumeFile(null)}
                          style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="Or paste Google Drive / Dropbox resume link"
                      className="wsi-career-input"
                      style={{ fontSize: "0.85rem", padding: "9px 14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", marginBottom: "6px" }}>
                    Cover Note / Brief Pitch
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell us about your core strengths, project background, or design philosophies..."
                    className="wsi-career-input"
                    style={{ resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
                  <button
                    type="button"
                    onClick={closeApplyModal}
                    disabled={isPending}
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      color: "#334155",
                      padding: "10px 20px",
                      borderRadius: "9999px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="wsi-career-btn-apply"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
