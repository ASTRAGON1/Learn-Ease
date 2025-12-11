import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./QuizInformation.css";
import { Calendar, User, BookOpen, Award, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react";

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
    duration: "30 min",
    questions: 15,
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
    maxScore: 10,
    duration: "25 min",
    questions: 12,
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
    duration: "20 min",
    questions: 10,
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
    maxScore: 10,
    duration: "35 min",
    questions: 18,
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
    maxScore: 10,
    duration: "40 min",
    questions: 20,
  },
];

export default function QuizInformation() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all"); // all | upcoming | graded | missed

  const rows = useMemo(() => {
    return DEMO.filter((x) => {
      const matchTab = tab === "all" ? true : x.status === tab;
      return matchTab;
    });
  }, [tab]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "graded":
        return <CheckCircle2 size={18} />;
      case "missed":
        return <XCircle size={18} />;
      case "upcoming":
        return <Clock size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "missed":
        return "Missed";
      case "upcoming":
        return "Upcoming";
      default:
        return "Unknown";
    }
  };

  const handleStartQuiz = (quiz) => {
    if (quiz.status === "upcoming") {
      navigate("/quiz", { state: { quizId: quiz.id } });
    }
  };

  const stats = useMemo(() => {
    return {
      all: DEMO.length,
      upcoming: DEMO.filter((q) => q.status === "upcoming").length,
      graded: DEMO.filter((q) => q.status === "graded").length,
      missed: DEMO.filter((q) => q.status === "missed").length,
    };
  }, []);

  return (
    <div className="qi-page">
      {/* Header */}
      <header className="qi-header">
        <div className="qi-header-content">
          <div className="qi-header-left">
            <Link to="/student-dashboard-2" className="qi-back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </Link>
            <div>
              <h1 className="qi-title">Quiz Information</h1>
              <p className="qi-subtitle">View and manage all your quizzes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="qi-stats">
        <div className="qi-stat-card" onClick={() => setTab("all")}>
          <div className="qi-stat-icon all">
            <BookOpen size={24} />
          </div>
          <div className="qi-stat-content">
            <div className="qi-stat-value">{stats.all}</div>
            <div className="qi-stat-label">All Quizzes</div>
          </div>
        </div>
        <div className="qi-stat-card" onClick={() => setTab("upcoming")}>
          <div className="qi-stat-icon upcoming">
            <Clock size={24} />
          </div>
          <div className="qi-stat-content">
            <div className="qi-stat-value">{stats.upcoming}</div>
            <div className="qi-stat-label">Upcoming</div>
          </div>
        </div>
        <div className="qi-stat-card" onClick={() => setTab("graded")}>
          <div className="qi-stat-icon graded">
            <CheckCircle2 size={24} />
          </div>
          <div className="qi-stat-content">
            <div className="qi-stat-value">{stats.graded}</div>
            <div className="qi-stat-label">Graded</div>
          </div>
        </div>
        <div className="qi-stat-card" onClick={() => setTab("missed")}>
          <div className="qi-stat-icon missed">
            <XCircle size={24} />
          </div>
          <div className="qi-stat-content">
            <div className="qi-stat-value">{stats.missed}</div>
            <div className="qi-stat-label">Missed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="qi-tabs-container">
        <div className="qi-tabs">
          {[
            ["all", "All", stats.all],
            ["upcoming", "Upcoming", stats.upcoming],
            ["graded", "Graded", stats.graded],
            ["missed", "Missed", stats.missed],
          ].map(([key, label, count]) => (
            <button
              key={key}
              className={`qi-tab ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
              <span className="qi-tab-count">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Cards */}
      <main className="qi-main">
        {rows.length > 0 ? (
          <div className="qi-cards-grid">
            {rows.map((quiz) => (
              <div key={quiz.id} className={`qi-card qi-card-${quiz.status}`}>
                <div className="qi-card-header">
                  <div className="qi-card-status">
                    <span className={`qi-status-badge qi-status-${quiz.status}`}>
                      {getStatusIcon(quiz.status)}
                      {getStatusLabel(quiz.status)}
                    </span>
                  </div>
                  <div className="qi-card-id">{quiz.courseId}</div>
                </div>

                <div className="qi-card-body">
                  <h3 className="qi-card-title">{quiz.quizTitle}</h3>
                  <p className="qi-card-course">{quiz.courseTitle}</p>

                  <div className="qi-card-info">
                    <div className="qi-info-item">
                      <User size={16} />
                      <span>{quiz.instructor}</span>
                    </div>
                    <div className="qi-info-item">
                      <Calendar size={16} />
                      <span>{quiz.date}</span>
                    </div>
                    <div className="qi-info-item">
                      <Clock size={16} />
                      <span>{quiz.duration}</span>
                    </div>
                    {quiz.questions && (
                      <div className="qi-info-item">
                        <BookOpen size={16} />
                        <span>{quiz.questions} questions</span>
                      </div>
                    )}
                  </div>

                  {quiz.status === "graded" && (
                    <div className="qi-score-section">
                      <div className="qi-score-header">
                        <span className="qi-score-label">Your Score</span>
                        <span className="qi-score-value">
                          {quiz.score}/{quiz.maxScore}
                        </span>
                      </div>
                      <div className="qi-score-bar">
                        <div
                          className="qi-score-fill"
                          style={{ width: `${(quiz.score / quiz.maxScore) * 100}%` }}
                        ></div>
                      </div>
                      <div className="qi-score-percentage">
                        {Math.round((quiz.score / quiz.maxScore) * 100)}%
                      </div>
                    </div>
                  )}

                  {quiz.status === "missed" && (
                    <div className="qi-missed-banner">
                      <XCircle size={18} />
                      <span>You missed this quiz</span>
                    </div>
                  )}
                </div>

                <div className="qi-card-footer">
                  {quiz.status === "upcoming" && (
                    <button
                      className="qi-btn qi-btn-primary"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <PlayCircle size={18} />
                      Start Quiz
                    </button>
                  )}
                  {quiz.status === "graded" && (
                    <button
                      className="qi-btn qi-btn-secondary"
                      onClick={() => navigate("/quiz-results", { state: { quiz } })}
                    >
                      <Award size={18} />
                      View Results
                    </button>
                  )}
                  {quiz.status === "missed" && (
                    <button className="qi-btn qi-btn-disabled" disabled>
                      <XCircle size={18} />
                      Missed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="qi-empty">
            <div className="qi-empty-icon">
              <BookOpen size={48} />
            </div>
            <h3 className="qi-empty-title">No quizzes found</h3>
            <p className="qi-empty-text">
              No quizzes match your current filter
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
