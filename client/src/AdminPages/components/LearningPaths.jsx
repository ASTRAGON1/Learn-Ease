import React, { useState } from "react";

function LearningPaths({ learningPaths, onRenameCourse, onRenameTopic, onRenameLesson }) {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());

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
            Two paths: Autism and Down Syndrome. Structure: Path → Courses → Topics → Lessons. You can rename courses, topics, and lessons.
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const name = prompt("Rename course", course.name);
                              if (name && name.trim()) onRenameCourse(path.id, course.id, name.trim());
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
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const name = prompt("Rename topic", topic.name);
                                          if (name && name.trim()) onRenameTopic(path.id, course.id, topic.id, name.trim());
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
                                    </div>

                                    {/* Lessons (Expanded) */}
                                    {isTopicExpanded && (
                                      <div style={{
                                        padding: "8px 16px 12px 42px",
                                        background: "#ffffff",
                                        borderTop: "1px solid #e5e7eb"
                                      }}>
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
                                              <button
                                                onClick={() => {
                                                  const name = prompt("Rename lesson", lesson.name);
                                                  if (name && name.trim()) {
                                                    onRenameLesson(path.id, course.id, topic.id, lesson.id, name.trim());
                                                  }
                                                }}
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
    </div>
  );
}

export default LearningPaths;

