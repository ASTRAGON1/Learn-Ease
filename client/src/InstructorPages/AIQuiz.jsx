import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";  
import "./AIQuiz.css";

const COURSES = ["Communication 1", "Communication 2", "Numbers", "Letters"];
const LESSONS  = ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"];
const DIFFS    = ["Easy", "Medium", "Hard"];
const CATS     = ["Down Syndrome", "Autism"];

export default function AIQuiz() {
  // form
  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState("Autism");
  const [course, setCourse]         = useState("");
  const [lesson, setLesson]         = useState("");
  const [difficulty, setDifficulty] = useState("Hard");
  const [numQ, setNumQ]             = useState(8);
  const [answersPerQ, setAnswersPerQ] = useState(3);

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
    title.trim() && course && lesson && Number(numQ) > 0 && Number(answersPerQ) >= 3
  ,[title, course, lesson, numQ, answersPerQ]);

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
    meta: { title, category, course, lesson, difficulty, numQ, answersPerQ, createdAt: new Date().toISOString() },
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
    <div className="qz-page">
      <div className="qz-topbar">
        <Link to="/InstructorDash" className="qz-back">
          <span className="qz-chev">‹</span> Dashboard
        </Link>
      </div>
      <h1 className="qz-title">Generate Quizzes using AI</h1>

      {/* FORM CARD */}
      <section className="qz-card">
        <h3 className="qz-sub">AI Quiz</h3>

        <div className="qz-grid">
          <div className="qz-left">
            <div className="qz-field">
              <label>Title of the quiz*</label>
              <input
                className="qz-input"
                placeholder="Give your question here"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div className="qz-smallmuted">Choose the course and the lesson this quiz will be associated</div>
            <div className="qz-row">
              <select className="qz-input" value={course} onChange={(e)=>setCourse(e.target.value)}>
                <option value="" disabled>Course</option>
                {COURSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select className="qz-input" value={lesson} onChange={(e)=>setLesson(e.target.value)}>
                <option value="" disabled>Lesson</option>
                {LESSONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="qz-row">
              <div className="qz-field">
                <label>Number of Questions</label>
                <select className="qz-input" value={numQ} onChange={(e)=>setNumQ(e.target.value)}>
                  {[4,6,8,10,12,15,20].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="qz-field">
                <label>Number of Answers per question</label>
                <select className="qz-input" value={answersPerQ} onChange={(e)=>setAnswersPerQ(e.target.value)}>
                  {[3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="qz-right">
            <div className="qz-field">
              <label>Category:</label>
              <div className="qz-pills">
                {CATS.map(c=>(
                  <button
                    type="button"
                    key={c}
                    className={`qz-pill ${category===c ? "active":""}`}
                    onClick={()=>setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="qz-field">
              <label>Level of difficulty</label>
              <select className="qz-input" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                {DIFFS.map(d=> <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="qz-form-actions">
          <button className="qz-primary" onClick={generate} disabled={!canGenerate}>Generate</button>
        </div>
      </section>

      {/* GENERATED RESULTS */}
      {hasQuiz && (
        <section className="qz-card">
          <div className="qz-results-head">
            <h3>AI Generated Quiz</h3>
            <div className="qz-meta">
              <span>{category}</span> · <span>{course} / {lesson}</span> · <span>{difficulty}</span>
            </div>
          </div>

          <ol className="qz-list">
            {items.map((it, idx)=>(
              <li key={it.id} className="qz-q-card">
                <div className="qz-q">{idx+1}. {it.q}</div>
                <ul className="qz-answers">
                  {it.answers.map((a, i)=>(
                    <li key={i} className={`qz-ans ${i===it.correctIdx? "qz-correct":"qz-wrong"}`}>
                      {a}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="qz-legend">
            <span className="qz-dot qz-green" /> Correct
            <span className="qz-sep" />
            <span className="qz-dot qz-red" /> Wrong
          </div>

          <div className="qz-form-actions">
            <button className="qz-secondary" onClick={clearGenerated}>Cancel</button>
            <button className="qz-secondary" onClick={saveDraft}>Save as Draft</button>
            <button className="qz-primary" onClick={publish}>Publish</button>
          </div>
        </section>
      )}

      {/* LISTS */}
      {(drafts.length>0 || published.length>0) && (
        <section className="qz-lists">
          {drafts.length>0 && (
            <div className="qz-card">
              <h3>Your drafts</h3>
              <ul className="qz-mini-list">
                {drafts.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qz-mini">{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="qz-link qz-danger" onClick={()=>delDraft(i)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {published.length>0 && (
            <div className="qz-card">
              <h3>Published</h3>
              <ul className="qz-mini-list">
                {published.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qz-mini">{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="qz-link qz-danger" onClick={()=>delPub(i)}>Remove</button>
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
