// QuizInformation.jsx
import React, { useMemo, useState } from "react";
import "./QuizInformation.css";

/* demo data */
const DEMO = [
  { id:"QZ-9801", courseId:"#CM9801", instructor:"Natali Craig", courseTitle:"Landing Page", quizTitle:"Meadow Lane Oakland", date:"Just now", status:"upcoming", score:null, description:"Short quiz covering fundamentals from the Landing Page module. 10 questions, 1 attempt." },
  { id:"QZ-9802", courseId:"#CM9802", instructor:"Kate Morrison", courseTitle:"CRM Admin pages", quizTitle:"Larry San Francisco", date:"1 minute ago", status:"graded", score:9, description:"Graded quiz about routing, auth guards, and admin page layout. Retake allowed once." },
  { id:"QZ-9803", courseId:"#CM9803", instructor:"Drew Cano", courseTitle:"Client Project", quizTitle:"Bagwell Avenue Ocala", date:"1 hour ago", status:"upcoming", score:null, description:"Upcoming quiz to validate your sprint planning and backlog grooming knowledge." },
  { id:"QZ-9804", courseId:"#CM9804", instructor:"Orlando Diggs", courseTitle:"Admin Dashboard", quizTitle:"Washburn Baton Rouge", date:"Yesterday", status:"missed", score:0, description:"This quiz was missed. You can retake it to record a grade (10 questions)." },
  { id:"QZ-9805", courseId:"#CM9805", instructor:"Andi Lane", courseTitle:"App Landing Page", quizTitle:"Nest Lane Olivette", date:"Feb 2, 2025", status:"graded", score:7, description:"Assessment of UI composition patterns and responsive rules. 10 questions." },
];

export default function QuizInformationPage({ items = DEMO }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // all | upcoming | graded | missed
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => {
      const passTab = tab === "all" ? true : x.status === tab;
      const hay = [x.courseId, x.instructor, x.courseTitle, x.quizTitle]
        .join(" ")
        .toLowerCase();
      return passTab && (q === "" || hay.includes(q));
    });
  }, [items, query, tab]);

  function StatusPill({ s }) {
    return (
      <span className={`qi-pill qi-${s}`}>
        {s === "graded" ? "Graded" : s === "missed" ? "Missed" : "Up Coming"}
      </span>
    );
  }

  function ScoreBadge({ status, score }) {
    if (status === "graded") return <span className="qi-badge">{score}/10</span>;
    if (status === "missed") return <span className="qi-badge qi-badge--missed">0/10</span>;
    return <span className="qi-badge qi-badge--muted">—</span>;
  }

  return (
    <div className="qi-page">
      {/* Header: title + pill filters on the left, compact search on the right */}
      <div className="qi-top">
        <div className="qi-headLeft">
          <h1 className="qi-title">Quizzes</h1>

          <div className="qi-tabs qi-tabs--pill" role="tablist">
            {["all", "upcoming", "graded", "missed"].map((t) => (
              <button
                key={t}
                role="tab"
                className={`qi-tab ${tab === t ? "is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "All" : t === "upcoming" ? "Up Coming" : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="qi-search qi-search--sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            className="qi-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="qi-tableWrap">
        <table className="qi-table">
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "220px" }} />
            <col />
            <col />
            <col style={{ width: "170px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>

          <thead>
            <tr>
              <th>Course ID</th>
              <th>Instructor Name</th>
              <th>Course Title</th>
              <th>Quiz Title</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((qz) => {
              const isOpen = open === qz.id;
              return (
                <React.Fragment key={qz.id}>
                  <tr
                    className={`qi-row qi-${qz.status}`}
                    onClick={() => setOpen(isOpen ? null : qz.id)}
                    aria-expanded={isOpen}
                  >
                    <td>{qz.courseId}</td>
                    <td>
                      <div className="qi-person">
                        <span className="qi-avatar" aria-hidden />
                        <span>{qz.instructor}</span>
                      </div>
                    </td>
                    <td>{qz.courseTitle}</td>
                    <td>{qz.quizTitle}</td>
                    <td className="qi-date">
                      <CalendarIcon /> {qz.date}
                    </td>
                    <td><StatusPill s={qz.status} /></td>
                  </tr>

                  {isOpen && (
                    <tr className="qi-detail">
                      <td colSpan={6}>
                        <div className="qi-widget">
                          <div className="qi-widget__header">
                            <h3 className="qi-widget__title">{qz.quizTitle}</h3>
                            <ScoreBadge status={qz.status} score={qz.score} />
                          </div>

                          <div className="qi-widget__meta">
                            <span className="qi-kv"><span className="qi-k">Course:</span><span className="qi-v">{qz.courseTitle}</span></span>
                            <span className="qi-kv"><span className="qi-k">Instructor:</span><span className="qi-v">{qz.instructor}</span></span>
                            <span className="qi-kv"><span className="qi-k">Status:</span><span className="qi-v">{qz.status}</span></span>
                          </div>

                          <p className="qi-widget__desc">{qz.description}</p>

                          <div className="qi-widget__actions">
                            <button
                              className="qi-retakeBtn qi-retakeBtn--lg"
                              onClick={() => alert(`Retake "${qz.quizTitle}"`)}
                            >
                              Retake Quiz
                            </button>
                            {qz.status === "graded" && (
                              <button
                                className="qi-secondaryBtn"
                                onClick={() => alert("View detailed report")}
                              >
                                View Report
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && <div className="qi-empty">No quizzes match your filters.</div>}
      </div>
    </div>
  );
}

/* icons */
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="qi-ic">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
