import React, { useMemo, useState, useEffect } from "react";

function InstructorProfile({ id, users, modLog, onBack, onDeleteUpload }) {
  const u = users.find((x) => x.id === id);
  const inf = u?.instructor || {};
  const uploads = inf.uploads || { videos: [], files: [], quizzes: [] };
  const myLog = useMemo(() => modLog.filter(e => e.userId === id), [modLog, id]);
  
  // State for content from database
  const [contentFromDB, setContentFromDB] = useState([]);
  const [quizzesFromDB, setQuizzesFromDB] = useState([]);
  const [deletedContentFromDB, setDeletedContentFromDB] = useState([]);
  const [deletedQuizzesFromDB, setDeletedQuizzesFromDB] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(true);
  
  // Format joined date nicely
  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Fetch content and quizzes from database
  useEffect(() => {
    const fetchContent = async () => {
      if (!u?.email) {
        setLoadingContent(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Fetch content using admin endpoint
        const contentResponse = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(u.email)}/content`);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setContentFromDB(contentData.data || []);
        }
        
        // Fetch quizzes using admin endpoint
        const quizzesResponse = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(u.email)}/quizzes`);
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setQuizzesFromDB(quizzesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [u?.email]);

  // Fetch deleted content and quizzes from database
  useEffect(() => {
    const fetchDeletedContent = async () => {
      if (!u?.email) {
        setLoadingDeleted(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Fetch deleted content using admin endpoint
        const deletedContentResponse = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(u.email)}/deleted-content`);
        if (deletedContentResponse.ok) {
          const deletedContentData = await deletedContentResponse.json();
          setDeletedContentFromDB(deletedContentData.data || []);
        }
        
        // Fetch deleted quizzes using admin endpoint
        const deletedQuizzesResponse = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(u.email)}/deleted-quizzes`);
        if (deletedQuizzesResponse.ok) {
          const deletedQuizzesData = await deletedQuizzesResponse.json();
          setDeletedQuizzesFromDB(deletedQuizzesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching deleted content:', error);
      } finally {
        setLoadingDeleted(false);
      }
    };

    fetchDeletedContent();
  }, [u?.email]);

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

  const uploadsCount = (uploads.videos?.length || 0) + (uploads.files?.length || 0) + (uploads.quizzes?.length || 0);
  const videos = uploads.videos || [];
  const files = uploads.files || [];
  const quizzes = uploads.quizzes || [];
  
  // Combine content and quizzes from database
  const allContent = useMemo(() => {
    const combined = [
      ...contentFromDB.map((c) => ({ 
        name: c.title, 
        type: c.type || "file", 
        status: c.status,
        id: c._id,
        category: c.category,
        difficulty: c.difficulty
      })),
      ...quizzesFromDB.map((q) => ({ 
        name: q.title, 
        type: "quiz", 
        status: q.status,
        id: q._id,
        category: q.category,
        difficulty: q.difficulty
      }))
    ];
    return combined;
  }, [contentFromDB, quizzesFromDB]);

  // Combine deleted content and quizzes from database
  const allDeletedContent = useMemo(() => {
    const combined = [
      ...deletedContentFromDB.map((c) => ({ 
        name: c.title, 
        type: c.type || "file", 
        status: c.status,
        previousStatus: c.previousStatus,
        id: c._id,
        category: c.category,
        difficulty: c.difficulty,
        deletedAt: c.deletedAt,
        createdAt: c.createdAt
      })),
      ...deletedQuizzesFromDB.map((q) => ({ 
        name: q.title, 
        type: "quiz", 
        status: q.status,
        previousStatus: q.previousStatus,
        id: q._id,
        category: q.category,
        difficulty: q.difficulty,
        deletedAt: q.updatedAt, // Use updatedAt as deletion date for quizzes
        createdAt: q.createdAt
      }))
    ];
    return combined;
  }, [deletedContentFromDB, deletedQuizzesFromDB]);

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
            {inf.followers !== undefined && (
              <div className="admin-instructor-stat">
                <div className="admin-instructor-stat-value">{inf.followers || 0}</div>
                <div className="admin-instructor-stat-label">Followers</div>
              </div>
            )}
            {inf.rating !== undefined && (
              <div className="admin-instructor-stat">
                <div className="admin-instructor-stat-value">
                  {inf.rating ? `⭐ ${inf.rating.toFixed(1)}` : '—'}
                </div>
                <div className="admin-instructor-stat-label">Rating</div>
              </div>
            )}
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
            {u.email && (
              <div className="admin-instructor-fact-item">
                <span className="admin-instructor-fact-label">Email:</span>
                <span className="admin-instructor-fact-value">{u.email}</span>
              </div>
            )}
            <div className="admin-instructor-fact-item">
              <span className="admin-instructor-fact-label">Joined:</span>
              <span className="admin-instructor-fact-value">{formatJoinedDate(u.joinedAt || u.createdAt)}</span>
            </div>
            {u.headline && (
              <div className="admin-instructor-fact-item">
                <span className="admin-instructor-fact-label">Headline:</span>
                <span className="admin-instructor-fact-value">{u.headline}</span>
              </div>
            )}
            <div className="admin-instructor-fact-item">
              <span className="admin-instructor-fact-label">Status:</span>
              <span className={`admin-instructor-status-badge ${u.status === "suspended" ? "suspended" : "active"}`}>
                <span className="admin-instructor-status-dot"></span>
                {u.status === "suspended" ? "Suspended" : u.status === "pending" ? "Pending" : "Active"}
              </span>
            </div>
            {u.online !== undefined && (
              <div className="admin-instructor-fact-item">
                <span className="admin-instructor-fact-label">Online:</span>
                <span className={`admin-instructor-status-badge ${u.online ? "active" : "offline"}`}>
                  <span className="admin-instructor-status-dot"></span>
                  {u.online ? "Online" : "Offline"}
                </span>
              </div>
            )}
          </div>
          
          {/* Skills Section */}
          {inf.skills && inf.skills.length > 0 && (
            <>
              <h4 className="admin-instructor-card-subtitle">Skills & Expertise</h4>
              <div className="admin-instructor-skills">
                {inf.skills.map((skill, idx) => (
                  <span key={idx} className="admin-instructor-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="admin-instructor-uploads-grid">
        <div className="admin-instructor-card" style={{ gridColumn: "1 / -1" }}>
          <div className="admin-instructor-card-header">
            <h3 className="admin-instructor-card-title">Content</h3>
            <div className="admin-instructor-card-badge">{allContent.length}</div>
          </div>
          {loadingContent ? (
            <div className="admin-instructor-empty-uploads">
              <p>Loading content...</p>
            </div>
          ) : allContent.length === 0 ? (
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
                    <th>Type</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {allContent.map((item, idx) => (
                    <tr key={`${item.type}-${item.id || idx}`}>
                      <td>
                        <div className="admin-instructor-upload-type">
                          {item.type === "video" ? (
                            <span className="admin-instructor-type-badge video">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                              </svg>
                              Video
                            </span>
                          ) : item.type === "quiz" ? (
                            <span className="admin-instructor-type-badge quiz">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                              Quiz
                            </span>
                          ) : item.type === "image" ? (
                            <span className="admin-instructor-type-badge file">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              Image
                            </span>
                          ) : (
                            <span className="admin-instructor-type-badge file">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                              </svg>
                              {item.type === "pdf" ? "PDF" : "File"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-instructor-upload-item">
                          <span>{item.name}</span>
                          {item.difficulty && (
                            <span style={{ 
                              marginLeft: '8px', 
                              fontSize: '12px', 
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {item.difficulty}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-instructor-status-badge ${item.status === 'published' ? 'active' : 'pending'}`}>
                          <span className="admin-instructor-status-dot"></span>
                          {item.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {item.category === 'autism' ? 'Autism' : item.category === 'downSyndrome' ? 'Down Syndrome' : item.category || '—'}
                        </span>
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
      {(allDeletedContent.length > 0 || !loadingDeleted) && (
        <div className="admin-instructor-uploads-grid">
          <div className="admin-instructor-card" style={{ gridColumn: "1 / -1" }}>
            <div className="admin-instructor-card-header">
              <h3 className="admin-instructor-card-title">Deleted Content</h3>
              <div className="admin-instructor-card-badge">{allDeletedContent.length}</div>
            </div>
            {loadingDeleted ? (
              <div className="admin-instructor-empty-uploads">
                <p>Loading deleted content...</p>
              </div>
            ) : allDeletedContent.length === 0 ? (
              <div className="admin-instructor-empty-uploads">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <p>No deleted content</p>
              </div>
            ) : (
              <div className="admin-instructor-uploads-table-container">
                <table className="admin-instructor-uploads-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Previous Status</th>
                      <th>Deleted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDeletedContent.map((item, idx) => (
                      <tr key={`deleted-${item.type}-${item.id || idx}`} style={{ opacity: 0.7 }}>
                        <td>
                          <div className="admin-instructor-upload-type">
                            {item.type === "video" ? (
                              <span className="admin-instructor-type-badge video" style={{ opacity: 0.7 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                                Video
                              </span>
                            ) : item.type === "quiz" ? (
                              <span className="admin-instructor-type-badge quiz" style={{ opacity: 0.7 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                Quiz
                              </span>
                            ) : item.type === "image" ? (
                              <span className="admin-instructor-type-badge file" style={{ opacity: 0.7 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                  <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                Image
                              </span>
                            ) : (
                              <span className="admin-instructor-type-badge file" style={{ opacity: 0.7 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                                {item.type === "pdf" || item.type === "document" ? "Document" : "File"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="admin-instructor-upload-item">
                            <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{item.name}</span>
                            {item.difficulty && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '12px', 
                                color: '#9ca3af',
                                background: '#f9fafb',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}>
                                {item.difficulty}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                            {item.category === 'autism' ? 'Autism' : item.category === 'downSyndrome' ? 'Down Syndrome' : item.category || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-instructor-status-badge ${item.previousStatus === 'published' ? 'active' : 'pending'}`} style={{ opacity: 0.6 }}>
                            <span className="admin-instructor-status-dot"></span>
                            {item.previousStatus === 'published' ? 'Was Published' : item.previousStatus === 'draft' ? 'Was Draft' : '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorProfile;
