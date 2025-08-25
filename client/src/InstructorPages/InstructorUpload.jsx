// src/pages/InstructorUpload.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./InstructorUpload.css";

const ALL_TAGS = [
  "Communication","Emotions","Social Skills","Routines","Self-Care",
  "Fine Motor","Gross Motor","Sensory","Visual Aids","AAC",
  "Behavior","Safety","Numbers","Letters","Reading",
  "Writing","Life Skills","Transitions","Play Skills","Community"
];

const COURSES = ["Communication 1", "Communication 2", "Numbers", "Letters"];
const LESSONS  = ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"];

const DEFAULT_ROWS = [
  { title:"Listening Class N24: How to Help Children with Down Syndrome Improve...", category:"Down Syndrome", status:"Published" },
  { title:"Math Session N15: Supporting Early Number Recognition for Kids...", category:"Autism", status:"Draft" },
  { title:"Reading Class N10: Building Vocabulary Step-by-Step for Children...", category:"Down Syndrome", status:"scheduled pub" },
  { title:"Listening Exercise N21: Teaching Active Listening Techniques to A...", category:"Autism", status:"Published" },
  { title:"Math Skills N18: Practical Counting Strategies for Down Syndrome...", category:"Down Syndrome", status:"Published" },
];

export default function InstructorUpload() {
  // Publishing
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [showTagList, setShowTagList] = useState(false);
  const [category, setCategory] = useState("Autism");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Tables
  const [contentRows, setContentRows] = useState(DEFAULT_ROWS);
  const [archivedRows, setArchivedRows] = useState([]);

  // Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [pairs, setPairs] = useState([{ q: "", a: "" }, { q: "", a: "" }]);

  const toggleTag = (t) => {
    if (tags.includes(t)) setTags(tags.filter(x => x !== t));
    else if (tags.length < 3) setTags([...tags, t]);
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

  const deleteContent = (idx) => setContentRows(rows => rows.filter((_, i) => i !== idx));

  // replace your archiveContent with this
  const archiveContent = (idx) => {
    const row = contentRows[idx];
    if (!row) return;

    // 1) push to archive
    setArchivedRows(a => [{ ...row, status: "Archived" }, ...a]);

    // 2) remove from content (pure updater)
    setContentRows(rows => rows.filter((_, i) => i !== idx));
  };


  return (
    <div className="upl-page">
      <div className="upl-topline">
        <Link to="/InstructorDash" className="upl-back"><span className="upl-chev">‹</span> Dashboard</Link>
      </div>

      {/* Publishing */}
      <div className="upl-header">Publishing</div>
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
            <label>Choose tags for your content*:</label>
            <div
              className="upl-tagbox"
              onClick={() => setShowTagList((s) => !s)}
              role="button"
              tabIndex={0}
            >
              {tags.length === 0 ? (
                <span className="upl-placeholder">you can only choose 3 tags max</span>
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
              <ul className="upl-taglist" role="listbox" aria-multiselectable="true">
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
          <p>
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
            onClick={() => setCategory("Down Syndrome")}
          >
            Down Syndrome
          </button>
          <button
            type="button"
            className={`upl-catbtn ${category === "Autism" ? "active" : ""}`}
            onClick={() => setCategory("Autism")}
          >
            Autism
          </button>
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
                onClick={() => setQuizCategory("Down Syndrome")}
              >
                Down Syndrome
              </button>
              <button
                type="button"
                className={`upl-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                onClick={() => setQuizCategory("Autism")}
              >
                Autism
              </button>
            </div>
          </div>
        </div>

        <div className="upl-quiz-note">Choose the course and the lesson this quiz will be associated</div>
        <div className="upl-quiz-selects">
          <select className="upl-input upl-quiz-select" value={quizCourse} onChange={(e)=>setQuizCourse(e.target.value)}>
            <option value="" disabled>Course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="upl-input upl-quiz-select" value={quizLesson} onChange={(e)=>setQuizLesson(e.target.value)}>
            <option value="" disabled>Lesson</option>
            {LESSONS.map(l => <option key={l} value={l}>{l}</option>)}
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

            <button
              type="button"
              className="upl-quiz-remove"
              onClick={()=>removePair(i)}
              title="Remove this Q/A"
              style={{marginLeft:8, padding:"0 10px"}}
            >
              −
            </button>

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
          {contentRows.map((row, idx) => (
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
                <button className="upl-btn-arch" onClick={()=>archiveContent(idx)}>Archive</button>
                <button className="upl-btn-del"  onClick={()=>deleteContent(idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Archive */}
      <h2 className="upl-section-title">Archive</h2>
      <div className="upl-content-card upl-section">
        <div className="upl-content-head">
          <span>Content title</span>
          <span>Category</span>
          <span>Status</span>
          <span className="upl-actions-col" />
        </div>

        <div className="upl-content-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {archivedRows.length === 0 ? (
            <div style={{ padding: "12px", fontSize: "14px", color: "#666" }}>
              No archived content
            </div>
          ) : (
            archivedRows.map((row, idx) => (
              <div key={idx} className="upl-content-row">
                <div className="upl-content-title" title={row.title}>
                  {row.title}
                </div>

                <div className="upl-pill upl-pill-gray">{row.category}</div>

                <div className="upl-status-pill upl-status-yellow">Archived</div>

                <div className="upl-content-actions">
                  <button className="upl-btn-arch" onClick={() => console.log("show", idx)}>Show</button>
                  <button className="upl-btn-del" onClick={() => setArchivedRows(a => a.filter((_, i) => i !== idx))}>
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
