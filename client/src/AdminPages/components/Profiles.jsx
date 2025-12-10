import React, { useMemo } from "react";

function Profiles({ profiles, users, search, onOpenInstructor, latestUploadFor }) {
  // Filter profiles by search
  const filteredStudentProfiles = useMemo(() => {
    let filtered = profiles.students || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((sp) => {
        const u = users.find((x) => x.id === sp.userId);
        return u && u.name.toLowerCase().includes(searchLower);
      });
    }
    return filtered;
  }, [profiles.students, users, search]);

  const filteredInstructorProfiles = useMemo(() => {
    let filtered = profiles.instructors || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((ip) => {
        const u = users.find((x) => x.id === ip.userId);
        return u && u.name.toLowerCase().includes(searchLower);
      });
    }
    return filtered;
  }, [profiles.instructors, users, search]);

  const totalStudents = profiles.students?.length || 0;
  const totalInstructors = profiles.instructors?.length || 0;
  const totalHours = useMemo(() => {
    return (profiles.students || []).reduce((sum, sp) => sum + (sp.hours || 0), 0);
  }, [profiles.students]);

  const avgScore = useMemo(() => {
    const students = profiles.students || [];
    if (students.length === 0) return 0;
    const total = students.reduce((sum, sp) => sum + (sp.performance?.avgScore || 0), 0);
    return Math.round(total / students.length);
  }, [profiles.students]);

  return (
    <div className="admin-profiles">
      {/* Header Section */}
      <div className="admin-profiles-header">
        <div className="admin-profiles-header-content">
          <h1 className="admin-profiles-title">Profiles</h1>
          <p className="admin-profiles-subtitle">View student performance and instructor contributions</p>
        </div>
        <div className="admin-profiles-stats">
          <div className="admin-profiles-stat-item">
            <div className="admin-profiles-stat-value">{totalStudents}</div>
            <div className="admin-profiles-stat-label">Students</div>
          </div>
          <div className="admin-profiles-stat-item">
            <div className="admin-profiles-stat-value">{totalInstructors}</div>
            <div className="admin-profiles-stat-label">Instructors</div>
          </div>
          <div className="admin-profiles-stat-item">
            <div className="admin-profiles-stat-value">{totalHours}</div>
            <div className="admin-profiles-stat-label">Total Hours</div>
          </div>
          <div className="admin-profiles-stat-item">
            <div className="admin-profiles-stat-value">{avgScore}%</div>
            <div className="admin-profiles-stat-label">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Profiles Cards Grid */}
      <div className="admin-profiles-grid">
        {/* Students Card */}
        <div className="admin-profiles-card">
          <div className="admin-profiles-card-header">
            <div>
              <h3 className="admin-profiles-card-title">Students</h3>
              <p className="admin-profiles-card-subtitle">Student performance metrics</p>
            </div>
            <div className="admin-profiles-card-badge">
              {filteredStudentProfiles.length} {search ? "found" : "total"}
            </div>
          </div>

          {filteredStudentProfiles.length === 0 ? (
            <div className="admin-profiles-empty">
              <div className="admin-profiles-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p className="admin-profiles-empty-text">
                {search ? "No students found" : "No students yet"}
              </p>
            </div>
          ) : (
            <div className="admin-profiles-table-container">
              <table className="admin-profiles-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Hours Studied</th>
                    <th>Avg Score</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentProfiles.map((sp) => {
                    const u = users.find((x) => x.id === sp.userId) || { name: sp.userId || "Unknown" };
                    const hours = sp.hours || 0;
                    const avgScore = sp.performance?.avgScore || 0;
                    const completion = Math.round((sp.performance?.completionRate || 0) * 100);
                    
                    return (
                      <tr key={sp.userId}>
                        <td>
                          <div className="admin-profiles-name">
                            <div className="admin-profiles-avatar admin-profiles-avatar-student">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="admin-profiles-name-text">{u.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-profiles-hours">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {hours}h
                          </div>
                        </td>
                        <td>
                          <div className="admin-profiles-score">
                            <div className="admin-profiles-score-bar">
                              <div 
                                className="admin-profiles-score-fill"
                                style={{ width: `${Math.min(avgScore, 100)}%` }}
                              ></div>
                            </div>
                            <span className="admin-profiles-score-value">{avgScore}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-profiles-completion">
                            <div className="admin-profiles-completion-bar">
                              <div 
                                className="admin-profiles-completion-fill"
                                style={{ width: `${Math.min(completion, 100)}%` }}
                              ></div>
                            </div>
                            <span className="admin-profiles-completion-value">{completion}%</span>
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

        {/* Instructors Card */}
        <div className="admin-profiles-card">
          <div className="admin-profiles-card-header">
            <div>
              <h3 className="admin-profiles-card-title">Instructors</h3>
              <p className="admin-profiles-card-subtitle">Instructor uploads and contributions</p>
            </div>
            <div className="admin-profiles-card-badge">
              {filteredInstructorProfiles.length} {search ? "found" : "total"}
            </div>
          </div>

          {filteredInstructorProfiles.length === 0 ? (
            <div className="admin-profiles-empty">
              <div className="admin-profiles-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <p className="admin-profiles-empty-text">
                {search ? "No instructors found" : "No instructors yet"}
              </p>
            </div>
          ) : (
            <div className="admin-profiles-table-container">
              <table className="admin-profiles-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Latest Upload</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructorProfiles.map((ip) => {
                    const u = users.find((x) => x.id === ip.userId) || { name: ip.userId || "Unknown", category: "—" };
                    const latestUpload = latestUploadFor(ip.userId);
                    
                    return (
                      <tr
                        key={ip.userId}
                        className="admin-profiles-instructor-row"
                        onClick={() => onOpenInstructor(ip.userId)}
                        title="Click to view instructor profile"
                      >
                        <td>
                          <div className="admin-profiles-name">
                            <div className="admin-profiles-avatar admin-profiles-avatar-instructor">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="admin-profiles-name-text">{u.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-profiles-upload">
                            {latestUpload && latestUpload !== "—" ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <span className="admin-profiles-upload-text">{latestUpload}</span>
                              </>
                            ) : (
                              <span className="admin-profiles-upload-empty">No uploads yet</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="admin-profiles-category-badge">
                            {u.category || "—"}
                          </span>
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
    </div>
  );
}

export default Profiles;
