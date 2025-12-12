import React, { useState } from "react";

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto"
        }}
      >
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            color: "#1a1a1a",
            fontFamily: "'Poppins', sans-serif"
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#1a1a1a"}
            onMouseLeave={(e) => e.target.style.color = "#6b7280"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LearningPaths({ 
  learningPaths, 
  onRenameCourse, 
  onRenameTopic, 
  onRenameLesson,
  onCreatePath,
  onCreateCourse,
  onCreateTopic,
  onCreateLesson,
  onBulkImport,
  onDeletePath,
  onDeleteCourse,
  onDeleteTopic,
  onDeleteLesson
}) {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'createPath', 'createCourse', 'createTopic', 'createLesson', 'renameCourse', 'renameTopic', 'renameLesson', 'deletePath', 'deleteCourse', 'deleteTopic', 'deleteLesson'
    data: null // { pathId, courseId, topicId, lessonId, currentName, etc. }
  });
  
  const [formData, setFormData] = useState({
    name: "",
    type: ""
  });
  
  const [importData, setImportData] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const openModal = (type, data = null) => {
    setModalState({ isOpen: true, type, data });
    setFormData({
      name: data?.currentName || "",
      type: data?.currentType || ""
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, data: null });
    setFormData({ name: "", type: "" });
  };

  const handleSubmit = async () => {
    // Skip name validation for delete operations
    const isDeleteOperation = modalState.type?.includes('delete');
    if (!isDeleteOperation && !formData.name.trim()) return;

    switch (modalState.type) {
      case 'createPath':
        if (!formData.type) {
          alert("Please select a path type");
          return;
        }
        onCreatePath(formData.name.trim(), formData.type);
        break;
      case 'createCourse':
        onCreateCourse(modalState.data.pathId, formData.name.trim());
        break;
      case 'createTopic':
        onCreateTopic(modalState.data.pathId, modalState.data.courseId, formData.name.trim());
        break;
      case 'createLesson':
        onCreateLesson(modalState.data.pathId, modalState.data.courseId, modalState.data.topicId, formData.name.trim());
        break;
      case 'renameCourse':
        onRenameCourse(modalState.data.pathId, modalState.data.courseId, formData.name.trim());
        break;
      case 'renameTopic':
        onRenameTopic(modalState.data.pathId, modalState.data.courseId, modalState.data.topicId, formData.name.trim());
        break;
      case 'renameLesson':
        onRenameLesson(modalState.data.pathId, modalState.data.courseId, modalState.data.topicId, modalState.data.lessonId, formData.name.trim());
        break;
      case 'bulkImport':
        await handleBulkImport();
        return; // Don't close modal yet, let handleBulkImport handle it
      case 'deletePath':
        await onDeletePath(modalState.data.pathId);
        break;
      case 'deleteCourse':
        await onDeleteCourse(modalState.data.pathId, modalState.data.courseId);
        break;
      case 'deleteTopic':
        await onDeleteTopic(modalState.data.pathId, modalState.data.courseId, modalState.data.topicId);
        break;
      case 'deleteLesson':
        await onDeleteLesson(modalState.data.pathId, modalState.data.courseId, modalState.data.topicId, modalState.data.lessonId);
        break;
    }
    closeModal();
  };

  const handleBulkImport = async () => {
    if (!importData.trim()) {
      alert("Please paste or upload JSON data");
      return;
    }

    setImportLoading(true);
    setImportResult(null);

    try {
      let data;
      try {
        data = JSON.parse(importData);
      } catch (parseError) {
        setImportResult({
          success: false,
          error: "Invalid JSON format. Please check your JSON syntax."
        });
        setImportLoading(false);
        return;
      }

      const result = await onBulkImport(data);
      setImportResult(result);
      
      if (result.success) {
        setImportData("");
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error.message || "An error occurred during import"
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert("Please upload a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setImportData(JSON.stringify(json, null, 2));
      } catch (error) {
        alert("Error reading file. Please make sure it's valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const totalCourses = learningPaths.reduce((sum, path) => sum + path.courses.length, 0);
  const totalTopics = learningPaths.reduce((sum, path) => 
    sum + path.courses.reduce((cSum, course) => cSum + course.topics.length, 0), 0
  );
  const totalLessons = learningPaths.reduce((sum, path) => 
    sum + path.courses.reduce((cSum, course) => 
      cSum + course.topics.reduce((tSum, topic) => tSum + topic.lessons.length, 0), 0
    ), 0
  );

  return (
    <div className="admin-reports">
      {/* Header Section */}
      <div className="admin-reports-header">
        <div className="admin-reports-header-content">
          <h1 className="admin-reports-title">Learning Paths</h1>
          <p className="admin-reports-subtitle">
            Create and manage learning paths. Structure: Path → Courses → Topics → Lessons. You can create, rename, and organize all content.
          </p>
        </div>
        <div className="admin-reports-stats">
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{learningPaths.length}</div>
            <div className="admin-reports-stat-label">Paths</div>
          </div>
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{totalCourses}</div>
            <div className="admin-reports-stat-label">Courses</div>
          </div>
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{totalTopics}</div>
            <div className="admin-reports-stat-label">Topics</div>
          </div>
          <div className="admin-reports-stat-item">
            <div className="admin-reports-stat-value">{totalLessons}</div>
            <div className="admin-reports-stat-label">Lessons</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => openModal('createPath')}
          type="button"
          style={{
            background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(74, 15, 173, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.3)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Path
        </button>
        <button
          onClick={() => openModal('bulkImport')}
          type="button"
          style={{
            background: "white",
            color: "#4A0FAD",
            border: "2px solid #4A0FAD",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#F3EFFF";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "white";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Bulk Import JSON
        </button>
      </div>

      {/* Learning Paths Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {learningPaths.length === 0 ? (
          <div className="admin-reports-card">
            <div className="admin-reports-empty">
              <div className="admin-reports-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <p className="admin-reports-empty-text">
                No learning paths yet
              </p>
            </div>
          </div>
        ) : (
          learningPaths.map((path) => {
            const courseCount = path.courses.length;
            const topicCount = path.courses.reduce((sum, c) => sum + c.topics.length, 0);
            const lessonCount = path.courses.reduce((sum, c) => 
              sum + c.topics.reduce((tSum, t) => tSum + t.lessons.length, 0), 0
            );

            return (
              <div key={path.id} className="admin-reports-card">
                {/* Path Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "20px",
                  borderBottom: "2px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "20px",
                      boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 4px 0",
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {path.name}
                      </h3>
                      <p style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: "0",
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {courseCount} courses • {topicCount} topics • {lessonCount} lessons
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => openModal('createCourse', { pathId: path.id })}
                      type="button"
                      style={{
                        background: "transparent",
                        color: "#4A0FAD",
                        border: "1px solid #4A0FAD",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'Poppins', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#4A0FAD";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#4A0FAD";
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add Course
                    </button>
                    <button
                      onClick={() => openModal('deletePath', { pathId: path.id, pathName: path.name })}
                      type="button"
                      style={{
                        background: "transparent",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'Poppins', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#ef4444";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#ef4444";
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete Path
                    </button>
                  </div>
                </div>

                {/* Courses */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {path.courses.map((course) => {
                    const courseKey = `${path.id}-${course.id}`;
                    const isCourseExpanded = expandedCourses.has(courseKey);

                    return (
                      <div key={course.id} style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        overflow: "hidden",
                        transition: "all 0.2s ease"
                      }}>
                        {/* Course Header */}
                        <div
                          onClick={() => toggleCourse(courseKey)}
                          style={{
                            padding: "16px 20px",
                            background: isCourseExpanded ? "#F3EFFF" : "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            if (!isCourseExpanded) {
                              e.currentTarget.style.background = "#f9fafb";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCourseExpanded) {
                              e.currentTarget.style.background = "#ffffff";
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                transform: isCourseExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                                color: "#4A0FAD",
                                flexShrink: 0
                              }}
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            <span style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              {course.name}
                            </span>
                            <span style={{
                              fontSize: "13px",
                              color: "#6b7280",
                              background: "#f3f4f6",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              {course.topics.length} {course.topics.length === 1 ? "topic" : "topics"}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal('createTopic', { pathId: path.id, courseId: course.id });
                              }}
                              type="button"
                              style={{
                                background: "transparent",
                                color: "#10b981",
                                border: "1px solid #10b981",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "'Poppins', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#10b981";
                                e.target.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "#10b981";
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                              Add Topic
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal('renameCourse', { pathId: path.id, courseId: course.id, currentName: course.name });
                              }}
                              type="button"
                              style={{
                                background: "transparent",
                                color: "#4A0FAD",
                                border: "1px solid #4A0FAD",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "'Poppins', sans-serif"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#4A0FAD";
                                e.target.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "#4A0FAD";
                              }}
                            >
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal('deleteCourse', { pathId: path.id, courseId: course.id, courseName: course.name });
                              }}
                              type="button"
                              style={{
                                background: "transparent",
                                color: "#ef4444",
                                border: "1px solid #ef4444",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "'Poppins', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#ef4444";
                                e.target.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "#ef4444";
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Topics (Expanded) */}
                        {isCourseExpanded && (
                          <div style={{
                            padding: "12px 20px 20px 52px",
                            background: "#ffffff",
                            borderTop: "1px solid #e5e7eb"
                          }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {course.topics.map((topic) => {
                                const topicKey = `${path.id}-${course.id}-${topic.id}`;
                                const isTopicExpanded = expandedTopics.has(topicKey);

                                return (
                                  <div key={topic.id} style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    overflow: "hidden"
                                  }}>
                                    {/* Topic Header */}
                                    <div
                                      onClick={() => toggleTopic(topicKey)}
                                      style={{
                                        padding: "12px 16px",
                                        background: isTopicExpanded ? "#f9fafb" : "#ffffff",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        transition: "all 0.2s ease"
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isTopicExpanded) {
                                          e.currentTarget.style.background = "#f9fafb";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isTopicExpanded) {
                                          e.currentTarget.style.background = "#ffffff";
                                        }
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          style={{
                                            transform: isTopicExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease",
                                            color: "#6b7280",
                                            flexShrink: 0
                                          }}
                                        >
                                          <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                        <span style={{
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          color: "#374151",
                                          fontFamily: "'Poppins', sans-serif"
                                        }}>
                                          {topic.name}
                                        </span>
                                        <span style={{
                                          fontSize: "12px",
                                          color: "#9ca3af",
                                          background: "#f3f4f6",
                                          padding: "3px 8px",
                                          borderRadius: "10px",
                                          fontFamily: "'Poppins', sans-serif"
                                        }}>
                                          {topic.lessons.length} {topic.lessons.length === 1 ? "lesson" : "lessons"}
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openModal('createLesson', { pathId: path.id, courseId: course.id, topicId: topic.id });
                                          }}
                                          type="button"
                                          style={{
                                            background: "transparent",
                                            color: "#10b981",
                                            border: "1px solid #10b981",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontFamily: "'Poppins', sans-serif",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.background = "#10b981";
                                            e.target.style.color = "white";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.background = "transparent";
                                            e.target.style.color = "#10b981";
                                          }}
                                        >
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                          </svg>
                                          Add Lesson
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openModal('renameTopic', { pathId: path.id, courseId: course.id, topicId: topic.id, currentName: topic.name });
                                          }}
                                          type="button"
                                          style={{
                                            background: "transparent",
                                            color: "#6b7280",
                                            border: "1px solid #d1d5db",
                                            padding: "4px 12px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontFamily: "'Poppins', sans-serif"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.background = "#6b7280";
                                            e.target.style.color = "white";
                                            e.target.style.borderColor = "#6b7280";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.background = "transparent";
                                            e.target.style.color = "#6b7280";
                                            e.target.style.borderColor = "#d1d5db";
                                          }}
                                        >
                                          Rename
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openModal('deleteTopic', { pathId: path.id, courseId: course.id, topicId: topic.id, topicName: topic.name });
                                          }}
                                          type="button"
                                          style={{
                                            background: "transparent",
                                            color: "#ef4444",
                                            border: "1px solid #ef4444",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontFamily: "'Poppins', sans-serif",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.background = "#ef4444";
                                            e.target.style.color = "white";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.background = "transparent";
                                            e.target.style.color = "#ef4444";
                                          }}
                                        >
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          </svg>
                                          Delete
                                        </button>
                                      </div>
                                    </div>

                                    {/* Lessons (Expanded) */}
                                    {isTopicExpanded && (
                                      <div style={{
                                        padding: "8px 16px 12px 42px",
                                        background: "#ffffff",
                                        borderTop: "1px solid #e5e7eb"
                                      }}>
                                        <div style={{ marginBottom: "8px" }}>
                                          <button
                                            onClick={() => openModal('createLesson', { pathId: path.id, courseId: course.id, topicId: topic.id })}
                                            type="button"
                                            style={{
                                              background: "transparent",
                                              color: "#10b981",
                                              border: "1px solid #10b981",
                                              padding: "4px 10px",
                                              borderRadius: "6px",
                                              fontSize: "10px",
                                              fontWeight: "600",
                                              cursor: "pointer",
                                              transition: "all 0.2s",
                                              fontFamily: "'Poppins', sans-serif",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "4px"
                                            }}
                                            onMouseEnter={(e) => {
                                              e.target.style.background = "#10b981";
                                              e.target.style.color = "white";
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.background = "transparent";
                                              e.target.style.color = "#10b981";
                                            }}
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <line x1="12" y1="5" x2="12" y2="19"></line>
                                              <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                            Add Lesson
                                          </button>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                          {topic.lessons.map((lesson) => (
                                            <div
                                              key={lesson.id}
                                              style={{
                                                padding: "10px 12px",
                                                background: "#f9fafb",
                                                borderRadius: "6px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                transition: "all 0.2s"
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#f3f4f6";
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#f9fafb";
                                              }}
                                            >
                                              <span style={{
                                                fontSize: "13px",
                                                color: "#374151",
                                                fontFamily: "'Poppins', sans-serif"
                                              }}>
                                                {lesson.name}
                                              </span>
                                              <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                  onClick={() => openModal('renameLesson', { pathId: path.id, courseId: course.id, topicId: topic.id, lessonId: lesson.id, currentName: lesson.name })}
                                                  type="button"
                                                  style={{
                                                    background: "transparent",
                                                    color: "#9ca3af",
                                                    border: "1px solid #e5e7eb",
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    fontFamily: "'Poppins', sans-serif"
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    e.target.style.background = "#9ca3af";
                                                    e.target.style.color = "white";
                                                    e.target.style.borderColor = "#9ca3af";
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.target.style.background = "transparent";
                                                    e.target.style.color = "#9ca3af";
                                                    e.target.style.borderColor = "#e5e7eb";
                                                  }}
                                                >
                                                  Rename
                                                </button>
                                                <button
                                                  onClick={() => openModal('deleteLesson', { pathId: path.id, courseId: course.id, topicId: topic.id, lessonId: lesson.id, lessonName: lesson.name })}
                                                  type="button"
                                                  style={{
                                                    background: "transparent",
                                                    color: "#ef4444",
                                                    border: "1px solid #ef4444",
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "10px",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    fontFamily: "'Poppins', sans-serif",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px"
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    e.target.style.background = "#ef4444";
                                                    e.target.style.color = "white";
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.target.style.background = "transparent";
                                                    e.target.style.color = "#ef4444";
                                                  }}
                                                >
                                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                  </svg>
                                                  Delete
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.type === 'createPath' ? 'Create New Path' :
          modalState.type === 'createCourse' ? 'Create New Course' :
          modalState.type === 'createTopic' ? 'Create New Topic' :
          modalState.type === 'createLesson' ? 'Create New Lesson' :
          modalState.type === 'renameCourse' ? 'Rename Course' :
          modalState.type === 'renameTopic' ? 'Rename Topic' :
          modalState.type === 'renameLesson' ? 'Rename Lesson' :
          modalState.type === 'bulkImport' ? 'Bulk Import JSON' :
          modalState.type === 'deletePath' ? 'Delete Path' :
          modalState.type === 'deleteCourse' ? 'Delete Course' :
          modalState.type === 'deleteTopic' ? 'Delete Topic' :
          modalState.type === 'deleteLesson' ? 'Delete Lesson' :
          ''
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Bulk Import Modal */}
          {modalState.type === 'bulkImport' && (
            <>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  Upload JSON File or Paste JSON Data
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                />
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='Paste your JSON here. Format: [{"GeneralPath": "autism", "pathTitle": "...", "Courses": [...]}, ...]'
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    fontFamily: "'Courier New', monospace",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#4A0FAD"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
              </div>
              
              {importResult && (
                <div style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: importResult.success ? "#D1FAE5" : "#FEE2E2",
                  border: `1px solid ${importResult.success ? "#10B981" : "#EF4444"}`,
                  color: importResult.success ? "#065F46" : "#991B1B"
                }}>
                  {importResult.success ? (
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: "8px" }}>✓ Import Successful!</div>
                      {importResult.data?.summary && (
                        <div style={{ fontSize: "13px" }}>
                          <div>Paths: {importResult.data.summary.paths}</div>
                          <div>Courses: {importResult.data.summary.courses}</div>
                          <div>Topics: {importResult.data.summary.topics}</div>
                          <div>Lessons: {importResult.data.summary.lessons}</div>
                        </div>
                      )}
                      {importResult.data?.errors && importResult.data.errors.length > 0 && (
                        <div style={{ marginTop: "8px", fontSize: "12px" }}>
                          <div style={{ fontWeight: "600" }}>Warnings:</div>
                          {importResult.data.errors.slice(0, 5).map((err, i) => (
                            <div key={i}>• {err}</div>
                          ))}
                          {importResult.data.errors.length > 5 && (
                            <div>... and {importResult.data.errors.length - 5} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: "4px" }}>✗ Import Failed</div>
                      <div style={{ fontSize: "13px" }}>{importResult.error}</div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#6b7280",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  {importResult?.success ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!importData.trim() || importLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: (!importData.trim() || importLoading)
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                    color: "white",
                    fontWeight: "600",
                    cursor: (!importData.trim() || importLoading)
                      ? "not-allowed"
                      : "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: (!importData.trim() || importLoading)
                      ? "none"
                      : "0 4px 12px rgba(74, 15, 173, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    if (importData.trim() && !importLoading) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(74, 15, 173, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (importData.trim() && !importLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.3)";
                    }
                  }}
                >
                  {importLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </>
          )}

          {/* Create/Rename Modals */}
          {(modalState.type === 'createPath' || modalState.type === 'createCourse' || modalState.type === 'createTopic' || modalState.type === 'createLesson' || modalState.type === 'renameCourse' || modalState.type === 'renameTopic' || modalState.type === 'renameLesson') && (
          <>
          {modalState.type === 'createPath' && (
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                fontFamily: "'Poppins', sans-serif"
              }}>
                Path Type
              </label>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'autism' })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: `2px solid ${formData.type === 'autism' ? '#4A0FAD' : '#e5e7eb'}`,
                    background: formData.type === 'autism' ? '#F3EFFF' : 'white',
                    color: formData.type === 'autism' ? '#4A0FAD' : '#6b7280',
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Autism
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'downSyndrome' })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: `2px solid ${formData.type === 'downSyndrome' ? '#4A0FAD' : '#e5e7eb'}`,
                    background: formData.type === 'downSyndrome' ? '#F3EFFF' : 'white',
                    color: formData.type === 'downSyndrome' ? '#4A0FAD' : '#6b7280',
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Down Syndrome
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              fontFamily: "'Poppins', sans-serif"
            }}>
              {modalState.type?.includes('rename') ? 'New Name' : 'Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={modalState.type === 'createPath' ? 'Enter path name' : modalState.type?.includes('rename') ? 'Enter new name' : 'Enter name'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') closeModal();
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                fontFamily: "'Poppins', sans-serif",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#4A0FAD"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "white",
                color: "#6b7280",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f9fafb";
                e.target.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#d1d5db";
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.name.trim() || (modalState.type === 'createPath' && !formData.type)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: (!formData.name.trim() || (modalState.type === 'createPath' && !formData.type)) 
                  ? "#d1d5db" 
                  : "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                color: "white",
                fontWeight: "600",
                cursor: (!formData.name.trim() || (modalState.type === 'createPath' && !formData.type)) 
                  ? "not-allowed" 
                  : "pointer",
                transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif",
                boxShadow: (!formData.name.trim() || (modalState.type === 'createPath' && !formData.type))
                  ? "none"
                  : "0 4px 12px rgba(74, 15, 173, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (formData.name.trim() && (modalState.type !== 'createPath' || formData.type)) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(74, 15, 173, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (formData.name.trim() && (modalState.type !== 'createPath' || formData.type)) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.3)";
                }
              }}
            >
              {modalState.type?.includes('rename') ? 'Rename' : 'Create'}
            </button>
          </div>
          </>
          )}

          {/* Delete Confirmation Modals */}
          {(modalState.type === 'deletePath' || modalState.type === 'deleteCourse' || modalState.type === 'deleteTopic' || modalState.type === 'deleteLesson') && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                background: "#FEF2F2",
                borderRadius: "8px",
                border: "1px solid #FEE2E2",
                marginBottom: "16px"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#991B1B",
                    marginBottom: "4px",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Are you sure you want to delete this?
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#7F1D1D",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    {modalState.type === 'deletePath' && (
                      <>This will permanently delete <strong>"{modalState.data?.pathName}"</strong> and all its courses, topics, and lessons. This action cannot be undone.</>
                    )}
                    {modalState.type === 'deleteCourse' && (
                      <>This will permanently delete <strong>"{modalState.data?.courseName}"</strong> and all its topics and lessons. This action cannot be undone.</>
                    )}
                    {modalState.type === 'deleteTopic' && (
                      <>This will permanently delete <strong>"{modalState.data?.topicName}"</strong> and all its lessons. This action cannot be undone.</>
                    )}
                    {modalState.type === 'deleteLesson' && (
                      <>This will permanently delete <strong>"{modalState.data?.lessonName}"</strong>. This action cannot be undone.</>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#6b7280",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#EF4444",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
                    e.target.style.background = "#DC2626";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                    e.target.style.background = "#EF4444";
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default LearningPaths;

