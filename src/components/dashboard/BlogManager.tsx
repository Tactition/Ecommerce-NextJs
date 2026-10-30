"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { getAllBlogPosts, deleteBlogPostAction } from "@/lib/actions/blog";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface BlogManagerProps {
  initialPosts: BlogPost[];
}

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getAllBlogPosts();
    setPosts(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsActionLoading(true);

    const res = await deleteBlogPostAction(deleteTargetId);
    setIsActionLoading(false);
    setDeleteTargetId(null);

    if (res.success) {
      setFeedback({ success: true, message: "Article deleted successfully." });
      await refreshData();
    } else {
      setFeedback({ success: false, message: res.error || "Delete failed" });
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--color-secondary)", marginBottom: "4px" }}>
            Interior Design Journal &amp; Articles
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
            Publish luxury interior guides, acoustic paneling trends, modular kitchen innovations, and project stories
          </p>
        </div>

        <Link
          href="/dashboard/blog/create"
          prefetch={true}
          className="abid-btn abid-btn-primary"
          style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
        >
          <Plus size={18} />
          <span>New Article</span>
        </Link>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: feedback.success ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: feedback.success ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.9rem",
            marginBottom: "20px",
            border: `1px solid ${feedback.success ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Published Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading articles...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No blog articles found. Click &quot;New Article&quot; to publish your first post.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "56px",
                          height: "42px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: "#0A111E",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={post.featured_image || "/assets/images/blog/blogThumb2_1.jpg"}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-secondary)" }}>{post.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          /blog/{post.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        backgroundColor: "var(--color-primary-light, #FFEBEA)",
                        color: "var(--color-primary, #FF4035)",
                      }}
                    >
                      {post.category || "General"}
                    </span>
                  </td>
                  <td>{post.author || "Wall Street Team"}</td>
                  <td>
                    <StatusBadge status={post.status} type="published" />
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 10px", fontSize: "0.82rem", textDecoration: "none" }}
                        title="View Live Article"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                        href={`/dashboard/blog/${post.id}/edit`}
                        prefetch={true}
                        className="abid-btn abid-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.82rem", textDecoration: "none" }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteTargetId(post.id)}
                        className="abid-btn"
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "var(--color-danger)",
                          border: "1px solid #FECACA",
                          padding: "6px 10px",
                          fontSize: "0.82rem",
                        }}
                        title="Delete Article"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Article?"
        message="Are you sure you want to permanently delete this blog post? It will be removed from the storefront and journal."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}
