import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import achievementsData from "../data/achievements.json";
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
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);

  // Helper functions for tab content
  const getCurrentLesson = () => {
    // Default to first lesson if none expanded or logic is complex
    // Here we try to find the "active" lesson based on completed count
    if (lessons.length === 0) return null;
    const activeIndex = Math.min(completedLessonsCount, lessons.length - 1);
    return lessons[activeIndex];
  };

  const getLessonMaterials = (lesson) => {
    if (!lesson || !lesson.materials) return [];
    return lesson.materials;
  };

  const getLessonQuizzes = (lesson) => {
    if (!lesson || !lesson.quizzes) return [];
    return lesson.quizzes;
  };

  const getLessonAchievements = (lesson) => {
    if (!lesson) return [];
    // Distribute achievements across lessons
    const lessonIndex = lessons.findIndex(l => l.id === lesson.id);
    if (lessonIndex === -1) return [];

    // Use modulo to cycle through achievements if there are more lessons than achievements
    const achievementIndex = lessonIndex % achievementsData.length;
    const achievement = achievementsData[achievementIndex];

    // Return formatted achievement (ensure properties match what UI expects)
    return [{
      id: achievement._id?.$oid || achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.badge === 'platinum' ? 'trophy' : (achievement.badge === 'gold' ? 'star' : 'award'),
      points: achievement.badge === 'platinum' ? 100 : (achievement.badge === 'gold' ? 50 : 25)
    }];
  };

  const currentLesson = getCurrentLesson();
  const lessonMaterials = getLessonMaterials(currentLesson);
  const lessonQuizzes = getLessonQuizzes(currentLesson);
  const lessonAchievementsList = getLessonAchievements(currentLesson);

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
      // Parse course index from id (URL uses 1-based indexing, so subtract 1)
      const courseIndex = parseInt(id) - 1;

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
        level: "Beginner",
        id: course._id || course.id // Ensure we store the ID
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
            completed: false,
            materials: (typeof lesson === 'object' && lesson.materials) ? lesson.materials : [],
            quizzes: (typeof lesson === 'object' && lesson.quizzes) ? lesson.quizzes : []
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

  // Fetch progress for this specific course
  useEffect(() => {
    const fetchProgress = async () => {
      // We need course ID. If courseData is set, we can use it.
      if (!courseData || !courseData.id) return;

      const token = window.sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/students/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.courseProgress) {
            const currentCourseId = courseData.id;
            const progressEntry = result.data.courseProgress.find(c => c.course === currentCourseId || c.course?._id === currentCourseId);

            if (progressEntry) {
              setCompletedLessonsCount(progressEntry.completedLessonsCount || 0);
              // Also expand the next lesson
              const nextLessonIndex = progressEntry.completedLessonsCount || 0;
              // We can find the lesson ID for this index
              // lessons array is flattened
              // But here we might not have updated 'lessons' state yet if this effect runs too early?
              // It depends on courseData being set.
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };

    fetchProgress();
  }, [courseData]);

  const handleCompleteLesson = async (lessonGlobalIndex) => {
    const token = window.sessionStorage.getItem('token');
    if (!token || !courseData?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/students/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: courseData.id,
          lessonIndex: lessonGlobalIndex,
          totalLessons: lessons.length
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompletedLessonsCount(result.completedLessonsCount);
          // Auto expand next lesson?
          const nextIndex = result.completedLessonsCount;
          if (nextIndex < lessons.length) {
            setExpandedLessons(new Set([lessons[nextIndex].id]));
          }
        } else {
          alert(result.message || 'Could not complete lesson');
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

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
                      <div className="cp-materials-content">
                        {currentLesson ? (
                          <div className="cp-materials-list">
                            <h3 style={{ marginBottom: '16px' }}>Materials for: {currentLesson.title}</h3>
                            {lessonMaterials.map((material) => (
                              <div key={material.id} className="cp-material-item">
                                <div className="cp-material-icon">
                                  {material.type === 'PDF' ? '📄' : '📝'}
                                </div>
                                <div className="cp-material-info">
                                  <div className="cp-material-title">{material.title}</div>
                                  <div className="cp-material-meta">{material.type} • {material.size}</div>
                                </div>
                                <button className="cp-material-download">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>Please select a lesson to view materials.</p>
                        )}
                      </div>
                    )}
                    {activeTab === "achievements" && (
                      <div className="cp-achievements-content">
                        <div className="cp-achievements-header">
                          <div>
                            <h3 className="cp-achievements-title">Lesson Achievements</h3>
                            <p className="cp-achievements-subtitle">Earn these by completing {currentLesson?.title}</p>
                          </div>
                        </div>

                        <div className="cp-achievements-list">
                          {lessonAchievementsList.map((achievement) => (
                            <div key={achievement.id} className="cp-achievement-card">
                              <div className="cp-achievement-icon-wrapper">
                                {achievement.icon === "trophy" && "🏆"}
                                {achievement.icon === "award" && "🎖️"}
                                {achievement.icon === "star" && "⭐"}
                              </div>
                              <div className="cp-achievement-content">
                                <h4 className="cp-achievement-name">{achievement.title}</h4>
                                <p className="cp-achievement-desc">{achievement.description}</p>
                                <div className="cp-achievement-badge" style={{ marginTop: '8px', display: 'inline-block' }}>
                                  +{achievement.points} Points
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "quiz" && (
                      <div className="cp-quiz-content">
                        {currentLesson ? (
                          <div className="cp-quiz-list">
                            <h3 style={{ marginBottom: '16px' }}>Quizzes for: {currentLesson.title}</h3>
                            {lessonQuizzes.map((quiz) => (
                              <div key={quiz.id} className="cp-quiz-card">
                                <div className="cp-quiz-header">
                                  <span className={`cp-quiz-difficulty ${quiz.difficulty.toLowerCase()}`}>
                                    {quiz.difficulty}
                                  </span>
                                  <span className="cp-quiz-time">{quiz.time}</span>
                                </div>
                                <h4 className="cp-quiz-title">{quiz.title}</h4>
                                <p className="cp-quiz-questions">{quiz.questions} Questions</p>
                                <button className="cp-quiz-start-btn">Start Quiz</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>Please select a lesson to view quizzes.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <aside className="cp-lessons-sidebar">
                  {lessons.length > 0 ? (
                    <div className="cp-lessons-list">
                      {lessons.map((lesson, index) => {
                        const isExpanded = expandedLessons.has(lesson.id);
                        const isCompleted = index < completedLessonsCount;
                        const isLocked = index > completedLessonsCount;
                        const isActive = index === completedLessonsCount; // The current lesson user should be on

                        return (
                          <div key={lesson.id} className={`cp-lesson-item ${isExpanded ? "expanded" : ""} ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                            <div
                              className="cp-lesson-header"
                              onClick={() => !isLocked && toggleLesson(lesson.id)}
                            >
                              <div className="cp-lesson-info">
                                <div className="cp-lesson-title">
                                  {isLocked && <span className="cp-locked-icon">🔒</span>}
                                  {lesson.title}
                                </div>
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

                            {/* Unlock/Complete Button Area (Only visible if expanded and not locked) */}
                            {isExpanded && !isLocked && !isCompleted && (
                              <div style={{ padding: '0 16px 16px' }}>
                                <button
                                  className="cp-complete-btn"
                                  onClick={() => handleCompleteLesson(index)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                  Mark as Completed
                                </button>
                              </div>
                            )}

                            {isExpanded && isCompleted && (
                              <div style={{ padding: '0 16px 16px', color: '#16a34a', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Completed
                              </div>
                            )}

                            {isExpanded && lesson.subLessons && (
                              <div className="cp-sublessons">
                                {lesson.subLessons.map((subLesson, subIndex) => (
                                  <div key={subIndex} className="cp-sublesson-item">
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
              </div >
            </>
          )
          }
        </div >
      </div >
    </div >
  );
}