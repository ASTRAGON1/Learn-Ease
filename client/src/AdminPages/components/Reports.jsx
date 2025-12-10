import React, { useMemo } from "react";

function Reports({ reports, users, search, onOpenInstructor }) {
  const filteredReports = useMemo(() => {
    let filtered = [...reports];
    
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter((r) => {
          // Try to find user by ID or name
          let u = users.find(x => x.id === r.reporterId);
          if (!u && r.userName) {
            u = users.find(x => 
              x.name?.toLowerCase() === r.userName?.toLowerCase() ||
              x.email?.toLowerCase() === r.userName?.toLowerCase()
            );
          }
          return (
            (r.id || r._id)?.toString().toLowerCase().includes(searchLower) ||
            (r.topic && r.topic.toLowerCase().includes(searchLower)) ||
            (r.description && r.description.toLowerCase().includes(searchLower)) ||
            (r.userName && r.userName.toLowerCase().includes(searchLower)) ||
            (u && u.name?.toLowerCase().includes(searchLower))
          );
        });
      }
    
    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [reports, search, users]);

  const totalReports = reports.length;
  const filteredCount = filteredReports.length;

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

  const getUserDisplay = (report) => {
    // Try to find user by ID first, then by name
    let u = users.find(x => x.id === report.reporterId);
    if (!u && report.userName) {
      // Try to find by name (case-insensitive)
      u = users.find(x => 
        x.name?.toLowerCase() === report.userName?.toLowerCase() ||
        x.email?.toLowerCase() === report.userName?.toLowerCase()
      );
    }
    
    const userName = report.userName || "Unknown";
    
    if (!u) {
      // If user not found, use report data
      const nameParts = userName.split(' ');
      const initials = nameParts.length >= 2 
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : userName.slice(0, 2).toUpperCase();
      
      // Normalize role display
      let roleDisplay = report.fromRole || "User";
      if (roleDisplay === "instructor") {
        roleDisplay = "Teacher";
      } else if (roleDisplay === "student") {
        roleDisplay = "Student";
      }
      
      return {
        name: userName,
        role: roleDisplay,
        avatar: initials,
        isInstructor: false,
        userId: null
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
      isInstructor: u.role === "instructor",
      userId: u.id
    };
  };

  return (
    <div className="admin-reports">
      {/* Header Section */}
      <div className="admin-reports-header">
        <div className="admin-reports-header-content">
          <h1 className="admin-reports-title">Reports</h1>
          <p className="admin-reports-subtitle">Manage and review user-reported issues</p>
        </div>
        <div className="admin-reports-stats">
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{totalReports}</div>
            <div className="admin-reports-stat-label">Total Reports</div>
          </div>
          {search && (
            <div className="admin-reports-stat-item">
              <div className="admin-reports-stat-value">{filteredCount}</div>
              <div className="admin-reports-stat-label">Found</div>
            </div>
          )}
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="admin-reports-card">
        <div className="admin-reports-table-header">
          <h3 className="admin-reports-table-title">All Reports</h3>
          <div className="admin-reports-table-badge">
            {filteredCount} {search ? "found" : "total"}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="admin-reports-empty">
            <div className="admin-reports-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <p className="admin-reports-empty-text">
              {search ? "No reports found matching your search" : "No reports yet"}
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
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const userInfo = getUserDisplay(report);
                  return (
                    <tr key={report.id || report._id}>
                      <td>
                        <div className="admin-reports-id">
                          {report.id || report._id || "—"}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-report-topic-badge ${getTopicBadgeClass(report.topic)}`}>
                          {report.topic || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-reports-user">
                          <div className="admin-reports-user-avatar">
                            {userInfo.avatar}
                          </div>
                          <div className="admin-reports-user-info">
                            {userInfo.isInstructor && userInfo.userId ? (
                              <button
                                className="admin-reports-user-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInstructor(userInfo.userId);
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
                          {report.description || "—"}
                        </div>
                      </td>
                      <td>
                        <div className="admin-reports-date">
                          {formatDate(report.createdAt)}
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

export default Reports;
