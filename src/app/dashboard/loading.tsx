import React from "react";

export default function DashboardLoading() {
  return (
    <div style={{ padding: "8px 0", animation: "fadeIn 0.15s ease-out" }}>
      {/* Header Skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              width: "220px",
              height: "28px",
              borderRadius: "8px",
              background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "340px",
              height: "16px",
              borderRadius: "6px",
              background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
        <div
          style={{
            width: "140px",
            height: "40px",
            borderRadius: "8px",
            background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>

      {/* Filter Bar Skeleton */}
      <div
        style={{
          height: "60px",
          borderRadius: "14px",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          marginBottom: "20px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "280px",
            height: "34px",
            borderRadius: "8px",
            background: "linear-gradient(90deg, #F8FAFC 25%, #EEF2F6 50%, #F8FAFC 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>

      {/* Table Skeleton */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: i === 5 ? "none" : "1px solid #F1F5F9",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 2 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "60%",
                    height: "16px",
                    borderRadius: "6px",
                    background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    width: "35%",
                    height: "12px",
                    borderRadius: "4px",
                    background: "linear-gradient(90deg, #F8FAFC 25%, #EEF2F6 50%, #F8FAFC 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                width: "100px",
                height: "22px",
                borderRadius: "6px",
                background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                flex: 1,
              }}
            />

            <div
              style={{
                width: "70px",
                height: "22px",
                borderRadius: "6px",
                background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />

            <div
              style={{
                width: "80px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
