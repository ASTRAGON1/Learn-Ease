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
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [likedVideos, setLikedVideos] = useState(new Set()); // Track liked videos

  // Quiz player state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState(null);
  const [quizPaused, setQuizPaused] = useState(false);

  // Helper functions for tab content
  const getCurrentLesson = () => {
    // Default to first lesson if none expanded or logic is complex
    // Here we try to find the "active" lesson based on completed count
    if (lessons.length === 0) return null;
    const activeIndex = Math.min(completedLessonsCount, lessons.length - 1);
    return lessons[activeIndex];
  };

  const getLessonMaterials = (lesson) => {
    if (!lesson) return [];
    // Filter materials (documents and images) for this lesson and limit to 3
    if (materials.length > 0) {
      return materials.filter(m => m.lesson === lesson.dbId || m.lesson === lesson.id).slice(0, 3);
    }
    return lesson.materials || [];
  };

  const getLessonQuizzes = (lesson) => {
    if (!lesson) return [];
    // Prioritize dynamically fetched quizzes
    if (quizzes.length > 0) {
      // Filter quizzes for this lesson
      const lessonQuizzes = quizzes.filter(q => q.lesson === lesson.dbId || q.lesson === lesson.id);

      // Get one quiz of each difficulty level (Easy, Medium, Hard)
      const easyQuiz = lessonQuizzes.find(q => q.difficulty === 'Easy');
      const mediumQuiz = lessonQuizzes.find(q => q.difficulty === 'Medium');
      const hardQuiz = lessonQuizzes.find(q => q.difficulty === 'Hard');

      // Return array with available quizzes in order: Easy, Medium, Hard
      return [easyQuiz, mediumQuiz, hardQuiz].filter(Boolean);
    }
    return lesson.quizzes || [];
  };

  const getLessonVideos = (lesson) => {
    if (!lesson) return [];
    // Filter videos for this lesson and limit to 2 videos
    if (videos.length > 0) {
      return videos.filter(v => v.lesson === lesson.dbId || v.lesson === lesson.id).slice(0, 2);
    }
    return [];
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

  // Quiz handler functions
  const saveQuizProgress = async (quizId, status, answers, questionIndex, grade = null) => {
    try {
      const token = window.sessionStorage.getItem('token');
      await fetch(`${API_URL}/api/quizzes/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId,
          status,
          answers,
          currentQuestionIndex: questionIndex,
          grade
        })
      });
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      const token = window.sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setActiveQuiz(result.data);
        setQuizAnswers({});
        setCurrentQuestionIndex(0);
        setQuizResults(null);
        setQuizPaused(false);

        // Save initial progress
        await saveQuizProgress(quizId, 'in-progress', {}, 0);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleSelectAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questionsAndAnswers.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handlePauseQuiz = async () => {
    setQuizPaused(true);
    // Save progress to localStorage
    localStorage.setItem(`quiz_${activeQuiz._id}`, JSON.stringify({
      answers: quizAnswers,
      questionIndex: currentQuestionIndex
    }));

    // Save progress to database
    await saveQuizProgress(
      activeQuiz._id,
      'paused',
      quizAnswers,
      currentQuestionIndex
    );
  };

  const handleResumeQuiz = () => {
    setQuizPaused(false);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    activeQuiz.questionsAndAnswers.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / activeQuiz.questionsAndAnswers.length) * 100);
    setQuizResults({
      score,
      correctCount,
      totalQuestions: activeQuiz.questionsAndAnswers.length,
      answers: quizAnswers
    });

    // Save final result to database
    await saveQuizProgress(
      activeQuiz._id,
      'completed',
      quizAnswers,
      currentQuestionIndex,
      score
    );

    // Clear saved progress
    localStorage.removeItem(`quiz_${activeQuiz._id}`);
  };

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResults(null);
    setQuizPaused(false);
  };

  const currentLesson = getCurrentLesson();
  const lessonMaterials = getLessonMaterials(currentLesson);
  const lessonQuizzes = getLessonQuizzes(currentLesson);
  const lessonAchievementsList = getLessonAchievements(currentLesson);
  const lessonVideos = getLessonVideos(currentLesson);

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
              setLearningPath(path);
            } else {
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
      // Try to find course by ID first
      let course = learningPath.courses.find(c => c.id === id || c._id === id);
      let courseIndex = -1;

      // If not found by ID, try parsing as 1-based index (legacy support)
      if (!course) {
        courseIndex = parseInt(id) - 1;
        if (!isNaN(courseIndex) && courseIndex >= 0 && courseIndex < learningPath.courses.length) {
          course = learningPath.courses[courseIndex];
        }
      }

      if (!course) {
        console.error('Invalid course ID or index:', id);
        setCourseData(null);
        setTopics([]);
        setLessons([]);
        setCourseLoading(false);
        return;
      }


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
            dbId: lesson.id, // Store real DB ID for linking
            title: typeof lesson === 'string' ? lesson : lesson.name,
            topic: topic.name,
            duration: "15 min",
            completed: false,
            materials: (typeof lesson === 'object' && lesson.materials) ? lesson.materials : [],
            quizzes: (typeof lesson === 'object' && lesson.quizzes) ? lesson.quizzes : []
          }))
        );

        setLessons(allLessons);
      } else {
        setTopics([]);
        setLessons([]);
      }

      // Fetch published quizzes for this course
      const fetchQuizzes = async () => {
        try {
          const token = window.sessionStorage.getItem('token');
          const currentCourseId = course._id || course.id;
          if (!token || !currentCourseId) return;

          const response = await fetch(`${API_URL}/api/quizzes/published?courseId=${currentCourseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              setQuizzes(result.data);
            }
          }
        } catch (error) {
          console.error('Error fetching quizzes:', error);
        }
      };

      fetchQuizzes();

      // Fetch published video content for this course
      const fetchVideos = async () => {
        try {
          const token = window.sessionStorage.getItem('token');
          const currentCourseId = course._id || course.id;
          if (!token || !currentCourseId) return;

          const response = await fetch(`${API_URL}/api/content/published?courseId=${currentCourseId}&contentType=video`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              setVideos(result.data);
            }
          }
        } catch (error) {
          console.error('Error fetching videos:', error);
        }
      };

      fetchVideos();

      // Fetch published documents and images for this course
      const fetchMaterials = async () => {
        try {
          const token = window.sessionStorage.getItem('token');
          const currentCourseId = course._id || course.id;
          if (!token || !currentCourseId) return;

          const response = await fetch(`${API_URL}/api/content/published?courseId=${currentCourseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              // Filter only documents and images
              const docs = result.data.filter(item => item.contentType === 'document' || item.contentType === 'image');
              setMaterials(docs);
            }
          }
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      };

      fetchMaterials();
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

          // Show achievement notification if any were earned
          if (result.achievementsEarned && result.achievementsEarned.length > 0) {
            setEarnedAchievements(result.achievementsEarned);
            setShowAchievementModal(true);
          }

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
                    {lessonVideos.length > 0 ? (
                      <div className="cp-single-video-wrapper">
                        <div className="cp-video-item">
                          <video
                            controls
                            className="cp-video-player"
                            src={lessonVideos[currentVideoIndex]?.fileURL}
                            onEnded={async () => {
                              setVideoCompleted(true);

                              // Track video view
                              const videoId = lessonVideos[currentVideoIndex]?._id;
                              if (videoId) {
                                try {
                                  await fetch(`${API_URL}/api/students/content/${videoId}/view`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                } catch (error) {
                                  console.error('Error tracking video view:', error);
                                }
                              }
                            }}
                            onPlay={() => setVideoCompleted(false)}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <div className="cp-video-info">
                            <div className="cp-video-header">
                              <h4 className="cp-video-title">{lessonVideos[currentVideoIndex]?.title}</h4>
                              <span className="cp-video-counter">
                                Video {currentVideoIndex + 1} of {lessonVideos.length}
                              </span>
                            </div>
                            {lessonVideos[currentVideoIndex]?.description && (
                              <p className="cp-video-description">{lessonVideos[currentVideoIndex]?.description}</p>
                            )}
                            <div className="cp-video-actions">
                              <button
                                className={`cp-like-btn ${likedVideos.has(lessonVideos[currentVideoIndex]?._id) ? 'liked' : ''}`}
                                onClick={async () => {
                                  const videoId = lessonVideos[currentVideoIndex]?._id;
                                  if (videoId) {
                                    const isLiked = likedVideos.has(videoId);
                                    const action = isLiked ? 'unlike' : 'like';

                                    try {
                                      const response = await fetch(`${API_URL}/api/students/content/${videoId}/like`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ action })
                                      });

                                      if (response.ok) {
                                        // Update local state only if API call succeeds
                                        setLikedVideos(prev => {
                                          const newSet = new Set(prev);
                                          if (isLiked) {
                                            newSet.delete(videoId);
                                          } else {
                                            newSet.add(videoId);
                                          }
                                          return newSet;
                                        });
                                      } else {
                                        console.error('Failed to update like status');
                                      }
                                    } catch (error) {
                                      console.error('Error liking video:', error);
                                    }
                                  }
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={likedVideos.has(lessonVideos[currentVideoIndex]?._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {likedVideos.has(lessonVideos[currentVideoIndex]?._id) ? 'Liked' : 'Like'}
                              </button>
                            </div>
                          </div>
                        </div>
                        {lessonVideos.length > 1 && (
                          <div className="cp-video-navigation">
                            <button
                              className="cp-video-nav-btn"
                              onClick={() => {
                                setCurrentVideoIndex(prev => Math.max(0, prev - 1));
                                setVideoCompleted(false);
                              }}
                              disabled={currentVideoIndex === 0}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6"></path>
                              </svg>
                              Previous
                            </button>
                            <button
                              className="cp-video-nav-btn cp-video-nav-next"
                              onClick={() => {
                                setCurrentVideoIndex(prev => Math.min(lessonVideos.length - 1, prev + 1));
                                setVideoCompleted(false);
                              }}
                              disabled={currentVideoIndex === lessonVideos.length - 1 || !videoCompleted}
                              title={!videoCompleted && currentVideoIndex < lessonVideos.length - 1 ? "Please finish the current video first" : ""}
                            >
                              Next
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6"></path>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
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
                    )}
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
                          <div className="cp-materials-wrapper">
                            <div className="cp-materials-header">
                              <h3>Learning Materials</h3>
                              <p>Resources for {currentLesson.title}</p>
                            </div>
                            {lessonMaterials.length > 0 ? (
                              <div className="cp-materials-grid">
                                {lessonMaterials.map((material) => (
                                  <div key={material._id} className="cp-material-card">
                                    <div className="cp-material-card-icon">
                                      {material.contentType === 'document' ? (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                          <line x1="16" y1="13" x2="8" y2="13"></line>
                                          <line x1="16" y1="17" x2="8" y2="17"></line>
                                          <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                      ) : (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                          <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                      )}
                                    </div>
                                    <div className="cp-material-card-content">
                                      <h4 className="cp-material-card-title">{material.title}</h4>
                                      <p className="cp-material-card-type">
                                        {material.contentType === 'document' ? 'Document' : 'Image'}
                                      </p>
                                      {material.description && (
                                        <p className="cp-material-card-desc">{material.description}</p>
                                      )}
                                    </div>
                                    <button
                                      className="cp-material-card-btn"
                                      onClick={async () => {
                                        setSelectedMaterial(material);

                                        // Track material view
                                        const materialId = material._id;
                                        if (materialId) {
                                          try {
                                            await fetch(`${API_URL}/api/students/content/${materialId}/view`, {
                                              method: 'POST',
                                              headers: {
                                                'Content-Type': 'application/json'
                                              }
                                            });
                                          } catch (error) {
                                            console.error('Error tracking material view:', error);
                                          }
                                        }
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                      View
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="cp-materials-empty">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <p>No materials available for this lesson yet.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="cp-materials-empty">
                            <p>Please select a lesson to view materials.</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "achievements" && (
                      <div className="cp-achievements-content">
                        <div className="cp-achievements-header">
                          <div>
                            <h3 className="cp-achievements-title">Lesson Achievements</h3>
                            <p className="cp-achievements-subtitle">
                              Earn these by completing {currentLesson?.title || "this lesson"}
                            </p>
                          </div>
                          <div className="cp-achievements-stats">
                            <div className="cp-achievements-stat-item">
                              <span className="cp-achievements-stat-value">{lessonAchievementsList.length}</span>
                              <span className="cp-achievements-stat-label">Available</span>
                            </div>
                          </div>
                        </div>

                        <div className="cp-achievements-grid">
                          {lessonAchievementsList.map((achievement, index) => (
                            <div key={achievement.id} className="cp-achievement-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                              <div className="cp-achievement-card-glow"></div>
                              <div className="cp-achievement-icon-container">
                                <div className="cp-achievement-icon-bg">
                                  <div className="cp-achievement-icon-pulse"></div>
                                  <span className="cp-achievement-icon-emoji">
                                    {achievement.icon === "trophy" && "🏆"}
                                    {achievement.icon === "award" && "🎖️"}
                                    {achievement.icon === "star" && "⭐"}
                                    {achievement.icon === "medal" && "🥇"}
                                    {achievement.icon === "ribbon" && "🎗️"}
                                    {!achievement.icon && "🏅"}
                                  </span>
                                </div>
                              </div>
                              <div className="cp-achievement-card-body">
                                <h4 className="cp-achievement-title-modern">{achievement.title}</h4>
                                <p className="cp-achievement-description-modern">{achievement.description}</p>
                                <div className="cp-achievement-footer">
                                  <div className="cp-achievement-points-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    <span>+{achievement.points} Points</span>
                                  </div>
                                  <div className="cp-achievement-status">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    Locked
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {lessonAchievementsList.length === 0 && (
                          <div className="cp-achievements-empty-state">
                            <div className="cp-achievements-empty-icon">
                              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                              </svg>
                            </div>
                            <h4>No Achievements Yet</h4>
                            <p>Complete lessons to unlock amazing achievements and earn points!</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "quiz" && (
                      <div className="cp-quiz-content">
                        {currentLesson ? (
                          <div className="cp-quiz-wrapper">
                            <div className="cp-quiz-header-section">
                              <h3>Practice Quizzes</h3>
                              <p>Test your knowledge of {currentLesson.title}</p>
                            </div>
                            {lessonQuizzes.length > 0 ? (
                              <div className="cp-quiz-grid">
                                {lessonQuizzes.map((quiz) => (
                                  <div key={quiz._id || quiz.id} className="cp-quiz-modern-card">
                                    <div className="cp-quiz-card-header">
                                      <span className={`cp-quiz-difficulty-badge ${quiz.difficulty?.toLowerCase()}`}>
                                        {quiz.difficulty || 'Medium'}
                                      </span>
                                      <span className="cp-quiz-time-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        {quiz.time}
                                      </span>
                                    </div>
                                    <div className="cp-quiz-card-body">
                                      <h4 className="cp-quiz-card-title">{quiz.title}</h4>
                                      <p className="cp-quiz-card-questions">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                        {quiz.questionsCount || quiz.questions || 0} Questions
                                      </p>
                                    </div>
                                    <button
                                      className="cp-quiz-start-button"
                                      onClick={() => handleStartQuiz(quiz._id || quiz.id)}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                      </svg>
                                      Start Quiz
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="cp-quiz-empty">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <p>No quizzes available for this lesson yet.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="cp-quiz-empty">
                            <p>Please select a lesson to view quizzes.</p>
                          </div>
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

                  {/* Completion / Next Course Footer */}
                  {courseData && lessons.length > 0 && completedLessonsCount >= lessons.length && (
                    <div className="cp-completion-card">
                      <span className="cp-completion-icon">🎉</span>
                      <h3 className="cp-completion-title">Course Completed!</h3>
                      <p className="cp-completion-text">You've successfully finished all lessons.</p>
                      <button
                        className="cp-completion-btn"
                        onClick={() => {
                          if (learningPath && courseData) {
                            const currentIdx = learningPath.courses.findIndex(c => c.id === courseData.id || c._id === courseData.id);
                            if (currentIdx !== -1 && currentIdx < learningPath.courses.length - 1) {
                              const nextCourse = learningPath.courses[currentIdx + 1];
                              const nextId = nextCourse.id || nextCourse._id;
                              window.location.href = `/course/${nextId}`;
                            } else {
                              navigate('/student-dashboard-2');
                            }
                          }
                        }}
                      >
                        Go to Next Course
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </aside>
              </div >
            </>
          )
          }
        </div >
      </div >

      {/* Material Viewer Modal */}
      {selectedMaterial && (
        <div className="cp-material-modal" onClick={() => setSelectedMaterial(null)}>
          <div className="cp-material-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="cp-material-modal-close" onClick={() => setSelectedMaterial(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="cp-material-modal-header">
              <h3>{selectedMaterial.title}</h3>
              {selectedMaterial.description && (
                <p>{selectedMaterial.description}</p>
              )}
            </div>
            <div className="cp-material-modal-body">
              {selectedMaterial.contentType === 'image' ? (
                <img src={selectedMaterial.fileURL} alt={selectedMaterial.title} />
              ) : (
                <iframe
                  src={selectedMaterial.fileURL}
                  title={selectedMaterial.title}
                  frameBorder="0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Player Modal */}
      {activeQuiz && !quizResults && (
        <div className="cp-quiz-player-modal">
          <div className="cp-quiz-player-content">
            <div className="cp-quiz-player-header">
              <div>
                <h2>{activeQuiz.title}</h2>
                <p className="cp-quiz-progress">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questionsAndAnswers.length}
                </p>
              </div>
              <div className="cp-quiz-header-actions">
                <button className="cp-quiz-pause-btn" onClick={handlePauseQuiz}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Pause
                </button>
                <button className="cp-quiz-close-btn" onClick={handleCloseQuiz}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="cp-quiz-progress-bar">
              <div
                className="cp-quiz-progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questionsAndAnswers.length) * 100}%` }}
              ></div>
            </div>

            <div className="cp-quiz-question-section">
              <h3 className="cp-quiz-question">
                {activeQuiz.questionsAndAnswers[currentQuestionIndex]?.question}
              </h3>

              <div className="cp-quiz-answers">
                {[
                  activeQuiz.questionsAndAnswers[currentQuestionIndex]?.correctAnswer,
                  ...(activeQuiz.questionsAndAnswers[currentQuestionIndex]?.wrongAnswers || [])
                ].sort().map((answer, idx) => (
                  <label key={idx} className="cp-quiz-answer-option">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={answer}
                      checked={quizAnswers[currentQuestionIndex] === answer}
                      onChange={() => handleSelectAnswer(currentQuestionIndex, answer)}
                    />
                    <span className="cp-quiz-answer-text">{answer}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="cp-quiz-navigation">
              <button
                className="cp-quiz-nav-btn"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
                Previous
              </button>

              {currentQuestionIndex < activeQuiz.questionsAndAnswers.length - 1 ? (
                <button
                  className="cp-quiz-nav-btn cp-quiz-next-btn"
                  onClick={handleNextQuestion}
                >
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              ) : (
                <button
                  className="cp-quiz-submit-btn"
                  onClick={handleSubmitQuiz}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>

          {quizPaused && (
            <div className="cp-quiz-pause-overlay">
              <div className="cp-quiz-pause-card">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <h3>Quiz Paused</h3>
                <p>Your progress has been saved. You can resume anytime.</p>
                <div className="cp-quiz-pause-actions">
                  <button className="cp-quiz-resume-btn" onClick={handleResumeQuiz}>
                    Resume Quiz
                  </button>
                  <button className="cp-quiz-exit-btn" onClick={handleCloseQuiz}>
                    Exit Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Results Modal */}
      {quizResults && (
        <div className="cp-quiz-results-modal">
          <div className="cp-quiz-results-content">
            <div className="cp-quiz-results-header">
              <div className="cp-quiz-results-score">
                <div className="cp-quiz-score-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={quizResults.score >= 70 ? "#10b981" : quizResults.score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      strokeDasharray={`${(quizResults.score / 100) * 339.292} 339.292`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    ></circle>
                  </svg>
                  <div className="cp-quiz-score-text">
                    <span className="cp-quiz-score-number">{quizResults.score}%</span>
                  </div>
                </div>
                <h2>Quiz Complete!</h2>
                <p className="cp-quiz-results-summary">
                  You got {quizResults.correctCount} out of {quizResults.totalQuestions} questions correct
                </p>
              </div>
            </div>

            <div className="cp-quiz-results-actions">
              <button className="cp-quiz-results-close-btn" onClick={handleCloseQuiz}>
                Back to Lessons
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notification Modal */}
      {showAchievementModal && earnedAchievements.length > 0 && (
        <div className="cp-achievement-notification-modal">
          <div className="cp-achievement-notification-content">
            <div className="cp-achievement-notification-header">
              <div className="cp-achievement-celebration-icon">🎉</div>
              <h2>Achievement{earnedAchievements.length > 1 ? 's' : ''} Unlocked!</h2>
              <p>Congratulations on completing the lesson!</p>
            </div>

            <div className="cp-achievement-notification-list">
              {earnedAchievements.map((achievement, index) => (
                <div key={achievement.id || index} className="cp-achievement-notification-item">
                  <div className="cp-achievement-notification-icon">
                    {achievement.badge === 'platinum' && '🏆'}
                    {achievement.badge === 'gold' && '🥇'}
                    {achievement.badge === 'silver' && '🥈'}
                  </div>
                  <div className="cp-achievement-notification-details">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <span className={`cp-achievement-notification-badge ${achievement.badge}`}>
                      {achievement.badge.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cp-achievement-notification-actions">
              <button
                className="cp-achievement-notification-close"
                onClick={() => {
                  setShowAchievementModal(false);
                  setEarnedAchievements([]);
                }}
              >
                Continue Learning
              </button>
              <button
                className="cp-achievement-notification-view"
                onClick={() => {
                  navigate('/achievements');
                }}
              >
                View All Achievements
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}