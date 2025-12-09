import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorUpload2.css";
import { USER_CURRICULUM } from "../data/curriculum";
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
import { uploadFile } from "../utils/uploadFile";

const FILE_TYPES = ["document", "video", "image"];

export default function InstructorUpload2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [mongoToken, setMongoToken] = useState(null);
  const { showToast, ToastComponent } = useSimpleToast();

  // Get instructor name from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (token) {
        setMongoToken(token);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
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
          }
        } catch (error) {
          console.error('Error fetching instructor name:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch content from database
  const fetchContent = useCallback(async () => {
    if (!mongoToken) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mongoToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.data || [];
        
        // Transform content to match the display format
        const transformed = content.map(item => ({
          id: item._id,
          title: item.title,
          category: item.category === 'autism' ? 'Autism' : item.category === 'downSyndrome' ? 'Down Syndrome' : item.category,
          status: item.status === 'published' ? 'Published' : item.status === 'draft' ? 'Draft' : item.status === 'archived' ? 'Archived' : item.status,
          storagePath: item.storagePath
        }));
        
        setContentRows(transformed);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  }, [mongoToken]);

  // Fetch content when token is available
  useEffect(() => {
    if (mongoToken) {
      fetchContent();
    }
  }, [mongoToken, fetchContent]);

  // Publishing state
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("");
  const [showFileTypeList, setShowFileTypeList] = useState(false);
  const [category, setCategory] = useState("Autism");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("");
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = category === "Autism" ? "autism" : "Down Syndrome";
    return USER_CURRICULUM.find(p => p.GeneralPath === pathKey);
  }, [category]);

  // Get available courses for current category
  const availableCourses = useMemo(() => {
    return currentPath?.Courses || [];
  }, [currentPath]);

  // Get available topics for selected course
  const availableTopics = useMemo(() => {
    if (!course || !currentPath) return [];
    const selectedCourse = currentPath.Courses.find(c => c.CoursesTitle === course);
    return selectedCourse?.Topics || [];
  }, [course, currentPath]);

  // Get available lessons for selected topic
  const availableLessons = useMemo(() => {
    if (!topic || !availableTopics.length) return [];
    const selectedTopic = availableTopics.find(t => t.TopicsTitle === topic);
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

  // Quiz state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [pairs, setPairs] = useState(Array(5).fill(null).map(() => ({ q: "", a: "" })));

  // Get current path for quiz based on quiz category
  const quizCurrentPath = useMemo(() => {
    const pathKey = quizCategory === "Autism" ? "autism" : "Down Syndrome";
    return USER_CURRICULUM.find(p => p.GeneralPath === pathKey);
  }, [quizCategory]);

  // Get available courses for quiz category
  const quizAvailableCourses = useMemo(() => {
    return quizCurrentPath?.Courses || [];
  }, [quizCurrentPath]);

  // Get available topics for selected quiz course
  const quizAvailableTopics = useMemo(() => {
    if (!quizCourse || !quizCurrentPath) return [];
    const selectedCourse = quizCurrentPath.Courses.find(c => c.CoursesTitle === quizCourse);
    return selectedCourse?.Topics || [];
  }, [quizCourse, quizCurrentPath]);

  // Get available lessons for selected quiz topic
  const quizAvailableLessons = useMemo(() => {
    if (!quizTopic || !quizAvailableTopics.length) return [];
    const selectedTopic = quizAvailableTopics.find(t => t.TopicsTitle === quizTopic);
    return selectedTopic?.lessons || [];
  }, [quizTopic, quizAvailableTopics]);

  // Reset dependent selections when quiz category or course changes
  const handleQuizCategoryChange = (newCategory) => {
    setQuizCategory(newCategory);
    setQuizCourse("");
    setQuizTopic("");
    setQuizLesson("");
  };

  const handleQuizCourseChange = (newCourse) => {
    setQuizCourse(newCourse);
    setQuizTopic("");
    setQuizLesson("");
  };

  const handleQuizTopicChange = (newTopic) => {
    setQuizTopic(newTopic);
    setQuizLesson("");
  };

  const selectFileType = (type) => {
    if (fileType === type) {
      setFileType("");
    } else {
      setFileType(type);
    }
    setShowFileTypeList(false);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!desc.trim()) e.desc = "Description is required";
    if (!file) {
      e.file = "File is required";
    }
    if (!fileType) e.fileType = "File type is required";
    if (!course) e.course = "Course is required";
    if (!topic) e.topic = "Topic is required";
    if (!lesson) e.lesson = "Lesson is required";
    if (!difficulty) e.difficulty = "Difficulty is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveContent = async (status) => {
    if (!validate()) return;
    
    if (!mongoToken) {
      showToast("Please log in to save content", "error");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("You must be logged in to upload content", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Upload file to Firebase Storage
      const storageFolder = fileType; // 'documents', 'videos', or 'images'
      const uploadResult = await uploadFile(
        file,
        storageFolder,
        currentUser.uid,
        (progress) => setUploadProgress(progress)
      );

      // Step 2: Save content to MongoDB
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const contentStatus = status === "Published" ? "published" : "draft";
      
      // Normalize category
      const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
      const normalizedCategory = categoryMap[category] || category.toLowerCase();

      const response = await fetch(`${API_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          title: title.trim(),
          category: normalizedCategory,
          type: fileType,
          topic: topic,
          lesson: lesson,
          course: course,
          description: desc.trim(),
          difficulty: difficulty || null,
          url: uploadResult.url,
          storagePath: uploadResult.path,
          fileType: file.type || '',
          size: file.size,
          firebaseUid: currentUser.uid,
          status: contentStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      const savedContent = await response.json();
      
      showToast(
        status === "Published" ? "Content published successfully!" : "Content saved as draft",
        "success"
      );

      // Refresh content list
      await fetchContent();
          
      // Clear form if published
          if (status === "Published") {
            setTitle("");
            setDesc("");
            setFile(null);
            setFileType("");
            setCourse("");
            setTopic("");
            setLesson("");
            setDifficulty("");
            setUploadProgress(0);
      } else {
        // For drafts, just reset progress
        setUploadProgress(0);
        }
    } catch (error) {
      console.error('Error saving content:', error);
      showToast(`Failed to save content: ${error.message}`, "error");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const onSaveDraft = () => saveContent("Draft");
  const onPublish = () => saveContent("Published");

  const addPair = () => {
    if (pairs.length >= 15) {
      showToast("Maximum 15 questions allowed", "error");
      return;
    }
    setPairs([...pairs, { q: "", a: "" }]);
  };
  
  const removePair = (idx) => {
    if (pairs.length <= 5) {
      showToast("Minimum 5 questions required", "error");
      return;
    }
    setPairs(pairs.filter((_, i) => i !== idx));
  };
  
  const saveQuiz = async (status) => {
    if (!quizTitle.trim()) {
      showToast("Quiz title is required", "error");
      return;
    }
    if (!quizCourse || !quizTopic || !quizLesson) {
      showToast("Please select course, topic, and lesson", "error");
      return;
    }
    if (pairs.length < 5) {
      showToast("Minimum 5 questions required", "error");
      return;
    }
    if (pairs.some(p => !p.q.trim() || !p.a.trim())) {
      showToast("Please fill in all questions and answers", "error");
      return;
    }

    // Simulate save (no backend connection)
    showToast(status === "Published" ? "Quiz published! (Simulated)" : "Quiz saved as draft. (Simulated)", "success");
    
    if (status === "Published") {
      setQuizTitle("");
      setQuizCategory("Autism");
      setQuizCourse("");
      setQuizTopic("");
      setQuizLesson("");
      setPairs(Array(5).fill(null).map(() => ({ q: "", a: "" })));
    }
  };

  const onPublishQuiz = () => saveQuiz("Published");
  const onSaveQuizDraft = () => saveQuiz("Draft");

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login");
  };

  // Scroll detection for chatbot animation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close profile dropdown when clicking outside
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

  // Close file type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFileTypeList && !event.target.closest('.ld-upload-field')) {
        setShowFileTypeList(false);
      }
    };

    if (showFileTypeList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFileTypeList]);

  const handleChatbotClick = () => {
    console.log("Chatbot clicked");
  };

  // Sidebar items
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

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  // Sample data for content and quizzes (no backend)
  const [contentRows, setContentRows] = useState([]);
  const [quizRows, setQuizRows] = useState([]);

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
            <h1 className="ld-upload-header-title">Publishing</h1>
          </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button 
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="ld-profile-avatar-image"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                  <div className="ld-profile-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                  )}
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
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt="Profile" 
                        className="ld-profile-dropdown-avatar-img"
                      />
                    ) : (
                    <div className="ld-profile-dropdown-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                    )}
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
          {/* Publishing Section */}
          <section className="ld-upload-section-main">
            <div className="ld-upload-card-main">
              <div className="ld-upload-form-row">
                <div className="ld-upload-field">
                  <label>Choose a title for your content*:</label>
                  <input
                    className={`ld-upload-input ${errors.title ? "ld-upload-error" : ""}`}
                    placeholder="Give a title to your content"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <span className="ld-upload-error-text">{errors.title}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Choose file type*:</label>
                  <div
                    className="ld-upload-tagbox"
                    onClick={() => setShowFileTypeList((s) => !s)}
                    role="button"
                    tabIndex={0}
                  >
                    {!fileType ? (
                      <span className="ld-upload-placeholder">Choose file type (document, video, or image)</span>
                    ) : (
                      <div className="ld-upload-chips">
                        <span className="ld-upload-chip">
                          {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                        </span>
                      </div>
                    )}
                    <span className="ld-upload-caret">▾</span>
                  </div>
                  {errors.fileType && <span className="ld-upload-error-text">{errors.fileType}</span>}

                  {showFileTypeList && (
                    <ul className="ld-upload-taglist">
                      {FILE_TYPES.map((type) => (
                        <li key={type}>
                          <button
                            type="button"
                            className={`ld-upload-tagitem ${fileType === type ? "selected" : ""}`}
                            onClick={() => selectFileType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div
                className="ld-upload-area"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('ld-upload-dragover');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ld-upload-dragover');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ld-upload-dragover');
                  setFile(e.dataTransfer.files?.[0] || null);
                }}
              >
                <input
                  id="ld-upload-file"
                  type="file"
                  accept=".mp4,.mov,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {!file ? (
                  <>
                    <div className="ld-upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ld-upload-content-text">
                      <p className="ld-upload-text">
                        <label htmlFor="ld-upload-file" className="ld-upload-link">Click to upload</label> or drag and drop
                      </p>
                      <small className="ld-upload-hint">PDF, DOC, DOCX, MP4, MOV, JPG, PNG, GIF (Max 800MB)</small>
                    </div>
                  </>
                ) : (
                  <div className="ld-upload-file-selected">
                    <div className="ld-upload-file-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ld-upload-file-info">
                      <div className="ld-upload-filename">{file.name}</div>
                      <small className="ld-upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <label htmlFor="ld-upload-file" className="ld-upload-change-btn">Change</label>
                  </div>
                )}
                {errors.file && <span className="ld-upload-error-text">{errors.file}</span>}
                {isUploading && (
                  <div className="ld-upload-progress">
                    <div className="ld-upload-progress-bar">
                      <div 
                        className="ld-upload-progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <span className="ld-upload-progress-text">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ld-upload-categories">
                <span>Category:</span>
                <button
                  type="button"
                  className={`ld-upload-catbtn ${category === "Down Syndrome" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("Down Syndrome")}
                >
                  Down Syndrome
                </button>
                <button
                  type="button"
                  className={`ld-upload-catbtn ${category === "Autism" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("Autism")}
                >
                  Autism
                </button>
              </div>

              <div className="ld-upload-selects-grid">
                <div className="ld-upload-field">
                  <label>Select Course:</label>
                  <select 
                    className={`ld-upload-input ${errors.course ? "ld-upload-error" : ""}`}
                    value={course} 
                    onChange={(e) => handleCourseChange(e.target.value)}
                    disabled={!availableCourses.length}
                  >
                    <option value="" disabled>Choose a course</option>
                    {availableCourses.map(c => (
                      <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
                    ))}
                  </select>
                  {errors.course && <span className="ld-upload-error-text">{errors.course}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Topic:</label>
                  <select 
                    className={`ld-upload-input ${errors.topic ? "ld-upload-error" : ""}`}
                    value={topic} 
                    onChange={(e) => handleTopicChange(e.target.value)}
                    disabled={!course || !availableTopics.length}
                  >
                    <option value="" disabled>Choose a topic</option>
                    {availableTopics.map(t => (
                      <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
                    ))}
                  </select>
                  {errors.topic && <span className="ld-upload-error-text">{errors.topic}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Lesson:</label>
                  <select 
                    className={`ld-upload-input ${errors.lesson ? "ld-upload-error" : ""}`}
                    value={lesson} 
                    onChange={(e) => setLesson(e.target.value)}
                    disabled={!topic || !availableLessons.length}
                  >
                    <option value="" disabled>Choose a lesson</option>
                    {availableLessons.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  {errors.lesson && <span className="ld-upload-error-text">{errors.lesson}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Difficulty*:</label>
                  <select 
                    className={`ld-upload-input ${errors.difficulty ? "ld-upload-error" : ""}`}
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="" disabled>Choose difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.difficulty && <span className="ld-upload-error-text">{errors.difficulty}</span>}
                </div>
              </div>

              <div className="ld-upload-field">
                <label>Description*:</label>
                <textarea
                  className={`ld-upload-textarea ${errors.desc ? "ld-upload-error" : ""}`}
                  placeholder="Give a description to your content"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                {errors.desc && <span className="ld-upload-error-text">{errors.desc}</span>}
              </div>

              <div className="ld-upload-actions">
                <button 
                  className="ld-upload-secondary" 
                  onClick={onSaveDraft}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Save as Draft"}
                </button>
                <button 
                  className="ld-upload-primary" 
                  onClick={onPublish}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Publish"}
                </button>
              </div>
            </div>
          </section>

          {/* Quiz Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Quiz</h2>
            <div className="ld-upload-card-main">
              <div className="ld-upload-quiz-top">
                <div className="ld-upload-field">
                  <label>Title of the quiz*:</label>
                  <input
                    className="ld-upload-input"
                    placeholder="Give your question here"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>
                <div className="ld-upload-field">
                  <label>Category:</label>
                  <div className="ld-upload-categories ld-upload-no-margin">
                    <button
                      type="button"
                      className={`ld-upload-catbtn ${quizCategory === "Down Syndrome" ? "active" : ""}`}
                      onClick={() => handleQuizCategoryChange("Down Syndrome")}
                    >
                      Down Syndrome
                    </button>
                    <button
                      type="button"
                      className={`ld-upload-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                      onClick={() => handleQuizCategoryChange("Autism")}
                    >
                      Autism
                    </button>
                  </div>
                </div>
              </div>

              <div className="ld-upload-quiz-note">Choose the course, topic, and lesson this quiz will be associated. Difficulty will be set automatically based on the number of questions (5: Easy, 6-10: Medium, 11-15: Hard).</div>
              
              <div className="ld-upload-quiz-selects">
                <select 
                  className="ld-upload-input ld-upload-quiz-select" 
                  value={quizCourse} 
                  onChange={(e) => handleQuizCourseChange(e.target.value)}
                  disabled={!quizAvailableCourses.length}
                >
                  <option value="" disabled>Course</option>
                  {quizAvailableCourses.map(c => (
                    <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
                  ))}
                </select>
                <select 
                  className="ld-upload-input ld-upload-quiz-select" 
                  value={quizTopic} 
                  onChange={(e) => handleQuizTopicChange(e.target.value)}
                  disabled={!quizCourse || !quizAvailableTopics.length}
                >
                  <option value="" disabled>Topic</option>
                  {quizAvailableTopics.map(t => (
                    <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
                  ))}
                </select>
                <select 
                  className="ld-upload-input ld-upload-quiz-select" 
                  value={quizLesson} 
                  onChange={(e) => setQuizLesson(e.target.value)}
                  disabled={!quizTopic || !quizAvailableLessons.length}
                >
                  <option value="" disabled>Lesson</option>
                  {quizAvailableLessons.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              
              <div className="ld-upload-quiz-count">
                Questions: {pairs.length} / 15 (Minimum: 5)
              </div>

              {pairs.map((p, i) => (
                <div key={i} className="ld-upload-qa-row">
                  <div className="ld-upload-field">
                    <label>Question for the quiz*:</label>
                    <input
                      className="ld-upload-input"
                      placeholder="Give your question here"
                      value={p.q}
                      onChange={(e) => {
                        const next = [...pairs];
                        next[i].q = e.target.value;
                        setPairs(next);
                      }}
                    />
                  </div>
                  <div className="ld-upload-field">
                    <label>Answer for the question*:</label>
                    <input
                      className="ld-upload-input"
                      placeholder="Give your answer here"
                      value={p.a}
                      onChange={(e) => {
                        const next = [...pairs];
                        next[i].a = e.target.value;
                        setPairs(next);
                      }}
                    />
                  </div>

                  {pairs.length > 5 && (
                    <button
                      type="button"
                      className="ld-upload-quiz-remove"
                      onClick={() => removePair(i)}
                      title="Remove this Q/A (Minimum 5 questions required)"
                    >
                      −
                    </button>
                  )}

                  {i === pairs.length - 1 && pairs.length < 15 && (
                    <button type="button" className="ld-upload-quiz-add" onClick={addPair} title="Add question (Maximum 15 questions)">+</button>
                  )}
                </div>
              ))}

              <div className="ld-upload-actions">
                <button className="ld-upload-secondary" onClick={onSaveQuizDraft}>Save as Draft</button>
                <button className="ld-upload-primary" onClick={onPublishQuiz}>Publish</button>
              </div>
            </div>
          </section>

          {/* Content List Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Content</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Content title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className="ld-upload-content-rows">
                {contentRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📄</div>
                    <p className="ld-upload-empty-text">No content yet</p>
                    <p className="ld-upload-empty-subtext">Create and publish your first content to see it here</p>
                  </div>
                ) : (
                  contentRows.map((row) => (
                    <div key={row.id} className="ld-upload-content-row">
                      <div className="ld-upload-content-title">{row.title}</div>
                      <div className="ld-upload-pill">{row.category}</div>
                      <div className={`ld-upload-status-pill ${
                        row.status === "Published" ? "ld-upload-status-green" :
                        row.status === "Draft" ? "ld-upload-status-red" : "ld-upload-status-yellow"
                      }`}>
                        {row.status}
                      </div>
                      <div className="ld-upload-content-actions">
                        <button type="button" className="ld-upload-btn-arch">Archive</button>
                        <button type="button" className="ld-upload-btn-del">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Quizzes List Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Quizzes</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Quiz title</span>
                <span>Category</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className="ld-upload-content-rows">
                {quizRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📝</div>
                    <p className="ld-upload-empty-text">No quizzes yet</p>
                    <p className="ld-upload-empty-subtext">Create and publish your first quiz to see it here</p>
                  </div>
                ) : (
                  quizRows.map((row) => (
                    <div key={row.id} className="ld-upload-content-row">
                      <div className="ld-upload-content-title">{row.title}</div>
                      <div className="ld-upload-pill">{row.category}</div>
                      <div className="ld-upload-content-actions">
                        <button type="button" className="ld-upload-btn-arch">Archive</button>
                        <button type="button" className="ld-upload-btn-del">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* AI Assistant Chatbot Icon */}
      <div 
        className={`ai-chatbot-icon ${scrollDirection}`}
        onClick={handleChatbotClick}
        role="button"
        tabIndex={0}
        aria-label="AI Assistant"
      >
        <div className="ai-chatbot-icon-inner">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="ai-chatbot-svg"
          >
            <rect x="4" y="6" width="16" height="14" rx="2" fill="currentColor" />
            <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
            <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1.5" fill="white"/>
            <circle cx="15" cy="11" r="1.5" fill="white"/>
            <circle cx="9" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            <circle cx="15" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            <rect x="9" y="15" width="6" height="2" rx="1" fill="white"/>
            <circle cx="7" cy="9" r="0.5" fill="white" opacity="0.6"/>
            <circle cx="17" cy="9" r="0.5" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div className="ai-chatbot-pulse"></div>
      </div>
      <ToastComponent />
    </div>
  );
}

