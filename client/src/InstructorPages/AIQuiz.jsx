// AIQuiz.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";  
import "./AIQuiz.css";
import { USER_CURRICULUM } from "../data/curriculum";

const DIFFS    = ["Easy", "Medium", "Hard"];
const CATS     = ["Down Syndrome", "Autism"];

export default function AIQuiz() {
  // form
  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState("Autism");
  const [topic, setTopic]           = useState("");
  const [course, setCourse]         = useState("");
  const [lesson, setLesson]         = useState("");
  const [difficulty, setDifficulty] = useState("Hard");
  const [numQ, setNumQ]             = useState(8);
  const [answersPerQ, setAnswersPerQ] = useState(3);

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = category === "Autism" ? "autism" : "down";
    return USER_CURRICULUM.find(p => p.GeneralPath === pathKey);
  }, [category]);

  // Get available topics for current category
  const availableTopics = useMemo(() => {
    return currentPath?.Topics || [];
  }, [currentPath]);

  // Get available courses for selected topic
  const availableCourses = useMemo(() => {
    if (!topic || !currentPath) return [];
    const selectedTopic = currentPath.Topics.find(t => t.TopicName === topic);
    return selectedTopic?.Courses || [];
  }, [topic, currentPath]);

  // Get available lessons for selected course
  const availableLessons = useMemo(() => {
    if (!course || !availableCourses.length) return [];
    const selectedCourse = availableCourses.find(c => c.CoursesTitle === course);
    return selectedCourse?.lessons || [];
  }, [course, availableCourses]);

  // Reset dependent selections when category or topic changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setTopic("");
    setCourse("");
    setLesson("");
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    setCourse("");
    setLesson("");
  };

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setLesson("");
  };

  // generated quiz
  const [items, setItems] = useState([]); // [{id, q, answers[], correctIdx}]
  const hasQuiz = items.length > 0;

  // storage (mock persistence)
  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);

  useEffect(() => {
    try {
      setDrafts(JSON.parse(localStorage.getItem("aiQuizDrafts") || "[]"));
      setPublished(JSON.parse(localStorage.getItem("aiQuizPublished") || "[]"));
    } catch { /* ignore */ }
  }, []);

  const canGenerate = useMemo(() =>
    title.trim() && topic && course && lesson && Number(numQ) > 0 && Number(answersPerQ) >= 3
  ,[title, topic, course, lesson, numQ, answersPerQ]);

  // --- helpers ---
  const genSentence = (base, n) =>
    `${base} — scenario ${n+1} for ${category} (${difficulty}).`;

  const generate = () => {
    if (!canGenerate) return alert("Please fill all required fields.");
    const qs = [];
    for (let i = 0; i < Number(numQ); i++) {
      const correctIdx = Math.floor(Math.random()*Number(answersPerQ));
      const answers = Array.from({length: Number(answersPerQ)}, (_,a)=>{
        const isC = a===correctIdx;
        return isC
          ? `Correct approach ${a+1} for ${title.toLowerCase()}`
          : `Common mistake ${a+1} to avoid`;
      });
      qs.push({
        id: `${Date.now()}-${i}`,
        q: genSentence(`${title || "Quiz"}`, i),
        answers,
        correctIdx,
      });
    }
    setItems(qs);
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const clearGenerated = () => setItems([]);

  const pkg = () => ({
    meta: { title, category, topic, course, lesson, difficulty, numQ, answersPerQ, createdAt: new Date().toISOString() },
    items,
  });

  const saveDraft = () => {
    if (!hasQuiz) return;
    const next = [pkg(), ...drafts];
    setDrafts(next);
    localStorage.setItem("aiQuizDrafts", JSON.stringify(next));
    alert("Saved as draft.");
  };

  const publish = () => {
    if (!hasQuiz) return;
    const next = [pkg(), ...published];
    setPublished(next);
    localStorage.setItem("aiQuizPublished", JSON.stringify(next));
    alert("Published! (mock)");
  };

  const delDraft = (idx) => {
    const next = drafts.filter((_,i)=>i!==idx);
    setDrafts(next);
    localStorage.setItem("aiQuizDrafts", JSON.stringify(next));
  };
  const delPub = (idx) => {
    const next = published.filter((_,i)=>i!==idx);
    setPublished(next);
    localStorage.setItem("aiQuizPublished", JSON.stringify(next));
  };

  return (
    <div className="qzInst-page">
      <div className="qzInst-topbar">
        <Link to="/InstructorDash" className="qzInst-back">
          <span className="qzInst-chev">‹</span> Dashboard
        </Link>
      </div>
      <h1 className="qzInst-title">Generate Quizzes using AI</h1>

      {/* FORM CARD */}
      <section className="qzInst-card">
        <h3 className="qzInst-sub">AI Quiz</h3>

        <div className="qzInst-grid">
          <div className="qzInst-left">
            <div className="qzInst-field">
              <label>Title of the quiz*</label>
              <input
                className="qzInst-input"
                placeholder="Give your question here"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div className="qzInst-smallmuted">Choose the topic, course and the lesson this quiz will be associated</div>
            <div className="qzInst-row">
              <select 
                className="qzInst-input" 
                value={topic} 
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={!availableTopics.length}
              >
                <option value="" disabled>Topic</option>
                {availableTopics.map(t => (
                  <option key={t.TopicName} value={t.TopicName}>{t.TopicName}</option>
                ))}
              </select>
              <select 
                className="qzInst-input" 
                value={course} 
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={!topic || !availableCourses.length}
              >
                <option value="" disabled>Course</option>
                {availableCourses.map(c => (
                  <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
                ))}
              </select>
              <select 
                className="qzInst-input" 
                value={lesson} 
                onChange={(e)=>setLesson(e.target.value)}
                disabled={!course || !availableLessons.length}
              >
                <option value="" disabled>Lesson</option>
                {availableLessons.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="qzInst-row">
              <div className="qzInst-field">
                <label>Number of Questions</label>
                <select className="qzInst-input" value={numQ} onChange={(e)=>setNumQ(e.target.value)}>
                  {[4,6,8,10,12,15,20].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="qzInst-field">
                <label>Number of Answers per question</label>
                <select className="qzInst-input" value={answersPerQ} onChange={(e)=>setAnswersPerQ(e.target.value)}>
                  {[3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="qzInst-right">
            <div className="qzInst-field">
              <label>Category:</label>
              <div className="qzInst-pills">
                {CATS.map(c=>(
                  <button
                    type="button"
                    key={c}
                    className={`qzInst-pill ${category===c ? "qzInst-active":""}`}
                    onClick={()=>handleCategoryChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="qzInst-field">
              <label>Level of difficulty</label>
              <select className="qzInst-input" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                {DIFFS.map(d=> <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="qzInst-form-actions">
          <button className="qzInst-primary" onClick={generate} disabled={!canGenerate}>Generate</button>
        </div>
      </section>

      {/* GENERATED RESULTS */}
      {hasQuiz && (
        <section className="qzInst-card">
          <div className="qzInst-results-head">
            <h3>AI Generated Quiz</h3>
            <div className="qzInst-meta">
              <span>{category}</span> · <span>{topic} / {course} / {lesson}</span> · <span>{difficulty}</span>
            </div>
          </div>

          <ol className="qzInst-list">
            {items.map((it, idx)=>(
              <li key={it.id} className="qzInst-q-card">
                <div className="qzInst-q">{idx+1}. {it.q}</div>
                <ul className="qzInst-answers">
                  {it.answers.map((a, i)=>(
                    <li key={i} className={`qzInst-ans ${i===it.correctIdx? "qzInst-correct":"qzInst-wrong"}`}>
                      {a}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="qzInst-legend">
            <span className="qzInst-dot qzInst-green" /> Correct
            <span className="qzInst-sep" />
            <span className="qzInst-dot qzInst-red" /> Wrong
          </div>

          <div className="qzInst-form-actions">
            <button className="qzInst-secondary" onClick={clearGenerated}>Cancel</button>
            <button className="qzInst-secondary" onClick={saveDraft}>Save as Draft</button>
            <button className="qzInst-primary" onClick={publish}>Publish</button>
          </div>
        </section>
      )}

      {/* LISTS */}
      {(drafts.length>0 || published.length>0) && (
        <section className="qzInst-lists">
          {drafts.length>0 && (
            <div className="qzInst-card">
              <h3>Your drafts</h3>
              <ul className="qzInst-mini-list">
                {drafts.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qzInst-mini">{d.meta.topic ? `${d.meta.topic} / ` : ""}{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="qzInst-link qzInst-danger" onClick={()=>delDraft(i)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {published.length>0 && (
            <div className="qzInst-card">
              <h3>Published</h3>
              <ul className="qzInst-mini-list">
                {published.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qzInst-mini">{d.meta.topic ? `${d.meta.topic} / ` : ""}{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="qzInst-link qzInst-danger" onClick={()=>delPub(i)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
