import React, { useMemo, useState, useRef, useEffect } from "react";
import "./quizPurple.css"; // keep in src/



// ---------- Demo data (replace with API) ----------
const DEMO_QUIZ = {
  id: "demo-onepage",
  courseTitle: "Speaking I - SPEK101",
  courseCode: "SPEK101",
  instructorName: "Dr. Jane Smith",
  instructorEmail: "jane.smith@university.edu",
  title: "Speaking Fundamentals — Unit 2 Quiz",
  durationSec: 0, // single page has no timer by default
  questions: [
    { id: "q1", text: "Which greeting is most formal?", options: ["Hey there!", "Good morning", "Yo!", "What's up?"], answerIndex: 1, category: "Etiquette" },
    { id: "q2", text: "Choose the correct response to 'How do you do?'", options: ["Fine, thanks.", "How do you do?", "Not bad.", "Great!"], answerIndex: 1, category: "Etiquette" },
    { id: "q3", text: "Pick the sentence with correct subject–verb agreement.", options: ["She go to class.", "They goes to class.", "He goes to class.", "I goes to class."], answerIndex: 2, category: "Grammar" },
    { id: "q4", text: "Which is a polite way to ask for help?", options: ["You, help me.", "Help.", "Can you please help me?", "Do this."], answerIndex: 2, category: "Politeness" },
    { id: "q5", text: "Select the best phrase to disagree politely.", options: ["You're wrong.", "I don't think that's quite right.", "Nope.", "Wrong."], answerIndex: 1, category: "Politeness" },
    { id: "q6", text: "Which closing is appropriate in a formal email?", options: ["Cheers,", "See ya,", "Later,", "Best regards,"], answerIndex: 3, category: "Email" },
    { id: "q7", text: "Choose the correct preposition: 'I'm interested ___ linguistics.'", options: ["on", "at", "in", "for"], answerIndex: 2, category: "Grammar" },
  ],
};

// ---------- Helpers ----------
function computeScore(quiz, answers) {
  let correct = 0;
  quiz.questions.forEach((q) => { if (answers[q.id] === q.answerIndex) correct++; });
  return { correct, total: quiz.questions.length };
}

// ---------- Component ----------
export default function QuizzApp({ quiz = DEMO_QUIZ }) {
  const [answers, setAnswers] = useState({}); // { qid: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [submitted]);

  const byCat = useMemo(() => {
    const m = {};
    quiz.questions.forEach((q) => {
      const ok = answers[q.id] === q.answerIndex;
      if (!m[q.category]) m[q.category] = { ok: 0, total: 0 };
      m[q.category].total += 1;
      if (ok) m[q.category].ok += 1;
    });
    return m;
  }, [quiz.questions, answers]);

  const score = useMemo(() => computeScore(quiz, answers), [quiz, answers]);

  function handleChange(qid, idx) {
    setAnswers((p) => ({ ...p, [qid]: idx }));
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
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

  function handleRetake() {
    setAnswers({});
    setSubmitted(false);
    formRef.current?.reset?.();
  }

  return (
    <div className="quizPurple-page">
      {/* Header */}
      <section className="quizPurple-container">
        <header className="quizPurple-header">
          <div className="quizPurple-logo">QZ</div>
          <div>
            <h1 className="quizPurple-title">{quiz.title}</h1>
            <div className="quizPurple-meta" style={{justifyContent:"flex-start"}}>
              <span><strong>Course:</strong> {quiz.courseTitle} ({quiz.courseCode})</span>
              <span>•</span>
              <span><strong>Instructor:</strong> {quiz.instructorName}</span>
              <span>•</span>
              <span><strong>Contact:</strong> {quiz.instructorEmail}</span>
            </div>
          </div>
        </header>
      </section>

      {/* One-page form */}
      <section className="quizPurple-container">
        <form ref={formRef} onSubmit={handleSubmit} className="quizPurple-card" noValidate>
          {quiz.questions.map((q, qIdx) => {
            const selected = answers[q.id];
            const showResult = submitted;
            const isCorrect = showResult && selected === q.answerIndex;
            const isWrong = showResult && selected != null && selected !== q.answerIndex;
            return (
              <fieldset key={q.id} className={`quizPurple-question ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} data-qidx={qIdx}>
                <legend className="quizPurple-qlegend">Q{qIdx + 1}. {q.text}</legend>
                <div className="quizPurple-options onepage">
                  {q.options.map((opt, i) => {
                    const checked = selected === i;
                    const postCorrect = submitted && i === q.answerIndex;
                    const postWrong = submitted && checked && i !== q.answerIndex;
                    return (
                      <label key={i} className={`quizPurple-radio ${checked ? "selected" : ""} ${postCorrect ? "post-correct" : ""} ${postWrong ? "post-wrong" : ""}`}>
                        <input
                          type="radio"
                          name={q.id}
                          value={i}
                          checked={checked || false}
                          onChange={() => handleChange(q.id, i)}
                          disabled={submitted}
                        />
                        <span className="quizPurple-opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="quizPurple-opt-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="quizPurple-explain">
                    Correct answer: <strong>{String.fromCharCode(65 + q.answerIndex)}</strong>
                  </div>
                )}
              </fieldset>
            );
          })}

          {!submitted ? (
            <div className="quizPurple-actions center" style={{marginTop:16}}>
              <button type="submit" className="btn btn-primary">Submit Quiz</button>
            </div>
          ) : (
            <div className="quizPurple-results">
              <div className="quizPurple-score">
                <div className="quizPurple-score-ring">
                  <div className="quizPurple-score-num">{Math.round((score.correct/score.total)*100)}%</div>
                </div>
                <div className="quizPurple-score-text">{score.correct} / {score.total} correct</div>
              </div>
              <div className="quizPurple-stats">
                {Object.entries(byCat).map(([cat, v]) => (
                  <div className="quizPurple-stat" key={cat}>
                    <div className="quizPurple-stat-name">{cat}</div>
                    <div className="quizPurple-stat-bar"><div className="quizPurple-stat-fill" style={{width: `${Math.round((v.ok/v.total)*100)}%`}}/></div>
                    <div className="quizPurple-stat-val">{v.ok}/{v.total}</div>
                  </div>
                ))}
              </div>
              <div className="quizPurple-actions center" style={{marginTop:8}}>
                <button type="button" className="btn btn-outline" onClick={handleRetake}>Retake</button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

// ---------- DEV TESTS ----------
if (typeof window !== "undefined" && import.meta?.env?.DEV) {
  console.group("onepage quiz tests");
  const t1 = computeScore(DEMO_QUIZ, { q1:1,q2:1,q3:2,q4:2,q5:1,q6:3,q7:2 });
  console.assert(t1.correct === 7, "All-correct should be 7/7");
  const t2 = computeScore(DEMO_QUIZ, { q1:0,q2:0,q3:0,q4:0,q5:0,q6:0,q7:0 });
  console.assert(t2.correct === 0, "All-wrong should be 0/7");
  console.groupEnd();
}