import React, { useMemo } from "react";

function InstructorProfile({ id, users, modLog, onBack, onDeleteUpload }) {
  const u = users.find((x) => x.id === id);
  const inf = u?.instructor || {};
  const uploads = inf.uploads || { videos: [], files: [], quizzes: [] };
  const myLog = useMemo(() => modLog.filter(e => e.userId === id), [modLog, id]);

  if (!u) {
    return (
      <div className="admin-instructor-profile">
        <div className="admin-instructor-profile-header">
          <button className="admin-instructor-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <h1 className="admin-instructor-title">Instructor not found</h1>
        </div>
      </div>
    );
  }

  const uploadsCount = (uploads.videos?.length || 0) + (uploads.files?.length || 0);
  const videos = uploads.videos || [];
  const files = uploads.files || [];
  
  // Combine videos and files into a single content array
  const allContent = [
    ...videos.map((v, i) => ({ name: v, type: "video", index: i })),
    ...files.map((f, i) => ({ name: f, type: "file", index: i }))
  ];

  return (
    <div className="admin-instructor-profile">
      {/* Header with Back Button */}
      <div className="admin-instructor-profile-header">
        <button className="admin-instructor-back-btn" onClick={onBack} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>
        <h1 className="admin-instructor-title">Instructor Profile</h1>
      </div>

      {/* Profile Hero Card */}
      <div className="admin-instructor-hero">
        <div className="admin-instructor-hero-content">
          <div className="admin-instructor-hero-main">
            {u.profilePic ? (
              <img 
                src={u.profilePic} 
                alt={u.name}
                className="admin-instructor-avatar-img"
              />
            ) : (
              <div className="admin-instructor-avatar">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="admin-instructor-info">
              <h2 className="admin-instructor-name">{u.name}</h2>
              {u.headline && (
                <p className="admin-instructor-headline">{u.headline}</p>
              )}
              {u.location && (
                <div className="admin-instructor-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {(() => {
                    // Extract only the country from location (e.g., "Ankara, TR" -> "TR")
                    const locationParts = u.location.split(',').map(s => s.trim());
                    return locationParts.length > 1 ? locationParts[locationParts.length - 1] : u.location;
                  })()}
                </div>
              )}
              {inf.cvUrl && (
                <a 
                  className="admin-instructor-cv-btn" 
                  href={inf.cvUrl} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  View CV
                </a>
              )}
            </div>
          </div>
          <div className="admin-instructor-stats">
            <div className="admin-instructor-stat">
              <div className="admin-instructor-stat-value">{inf.likes || 0}</div>
              <div className="admin-instructor-stat-label">Likes</div>
            </div>
            <div className="admin-instructor-stat">
              <div className="admin-instructor-stat-value">{uploadsCount}</div>
              <div className="admin-instructor-stat-label">Uploads</div>
            </div>
          </div>
        </div>
      </div>

      {/* About and Quick Facts Grid */}
      <div className="admin-instructor-info-grid">
        <div className="admin-instructor-card">
          <h3 className="admin-instructor-card-title">About</h3>
          <p className="admin-instructor-about-text">
            {u.description || u.bio || "No description available."}
          </p>
        </div>

        <div className="admin-instructor-card">
          <h3 className="admin-instructor-card-title">Quick Facts</h3>
          <div className="admin-instructor-facts">
            <div className="admin-instructor-fact-item">
              <span className="admin-instructor-fact-label">Joined:</span>
              <span className="admin-instructor-fact-value">{u.joinedAt || "—"}</span>
            </div>
            <div className="admin-instructor-fact-item">
              <span className="admin-instructor-fact-label">Status:</span>
              <span className={`admin-instructor-status-badge ${u.status === "suspended" ? "suspended" : "active"}`}>
                <span className="admin-instructor-status-dot"></span>
                {u.status === "suspended" ? "Suspended" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="admin-instructor-uploads-grid">
        <div className="admin-instructor-card" style={{ gridColumn: "1 / -1" }}>
          <div className="admin-instructor-card-header">
            <h3 className="admin-instructor-card-title">Content</h3>
            <div className="admin-instructor-card-badge">{allContent.length}</div>
          </div>
          {allContent.length === 0 ? (
            <div className="admin-instructor-empty-uploads">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <p>No content uploaded yet</p>
            </div>
          ) : (
            <div className="admin-instructor-uploads-table-container">
              <table className="admin-instructor-uploads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allContent.map((item, idx) => (
                    <tr key={`${item.type}-${idx}`}>
                      <td>
                        <div className="admin-instructor-upload-item">
                          {item.type === "video" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="admin-instructor-delete-btn"
                          type="button"
                          onClick={() => {
                            const contentType = item.type === "video" ? "video" : "file";
                            const reason = prompt(`Reason for deleting this ${contentType}?`);
                            if (reason === null) return;
                            onDeleteUpload(id, `${item.type}s`, item.index, reason);
                          }}
                          title={`Delete ${item.type}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Deleted Content Section */}
      {myLog.length > 0 && (
        <div className="admin-instructor-card">
          <div className="admin-instructor-card-header">
            <h3 className="admin-instructor-card-title">Deleted Content</h3>
            <div className="admin-instructor-card-badge">{myLog.length}</div>
          </div>
          <div className="admin-instructor-uploads-table-container">
            <table className="admin-instructor-uploads-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {myLog.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="admin-instructor-log-date">
                        {new Date(e.at).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="admin-instructor-log-action">
                        Deleted {e.type.slice(0, -1)}: <strong>{e.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="admin-instructor-log-reason">{e.reason || "—"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorProfile;
