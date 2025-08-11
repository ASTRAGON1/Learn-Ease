// src/pages/InstructorUpload.jsx
import React, { useState } from "react";
import "./InstructorUpload.css";

const ALL_TAGS = [
  "Communication","Emotions","Social Skills","Routines","Self-Care",
  "Fine Motor","Gross Motor","Sensory","Visual Aids","AAC",
  "Behavior","Safety","Numbers","Letters","Reading",
  "Writing","Life Skills","Transitions","Play Skills","Community"
];

const COURSES = ["Communication 1", "Communication 2", "Numbers", "Letters"];
const LESSONS  = ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"];

const CONTENT_ROWS = [
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

  const onSaveDraft = () => {
    if (!validate()) return;
    console.log({ title, tags, category, desc, file, status: "draft" });
    alert("Saved as draft.");
  };

  const onPublish = () => {
    if (!validate()) return;
    console.log({ title, tags, category, desc, file, status: "publish" });
    alert("Published!");
  };

  const addPair = () => setPairs([...pairs, { q: "", a: "" }]);

  const onPublishQuiz = () => {
    console.log({ quizTitle, quizCategory, quizCourse, quizLesson, pairs, status: "quiz-publish" });
    alert("Quiz published!");
  };

  return (
    <div className="iu-page">
      <div className="iu-topline">
        <button className="iu-back"><span className="chev">‹</span> Dashboard</button>
      </div>

      {/* Publishing */}
      <div className="iu-header">Publishing</div>
      <div className="iu-card section">
        

        <div className="iu-row">
          <div className="iu-field">
            <label>Choose a title for your content*:</label>
            <input
              className={`iu-input ${errors.title ? "iu-error" : ""}`}
              placeholder="Give a title to your content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="iu-errtxt">{errors.title}</span>}
          </div>

          <div className="iu-field">
            <label>Choose tags for your content*:</label>
            <div
              className="iu-tagbox"
              onClick={() => setShowTagList((s) => !s)}
              role="button"
              tabIndex={0}
            >
              {tags.length === 0 ? (
                <span className="iu-placeholder">you can only choose 3 tags max</span>
              ) : (
                <div className="iu-chips">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="iu-chip"
                      onClick={(e) => { e.stopPropagation(); toggleTag(t); }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <span className="iu-caret">▾</span>
            </div>

            {showTagList && (
              <div className="iu-tagmenu">
                {ALL_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`iu-tagitem ${tags.includes(t) ? "selected" : ""}`}
                    onClick={() => toggleTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="iu-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <input
            id="iu-file"
            type="file"
            accept=".mp4,.mov,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            hidden
          />
          <p>
            Drag & Drop or{" "}
            <label htmlFor="iu-file" className="iu-link">Choose file</label>{" "}
            to upload
          </p>
          <small>video, pdf, doc</small>
          {file && <div className="iu-filename">{file.name}</div>}
        </div>

        <div className="iu-cats">
          <span>Category:</span>
          <button
            type="button"
            className={`iu-catbtn ${category === "Down Syndrome" ? "active" : ""}`}
            onClick={() => setCategory("Down Syndrome")}
          >
            Down Syndrome
          </button>
          <button
            type="button"
            className={`iu-catbtn ${category === "Autism" ? "active" : ""}`}
            onClick={() => setCategory("Autism")}
          >
            Autism
          </button>
        </div>

        <div className="iu-field">
          <label>Description*:</label>
          <textarea
            className={`iu-textarea ${errors.desc ? "iu-error" : ""}`}
            placeholder="Give a description to your content"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {errors.desc && <span className="iu-errtxt">{errors.desc}</span>}
        </div>

        <div className="iu-actions">
          <button className="iu-secondary" onClick={onSaveDraft}>Save as Draft</button>
          <button className="iu-primary" onClick={onPublish}>Publish</button>
        </div>
      </div>

      {/* Quiz */}
      <h2 className="section-title">Quiz</h2>
      <div className="quiz-card section">
        <div className="quiz-top grid-2">
          <div className="iu-field">
            <label>Title of the quiz*:</label>
            <input
              className="iu-input"
              placeholder="Give your question here"
              value={quizTitle}
              onChange={(e)=>setQuizTitle(e.target.value)}
            />
          </div>
          <div className="iu-field align-right">
            <label>Category:</label>
            <div className="iu-cats no-margin">
              <button
                type="button"
                className={`iu-catbtn ${quizCategory === "Down Syndrome" ? "active" : ""}`}
                onClick={() => setQuizCategory("Down Syndrome")}
              >
                Down Syndrome
              </button>
              <button
                type="button"
                className={`iu-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                onClick={() => setQuizCategory("Autism")}
              >
                Autism
              </button>
            </div>
          </div>
        </div>

        <div className="quiz-note">Choose the course and the lesson this quiz will be associated</div>
        <div className="quiz-selects">
          <select className="iu-input quiz-select" value={quizCourse} onChange={(e)=>setQuizCourse(e.target.value)}>
            <option value="" disabled>Course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="iu-input quiz-select" value={quizLesson} onChange={(e)=>setQuizLesson(e.target.value)}>
            <option value="" disabled>Lesson</option>
            {LESSONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {pairs.map((p, i)=>(
          <div key={i} className="qa-row">
            <div className="iu-field">
              <label>Question for the quiz*:</label>
              <input
                className="iu-input"
                placeholder="Give your question here"
                value={p.q}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].q=e.target.value; setPairs(next);
                }}
              />
            </div>
            <div className="iu-field">
              <label>Answer for the question*:</label>
              <input
                className="iu-input"
                placeholder="Give your question here"
                value={p.a}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].a=e.target.value; setPairs(next);
                }}
              />
            </div>
            {i === pairs.length-1 && (
              <button type="button" className="quiz-add" onClick={addPair}>+</button>
            )}
          </div>
        ))}

        <div className="iu-actions">
          <button className="iu-primary" onClick={onPublishQuiz}>Publish</button>
        </div>
      </div>

      {/* Content */}
      <h2 className="section-title">Content</h2>
      <div className="content-card section">
        <div className="content-head">
          <span>Content title</span>
          <span>Category</span>
          <span>Status</span>
          <span className="actions-col" />
        </div>

        <div className="content-rows">
          {CONTENT_ROWS.map((row, idx) => (
            <div key={idx} className="content-row">
              <div className="content-title" title={row.title}>{row.title}</div>

              <div className="pill pill-gray">{row.category}</div>

              <div className={`status-pill ${
                row.status === "Published" ? "status-green" :
                row.status === "Draft" ? "status-red" : "status-yellow"
              }`}>
                {row.status}
              </div>

              <div className="content-actions">
                <button className="btn-arch" onClick={()=>console.log("archive", idx)}>Archive</button>
                <button className="btn-del"  onClick={()=>console.log("delete", idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
