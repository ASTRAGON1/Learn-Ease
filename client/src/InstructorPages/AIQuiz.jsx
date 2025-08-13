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
  const [answersPerQ, setAnswersPerQ] = useState(3); // your request

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
    <div className="aq-page">
      <div className="aq-topbar">
        <Link to="/InstructorDash" className="aq-back">
          <span className="chev">‹</span> Dashboard
        </Link>
      </div>
      <h1 className="aq-title">Generate Quizzes using AI</h1>

      {/* FORM CARD */}
      <section className="aq-card">
        <h3 className="aq-sub">AI Quiz</h3>

        <div className="aq-grid">
          <div className="left">
            <div className="field">
              <label>Title of the quiz*</label>
              <input
                className="input"
                placeholder="Give your question here"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div className="smallmuted">Choose the course and the lesson this quiz will be associated</div>
            <div className="row">
              <select className="input" value={course} onChange={(e)=>setCourse(e.target.value)}>
                <option value="" disabled>Course</option>
                {COURSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" value={lesson} onChange={(e)=>setLesson(e.target.value)}>
                <option value="" disabled>Lesson</option>
                {LESSONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="row">
              <div className="field">
                <label>Number of Questions</label>
                <select className="input" value={numQ} onChange={(e)=>setNumQ(e.target.value)}>
                  {[4,6,8,10,12,15,20].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Number of Answers per question</label>
                <select className="input" value={answersPerQ} onChange={(e)=>setAnswersPerQ(e.target.value)}>
                  {[3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="right">
            <div className="field">
              <label>Category:</label>
              <div className="pills">
                {CATS.map(c=>(
                  <button
                    type="button"
                    key={c}
                    className={`pill ${category===c ? "active":""}`}
                    onClick={()=>setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Level of difficulty</label>
              <select className="input" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                {DIFFS.map(d=> <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="primary" onClick={generate} disabled={!canGenerate}>Generate</button>
        </div>
      </section>

      {/* GENERATED RESULTS */}
      {hasQuiz && (
        <section className="aq-card">
          <div className="results-head">
            <h3>AI Generated Quiz</h3>
            <div className="meta">
              <span>{category}</span> · <span>{course} / {lesson}</span> · <span>{difficulty}</span>
            </div>
          </div>

          <ol className="aq-list">
            {items.map((it, idx)=>(
              <li key={it.id} className="q-card">
                <div className="q">{idx+1}. {it.q}</div>
                <ul className="answers">
                  {it.answers.map((a, i)=>(
                    <li key={i} className={`ans ${i===it.correctIdx? "correct":"wrong"}`}>
                      {a}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="legend">
            <span className="dot green" /> Correct
            <span className="sep" />
            <span className="dot red" /> Wrong
          </div>

          <div className="form-actions">
            <button className="secondary" onClick={clearGenerated}>Cancel</button>
            <button className="secondary" onClick={saveDraft}>Save as Draft</button>
            <button className="primary" onClick={publish}>Publish</button>
          </div>
        </section>
      )}

      {/* LISTS */}
      {(drafts.length>0 || published.length>0) && (
        <section className="aq-lists">
          {drafts.length>0 && (
            <div className="aq-card">
              <h3>Your drafts</h3>
              <ul className="mini-list">
                {drafts.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="mini">{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="link danger" onClick={()=>delDraft(i)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {published.length>0 && (
            <div className="aq-card">
              <h3>Published</h3>
              <ul className="mini-list">
                {published.map((d, i)=>(
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="mini">{d.meta.course} / {d.meta.lesson} · {d.meta.category} · {d.meta.numQ}Q</div>
                    </div>
                    <button className="link danger" onClick={()=>delPub(i)}>Remove</button>
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
