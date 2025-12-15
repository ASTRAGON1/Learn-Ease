import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./QuizInformation.css";
import { Calendar, User, BookOpen, Award, Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QuizInformation() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all"); // all | upcoming | graded
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) return;

      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch(`${API_URL}/api/quizzes/student`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   setQuizzes(data.quizzes || []);
        // }
        setQuizzes([]); // Empty array until API is ready
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const rows = useMemo(() => {
    return quizzes.filter((x) => {
      const matchTab = tab === "all" ? true : x.status === tab;
      return matchTab;
    });
  }, [quizzes, tab]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "graded":
        return <CheckCircle2 size={18} />;
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
      all: quizzes.length,
      upcoming: quizzes.filter((q) => q.status === "upcoming").length,
      graded: quizzes.filter((q) => q.status === "graded").length,
    };
  }, [quizzes]);

  return (
    <div className="qi-page">
      {/* Header */}
      <header className="qi-header">
        <Link to="/student-dashboard-2" className="qi-back-btn">
          <span className="qi-back-chev">‹</span> Back to Dashboard
        </Link>
        <div className="qi-header-content">
          <div className="qi-header-icon">
            <BookOpen size={32} />
          </div>
          <h1 className="qi-title">Quiz Information</h1>
          <p className="qi-subtitle">View and manage all your quizzes</p>
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
      </div>

      {/* Tabs */}
      <div className="qi-tabs-container">
        <div className="qi-tabs">
          {[
            ["all", "All", stats.all],
            ["upcoming", "Upcoming", stats.upcoming],
            ["graded", "Graded", stats.graded],
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
        {loading ? (
          <div className="qi-empty">
            <div className="qi-empty-icon">
              <BookOpen size={48} />
            </div>
            <h3 className="qi-empty-title">Loading quizzes...</h3>
          </div>
        ) : rows.length > 0 ? (
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
