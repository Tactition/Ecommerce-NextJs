import React from "react";

interface StatusBadgeProps {
  status: string | number;
  type?: "published" | "active" | "submission";
}

export default function StatusBadge({ status, type = "published" }: StatusBadgeProps) {
  let isPositive = false;
  let label = String(status);

  if (type === "published") {
    isPositive = status === 1 || status === "published";
    label = isPositive ? "Published" : "Draft";
  } else if (type === "active") {
    isPositive = status === 1 || status === "active";
    label = isPositive ? "Active" : "Inactive";
  } else if (type === "submission") {
    if (status === "unread") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 700,
            backgroundColor: "#FEF3C7",
            color: "#D97706",
          }}
        >
          ● Unread
        </span>
      );
    } else if (status === "read") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 700,
            backgroundColor: "#ECFDF5",
            color: "#059669",
          }}
        >
          ● Responded
        </span>
      );
    } else {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 700,
            backgroundColor: "#F1F5F9",
            color: "#64748B",
          }}
        >
          ● Archived
        </span>
      );
    }
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "0.78rem",
        fontWeight: 700,
        backgroundColor: isPositive ? "var(--color-success-bg)" : "var(--color-warning-bg)",
        color: isPositive ? "var(--color-success)" : "var(--color-warning)",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isPositive ? "var(--color-success)" : "var(--color-warning)",
        }}
      />
      <span>{label}</span>
    </span>
  );
}
