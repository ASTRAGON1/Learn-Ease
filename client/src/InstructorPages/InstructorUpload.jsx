// src/pages/InstructorUpload.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InstructorUpload.css";
import { USER_CURRICULUM } from "../data/curriculum";
import { uploadFile } from "../utils/uploadFile";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const FILE_TYPES = [
  "document",
  "video",
  "image"
];

export default function InstructorUpload() {
  const navigate = useNavigate();
  
  // Publishing
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState(""); // Single selection: document, video, or image
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

  // Tables
  const [contentRows, setContentRows] = useState([]);
  const [archivedRows, setArchivedRows] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [quizRows, setQuizRows] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allContent = result.data || [];
          
          // Separate published/draft from archived
          const active = allContent.filter(c => c.status !== 'archived');
          const archived = allContent.filter(c => c.status === 'archived');
          
          // Map to display format
          const mapContent = (content) => ({
            id: content._id,
            title: content.title,
            category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
            status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
          });
          
          setContentRows(active.map(mapContent));
          setArchivedRows(archived.map(mapContent));
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, []);

  // Fetch quizzes from database
  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allQuizzes = result.data || [];
          
          // Filter out archived quizzes
          const active = allQuizzes.filter(q => q.status !== 'archived');
          
          // Map to display format
          const mapQuiz = (quiz) => ({
            id: quiz._id,
            title: quiz.title,
            category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome',
            status: quiz.status === 'published' ? 'Published' : quiz.status === 'draft' ? 'Draft' : 'Archived',
            difficulty: quiz.difficulty || '-'
          });
          
          setQuizRows(active.map(mapQuiz));
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [pairs, setPairs] = useState(Array(5).fill(null).map(() => ({ q: "", a: "" }))); // Start with 5 questions (minimum)

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
      // Deselect if clicking the same type
      setFileType("");
    } else {
      // Select the new type (only one allowed)
      setFileType(type);
    }
    setShowFileTypeList(false);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!desc.trim()) e.desc = "Description is required";
    if (!file) e.file = "File is required";
    if (!fileType) e.fileType = "File type is required";
    if (!course) e.course = "Course is required";
    if (!topic) e.topic = "Topic is required";
    if (!lesson) e.lesson = "Lesson is required";
    if (!difficulty) e.difficulty = "Difficulty is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Map file type to storage folder
  const getStorageType = (type) => {
    const folderMap = {
      "document": "documents",
      "video": "videos",
      "image": "images"
    };
    return folderMap[type] || "documents";
  };

  const saveContent = async (status) => {
    if (!validate()) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to upload content");
      return;
    }

    // Check Firebase auth - wait for auth state to be determined
    let currentUser = auth.currentUser;
    if (!currentUser) {
      // Wait for Firebase auth state to initialize (up to 2 seconds)
      await new Promise((resolve) => {
        let resolved = false;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        });
        // Timeout after 2 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        }, 2000);
      });
      currentUser = auth.currentUser;
    }

    // If still no Firebase user authenticated, we cannot upload
    // Firebase Storage requires Firebase Auth authentication
    if (!currentUser) {
      alert("Firebase authentication required for file uploads. Please log out and log in again, or ensure you're signed in with Firebase.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Firebase Storage
      const storageFolder = getStorageType(fileType);
      const uploadResult = await uploadFile(
        file,
        storageFolder,
        currentUser.uid,
        (progress) => setUploadProgress(progress)
      );

      // Save metadata to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          category,
          type: fileType, // document, video, or image
          topic,
          lesson,
          course,
          description: desc,
          difficulty,
          url: uploadResult.url,
          storagePath: uploadResult.path,
          fileType: uploadResult.type,
          size: uploadResult.size,
          firebaseUid: uploadResult.firebaseUid,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save content');
      }

      const result = await response.json();
      
      // Refresh content list
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allContent = refreshResult.data || [];
        const active = allContent.filter(c => c.status !== 'archived');
        const mapContent = (content) => ({
          id: content._id,
          title: content.title,
          category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
        });
        setContentRows(active.map(mapContent));
      }
      
      alert(status === "Published" ? "Published!" : "Saved as draft.");
      
      if (status === "Published") {
        // Reset form
        setTitle("");
        setDesc("");
        setFile(null);
        setFileType("");
        setCourse("");
        setTopic("");
        setLesson("");
        setDifficulty("");
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onSaveDraft = () => saveContent("Draft");
  const onPublish = () => saveContent("Published");

  const addPair = () => {
    if (pairs.length >= 15) {
      alert("Maximum 15 questions allowed");
      return;
    }
    setPairs([...pairs, { q: "", a: "" }]);
  };
  
  const removePair = (idx) => {
    if (pairs.length <= 5) {
      alert("Minimum 5 questions required");
      return;
    }
    setPairs(pairs.filter((_, i) => i !== idx));
  };
  
  const saveQuiz = async (status) => {
    if (!quizTitle.trim()) {
      alert("Quiz title is required");
      return;
    }
    if (!quizCourse || !quizTopic || !quizLesson) {
      alert("Please select course, topic, and lesson");
      return;
    }
    if (pairs.length < 5) {
      alert("Minimum 5 questions required");
      return;
    }
    if (pairs.length > 15) {
      alert("Maximum 15 questions allowed");
      return;
    }
    if (pairs.some(p => !p.q.trim() || !p.a.trim())) {
      alert("Please fill in all questions and answers");
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to save quiz");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          category: quizCategory,
          topic: quizTopic,
          lesson: quizLesson,
          course: quizCourse,
          questionsAndAnswers: pairs,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save quiz');
      }

      // Refresh quiz list
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allQuizzes = refreshResult.data || [];
        const active = allQuizzes.filter(q => q.status !== 'archived');
        const mapQuiz = (quiz) => ({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: quiz.status === 'published' ? 'Published' : quiz.status === 'draft' ? 'Draft' : 'Archived',
          difficulty: quiz.difficulty || '-'
        });
        setQuizRows(active.map(mapQuiz));
      }

      alert(status === "Published" ? "Quiz published!" : "Quiz saved as draft.");
      
      if (status === "Published") {
        // Reset form
        setQuizTitle("");
        setQuizCategory("Autism");
        setQuizCourse("");
        setQuizTopic("");
        setQuizLesson("");
        setPairs(Array(5).fill(null).map(() => ({ q: "", a: "" })));
      }
    } catch (error) {
      console.error('Quiz save error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const onPublishQuiz = () => saveQuiz("Published");
  const onSaveQuizDraft = () => saveQuiz("Draft");

  const handleBack = () => {
    navigate("/InstructorDash");
  };

  return (
    <div className="upl-page">
      <div className="upl-topline">
        <button type="button" className="upl-back" onClick={handleBack}>
          <span className="upl-chev">‹</span> Dashboard
        </button>
        <div className="upl-header">Publishing</div>
      </div>
      <div className="upl-card upl-section">
        <div className="upl-row">
          <div className="upl-field">
            <label>Choose a title for your content*:</label>
            <input
              className={`upl-input ${errors.title ? "upl-error" : ""}`}
              placeholder="Give a title to your content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="upl-errtxt">{errors.title}</span>}
          </div>

          <div className="upl-field">
            <label>Choose file type*:</label>
            <div
              className="upl-tagbox"
              onClick={() => setShowFileTypeList((s) => !s)}
              role="button"
              tabIndex={0}
            >
              {!fileType ? (
                <span className="upl-placeholder">Choose file type (document, video, or image)</span>
              ) : (
                <div className="upl-chips">
                  <span className="upl-chip">
                    {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                  </span>
                </div>
              )}
              <span className="upl-caret">▾</span>
            </div>
            {errors.fileType && <span className="upl-errtxt">{errors.fileType}</span>}

            {showFileTypeList && (
              <ul className="upl-taglist" role="listbox" aria-multiselectable="false">
                {FILE_TYPES.map((type) => (
                  <li key={type}>
                    <button
                      type="button"
                      className={`upl-tagitem ${fileType === type ? "selected" : ""}`}
                      onClick={() => selectFileType(type)}
                      role="option"
                      aria-selected={fileType === type}
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
          className="upl-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <input
            id="upl-file"
            type="file"
            accept=".mp4,.mov,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            hidden
          />
          <p className="upl-upload-text">
            Drag & Drop or{" "}
            <label htmlFor="upl-file" className="upl-link">Choose file</label>{" "}
            to upload
          </p>
          <small>video, pdf, doc</small>
          {file && <div className="upl-filename">{file.name}</div>}
          {errors.file && <span className="upl-errtxt">{errors.file}</span>}
          {isUploading && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  backgroundColor: '#4CAF50', 
                  height: '20px', 
                  transition: 'width 0.3s',
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '12px',
                  lineHeight: '20px'
                }}>
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="upl-cats">
          <span>Category:</span>
          <button
            type="button"
            className={`upl-catbtn ${category === "Down Syndrome" ? "active" : ""}`}
            onClick={() => handleCategoryChange("Down Syndrome")}
          >
            Down Syndrome
          </button>
          <button
            type="button"
            className={`upl-catbtn ${category === "Autism" ? "active" : ""}`}
            onClick={() => handleCategoryChange("Autism")}
          >
            Autism
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
          <div className="upl-field" style={{ marginBottom: 0 }}>
            <label>Select Course:</label>
            <select 
              className={`upl-input ${errors.course ? "upl-error" : ""}`}
              value={course} 
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={!availableCourses.length}
            >
              <option value="" disabled>Choose a course</option>
              {availableCourses.map(c => (
                <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
              ))}
            </select>
            {errors.course && <span className="upl-errtxt">{errors.course}</span>}
          </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
            <label>Select Topic:</label>
            <select 
              className={`upl-input ${errors.topic ? "upl-error" : ""}`}
              value={topic} 
              onChange={(e) => handleTopicChange(e.target.value)}
              disabled={!course || !availableTopics.length}
            >
              <option value="" disabled>Choose a topic</option>
              {availableTopics.map(t => (
                <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
              ))}
            </select>
            {errors.topic && <span className="upl-errtxt">{errors.topic}</span>}
          </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
            <label>Select Lesson:</label>
            <select 
              className={`upl-input ${errors.lesson ? "upl-error" : ""}`}
              value={lesson} 
              onChange={(e) => setLesson(e.target.value)}
              disabled={!topic || !availableLessons.length}
            >
              <option value="" disabled>Choose a lesson</option>
              {availableLessons.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.lesson && <span className="upl-errtxt">{errors.lesson}</span>}
          </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
            <label>Select Difficulty*:</label>
            <select 
              className={`upl-input ${errors.difficulty ? "upl-error" : ""}`}
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="" disabled>Choose difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            {errors.difficulty && <span className="upl-errtxt">{errors.difficulty}</span>}
          </div>
        </div>

        <div className="upl-field">
          <label>Description*:</label>
          <textarea
            className={`upl-textarea ${errors.desc ? "upl-error" : ""}`}
            placeholder="Give a description to your content"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {errors.desc && <span className="upl-errtxt">{errors.desc}</span>}
        </div>

        <div className="upl-actions">
          <button 
            className="upl-secondary" 
            onClick={onSaveDraft}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Save as Draft"}
          </button>
          <button 
            className="upl-primary" 
            onClick={onPublish}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Quiz */}
      <h2 className="upl-section-title">Quiz</h2>
      <div className="upl-quiz-card upl-section">
        <div className="upl-quiz-top upl-grid-2">
          <div className="upl-field">
            <label>Title of the quiz*:</label>
            <input
              className="upl-input"
              placeholder="Give your question here"
              value={quizTitle}
              onChange={(e)=>setQuizTitle(e.target.value)}
            />
          </div>
          <div className="upl-field upl-align-right">
            <label>Category:</label>
            <div className="upl-cats upl-no-margin">
              <button
                type="button"
                className={`upl-catbtn ${quizCategory === "Down Syndrome" ? "active" : ""}`}
                onClick={() => handleQuizCategoryChange("Down Syndrome")}
              >
                Down Syndrome
              </button>
              <button
                type="button"
                className={`upl-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                onClick={() => handleQuizCategoryChange("Autism")}
              >
                Autism
              </button>
            </div>
          </div>
        </div>

        <div className="upl-quiz-note">Choose the course, topic, and lesson this quiz will be associated. Difficulty will be set automatically based on the number of questions (5: Easy, 6-10: Medium, 11-15: Hard).</div>
        
        <div className="upl-quiz-selects">
          <select 
            className="upl-input upl-quiz-select" 
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
            className="upl-input upl-quiz-select" 
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
            className="upl-input upl-quiz-select" 
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
        
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Questions: {pairs.length} / 15 (Minimum: 5)
        </div>

        {pairs.map((p, i)=>(
          <div key={i} className="upl-qa-row">
            <div className="upl-field">
              <label>Question for the quiz*:</label>
              <input
                className="upl-input"
                placeholder="Give your question here"
                value={p.q}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].q=e.target.value; setPairs(next);
                }}
              />
            </div>
            <div className="upl-field">
              <label>Answer for the question*:</label>
              <input
                className="upl-input"
                placeholder="Give your question here"
                value={p.a}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].a=e.target.value; setPairs(next);
                }}
              />
            </div>

            {pairs.length > 5 && (
              <button
                type="button"
                className="upl-quiz-remove"
                onClick={()=>removePair(i)}
                title="Remove this Q/A (Minimum 5 questions required)"
                style={{marginLeft:8, padding:"0 10px"}}
              >
                −
              </button>
            )}

            {i === pairs.length-1 && pairs.length < 15 && (
              <button type="button" className="upl-quiz-add" onClick={addPair} title="Add question (Maximum 15 questions)">+</button>
            )}
          </div>
        ))}

        <div className="upl-actions">
          <button className="upl-secondary" onClick={onSaveQuizDraft}>Save as Draft</button>
          <button className="upl-primary" onClick={onPublishQuiz}>Publish</button>
        </div>
      </div>

      {/* Quizzes List */}
      <h2 className="upl-section-title">Quizzes</h2>
      <div className="upl-content-card upl-archive-card upl-section">
        <div className="upl-content-head upl-archive-head">
          <span>Quiz title</span>
          <span>Category</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingQuizzes ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">⏳</div>
              <p className="upl-empty-text">Loading quizzes...</p>
            </div>
          ) : quizRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📝</div>
              <p className="upl-empty-text">No quizzes yet</p>
              <p className="upl-empty-subtext">Create and publish your first quiz to see it here</p>
            </div>
          ) : (
            quizRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row">
                <div className="upl-content-title upl-archive-title" title={row.title}>{row.title}</div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className="upl-content-actions upl-archive-actions">
                  <button type="button" className="upl-btn-arch" onClick={()=>{}}>Archive</button>
                  <button type="button" className="upl-btn-del"  onClick={()=>{}}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content */}
      <h2 className="upl-section-title">Content</h2>
      <div className="upl-content-card upl-archive-card upl-section">
        <div className="upl-content-head upl-archive-head" data-columns="4">
          <span>Content title</span>
          <span>Category</span>
          <span>Status</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingContent ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">⏳</div>
              <p className="upl-empty-text">Loading content...</p>
            </div>
          ) : contentRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📄</div>
              <p className="upl-empty-text">No content yet</p>
              <p className="upl-empty-subtext">Create and publish your first content to see it here</p>
            </div>
          ) : (
            contentRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row" data-columns="4">
                <div className="upl-content-title upl-archive-title" title={row.title}>{row.title}</div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className={`upl-status-pill ${
                  row.status === "Published" ? "upl-status-green" :
                  row.status === "Draft" ? "upl-status-red" : "upl-status-yellow"
                }`}>
                  {row.status}
                </div>

                <div className="upl-content-actions upl-archive-actions">
                  <button type="button" className="upl-btn-arch" onClick={()=>{}}>Archive</button>
                  <button type="button" className="upl-btn-del"  onClick={()=>{}}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Archive */}
      <h2 className="upl-section-title">Archive</h2>
      <div className="upl-content-card upl-archive-card upl-section">
        <div className="upl-content-head upl-archive-head">
          <span>Content title</span>
          <span>Category</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {archivedRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📦</div>
              <p className="upl-empty-text">No archived content</p>
              <p className="upl-empty-subtext">Archived items will appear here</p>
            </div>
          ) : (
            archivedRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row">
                <div className="upl-content-title upl-archive-title" title={row.title}>
                  {row.title}
                </div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className="upl-content-actions upl-archive-actions">
                  <button 
                    className="upl-btn-arch upl-btn-restore" 
                    onClick={() => console.log("show", idx)}
                    title="Restore content"
                  >
                    Restore
                  </button>
                  <button 
                    className="upl-btn-del upl-btn-delete-arch" 
                    onClick={() => setArchivedRows(a => a.filter((_, i) => i !== idx))}
                    title="Permanently delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}