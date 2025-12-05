// src/pages/InstructorUpload.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./InstructorUpload.css";
import { USER_CURRICULUM } from "../data/curriculum";

const ALL_TAGS = [
  "video",
  "file document",
  "picture"
];

const DEFAULT_ROWS = [
  { title:"Listening Class N24: How to Help Children with Down Syndrome Improve...", category:"Down Syndrome", status:"Published" },
  { title:"Math Session N15: Supporting Early Number Recognition for Kids...", category:"Autism", status:"Draft" },
  { title:"Reading Class N10: Building Vocabulary Step-by-Step for Children...", category:"Down Syndrome", status:"Draft" },
  { title:"Listening Exercise N21: Teaching Active Listening Techniques to A...", category:"Autism", status:"Published" },
  { title:"Math Skills N18: Practical Counting Strategies for Down Syndrome...", category:"Down Syndrome", status:"Published" },
];

export default function InstructorUpload() {
  const navigate = useNavigate();
  
  // Publishing
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [showTagList, setShowTagList] = useState(false);
  const [category, setCategory] = useState("Autism");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

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
  const [contentRows, setContentRows] = useState(DEFAULT_ROWS);
  const [archivedRows, setArchivedRows] = useState([]);

  // Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [pairs, setPairs] = useState([{ q: "", a: "" }]);

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

  const toggleTag = (t) => {
    if (tags.includes(t)) {
      // Deselect if clicking the same tag
      setTags([]);
    } else {
      // For file type tags, only allow one selection
      setTags([t]);
    }
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!desc.trim()) e.desc = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addContentRow = (statusLabel) => {
    const newRow = { title: title || "Untitled", category, status: statusLabel };
    setContentRows(prev => [newRow, ...prev]);
  };

  const onSaveDraft = () => { if (!validate()) return; addContentRow("Draft"); alert("Saved as draft."); };
  const onPublish   = () => { if (!validate()) return; addContentRow("Published"); alert("Published!"); window.location.reload(); };

  const addPair = () => setPairs([...pairs, { q: "", a: "" }]);
  const removePair = (idx) => { if (pairs.length === 1) return; setPairs(pairs.filter((_, i) => i !== idx)); };
  const onPublishQuiz = () => { alert("Quiz published!"); };

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
            <label>Choose a tag for your content*:</label>
            <div
              className="upl-tagbox"
              onClick={() => setShowTagList((s) => !s)}
              role="button"
              tabIndex={0}
            >
              {tags.length === 0 ? (
                <span className="upl-placeholder">choose file type</span>
              ) : (
                <div className="upl-chips">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="upl-chip"
                      onClick={(e) => { e.stopPropagation(); toggleTag(t); }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <span className="upl-caret">▾</span>
            </div>

            {showTagList && (
              <ul className="upl-taglist" role="listbox" aria-multiselectable="false">
                {ALL_TAGS.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`upl-tagitem ${tags.includes(t) ? "selected" : ""}`}
                      onClick={() => toggleTag(t)}
                      role="option"
                      aria-selected={tags.includes(t)}
                    >
                      {t}
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

        <div className="upl-field">
          <label>Select Course:</label>
          <select 
            className="upl-input" 
            value={course} 
            onChange={(e) => handleCourseChange(e.target.value)}
            disabled={!availableCourses.length}
          >
            <option value="" disabled>Choose a course</option>
            {availableCourses.map(c => (
              <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
            ))}
          </select>
        </div>

        <div className="upl-field">
          <label>Select Topic:</label>
          <select 
            className="upl-input" 
            value={topic} 
            onChange={(e) => handleTopicChange(e.target.value)}
            disabled={!course || !availableTopics.length}
          >
            <option value="" disabled>Choose a topic</option>
            {availableTopics.map(t => (
              <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
            ))}
          </select>
        </div>

        <div className="upl-field">
          <label>Select Lesson:</label>
          <select 
            className="upl-input" 
            value={lesson} 
            onChange={(e) => setLesson(e.target.value)}
            disabled={!topic || !availableLessons.length}
          >
            <option value="" disabled>Choose a lesson</option>
            {availableLessons.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
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
          <button className="upl-secondary" onClick={onSaveDraft}>Save as Draft</button>
          <button className="upl-primary" onClick={onPublish}>Publish</button>
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

        <div className="upl-quiz-note">Choose the course, topic and the lesson this quiz will be associated</div>
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

            {pairs.length > 1 && (
              <button
                type="button"
                className="upl-quiz-remove"
                onClick={()=>removePair(i)}
                title="Remove this Q/A"
                style={{marginLeft:8, padding:"0 10px"}}
              >
                −
              </button>
            )}

            {i === pairs.length-1 && (
              <button type="button" className="upl-quiz-add" onClick={addPair}>+</button>
            )}
          </div>
        ))}

        <div className="upl-actions">
          <button className="upl-primary" onClick={onPublishQuiz}>Publish</button>
        </div>
      </div>

      {/* Content */}
      <h2 className="upl-section-title">Content</h2>
      <div className="upl-content-card upl-section">
        <div className="upl-content-head">
          <span>Content title</span>
          <span>Category</span>
          <span>Status</span>
          <span className="upl-actions-col" />
        </div>

        <div className="upl-content-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {contentRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📄</div>
              <p className="upl-empty-text">No content yet</p>
              <p className="upl-empty-subtext">Create and publish your first content to see it here</p>
            </div>
          ) : (
            contentRows.map((row, idx) => (
              <div key={idx} className="upl-content-row">
                <div className="upl-content-title" title={row.title}>{row.title}</div>

                <div className="upl-pill upl-pill-gray">{row.category}</div>

                <div className={`upl-status-pill ${
                  row.status === "Published" ? "upl-status-green" :
                  row.status === "Draft" ? "upl-status-red" : "upl-status-yellow"
                }`}>
                  {row.status}
                </div>

                <div className="upl-content-actions">
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
            archivedRows.map((row, idx) => (
              <div key={idx} className="upl-content-row upl-archive-row">
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