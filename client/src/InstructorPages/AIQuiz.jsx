// AIQuiz.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AIQuiz.css";
import { USER_CURRICULUM } from "../data/curriculum";

const CATS = ["Down Syndrome", "Autism"];

export default function AIQuiz() {
  const navigate = useNavigate();
  const normalizeKey = (str = "") => str.toLowerCase().replace(/\s+/g, " ").trim();

  const handleBack = () => {
    navigate("/InstructorDash");
  };

  // form
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
    } catch {
      // ignore
    }
  }, []);

  const canGenerate = useMemo(
    () => title.trim() && course && topic && lesson && Number(numQ) >= 5 && Number(numQ) <= 15 && Number(answersPerQ) >= 3,
    [title, course, topic, lesson, numQ, answersPerQ]
  );

  // --- helpers ---
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

  // Transform AI-generated quiz to match Quiz model format
  // Only store question and correctAnswer (AI will generate wrong options later)
  const transformQuizForAPI = () => {
    return items.map((item) => ({
      q: item.q,
      a: item.answers[item.correctIdx] // Store only the correct answer
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
      
      // Don't send difficulty - let controller auto-set based on question count
      // (same logic as normal quiz: 5=Easy, 6-10=Medium, 11-15=Hard)
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
        // Reset form
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

  const delDraft = (idx) => {
    const next = drafts.filter((_, i) => i !== idx);
    setDrafts(next);
    localStorage.setItem("aiQuizDrafts", JSON.stringify(next));
  };
  const delPub = (idx) => {
    const next = published.filter((_, i) => i !== idx);
    setPublished(next);
    localStorage.setItem("aiQuizPublished", JSON.stringify(next));
  };

  return (
    <div className="qzInst-page">
      <div className="qzInst-topbar">
        <button type="button" className="qzInst-back" onClick={handleBack}>
          <span className="qzInst-chev">‹</span> Dashboard
        </button>
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
                placeholder="Give the title of the quiz here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="qzInst-smallmuted">Choose the course, topic and the lesson this quiz will be associated</div>
            <div className="qzInst-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <select
                className="qzInst-input"
                value={course}
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={!availableCourses.length}
                style={{ flex: 1 }}
              >
                <option value="" disabled>
                  Course
                </option>
                {availableCourses.map((c) => (
                  <option key={c.CoursesTitle} value={c.CoursesTitle}>
                    {c.CoursesTitle}
                  </option>
                ))}
              </select>
              <select
                className="qzInst-input"
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={!course || !availableTopics.length}
                style={{ flex: 1 }}
              >
                <option value="" disabled>
                  Topic
                </option>
                {availableTopics.map((t) => (
                  <option key={t.TopicsTitle} value={t.TopicsTitle}>
                    {t.TopicsTitle}
                  </option>
                ))}
              </select>
              <select
                className="qzInst-input"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                disabled={!topic || !availableLessons.length}
                style={{ flex: 1 }}
              >
                <option value="" disabled>
                  Lesson
                </option>
                {availableLessons.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="qzInst-row">
              <div className="qzInst-field">
                <label>Number of Questions* (5-15)</label>
                <select className="qzInst-input" value={numQ} onChange={(e) => setNumQ(e.target.value)}>
                  {Array.from({ length: 11 }, (_, i) => i + 5).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="qzInst-field">
                <label>Number of Answers per question</label>
                <select className="qzInst-input" value={answersPerQ} onChange={(e) => setAnswersPerQ(e.target.value)}>
                  {[3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="qzInst-right">
            <div className="qzInst-field">
              <label>Category:</label>
              <div className="qzInst-pills">
                {CATS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`qzInst-pill ${category === c ? "qzInst-active" : ""}`}
                    onClick={() => handleCategoryChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="qzInst-form-actions">
          <button className="qzInst-primary" onClick={generate} disabled={!canGenerate}>
            Generate
          </button>
        </div>
      </section>

      {/* GENERATED RESULTS */}
      {hasQuiz && (
        <section className="qzInst-card">
          <div className="qzInst-results-head">
            <h3>AI Generated Quiz</h3>
            <div className="qzInst-meta">
              <span>{category}</span> | <span>{course} / {topic} / {lesson}</span>
            </div>
          </div>

          <ol className="qzInst-list">
            {items.map((it, idx) => (
              <li key={it.id} className="qzInst-q-card">
                <div className="qzInst-q">
                  {idx + 1}. {it.q}
                </div>
                <ul className="qzInst-answers">
                  {it.answers.map((a, i) => (
                    <li key={i} className={`qzInst-ans ${i === it.correctIdx ? "qzInst-correct" : "qzInst-wrong"}`}>
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
            <button className="qzInst-secondary" onClick={clearGenerated}>
              Cancel
            </button>
            <button className="qzInst-secondary" onClick={saveDraft}>
              Save as Draft
            </button>
            <button className="qzInst-primary" onClick={publish}>
              Publish
            </button>
          </div>
        </section>
      )}

      {/* {(drafts.length > 0 || published.length > 0) && (
        <section className="qzInst-lists">
          {drafts.length > 0 && (
            <div className="qzInst-card">
              <h3>Your drafts</h3>
              <ul className="qzInst-mini-list">
                {drafts.map((d, i) => (
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qzInst-mini">
                        {d.meta.course ? `${d.meta.course} / ` : ""}
                        {d.meta.topic} / {d.meta.lesson} | {d.meta.category} | {d.meta.numQ}Q
                      </div>
                    </div>
                    <button className="qzInst-link qzInst-danger" onClick={() => delDraft(i)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {published.length > 0 && (
            <div className="qzInst-card">
              <h3>Published</h3>
              <ul className="qzInst-mini-list">
                {published.map((d, i) => (
                  <li key={i}>
                    <div>
                      <strong>{d.meta.title}</strong>
                      <div className="qzInst-mini">
                        {d.meta.course ? `${d.meta.course} / ` : ""}
                        {d.meta.topic} / {d.meta.lesson} | {d.meta.category} | {d.meta.numQ}Q
                      </div>
                    </div>
                    <button className="qzInst-link qzInst-danger" onClick={() => delPub(i)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )} */}
    </div>
  );
}