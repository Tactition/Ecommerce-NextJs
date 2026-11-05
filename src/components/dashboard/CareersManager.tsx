"use client";

import React, { useState } from "react";
import { Career, CareerApplication } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  getAllCareers,
  saveCareerAction,
  deleteCareerAction,
  toggleCareerStatusAction,
  getCareerApplications,
  updateApplicationStatusAction,
  deleteApplicationAction,
} from "@/lib/actions/careers";
import {
  Briefcase,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Eye,
  FileText,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";

interface CareersManagerProps {
  initialCareers: Career[];
  initialApplications: CareerApplication[];
}

export default function CareersManager({
  initialCareers,
  initialApplications,
}: CareersManagerProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");

  // Jobs State
  const [careers, setCareers] = useState<Career[]>(initialCareers);
  const [applications, setApplications] = useState<CareerApplication[]>(initialApplications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deleteTargetJobId, setDeleteTargetJobId] = useState<number | null>(null);
  const [deleteTargetAppId, setDeleteTargetAppId] = useState<number | null>(null);
  const [viewingApp, setViewingApp] = useState<CareerApplication | null>(null);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");

  const refreshCareers = async () => {
    const data = await getAllCareers();
    setCareers(data);
  };

  const refreshApplications = async () => {
    const data = await getCareerApplications();
    setApplications(data);
  };

  const openCreateModal = () => {
    setEditingCareer(null);
    setDescription("");
    setRequirements("");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const openEditModal = (c: Career) => {
    setEditingCareer(c);
    setDescription(c.description || "");
    setRequirements(c.requirements || "");
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActionLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await saveCareerAction(formData);
    setIsActionLoading(false);

    if (res.success) {
      setFeedback({ success: true, message: "Career opening saved successfully!" });
      setIsModalOpen(false);
      await refreshCareers();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to save career" });
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTargetJobId) return;
    setIsActionLoading(true);

    const res = await deleteCareerAction(deleteTargetJobId);
    setIsActionLoading(false);
    setDeleteTargetJobId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Career opening deleted successfully." });
      await refreshCareers();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to delete" });
    }
  };

  const handleToggleStatus = async (job: Career) => {
    const newStatus = job.is_published ? false : true;
    const res = await toggleCareerStatusAction(job.id, newStatus);
    if (res.success) {
      setCareers((prev) =>
        prev.map((c) => (c.id === job.id ? { ...c, is_published: newStatus ? 1 : 0 } : c))
      );
    }
  };

  const handleStatusChange = async (appId: number, status: string) => {
    const res = await updateApplicationStatusAction(appId, status);
    if (res.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: status as any } : a))
      );
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteTargetAppId) return;
    setIsActionLoading(true);

    const res = await deleteApplicationAction(deleteTargetAppId);
    setIsActionLoading(false);
    setDeleteTargetAppId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Application record deleted." });
      await refreshApplications();
    } else {
      setFeedback({ success: false, message: res.error || "Failed to delete application" });
    }
  };

  // Filtered lists
  const filteredCareers = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.job_type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApplications = applications.filter((a) => {
    const matchesSearch =
      a.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      a.applicant_email.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = appStatusFilter === "all" || a.status === appStatusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Careers &amp; Recruitment
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Manage published job openings, candidate requirements, and track received candidate applications
          </p>
        </div>

        {activeTab === "jobs" && (
          <button
            onClick={openCreateModal}
            className="abid-btn abid-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={18} />
            <span>Post New Opening</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: feedback.success ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: feedback.success ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.92rem",
            fontWeight: 500,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="dashboard-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Openings</div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-secondary)", marginTop: "4px" }}>{careers.length}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--color-primary)", marginTop: "4px", fontWeight: 600 }}>
            {careers.filter(c => c.is_published).length} Active On Website
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Applications</div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-secondary)", marginTop: "4px" }}>{applications.length}</div>
          <div style={{ fontSize: "0.78rem", color: "#2563EB", marginTop: "4px", fontWeight: 600 }}>
            {applications.filter(a => a.resume_url).length} With Resumes
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Pending Review</div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>
            {applications.filter(a => a.status === "pending").length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#D97706", marginTop: "4px", fontWeight: 600 }}>
            Awaiting assessment
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Shortlisted</div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
            {applications.filter(a => a.status === "shortlisted").length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#059669", marginTop: "4px", fontWeight: 600 }}>
            Ready for interview
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #E2E8F0", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: activeTab === "jobs" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "jobs" ? "2px solid var(--color-primary)" : "2px solid transparent",
            marginBottom: "-2px",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Briefcase size={18} />
          <span>Job Openings ({careers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          style={{
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: activeTab === "applications" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "applications" ? "2px solid var(--color-primary)" : "2px solid transparent",
            marginBottom: "-2px",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Users size={18} />
          <span>Received Applications ({applications.length})</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="dashboard-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ position: "relative", minWidth: "260px", flex: 1, maxWidth: "400px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-light)",
            }}
          />
          <input
            type="text"
            placeholder={activeTab === "jobs" ? "Search roles, departments..." : "Search applicant name, email, role..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 38px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-surface-border)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        {activeTab === "applications" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Status:</span>
            <select
              value={appStatusFilter}
              onChange={(e) => setAppStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-surface-border)",
                fontSize: "0.88rem",
                outline: "none",
                background: "#FFF",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: JOB OPENINGS LIST */}
      {activeTab === "jobs" && (
        <div className="dashboard-card" style={{ overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="dashboard-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-surface-border)", background: "var(--color-surface-subtle)" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Role &amp; Department</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Type</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Compensation</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Location</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Status</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCareers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--color-surface-border)" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 600, color: "var(--color-secondary)", fontSize: "0.95rem" }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 500 }}>
                        {c.department}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "var(--color-text-main)" }}>
                      {c.job_type}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "var(--color-text-main)" }}>
                      {c.salary}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      {c.location || "Srinagar"}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        title="Click to toggle status"
                      >
                        <StatusBadge status={c.is_published ? "published" : "draft"} />
                      </button>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-surface-border)",
                            background: "#FFF",
                            color: "var(--color-secondary)",
                            cursor: "pointer",
                          }}
                          title="Edit opening"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetJobId(c.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-danger-bg)",
                            background: "var(--color-danger-bg)",
                            color: "var(--color-danger)",
                            cursor: "pointer",
                          }}
                          title="Delete opening"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCareers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No career positions found. Click &quot;Post New Opening&quot; above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS LIST */}
      {activeTab === "applications" && (
        <div className="dashboard-card" style={{ overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="dashboard-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-surface-border)", background: "var(--color-surface-subtle)" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Candidate</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Applied For</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Resume / Links</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Date</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Status</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "var(--color-text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--color-surface-border)" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 600, color: "var(--color-secondary)", fontSize: "0.95rem" }}>
                        {a.applicant_name}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                        <a href={`mailto:${a.applicant_email}`} style={{ color: "var(--color-accent)" }}>
                          {a.applicant_email}
                        </a>
                        {" • "}
                        <a href={`tel:${a.applicant_phone}`} style={{ color: "var(--color-text-main)" }}>
                          {a.applicant_phone}
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.88rem", fontWeight: 500, color: "var(--color-text-main)" }}>
                      {a.job_title}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {a.resume_url && (
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <Download size={13} />
                            <span>Resume</span>
                          </a>
                        )}
                        {a.portfolio_url && (
                          <a
                            href={a.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: "#F1F5F9",
                              color: "#334155",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={13} />
                            <span>Portfolio</span>
                          </a>
                        )}
                        {!a.resume_url && !a.portfolio_url && (
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>None</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : "Recently"}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          border: "1px solid var(--color-surface-border)",
                          background:
                            a.status === "shortlisted"
                              ? "#ECFDF5"
                              : a.status === "rejected"
                              ? "#FEF2F2"
                              : a.status === "reviewed"
                              ? "#EFF6FF"
                              : "#FFFBEB",
                          color:
                            a.status === "shortlisted"
                              ? "#059669"
                              : a.status === "rejected"
                              ? "#DC2626"
                              : a.status === "reviewed"
                              ? "#2563EB"
                              : "#D97706",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setViewingApp(a)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-surface-border)",
                            background: "#FFF",
                            color: "var(--color-secondary)",
                            cursor: "pointer",
                          }}
                          title="View cover note & full details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetAppId(a.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-danger-bg)",
                            background: "var(--color-danger-bg)",
                            color: "var(--color-danger)",
                            cursor: "pointer",
                          }}
                          title="Delete application"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No candidate applications found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: POST / EDIT CAREER */}
      {isModalOpen && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card" style={{ maxWidth: "680px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.35rem", color: "var(--color-secondary)" }}>
                {editingCareer ? "Edit Career Opening" : "Create Career Opening"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit}>
              {editingCareer && <input type="hidden" name="id" value={editingCareer.id} />}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="dashboard-label">
                    Job Title <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingCareer?.title || ""}
                    placeholder="e.g. Senior Interior Architect"
                    className="dashboard-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">
                    Department / Category <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    required
                    defaultValue={editingCareer?.department || ""}
                    placeholder="e.g. Architectural Design"
                    className="dashboard-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="dashboard-label">Job Type</label>
                  <select name="job_type" defaultValue={editingCareer?.job_type || "Full-time"} className="dashboard-input">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="dashboard-label">Compensation / Salary</label>
                  <input
                    type="text"
                    name="salary"
                    defaultValue={editingCareer?.salary || "₹6L - ₹10L / Year"}
                    placeholder="e.g. ₹8L - ₹12L / Year"
                    className="dashboard-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingCareer?.location || "Srinagar / Hybrid"}
                    placeholder="e.g. Srinagar / Hybrid"
                    className="dashboard-input"
                  />
                </div>
              </div>

              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="requirements" value={requirements} />

              <RichTextEditor
                label="Role Description & Responsibilities"
                value={description}
                onChange={setDescription}
                placeholder="Outline core responsibilities, project scope, and daily craftsmanship goals..."
                minHeight={140}
                required
              />

              <RichTextEditor
                label="Key Requirements / Qualifications"
                value={requirements}
                onChange={setRequirements}
                placeholder="e.g. 4+ years in luxury residential design, proficiency with AutoCAD, 3ds Max..."
                minHeight={110}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label className="dashboard-label">Sort Order</label>
                  <input
                    type="number"
                    name="sort_order"
                    defaultValue={editingCareer?.sort_order ?? 0}
                    className="dashboard-input"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    value="1"
                    defaultChecked={editingCareer ? Boolean(editingCareer.is_published) : true}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="is_published" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-secondary)", cursor: "pointer" }}>
                    Publish to Website
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isActionLoading}
                  className="abid-btn abid-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="abid-btn abid-btn-primary"
                >
                  {isActionLoading ? "Saving Opening..." : editingCareer ? "Update Opening" : "Publish Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW APPLICATION DETAILS */}
      {viewingApp && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card" style={{ maxWidth: "560px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase" }}>
                  Application Details
                </span>
                <h2 style={{ fontSize: "1.3rem", color: "var(--color-secondary)", margin: "2px 0 0 0" }}>
                  {viewingApp.applicant_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-text-main)", marginBottom: "20px" }}>
              <div style={{ padding: "12px", background: "var(--color-surface-subtle)", borderRadius: "var(--radius-sm)", marginBottom: "14px" }}>
                <div><strong>Applied Role:</strong> {viewingApp.job_title}</div>
                <div><strong>Email:</strong> {viewingApp.applicant_email}</div>
                <div><strong>Phone:</strong> {viewingApp.applicant_phone}</div>
                <div><strong>Date:</strong> {viewingApp.created_at ? new Date(viewingApp.created_at).toLocaleString() : "Recently"}</div>
              </div>

              {viewingApp.cover_note && (
                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ display: "block", marginBottom: "4px" }}>Cover Note / Pitch:</strong>
                  <div style={{ padding: "12px", background: "#FFF", border: "1px solid var(--color-surface-border)", borderRadius: "var(--radius-sm)", whiteSpace: "pre-wrap" }}>
                    {viewingApp.cover_note}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                {viewingApp.resume_url && (
                  <a
                    href={viewingApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="abid-btn abid-btn-primary"
                    style={{ fontSize: "0.85rem", padding: "8px 14px", textDecoration: "none" }}
                  >
                    <Download size={14} />
                    <span>Download Attached Resume</span>
                  </a>
                )}
                {viewingApp.portfolio_url && (
                  <a
                    href={viewingApp.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="abid-btn abid-btn-outline"
                    style={{ fontSize: "0.85rem", padding: "8px 14px", textDecoration: "none" }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Portfolio Link</span>
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="abid-btn abid-btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: DELETE JOB */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetJobId)}
        title="Delete Career Opening"
        message="Are you sure you want to delete this job opening? This will permanently remove it from the careers page."
        confirmLabel="Delete Opening"
        cancelLabel="Cancel"
        isLoading={isActionLoading}
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteTargetJobId(null)}
      />

      {/* CONFIRM DIALOG: DELETE APPLICATION */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetAppId)}
        title="Delete Candidate Application"
        message="Are you sure you want to delete this candidate application record? This cannot be undone."
        confirmLabel="Delete Application"
        cancelLabel="Cancel"
        isLoading={isActionLoading}
        onConfirm={handleDeleteApplication}
        onCancel={() => setDeleteTargetAppId(null)}
      />
    </div>
  );
}
