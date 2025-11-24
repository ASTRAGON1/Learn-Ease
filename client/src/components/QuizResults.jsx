import React from "react";
import "./QuizResults.css";

const sampleData = [
  {
    student: "ByeWind",
    date:    "Jun 24, 2025",
    grade:   "85%",
    status:  "Complete",
  },
  {
    student: "Natali Craig",
    date:    "Mar 10, 2025",
    grade:   "50%",
    status:  "Complete",
  },
  {
    student: "nouaim",
    date:    "Mar 10, 2025",
    grade:   "--%",
    status:  "Paused",
  },
  {
    student: "nouaim",
    date:    "Mar 10, 2025",
    grade:   "--%",
    status:  "Paused",
  },
    {
    student: "nouaim",
    date:    "Mar 10, 2025",
    grade:   "--%",
    status:  "Paused",
  },
  {
    student: "nouaim",
    date:    "Mar 10, 2025",
    grade:   "--%",
    status:  "Paused",
  },
  {
    student: "nouaim",
    date:    "Mar 10, 2025",
    grade:   "--%",
    status:  "Paused",
  },
];

export default function QuizResults({ data = sampleData }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="quiz-results">
  <h3 className="quiz-title">Quizzes results</h3>

  {/* fixed header */}
  <div className="quiz-header">
    <div className="col student-col">Student</div>
    <div className="col date-col">Date</div>
    <div className="col grade-col">Grade</div>
    <div className="col status-col">Status</div>
  </div>

  {/* only this list scrolls */}
  <div className="quiz-list">
    {hasData ? (
      data.map((row, i) => (
        <div key={i} className="quiz-row">
          <div className="col student-col">
            <div className="avatar-circle" /> {row.student}
          </div>
          <div className="col date-col">{row.date}</div>
          <div className="col grade-col">{row.grade}</div>
          <div className="col status-col">
            <button 
              className={`status-btn ${
                row.status.toLowerCase().includes('complete') ? 'completed' : 
                row.status.toLowerCase().includes('pause') ? 'paused' : ''
              }`}
            >
              {row.status}
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="quiz-empty-state">
        <div className="quiz-empty-icon">📭</div>
        <p className="quiz-empty-text">No quiz results yet</p>
        <p className="quiz-empty-subtext">Generate quizzes to see insights here.</p>
      </div>
    )}
  </div>
</div>

  );
}
