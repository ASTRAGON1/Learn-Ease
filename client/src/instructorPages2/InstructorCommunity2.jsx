import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorDashboard2.css";

/**
 * Placeholder for the new Instructor Community page
 * This will be replaced with the full community page implementation
 */
export default function InstructorCommunity2() {
  const navigate = useNavigate();

  return (
    <div className="ld-page">
      <div className="ld-main">
        <div className="ld-content" style={{ textAlign: "center", paddingTop: "100px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "16px", color: "#3F3D56" }}>Community Page</h1>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px" }}>
            This page is coming soon. The new community page will be implemented here.
          </p>
          <button
            onClick={() => navigate("/instructor-dashboard-2")}
            style={{
              padding: "12px 24px",
              background: "#4A0FAD",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

