import React, { useMemo, useState } from "react";
import "./QuizInformation.css";
import logo from "../assets/logoquiz.png";

/** Demo data (replace with API later) */
const DEMO = [
  {
    id: "QZ-9801",
    courseId: "#CM9801",
    instructor: "Natali Craig",
    courseTitle: "Landing Page",
    quizTitle: "Meadow Lane Oakland",
    date: "Just now",
    status: "upcoming", // upcoming | graded | missed
    score: null,
  },
  {
    id: "QZ-9802",
    courseId: "#CM9802",
    instructor: "Kate Morrison",
    courseTitle: "CRM Admin pages",
    quizTitle: "Larry San Francisco",
    date: "1 minute ago",
    status: "graded",
    score: 9,
  },
  {
    id: "QZ-9803",
    courseId: "#CM9803",
    instructor: "Drew Cano",
    courseTitle: "Client Project",
    quizTitle: "Bagwell Avenue Ocala",
    date: "1 hour ago",
    status: "upcoming",
    score: null,
  },
  {
    id: "QZ-9804",
    courseId: "#CM9804",
    instructor: "Orlando Diggs",
    courseTitle: "Admin Dashboard",
    quizTitle: "Washburn Baton Rouge",
    date: "Yesterday",
    status: "missed",
    score: 0,
  },
  {
    id: "QZ-9805",
    courseId: "#CM9805",
    instructor: "Andi Lane",
    courseTitle: "App Landing Page",
    quizTitle: "Nest Lane Olivette",
    date: "Feb 2, 2025",
    status: "graded",
    score: 7,
  },
];

export default function QuizInformation() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // all | upcoming | graded | missed
  const [openId, setOpenId] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO.filter((x) => {
      const matchTab = tab === "all" ? true : x.status === tab;
      const hay = `${x.courseId} ${x.instructor} ${x.courseTitle} ${x.quizTitle}`.toLowerCase();
      return matchTab && (q === "" || hay.includes(q));
    });
  }, [query, tab]);

  const pill = (s) => (s === "graded" ? "Graded" : s === "missed" ? "Missed" : "Up coming");

  return (
    <div className="qi2-page">

<header className="qi2-header qi2-header--hero">
  <div className="qi2-brand">
    <img src={logo} alt="Logo" className="qi2-logo qi2-logo--lg" />
    <div className="qi2-search" role="search">
    <input
      className="qi2-input"
      placeholder="Search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      aria-label="Search quizzes"
    />
  </div>

  </div>
</header>


<div className="qi2-actionsBar">
  <div className="qi2-tabs" role="tablist" aria-label="Quiz filters">
    {[
      ["all", "All"],
      ["upcoming", "Up Coming"],
      ["graded", "Graded"],
      ["missed", "Missed"],
    ].map(([key, label]) => (
      <button
        key={key}
        role="tab"
        aria-selected={tab === key}
        className={`qi2-tab ${tab === key ? "is-active" : ""}`}
        onClick={() => setTab(key)}
      >
        {label}
      </button>
    ))}
  </div>


</div>


      {/* MAIN TABLE */}
      <main className="qi2-main">
        <div className="qi2-tableWrap">
          <table className="qi2-table">
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
              {rows.map((r) => {
                const open = openId === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`qi2-row qi2-${r.status}`}
                      onClick={() => setOpenId(open ? null : r.id)}
                      aria-expanded={open}
                    >
                      <td>{r.courseId}</td>
                      <td>
                        <div className="qi2-person">
                          <span className="qi2-avatar" aria-hidden />
                          {r.instructor}
                        </div>
                      </td>
                      <td>{r.courseTitle}</td>
                      <td>{r.quizTitle}</td>
                      <td className="qi2-date">
                        <CalendarIcon /> {r.date}
                      </td>
                      <td>
                        <span className={`qi2-pill qi2-${r.status}`}>{pill(r.status)}</span>
                      </td>
                    </tr>

                    {open && (
                      <tr className="qi2-detail">
                        <td colSpan={6}>
                          <div className="qi2-widget">
                            <h3 className="qi2-w-title">{r.quizTitle}</h3>

                            <div className="qi2-w-grid">
                              <div className="qi2-kv">
                                <span className="qi2-k">Quiz Title:</span>
                                <span className="qi2-v">{r.quizTitle}</span>
                              </div>
                              <div className="qi2-kv">
                                <span className="qi2-k">Instructor:</span>
                                <span className="qi2-v">{r.instructor}</span>
                              </div>
                              <div className="qi2-kv">
                                <span className="qi2-k">Status:</span>
                                <span className="qi2-v">{pill(r.status)}</span>
                              </div>

                              {r.status === "graded" && (
                                <div className="qi2-kv">
                                  <span className="qi2-k">Grade:</span>
                                  <span className="qi2-badge">{r.score}/10</span>
                                </div>
                              )}

                              {r.status === "missed" && (
                                <div className="qi2-kv">
                                  <span className="qi2-k">Grade:</span>
                                  <span className="qi2-badge qi2-badge--missed">0/10</span>
                                </div>
                              )}

                              {r.status === "upcoming" && (
                                <div className="qi2-kv">
                                  <span className="qi2-k">Scheduled:</span>
                                  <span className="qi2-v">{r.date}</span>
                                </div>
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

          {rows.length === 0 && (
            <div className="qi2-empty">No quizzes match your filters.</div>
          )}
        </div>
      </main>
    </div>
  );
}

/* tiny icon */
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
