import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./quizPurple.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---------- Helpers ----------
function computeScore(quiz, answers) {
  if (!quiz || !quiz.questions) return { correct: 0, total: 0 };
  let correct = 0;
  quiz.questions.forEach((q) => { if (answers[q.id] === q.answerIndex) correct++; });
  return { correct, total: quiz.questions.length };
}

// ---------- Component ----------
export default function QuizzApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { qid: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const formRef = useRef(null);

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      const token = window.sessionStorage.getItem('token');
      const quizId = location.state?.quizId;

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // TODO: Replace with actual API endpoint when available
        // if (quizId) {
        //   const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        //     headers: { 'Authorization': `Bearer ${token}` }
        //   });
        //   if (response.ok) {
        //     const data = await response.json();
        //     setQuiz(data.quiz);
        //   }
        // }

        // For now, show empty state
        setQuiz(null);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [navigate, location.state]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [submitted]);

  const byCat = useMemo(() => {
    if (!quiz || !quiz.questions) return {};
    const m = {};
    quiz.questions.forEach((q) => {
      const ok = answers[q.id] === q.answerIndex;
      if (!m[q.category]) m[q.category] = { ok: 0, total: 0 };
      m[q.category].total += 1;
      if (ok) m[q.category].ok += 1;
    });
    return m;
  }, [quiz, answers]);

  const score = useMemo(() => computeScore(quiz, answers), [quiz, answers]);

  function handleChange(qid, idx) {
    setAnswers((p) => ({ ...p, [qid]: idx }));
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!quiz || !quiz.questions) return;

    // ensure all answered
    const firstUnansweredIdx = quiz.questions.findIndex((q) => answers[q.id] == null);
    if (firstUnansweredIdx !== -1) {
      const el = formRef.current?.querySelector(`[data-qidx="${firstUnansweredIdx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("quizPurple-warnflash");
      setTimeout(() => el?.classList.remove("quizPurple-warnflash"), 900);
      return;
    }
    setSubmitted(true);
  }

  // Quiz is automatically marked as passed upon submission
  useEffect(() => {
    if (submitted && quiz) {
      // Send quiz results to backend
      const token = window.sessionStorage.getItem('token');
      fetch(`${API_URL}/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers, score })
      }).then(res => res.json())
        .then(data => console.log('Quiz submission response:', data))
        .catch(err => console.error('Quiz submission error:', err));
      const finalScore = computeScore(quiz, answers);
      console.log('Quiz submitted', { quizId: quiz.id, score: finalScore });
    }
  }, [submitted, quiz, answers]);

  const handleNext = () => {
    if (!quiz || !quiz.questions) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleBackToCourse = () => {
    navigate("/student-dashboard-2");
  };

  if (loading) {
    return (
      <div className="quizPurple-page">
        <div className="quizPurple-loading">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quizPurple-page">
        <div className="quizPurple-empty">
          <p>No quiz available</p>
          <button onClick={() => navigate("/student-dashboard-2")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizPurple-page">
      {/* Header */}
      <section className="quizPurple-container">
        <header className="quizPurple-header">
          <button className="quizPurple-back-btn" onClick={handleBackToCourse}>
            <span className="quizPurple-back-chev">‹</span> Dashboard
          </button>
          <div className="quizPurple-header-content">
            <div className="quizPurple-logo">QZ</div>
            <div>
              <h1 className="quizPurple-title">{quiz.title}</h1>
              <div className="quizPurple-meta">
                <span><strong>Course:</strong> {quiz.courseTitle} ({quiz.courseCode})</span>
                <span>•</span>
                <span><strong>Instructor:</strong> {quiz.instructorName}</span>
              </div>
            </div>
          </div>
          {!submitted && (
            <div className="quizPurple-progress">
              <div className="quizPurple-progress-bar">
                <div
                  className="quizPurple-progress-fill"
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="quizPurple-progress-text">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
            </div>
          )}
        </header>
      </section>

      {/* Quiz Form */}
      <section className="quizPurple-container">
        {!submitted ? (
          <form ref={formRef} onSubmit={handleSubmit} className="quizPurple-card" noValidate>
            {/* Current Question */}
            <div className="quizPurple-question-wrapper">
              <div className="quizPurple-question-header">
                <span className="quizPurple-question-number">Question {currentQuestion + 1}</span>
                <span className="quizPurple-question-category">{quiz.questions[currentQuestion].category}</span>
              </div>

              <fieldset
                key={quiz.questions[currentQuestion].id}
                className="quizPurple-question"
                data-qidx={currentQuestion}
              >
                <legend className="quizPurple-qlegend">{quiz.questions[currentQuestion].text}</legend>
                <div className="quizPurple-options">
                  {quiz.questions[currentQuestion].options.map((opt, i) => {
                    const selected = answers[quiz.questions[currentQuestion].id] === i;
                    return (
                      <label
                        key={i}
                        className={`quizPurple-radio ${selected ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={quiz.questions[currentQuestion].id}
                          value={i}
                          checked={selected || false}
                          onChange={() => handleChange(quiz.questions[currentQuestion].id, i)}
                        />
                        <span className="quizPurple-opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="quizPurple-opt-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Navigation Buttons */}
              <div className="quizPurple-navigation">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                  Previous
                </button>

                <div className="quizPurple-question-dots">
                  {quiz.questions.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      className={`quizPurple-dot ${answers[q.id] !== undefined ? "answered" : ""} ${idx === currentQuestion ? "active" : ""}`}
                      onClick={() => setCurrentQuestion(idx)}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <button type="submit" className="btn btn-primary">
                    Submit Quiz
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          /* Results View - Show All Questions */
          <div className="quizPurple-card">
            {quiz.questions.map((q, qIdx) => {
              const selected = answers[q.id];
              const isCorrect = selected === q.answerIndex;
              const isWrong = selected != null && selected !== q.answerIndex;
              return (
                <fieldset
                  key={q.id}
                  className={`quizPurple-question ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                >
                  <div className="quizPurple-question-header">
                    <span className="quizPurple-question-number">Question {qIdx + 1}</span>
                    <span className="quizPurple-question-category">{q.category}</span>
                    {isCorrect && (
                      <span className="quizPurple-status-badge correct">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Correct
                      </span>
                    )}
                    {isWrong && (
                      <span className="quizPurple-status-badge wrong">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Incorrect
                      </span>
                    )}
                  </div>
                  <legend className="quizPurple-qlegend">{q.text}</legend>
                  <div className="quizPurple-options">
                    {q.options.map((opt, i) => {
                      const checked = selected === i;
                      const postCorrect = i === q.answerIndex;
                      const postWrong = checked && i !== q.answerIndex;
                      return (
                        <label
                          key={i}
                          className={`quizPurple-radio ${checked ? "selected" : ""} ${postCorrect ? "post-correct" : ""} ${postWrong ? "post-wrong" : ""}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={i}
                            checked={checked || false}
                            disabled
                          />
                          <span className="quizPurple-opt-letter">{String.fromCharCode(65 + i)}</span>
                          <span className="quizPurple-opt-text">{opt}</span>
                          {postCorrect && (
                            <svg className="quizPurple-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <div className="quizPurple-explain">
                    <strong>Correct answer:</strong> {String.fromCharCode(65 + q.answerIndex)}. {q.options[q.answerIndex]}
                  </div>
                </fieldset>
              );
            })}

            {/* Results Summary */}
            <div className="quizPurple-results">
              <div className="quizPurple-score">
                <div className="quizPurple-score-ring">
                  <div className="quizPurple-score-num">{Math.round((score.correct / score.total) * 100)}%</div>
                </div>
                <div className="quizPurple-score-text">{score.correct} / {score.total} correct</div>
              </div>
              <div className="quizPurple-stats">
                {Object.entries(byCat).map(([cat, v]) => (
                  <div className="quizPurple-stat" key={cat}>
                    <div className="quizPurple-stat-name">{cat}</div>
                    <div className="quizPurple-stat-bar">
                      <div className="quizPurple-stat-fill" style={{ width: `${Math.round((v.ok / v.total) * 100)}%` }} />
                    </div>
                    <div className="quizPurple-stat-val">{v.ok}/{v.total}</div>
                  </div>
                ))}
              </div>
              <div className="quizPurple-actions center">
                <div className="quizPurple-passed-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Quiz Submitted - Marked as Passed</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleBackToCourse}>
                  Back to Course
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
