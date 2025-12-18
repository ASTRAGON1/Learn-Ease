import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./CoursePlayer.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [expandedLessons, setExpandedLessons] = useState(new Set(["lesson-1"]));
  const [passedQuizzesExpanded, setPassedQuizzesExpanded] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      // First, try to get from sessionStorage (set during login)
      const storage = window.sessionStorage;
      const storedName = storage.getItem("userName");
      const storedEmail = storage.getItem("userEmail");
      const token = storage.getItem("token");

      if (storedName) {
        setStudentName(storedName);
      }
      if (storedEmail) {
        setStudentEmail(storedEmail);
      }

      // Try to fetch from API if token is available
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/students/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const student = data.data || data;

            if (student.name || student.fullName) {
              setStudentName(student.name || student.fullName);
            }
            if (student.email) {
              setStudentEmail(student.email);
            }
          } else if (response.status === 403) {
            // Quiz required - redirect to diagnostic quiz
            const errorData = await response.json().catch(() => ({}));
            if (errorData.quizRequired) {
              navigate('/diagnostic-quiz', { replace: true });
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
          // If API fails, use sessionStorage data (already set above)
        }
      }
    };

    fetchStudentData();
  }, [navigate]);

  const [courseData, setCourseData] = useState(null);
  const [courseAchievements, setCourseAchievements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [studentPathType, setStudentPathType] = useState(null);
  const [learningPath, setLearningPath] = useState(null);

  // Fetch student type from API
  useEffect(() => {
    const fetchStudentType = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/students/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.type) {
            setStudentPathType(data.data.type);
            console.log('✅ Student type:', data.data.type);
          }
        }
      } catch (error) {
        console.error('Error fetching student type:', error);
      }
    };

    fetchStudentType();
  }, []);

  // Fetch learning path based on student type
  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!studentPathType) return;

      try {
        const response = await fetch(`${API_URL}/api/admin/learning-paths`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const normalizedType = studentPathType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentPathType.toLowerCase();
            const path = result.data.find(p => {
              if (!p.id) return false;
              const pathId = p.id.toLowerCase();
              const pathName = p.name.toLowerCase();
              return pathId.includes(normalizedType) ||
                pathName.includes(normalizedType) ||
                (normalizedType === 'autism' && (pathId.includes('autism') || pathName.includes('autism'))) ||
                (normalizedType === 'downsyndrome' && (pathId.includes('downsyndrome') || pathName.includes('down syndrome')));
            });

            if (path) {
              console.log(`✅ Found learning path:`, path.name);
              setLearningPath(path);
            } else {
              console.warn(`⚠️ No learning path found for type: ${normalizedType}`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching learning path:', error);
      }
    };

    fetchLearningPath();
  }, [studentPathType]);

  // Get course data from learning path based on course ID
  useEffect(() => {
    if (!learningPath || !id) {
      setCourseLoading(false);
      return;
    }

    try {
      // Parse course index from id (e.g., "0" for first course, "1" for second, etc.)
      const courseIndex = parseInt(id);

      if (isNaN(courseIndex) || courseIndex < 0 || courseIndex >= learningPath.courses.length) {
        console.error('Invalid course index:', id);
        setCourseData(null);
        setTopics([]);
        setLessons([]);
        setCourseLoading(false);
        return;
      }

      const course = learningPath.courses[courseIndex];
      console.log(`✅ Loading course ${courseIndex}:`, course.name);

      // Set course data
      setCourseData({
        title: course.name,
        description: course.description || `Learn ${course.name}`,
        instructor: "LearnEase Team",
        duration: `${course.topics?.length || 0} topics`,
        level: "Beginner"
      });

      // Set topics and lessons
      if (course.topics && course.topics.length > 0) {
        const formattedTopics = course.topics.map((topic, topicIndex) => ({
          id: `topic-${topicIndex}`,
          name: topic.name,
          description: topic.description || '',
          lessons: topic.lessons || []
        }));

        setTopics(formattedTopics);

        // Flatten all lessons from all topics
        const allLessons = course.topics.flatMap((topic, topicIndex) =>
          (topic.lessons || []).map((lesson, lessonIndex) => ({
            id: `lesson-${topicIndex}-${lessonIndex}`,
            title: typeof lesson === 'string' ? lesson : lesson.name,
            topic: topic.name,
            duration: "15 min",
            completed: false
          }))
        );

        setLessons(allLessons);
        console.log(`✅ Loaded ${allLessons.length} lessons from ${formattedTopics.length} topics`);
      } else {
        setTopics([]);
        setLessons([]);
      }

      // TODO: Fetch quizzes and achievements from API when available
      setQuizzes([]);
      setCourseAchievements([]);

    } catch (error) {
      console.error('Error loading course data:', error);
      setCourseData(null);
      setTopics([]);
      setLessons([]);
    } finally {
      setCourseLoading(false);
    }
  }, [learningPath, id]);

  const passedQuizzes = quizzes.filter(q => q.status === "passed");
  const upcomingQuizzes = quizzes.filter(q => q.status === "upcoming");

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  return (
    <div className="cp-page-new">
      {/* Main Content */}
      <div className="cp-main-new">
        {/* Top Header */}
        <header className="cp-header-new">
          <div className="cp-header-left">
            <h1 className="cp-welcome">
              Welcome to <span className="cp-brand">LearnEase</span>
            </h1>
          </div>
          <div className="cp-header-center">
            <h2 className="cp-header-course-title">{courseData?.title || "Loading Course..."}</h2>
          </div>
          <div className="cp-header-right">

            <div className="cp-profile">
              <div className="cp-profile-avatar">
                {studentName ? studentName.slice(0, 2).toUpperCase() : "ST"}
              </div>
              <div className="cp-profile-info">
                <div className="cp-profile-name">{studentName || "Student"}</div>
                <div className="cp-profile-username">{studentEmail || ""}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="cp-content-new">
          {courseLoading ? (
            <div className="cp-loading">
              <div className="cp-loading-spinner"></div>
              <p>Loading course data...</p>
            </div>
          ) : courseData ? (
            <>
              {/* Course Header with Back Button */}
              <div className="cp-course-header">
                <button className="cp-back-btn" onClick={() => navigate("/student-dashboard-2")}>
                  <span className="cp-back-chev">‹</span> Dashboard
                </button>
              </div>

              {/* Course Badges */}
              <div className="cp-badges">
                <div className="cp-badge-item">
                  <span className="cp-badge-value">{lessons.length}</span>
                  <span className="cp-badge-label">lessons</span>
                </div>
                <div className="cp-badge-item">
                  <span className="cp-badge-value">{topics.length}</span>
                  <span className="cp-badge-label">topics</span>
                </div>
                {courseData.level && (
                  <div className="cp-badge-item">
                    <span className="cp-badge-label">{courseData.level}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cp-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <h3>Course Not Found</h3>
              <p>The course you're looking for doesn't exist or you don't have access to it.</p>
              <button className="cp-back-to-courses" onClick={() => navigate('/courses')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Back to Courses
              </button>
            </div>
          )}

          {courseData && !courseLoading && (
            <>
              {/* Main Content Grid */}
              <div className="cp-content-grid">
                {/* Left: Video and Tabs */}
                <div className="cp-left-content">
                  {/* Video Player */}
                  <div className="cp-video-container">
                    <div className="cp-video-thumbnail">
                      <img
                        src="https://images.unsplash.com/photo-1543269664-7eef42226a21?w=800&h=450&fit=crop"
                        alt="Course video"
                      />
                      <button className="cp-play-button">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="cp-tabs">
                    <button
                      className={`cp-tab ${activeTab === "description" ? "active" : ""}`}
                      onClick={() => setActiveTab("description")}
                    >
                      Description
                    </button>
                    <button
                      className={`cp-tab ${activeTab === "materials" ? "active" : ""}`}
                      onClick={() => setActiveTab("materials")}
                    >
                      Materials
                    </button>
                    <button
                      className={`cp-tab ${activeTab === "quiz" ? "active" : ""}`}
                      onClick={() => setActiveTab("quiz")}
                    >
                      Quiz
                    </button>
                    <button
                      className={`cp-tab ${activeTab === "achievements" ? "active" : ""}`}
                      onClick={() => setActiveTab("achievements")}
                    >
                      Achievement
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="cp-tab-content">
                    {activeTab === "description" && (
                      <div>
                        {courseData?.description ? (
                          <p className="cp-description-text">{courseData.description}</p>
                        ) : (
                          <p className="cp-description-text">No description available for this course.</p>
                        )}
                        {topics.length > 0 && (
                          <div className="cp-topics-section">
                            <h4 className="cp-topics-heading">Course Topics</h4>
                            <div className="cp-topics-list">
                              {topics.map((topic, index) => (
                                <div key={topic.id} className="cp-topic-item">
                                  <div className="cp-topic-number">{index + 1}</div>
                                  <div className="cp-topic-content">
                                    <div className="cp-topic-title">{topic.name}</div>
                                    {topic.description && (
                                      <div className="cp-topic-description">{topic.description}</div>
                                    )}
                                    <div className="cp-topic-lessons-count">
                                      {topic.lessons?.length || 0} lessons
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "materials" && (
                      <div>
                        <p>Course materials will be available here.</p>
                      </div>
                    )}
                    {activeTab === "achievements" && (
                      <div className="cp-achievements-content">
                        <div className="cp-achievements-header">
                          <div>
                            <h3 className="cp-achievements-title">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                <path d="M4 22h16"></path>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                              </svg>
                              Course Achievements
                            </h3>
                            <p className="cp-achievements-subtitle">Earn achievements by completing this course</p>
                          </div>
                          <Link to="/achievements" className="cp-view-all-achievements">
                            View All
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                          </Link>
                        </div>

                        {courseAchievements.length > 0 ? (
                          <div className="cp-achievements-list">
                            {courseAchievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className={`cp-achievement-card ${achievement.unlocked ? "unlocked" : ""}`}
                              >
                                <div className="cp-achievement-icon-wrapper">
                                  {achievement.icon === "trophy" && (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                      <path d="M4 22h16"></path>
                                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                  )}
                                  {achievement.icon === "award" && (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="8" r="6"></circle>
                                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                                    </svg>
                                  )}
                                  {achievement.icon === "star" && (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                  )}
                                  {achievement.unlocked && (
                                    <div className="cp-achievement-check">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="cp-achievement-content">
                                  <div className="cp-achievement-header-row">
                                    <h4 className="cp-achievement-name">{achievement.title}</h4>
                                    {achievement.unlocked && (
                                      <span className={`cp-achievement-badge ${achievement.badge}`}>
                                        {achievement.badge === "platinum" ? "Platinum" : achievement.badge === "gold" ? "Gold" : "Silver"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="cp-achievement-desc">{achievement.description}</p>
                                  {!achievement.unlocked && (
                                    <div className="cp-achievement-progress">
                                      <div className="cp-achievement-progress-bar">
                                        <div
                                          className="cp-achievement-progress-fill"
                                          style={{ width: `${achievement.progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="cp-achievement-progress-text">{achievement.progress}%</span>
                                    </div>
                                  )}
                                  {achievement.unlocked && (
                                    <div className="cp-achievement-unlocked">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                      </svg>
                                      <span>Unlocked!</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No achievements available for this course yet.</p>
                        )}
                      </div>
                    )}
                    {activeTab === "quiz" && (
                      <div className="cp-quiz-content">
                        {/* Passed Quizzes Section */}
                        {passedQuizzes.length > 0 && (
                          <div className="cp-quiz-section">
                            <div
                              className="cp-quiz-section-header clickable"
                              onClick={() => setPassedQuizzesExpanded(!passedQuizzesExpanded)}
                            >
                              <h3 className="cp-quiz-section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Passed Quizzes ({passedQuizzes.length})
                              </h3>
                              <svg
                                className={`cp-quiz-dropdown-icon ${passedQuizzesExpanded ? "expanded" : ""}`}
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </div>
                            {passedQuizzesExpanded && (
                              <div className="cp-quiz-list">
                                {passedQuizzes.map((quiz) => (
                                  <div key={quiz.id} className="cp-quiz-card passed">
                                    <div className="cp-quiz-card-header">
                                      <div className="cp-quiz-card-info">
                                        <h4 className="cp-quiz-card-title">{quiz.title}</h4>
                                        <p className="cp-quiz-card-meta">{quiz.lesson} • {quiz.date}</p>
                                      </div>
                                      <div className="cp-quiz-score">
                                        <span className="cp-quiz-score-value">{quiz.score}%</span>
                                        <span className="cp-quiz-score-label">Score</span>
                                      </div>
                                    </div>
                                    <div className="cp-quiz-card-details">
                                      <div className="cp-quiz-detail-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <span>{quiz.duration}</span>
                                      </div>
                                      <div className="cp-quiz-detail-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 11l3 3L22 4"></path>
                                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                        </svg>
                                        <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                                      </div>
                                    </div>
                                    <div className="cp-quiz-progress-bar">
                                      <div
                                        className="cp-quiz-progress-fill"
                                        style={{ width: `${quiz.score}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Upcoming Quizzes Section */}
                        {upcomingQuizzes.length > 0 && (
                          <div className="cp-quiz-section">
                            <div className="cp-quiz-section-header">
                              <h3 className="cp-quiz-section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Upcoming Quizzes ({upcomingQuizzes.length})
                              </h3>
                            </div>
                            <div className="cp-quiz-list">
                              {upcomingQuizzes.map((quiz) => (
                                <div key={quiz.id} className="cp-quiz-card upcoming">
                                  <div className="cp-quiz-card-header">
                                    <div className="cp-quiz-card-info">
                                      <h4 className="cp-quiz-card-title">{quiz.title}</h4>
                                      <p className="cp-quiz-card-meta">{quiz.lesson} • {quiz.date}</p>
                                    </div>
                                    <div className="cp-quiz-badge upcoming">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      Upcoming
                                    </div>
                                  </div>
                                  <div className="cp-quiz-card-details">
                                    <div className="cp-quiz-detail-item">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      <span>{quiz.duration}</span>
                                    </div>
                                    <div className="cp-quiz-detail-item">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 11l3 3L22 4"></path>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                      </svg>
                                      <span>{quiz.totalQuestions} questions</span>
                                    </div>
                                  </div>
                                  <button
                                    className="cp-quiz-start-btn"
                                    onClick={() => navigate(`/quiz`)}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    Start Quiz
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty State */}
                        {passedQuizzes.length === 0 && upcomingQuizzes.length === 0 && (
                          <div className="cp-quiz-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 11l3 3L22 4"></path>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            <h3 className="cp-quiz-empty-title">No quizzes available</h3>
                            <p className="cp-quiz-empty-text">Quizzes for this course will appear here once they are assigned.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right: Lesson List */}
                <aside className="cp-lessons-sidebar">
                  {lessons.length > 0 ? (
                    <div className="cp-lessons-list">
                      {lessons.map((lesson) => {
                        const isExpanded = expandedLessons.has(lesson.id);
                        return (
                          <div key={lesson.id} className={`cp-lesson-item ${isExpanded ? "expanded" : ""}`}>
                            <div
                              className="cp-lesson-header"
                              onClick={() => toggleLesson(lesson.id)}
                            >
                              <div className="cp-lesson-info">
                                <div className="cp-lesson-title">{lesson.title}</div>
                                {lesson.topic && (
                                  <div className="cp-lesson-topic">Topic: {lesson.topic}</div>
                                )}
                                <div className="cp-lesson-duration">{lesson.duration}</div>
                              </div>
                              <button className="cp-expand-btn">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                >
                                  <path d="M6 9l6 6 6-6"></path>
                                </svg>
                              </button>
                            </div>
                            {isExpanded && lesson.subLessons && (
                              <div className="cp-sublessons">
                                {lesson.subLessons.map((subLesson, index) => (
                                  <div key={index} className="cp-sublesson-item">
                                    <span className="cp-sublesson-title">{subLesson.title}</span>
                                    <span className="cp-sublesson-duration">{subLesson.duration}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="cp-lessons-empty">
                      <p>No lessons available for this course.</p>
                    </div>
                  )}
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}