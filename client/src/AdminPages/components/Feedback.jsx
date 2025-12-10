import React, { useMemo } from "react";

function Feedback({ feedback, users, search, onToggleVisibility, onOpenInstructor }) {
  // Stars function similar to landing page
  const stars = (n) => {
    const rating = n || 5; // Default to 5 if no rating
    return "★".repeat(Math.max(0, rating)) + "☆".repeat(Math.max(0, 5 - rating));
  };
  const filteredFeedback = useMemo(() => {
    let filtered = [...feedback];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((f) => {
        const u = users.find(x => x.id === f.reporterId);
        return (
          f.id?.toLowerCase().includes(searchLower) ||
          (f.topic && f.topic.toLowerCase().includes(searchLower)) ||
          (f.description && f.description.toLowerCase().includes(searchLower)) ||
          (u && u.name?.toLowerCase().includes(searchLower))
        );
      });
    }
    
    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [feedback, search, users]);

  const totalFeedback = feedback.length;
  const filteredCount = filteredFeedback.length;
  const visibleCount = feedback.filter(f => f.show || f.visible).length;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getTopicBadgeClass = (topic) => {
    const topicLower = topic?.toLowerCase() || "";
    if (topicLower.includes("login") || topicLower.includes("account")) {
      return "admin-report-topic-badge-login";
    } else if (topicLower.includes("upload")) {
      return "admin-report-topic-badge-upload";
    } else if (topicLower.includes("content")) {
      return "admin-report-topic-badge-content";
    } else if (topicLower.includes("stats") || topicLower.includes("analytics")) {
      return "admin-report-topic-badge-stats";
    } else if (topicLower.includes("navigation")) {
      return "admin-report-topic-badge-nav";
    }
    return "admin-report-topic-badge-default";
  };

  const getUserDisplay = (feedbackItem) => {
    const u = users.find(x => x.id === feedbackItem.reporterId);
    const userName = feedbackItem.userName || "Unknown";
    
    if (!u) {
      // If user not found, use feedback data
      const nameParts = userName.split(' ');
      const initials = nameParts.length >= 2 
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : userName.slice(0, 2).toUpperCase();
      
      return {
        name: userName,
        role: feedbackItem.fromRole || "User",
        avatar: initials,
        isInstructor: false
      };
    }
    
    // If user found, use user data
    const nameParts = (u.name || userName).split(' ');
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (u.name || userName).slice(0, 2).toUpperCase();
    
    // Normalize role display
    let roleDisplay = u.role || "User";
    if (roleDisplay === "instructor") {
      roleDisplay = "Teacher";
    } else if (roleDisplay === "student") {
      roleDisplay = "Student";
    }
    
    return {
      name: u.name || userName,
      role: roleDisplay,
      avatar: initials,
      isInstructor: u.role === "instructor"
    };
  };

  return (
    <div className="admin-reports">
      {/* Header Section */}
      <div className="admin-reports-header">
        <div className="admin-reports-header-content">
          <h1 className="admin-reports-title">Feedback</h1>
          <p className="admin-reports-subtitle">Manage and review user feedback</p>
        </div>
        <div className="admin-reports-stats">
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{totalFeedback}</div>
            <div className="admin-reports-stat-label">Total Feedback</div>
          </div>
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{visibleCount}</div>
            <div className="admin-reports-stat-label">Visible</div>
          </div>
          {search && (
            <div className="admin-reports-stat-item">
              <div className="admin-reports-stat-value">{filteredCount}</div>
              <div className="admin-reports-stat-label">Found</div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Table Card */}
      <div className="admin-reports-card">
        <div className="admin-reports-table-header">
          <h3 className="admin-reports-table-title">All Feedback</h3>
          <div className="admin-reports-table-badge">
            {filteredCount} {search ? "found" : "total"}
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="admin-reports-empty">
            <div className="admin-reports-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="admin-reports-empty-text">
              {search ? "No feedback found matching your search" : "No feedback yet"}
            </p>
            {search && (
              <p className="admin-reports-empty-hint">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="admin-reports-table-container">
            <table className="admin-reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Topic</th>
                  <th>From</th>
                  <th>Description</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((feedbackItem) => {
                  const userInfo = getUserDisplay(feedbackItem);
                  return (
                    <tr key={feedbackItem.id || feedbackItem._id}>
                      <td>
                        <div className="admin-reports-id">
                          {feedbackItem.id || feedbackItem._id || "—"}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-report-topic-badge ${getTopicBadgeClass(feedbackItem.topic)}`}>
                          {feedbackItem.topic || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-reports-user">
                          <div className="admin-reports-user-avatar">
                            {userInfo.avatar}
                          </div>
                          <div className="admin-reports-user-info">
                            {userInfo.isInstructor ? (
                              <button
                                className="admin-reports-user-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInstructor(feedbackItem.reporterId);
                                }}
                                title="Click to view instructor profile"
                              >
                                {userInfo.name}
                              </button>
                            ) : (
                              <span className="admin-reports-user-name">{userInfo.name}</span>
                            )}
                            <span className="admin-reports-user-role">{userInfo.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-reports-description">
                          {feedbackItem.description || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "16px",
                          color: "#fbbf24",
                          fontWeight: "500"
                        }}>
                          {stars(feedbackItem.rating)}
                        </div>
                      </td>
                      <td>
                        {(feedbackItem.show || feedbackItem.visible) ? (
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "500",
                            background: "#D1FAE5",
                            color: "#10b981"
                          }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                            Shown
                          </span>
                        ) : (
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "500",
                            background: "#F3F4F6",
                            color: "#6b7280"
                          }}>
                            Hidden
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-reports-date">
                          {formatDate(feedbackItem.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!(feedbackItem.show || feedbackItem.visible) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleVisibility(feedbackItem.id, true);
                              }}
                              type="button"
                              style={{
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              Show feedback
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleVisibility(feedbackItem.id, false);
                              }}
                              type="button"
                              style={{
                                background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                                color: "#6b7280",
                                border: "1.5px solid #e5e7eb",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
                                e.target.style.color = "#dc2626";
                                e.target.style.borderColor = "#fca5a5";
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)";
                                e.target.style.color = "#6b7280";
                                e.target.style.borderColor = "#e5e7eb";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                              Hide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;

