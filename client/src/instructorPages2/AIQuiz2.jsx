import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./AIQuiz2.css";
import { USER_CURRICULUM } from "../data/curriculum";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";

const CATS = ["Down Syndrome", "Autism"];

export default function AIQuiz2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const normalizeKey = (str = "") => str.toLowerCase().replace(/\s+/g, " ").trim();

  // Get instructor name
  const [instructorName] = useState(() => {
    const fullName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || 
                     'Instructor';
    return fullName.split(' ')[0];
  });

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Autism");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [answersPerQ, setAnswersPerQ] = useState(3);

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = normalizeKey(category);
    return USER_CURRICULUM.find((p) => normalizeKey(p.GeneralPath) === pathKey);
  }, [category]);

  // Get available courses for current category
  const availableCourses = useMemo(() => currentPath?.Courses || [], [currentPath]);

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
  const hasQuiz = items.length > 0;

  const canGenerate = useMemo(
    () => title.trim() && course && topic && lesson && Number(numQ) >= 5 && Number(numQ) <= 15 && Number(answersPerQ) >= 3,
    [title, course, topic, lesson, numQ, answersPerQ]
  );

  const genSentence = (base, n) => `${base} - scenario ${n + 1} for ${category}.`;

  const generate = () => {
    if (!canGenerate) return alert("Please fill all required fields.");
    const qs = [];
    for (let i = 0; i < Number(numQ); i++) {
      const correctIdx = Math.floor(Math.random() * Number(answersPerQ));
      const answers = Array.from({ length: Number(answersPerQ) }, (_, a) => {
        const isC = a === correctIdx;
        return isC
          ? `Correct approach ${a + 1} for ${title.toLowerCase()}`
          : `Common mistake ${a + 1} to avoid`;
      });
      qs.push({
        id: `${Date.now()}-${i}`,
        q: genSentence(`${title || "Quiz"}`, i),
        answers,
        correctIdx,
      });
    }
    setItems(qs);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearGenerated = () => setItems([]);

  const transformQuizForAPI = () => {
    return items.map((item) => ({
      q: item.q,
      a: item.answers[item.correctIdx]
    }));
  };

  const saveQuiz = async (status) => {
    if (!hasQuiz) return;
    
    if (!title.trim()) {
      alert("Quiz title is required");
      return;
    }
    if (!course || !topic || !lesson) {
      alert("Please select course, topic, and lesson");
      return;
    }
    if (items.length < 5 || items.length > 15) {
      alert("Quiz must have between 5 and 15 questions");
      return;
    }
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to save quiz");
      return;
    }

    try {
      const questionsAndAnswers = transformQuizForAPI();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          topic,
          lesson,
          course,
          questionsAndAnswers,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save quiz');
      }

      alert(status === "Published" ? "Quiz published!" : "Quiz saved as draft.");
      
      if (status === "Published") {
        setTitle("");
        setCategory("Autism");
        setCourse("");
        setTopic("");
        setLesson("");
        setNumQ(5);
        setItems([]);
      }
    } catch (error) {
      console.error('Quiz save error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const saveDraft = () => saveQuiz("Draft");
  const publish = () => saveQuiz("Published");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("le_instructor_token");
    localStorage.removeItem("le_instructor_name");
    navigate("/InstructorLogin");
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
                  <div className="ld-profile-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  <div className="ld-profile-username">@instructor</div>
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
                    <div className="ld-profile-dropdown-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">instructor@learnease.com</div>
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
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aq-number-row">
                  <div className="aq-form-field">
                    <label className="aq-form-label">Number of Questions* (5-15)</label>
                    <select className="aq-form-select" value={numQ} onChange={(e) => setNumQ(e.target.value)}>
                      {Array.from({ length: 11 }, (_, i) => i + 5).map((n) => (
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
              <button className="aq-primary-btn" onClick={generate} disabled={!canGenerate}>
                Generate
              </button>
            </div>
          </section>

          {/* Generated Results */}
          {hasQuiz && (
            <section className="aq-form-card">
              <div className="aq-results-header">
                <h3 className="aq-card-title">AI Generated Quiz</h3>
                <div className="aq-results-meta">
                  <span>{category}</span> | <span>{course} / {topic} / {lesson}</span>
                </div>
              </div>

              <ol className="aq-questions-list">
                {items.map((it, idx) => (
                  <li key={it.id} className="aq-question-card">
                    <div className="aq-question-text">
                      {idx + 1}. {it.q}
                    </div>
                    <ul className="aq-answers-list">
                      {it.answers.map((a, i) => (
                        <li key={i} className={`aq-answer-item ${i === it.correctIdx ? "correct" : "wrong"}`}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              <div className="aq-legend">
                <span className="aq-legend-item">
                  <span className="aq-legend-dot correct" /> Correct
                </span>
                <span className="aq-legend-item">
                  <span className="aq-legend-dot wrong" /> Wrong
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
    </div>
  );
}

