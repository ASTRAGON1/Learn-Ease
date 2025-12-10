import React, { useMemo } from "react";
import Table from "./Table";

function InstructorApplications({ applications = [], users = [], search, onDecideApplication, onReopenApplication, onOpenInstructor }) {
  // Filter applications by search
  const filteredApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    if (!search) return applications;
    const searchLower = search.toLowerCase();
    return applications.filter((app) =>
      (app.name && app.name.toLowerCase().includes(searchLower)) ||
      (app.email && app.email.toLowerCase().includes(searchLower)) ||
      (app.description && app.description.toLowerCase().includes(searchLower))
    );
  }, [applications, search]);

  const cols = [
    {
      key: "name",
      label: "Name",
      render: (name, row) => {
        // If application is accepted, check if user exists and make name clickable
        if (row.status === "accepted") {
          const user = users.find(u => u.name === name && u.role === "instructor");
          if (user) {
            return (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  flexShrink: 0
                }}>
                  {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span
                  style={{ cursor: "pointer", color: "#4A0FAD", textDecoration: "none", fontWeight: "500" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInstructor(user.id);
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  title="Click to view instructor profile"
                >
                  {name}
                </span>
              </div>
            );
          }
        }
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              flexShrink: 0
            }}>
              {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span style={{ fontWeight: "500" }}>{name}</span>
          </div>
        );
      },
    },
    { 
      key: "email", 
      label: "Email",
      render: (email) => (
        <span style={{ color: "#6b7280", fontSize: "14px" }}>{email}</span>
      )
    },
    { 
      key: "submittedAt", 
      label: "Submitted",
      render: (date) => (
        <span style={{ color: "#6b7280", fontSize: "14px" }}>{date}</span>
      )
    },
    { 
      key: "cvUrl", 
      label: "CV", 
      render: (v) => (
        <a 
          href={v} 
          target="_blank" 
          rel="noreferrer"
          style={{
            color: "#4A0FAD",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
            padding: "4px 12px",
            borderRadius: "6px",
            background: "#F3EFFF",
            display: "inline-block",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#4A0FAD";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#F3EFFF";
            e.target.style.color = "#4A0FAD";
          }}
        >
          View CV
        </a>
      )
    },
    { 
      key: "description", 
      label: "About",
      render: (desc) => (
        <span style={{ color: "#1a1a1a", fontSize: "14px", lineHeight: "1.5" }}>{desc}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) =>
        row.status === "pending"
          ? <span className="badge purple" title="Awaiting review" style={{ 
              background: "#F3EFFF", 
              color: "#4A0FAD", 
              padding: "6px 12px", 
              borderRadius: "20px", 
              fontSize: "13px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4A0FAD" }}></span>
              Pending
            </span>
          : row.status === "accepted"
          ? <span className="badge green" style={{ 
              background: "#D1FAE5", 
              color: "#10b981", 
              padding: "6px 12px", 
              borderRadius: "20px", 
              fontSize: "13px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
              Accepted
            </span>
          : row.status === "declined"
          ? <span className="badge red" title={row.declinedReason || ""} style={{ 
              background: "#FEE2E2", 
              color: "#ef4444", 
              padding: "6px 12px", 
              borderRadius: "20px", 
              fontSize: "13px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>
              Declined
            </span>
          : row.status,
    },
  ];

  return (
    <div className="le-content" style={{ padding: "24px" }}>
      <div className="section-title" style={{ marginBottom: "24px" }}>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: "700", 
          color: "#1a1a1a", 
          margin: "0 0 8px 0" 
        }}>
          Instructor Applications
        </h2>
        <p style={{ 
          color: "#6b7280", 
          fontSize: "14px", 
          margin: "0" 
        }}>
          Review and manage instructor applications
        </p>
      </div>
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        {filteredApplications.length === 0 ? (
          <div style={{
            padding: "60px 24px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ margin: "0 auto 16px", opacity: 0.5 }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a1a",
              margin: "0 0 8px 0"
            }}>
              No applications found
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0"
            }}>
              {applications.length === 0 
                ? "No instructor applications have been submitted yet."
                : "No applications match your search criteria."}
            </p>
          </div>
        ) : (
          <Table
            columns={[
              ...cols,
              {
                key: "actions",
                label: "Actions",
                render: (_, row) => (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {row.status === "pending" && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDecideApplication(row.id, "accept");
                          }} 
                          type="button"
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#059669";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#10b981";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                          }}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDecideApplication(row.id, "decline");
                          }} 
                          type="button"
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            rows={filteredApplications}
          />
        )}
      </div>
    </div>
  );
}

export default InstructorApplications;

