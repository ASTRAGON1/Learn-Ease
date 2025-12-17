import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./AIQuiz2.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";
import { useSimpleToast } from "../utils/toast";

const CATS = ["Down Syndrome", "Autism"];


const ProfileAvatar = ({ src, name, className, style, fallbackClassName }) => {
  const [error, setError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt="Profile"
        className={className}
        style={style}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {(name || "User").slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function AIQuiz2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState('pending');
  const { showToast, ToastComponent } = useSimpleToast();

  // Get instructor name from Firebase Auth
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (!token) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          setLoading(false);
          navigate('/all-login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const teacher = data.data || data;
          if (teacher.fullName) {
            setInstructorName(teacher.fullName.split(' ')[0]);
          }
          if (teacher.email) {
            setEmail(teacher.email);
          }
          if (teacher.profilePic) {
            setProfilePic(teacher.profilePic);
          }
          if (teacher.userStatus) {
            setUserStatus(teacher.userStatus);
            // Redirect if not approved or suspended
            if (teacher.userStatus !== 'active') {
              const message = teacher.userStatus === 'suspended'
                ? "Your account has been suspended. Please contact support for more information."
                : "You need to be accepted by the admin to generate quizzes.";
              showToast(message, "error");
              setTimeout(() => {
                navigate('/instructor-dashboard-2');
              }, 2000);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching instructor name:', error);
        setLoading(false);
        navigate('/all-login');
        return;
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Autism");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [numQ, setNumQ] = useState(3);
  const [answersPerQ, setAnswersPerQ] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [curriculumData, setCurriculumData] = useState([]);

  // Fetch learning paths data
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const token = await getMongoDBToken();
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/admin/learning-paths`, {
          headers
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            // Keep full structure with IDs and names
            const transformed = result.data.map(path => ({
              id: path.id,
              GeneralPath: path.type || (path.id.includes('autism') ? 'autism' : path.id.includes('down') ? 'downSyndrome' : path.id),
              pathTitle: path.name,
              Courses: path.courses.map(course => ({
                id: course.id,
                CoursesTitle: course.name,
                Topics: course.topics.map(topic => ({
                  id: topic.id,
                  TopicsTitle: topic.name,
                  lessons: topic.lessons.map(lesson => ({
                    id: lesson.id,
                    name: lesson.name
                  }))
                }))
              }))
            }));
            console.log('📚 Fetched curriculum data:', transformed);
            console.log('📚 Number of paths:', transformed.length);
            if (transformed.length > 0) {
              console.log('📚 First path:', transformed[0]);
              console.log('📚 First path courses:', transformed[0].Courses);
            }
            setCurriculumData(transformed);
          }
        } else {
          console.error('❌ Failed to fetch learning paths:', response.status);
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      }
    };
    fetchPaths();
  }, []);

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = category === "Autism" ? "autism" : "downSyndrome";
    console.log('🔍 Looking for path with key:', pathKey);
    console.log('🔍 Available curriculum data:', curriculumData);
    const found = curriculumData.find(p => p.GeneralPath === pathKey);
    console.log('🔍 Found path:', found);
    return found;
  }, [category, curriculumData]);

  // Get available courses for current category
  const availableCourses = useMemo(() => {
    const courses = currentPath?.Courses || [];
    console.log('📖 Available courses for', category, ':', courses);
    return courses;
  }, [currentPath, category]);

  // Get available topics for selected course
  const availableTopics = useMemo(() => {
    if (!course || !currentPath) return [];
    const selectedCourse = currentPath.Courses.find((c) => c.CoursesTitle === course);
    return selectedCourse?.Topics || [];
  }, [course, currentPath]);

  // Get available lessons for selected topic
  const availableLessons = useMemo(() => {
    if (!topic || !availableTopics.length) return [];
    const selectedTopic = availableTopics.find((t) => t.TopicsTitle === topic);
    return selectedTopic?.lessons || [];
  }, [topic, availableTopics]);

  // Get IDs for selected items
  const getSelectedIds = useMemo(() => {
    if (!currentPath) return { pathId: null, courseId: null, topicId: null, lessonId: null };

    const pathId = currentPath.id;
    const selectedCourse = currentPath.Courses.find(c => c.CoursesTitle === course);
    const courseId = selectedCourse?.id || null;
    const selectedTopic = selectedCourse?.Topics.find(t => t.TopicsTitle === topic);
    const topicId = selectedTopic?.id || null;
    const selectedLesson = selectedTopic?.lessons.find(l => l.name === lesson);
    const lessonId = selectedLesson?.id || null;

    return { pathId, courseId, topicId, lessonId };
  }, [currentPath, course, topic, lesson]);

  // Reset dependent selections when category or course changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCourse("");
    setTopic("");
    setLesson("");
  };

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setTopic("");
    setLesson("");
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    setLesson("");
  };

  // Generated quiz
  const [items, setItems] = useState([]);
  const [quizContext, setQuizContext] = useState(null); // Track the context when quiz was generated
  const [editingField, setEditingField] = useState(null); // Track which field is being edited: "q-{idx}" or "a-{idx}-{answerIdx}"
  const inputRefs = useRef({}); // Store refs for inputs to focus them
  const hasQuiz = items.length > 0;

  const canGenerate = useMemo(
    () => title.trim() && course && topic && lesson && difficulty && Number(numQ) >= 3 && Number(numQ) <= 10 && Number(answersPerQ) >= 3 && !isGenerating,
    [title, course, topic, lesson, difficulty, numQ, answersPerQ, isGenerating]
  );

  const generate = async () => {
    if (!canGenerate) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    setIsGenerating(true);
    showToast("Generating quiz with AI...", "success");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/ai/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          category: category,
          course: course,
          topic: topic,
          lesson: lesson,
          difficulty: difficulty,
          numQuestions: Number(numQ),
          numAnswers: Number(answersPerQ)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.success && data.data && data.data.questions) {
        // Transform AI response to our format
        const qs = data.data.questions.map((q, idx) => ({
          id: `${Date.now()}-${idx}`,
          q: q.question,
          answers: q.answers,
          correctIdx: q.correctIndex
        }));

        setItems(qs);
        // Store the context when quiz was generated
        setQuizContext({
          course,
          topic,
          lesson,
          difficulty,
          category
        });
        showToast("Quiz generated successfully!", "success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGenerated = () => {
    setItems([]);
    setQuizContext(null);
  };

  // Clear quiz if critical fields change (course, topic, lesson, difficulty, category)
  useEffect(() => {
    if (hasQuiz && quizContext) {
      const contextChanged =
        quizContext.course !== course ||
        quizContext.topic !== topic ||
        quizContext.lesson !== lesson ||
        quizContext.difficulty !== difficulty ||
        quizContext.category !== category;

      if (contextChanged) {
        setItems([]);
        setQuizContext(null);
        showToast("Quiz cleared: Course, Topic, Lesson, Difficulty, or Category was changed. Please regenerate the quiz.", "error");
      }
    }
  }, [course, topic, lesson, difficulty, category, hasQuiz, quizContext]);

  const transformQuizForAPI = () => {
    return items.map((item) => {
      // Validate item has required fields
      if (!item.q || !item.answers || !Array.isArray(item.answers) || item.answers.length === 0) {
        throw new Error('Invalid question format');
      }

      if (typeof item.correctIdx !== 'number' || item.correctIdx < 0 || item.correctIdx >= item.answers.length) {
        throw new Error('Invalid correct answer index');
      }

      // Get wrong answers (all answers except the correct one)
      const wrongAnswers = item.answers
        .map((ans, idx) => idx !== item.correctIdx ? ans : null)
        .filter(Boolean);

      return {
        q: item.q.trim(),
        a: item.answers[item.correctIdx].trim(),
        wrongAnswers: wrongAnswers.map(ans => ans.trim()).filter(ans => ans.length > 0)
      };
    });
  };

  const saveQuiz = async (status) => {
    if (!hasQuiz) return;

    if (!title.trim()) {
      showToast("Quiz title is required", "error");
      return;
    }
    if (!course || !topic || !lesson) {
      showToast("Please select course, topic, and lesson", "error");
      return;
    }
    if (!difficulty) {
      showToast("Please select difficulty level", "error");
      return;
    }
    if (items.length < 3 || items.length > 10) {
      showToast("Quiz must have between 3 and 10 questions", "error");
      return;
    }

    const token = await getMongoDBToken();
    if (!token) {
      showToast("Please log in to save quiz", "error");
      navigate('/all-login');
      return;
    }

    try {
      const questionsAndAnswers = transformQuizForAPI();

      // Normalize category for backend
      const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
      const normalizedCategory = categoryMap[category] || category.toLowerCase();

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          category: normalizedCategory,
          topic,
          lesson,
          course,
          // Add IDs for proper linking
          pathId: getSelectedIds.pathId,
          courseId: getSelectedIds.courseId,
          topicId: getSelectedIds.topicId,
          lessonId: getSelectedIds.lessonId,
          difficulty,
          questionsAndAnswers,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (e) {
          error = { error: `Server error (${response.status})` };
        }
        console.error('Quiz save API error:', {
          status: response.status,
          statusText: response.statusText,
          error: error
        });
        throw new Error(error.error || error.message || `Failed to save quiz (${response.status})`);
      }

      showToast(status === "Published" ? "Quiz published!" : "Quiz saved as draft.", "success");

      // Clear form only if published
      if (status === "Published") {
        setTitle("");
        setCategory("Autism");
        setCourse("");
        setTopic("");
        setLesson("");
        setDifficulty("Easy");
        setNumQ(3);
        setItems([]);
        setQuizContext(null);
        setEditingField(null);
      }
    } catch (error) {
      console.error('Quiz save error:', error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const saveDraft = () => saveQuiz("Draft");
  const publish = () => saveQuiz("Published");

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    // Always navigate to login page, even if signOut fails
    navigate("/all-login", { replace: true });
  };

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.ld-profile-container')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const sidebarItems = [
    {
      key: "course",
      label: "Course",
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "performance",
      label: "Performance",
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "curriculum",
      label: "Curriculum",
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "resources",
      label: "Resources",
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
  ];

  if (loading) {
    return (
      <div className="ld-page">
        <div className="ld-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar */}
      <aside
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ld-sidebar-footer">
            <button className="ld-sidebar-link ld-sidebar-logout" onClick={handleLogout}>
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2")}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-center">
            <h1 className="ld-upload-header-title">Generate Quizzes using AI</h1>
          </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  <ProfileAvatar
                    src={profilePic}
                    name={instructorName}
                    className="ld-profile-avatar-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    fallbackClassName="ld-profile-avatar"
                  />
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  {email && <div className="ld-profile-email">{email}</div>}
                </div>
                <svg
                  className={`ld-profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ld-profile-dropdown">
                  <div className="ld-profile-dropdown-header">
                    <ProfileAvatar
                      src={profilePic}
                      name={instructorName}
                      className="ld-profile-dropdown-avatar-img"
                      fallbackClassName="ld-profile-dropdown-avatar"
                    />
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">{email || 'No email'}</div>
                    </div>
                  </div>
                  <div className="ld-profile-dropdown-divider"></div>
                  <Link to="/profile-2" className="ld-profile-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </Link>
                  <button className="ld-profile-dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ld-content">
          {/* Form Card */}
          <section className="aq-form-card">
            <h3 className="aq-card-title">AI Quiz</h3>

            <div className="aq-form-grid">
              <div className="aq-form-left">
                <div className="aq-form-field">
                  <label className="aq-form-label">Title of the quiz*</label>
                  <input
                    className="aq-form-input"
                    placeholder="Give the title of the quiz here"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="aq-form-hint">Choose the course, topic and the lesson this quiz will be associated</div>

                <div className="aq-selects-row">
                  <select
                    className="aq-form-select"
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    disabled={!availableCourses.length}
                  >
                    <option value="" disabled>Course</option>
                    {availableCourses.map((c) => (
                      <option key={c.CoursesTitle} value={c.CoursesTitle}>
                        {c.CoursesTitle}
                      </option>
                    ))}
                  </select>

                  <select
                    className="aq-form-select"
                    value={topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    disabled={!course || !availableTopics.length}
                  >
                    <option value="" disabled>Topic</option>
                    {availableTopics.map((t) => (
                      <option key={t.TopicsTitle} value={t.TopicsTitle}>
                        {t.TopicsTitle}
                      </option>
                    ))}
                  </select>

                  <select
                    className="aq-form-select"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    disabled={!topic || !availableLessons.length}
                  >
                    <option value="" disabled>Lesson</option>
                    {availableLessons.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aq-form-field">
                  <label className="aq-form-label">Difficulty*</label>
                  <div className="aq-difficulty-pills">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        type="button"
                        key={d}
                        className={`aq-difficulty-pill ${difficulty === d ? "active" : ""}`}
                        onClick={() => setDifficulty(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aq-number-row">
                  <div className="aq-form-field">
                    <label className="aq-form-label">Number of Questions* (3-10)</label>
                    <select className="aq-form-select" value={numQ} onChange={(e) => setNumQ(e.target.value)}>
                      {Array.from({ length: 8 }, (_, i) => i + 3).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="aq-form-field">
                    <label className="aq-form-label">Number of Answers per question</label>
                    <select className="aq-form-select" value={answersPerQ} onChange={(e) => setAnswersPerQ(e.target.value)}>
                      {[3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="aq-form-right">
                <div className="aq-form-field">
                  <label className="aq-form-label">Category:</label>
                  <div className="aq-category-pills">
                    {CATS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        className={`aq-category-pill ${category === c ? "active" : ""}`}
                        onClick={() => handleCategoryChange(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="aq-form-actions">
              {hasQuiz && (
                <div className="aq-form-note" style={{ marginRight: 'auto', fontSize: '13px', color: 'var(--ld-text-secondary)' }}>
                  💡 Note: Changing Course, Topic, Lesson, Difficulty, or Category will clear the quiz. You can edit Title, Number of Questions, or Answers per question without clearing.
                </div>
              )}
              <button className="aq-primary-btn" onClick={generate} disabled={!canGenerate}>
                {isGenerating ? "Generating..." : hasQuiz ? "Regenerate Quiz" : "Generate"}
              </button>
            </div>
          </section>

          {/* Generated Results */}
          {hasQuiz && (
            <section className="aq-form-card">
              <div className="aq-results-header">
                <h3 className="aq-card-title">AI Generated Quiz</h3>
                <div className="aq-results-meta">
                  <span>{category}</span> | <span>{course} / {topic} / {lesson}</span> | <span>Difficulty: {difficulty}</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--ld-text-secondary)', fontStyle: 'italic' }}>
                  💡 You can edit Title, Number of Questions, or Answers per question. Changing Course, Topic, Lesson, Difficulty, or Category will clear this quiz.
                </div>
              </div>

              <ol className="aq-questions-list">
                {items.map((it, idx) => (
                  <li key={it.id} className="aq-question-card">
                    <div className="aq-question-text">
                      <span style={{ marginRight: '8px', fontWeight: '600' }}>{idx + 1}.</span>
                      <input
                        ref={(el) => inputRefs.current[`q-${idx}`] = el}
                        type="text"
                        className="aq-question-input"
                        value={it.q}
                        readOnly={editingField !== `q-${idx}`}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].q = e.target.value;
                          setItems(updated);
                        }}
                        onClick={(e) => {
                          if (editingField !== `q-${idx}`) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onFocus={(e) => {
                          if (editingField !== `q-${idx}`) {
                            e.target.blur();
                          }
                        }}
                        onBlur={() => setEditingField(null)}
                        placeholder="Enter question text"
                      />
                      <button
                        type="button"
                        className="aq-edit-btn"
                        onClick={() => {
                          setEditingField(`q-${idx}`);
                          setTimeout(() => {
                            inputRefs.current[`q-${idx}`]?.focus();
                          }, 0);
                        }}
                        title="Edit question"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                    <ul className="aq-answers-list">
                      {it.answers.map((a, i) => (
                        <li key={i} className={`aq-answer-item ${i === it.correctIdx ? "correct" : "wrong"}`}>
                          <input
                            ref={(el) => inputRefs.current[`a-${idx}-${i}`] = el}
                            type="text"
                            className="aq-answer-input"
                            value={a}
                            readOnly={editingField !== `a-${idx}-${i}`}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].answers[i] = e.target.value;
                              setItems(updated);
                            }}
                            onClick={(e) => {
                              if (editingField !== `a-${idx}-${i}`) {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                            onFocus={(e) => {
                              if (editingField !== `a-${idx}-${i}`) {
                                e.target.blur();
                              }
                            }}
                            onBlur={() => setEditingField(null)}
                            placeholder="Enter answer text"
                          />
                          <button
                            type="button"
                            className="aq-edit-btn"
                            onClick={() => {
                              setEditingField(`a-${idx}-${i}`);
                              setTimeout(() => {
                                inputRefs.current[`a-${idx}-${i}`]?.focus();
                              }, 0);
                            }}
                            title="Edit answer"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              <div className="aq-legend">
                <span className="aq-legend-item">
                  <span className="aq-legend-dot correct" /> Correct Answer
                </span>
                <span className="aq-legend-item">
                  <span className="aq-legend-dot wrong" /> Wrong Answer
                </span>
                <span style={{ fontSize: '13px', color: 'var(--ld-text-secondary)', marginLeft: '16px' }}>
                  💡 Click the edit icon to edit questions and answers. The correct answer is set by the AI and cannot be changed.
                </span>
              </div>

              <div className="aq-form-actions">
                <button className="aq-secondary-btn" onClick={clearGenerated}>
                  Cancel
                </button>
                <button className="aq-secondary-btn" onClick={saveDraft}>
                  Save as Draft
                </button>
                <button className="aq-primary-btn" onClick={publish}>
                  Publish
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      <ToastComponent />
    </div>
  );
}

