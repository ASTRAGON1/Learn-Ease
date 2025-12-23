import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./QuizInformation.css";
import { Calendar, User, BookOpen, Award, Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QuizInformation() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("your_course"); // your_course | upcoming | graded
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
        const response = await fetch(`${API_URL}/api/quizzes/student`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes || []);
        } else {
          console.error('Failed to fetch quizzes');
          setQuizzes([]);
        }
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
    return quizzes.filter((x) => x.status === tab);
  }, [quizzes, tab]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "graded":
        return <CheckCircle2 size={18} />;
      case "upcoming":
        return <Clock size={18} />;
      case "your_course":
        return <PlayCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "graded":
        return "Graded/Paused";
      case "upcoming":
        return "Upcoming";
      case "your_course":
        return "Available";
      default:
        return "Unknown";
    }
  };

  const handleStartQuiz = (quiz) => {
    if (quiz.status === "your_course") {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const stats = useMemo(() => {
    return {
      your_course: quizzes.filter((q) => q.status === "your_course").length,
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
        <div className="qi-stat-card" onClick={() => setTab("your_course")}>
          <div className="qi-stat-icon all">
            <BookOpen size={24} />
          </div>
          <div className="qi-stat-content">
            <div className="qi-stat-value">{stats.your_course}</div>
            <div className="qi-stat-label">Your Course</div>
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
            <div className="qi-stat-label">Graded/Paused</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="qi-tabs-container">
        <div className="qi-tabs">
          {[
            ["your_course", "Your Course", stats.your_course],
            ["upcoming", "Upcoming", stats.upcoming],
            ["graded", "Graded/Paused", stats.graded],
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
              <div key={quiz.id} className="qi-modern-card">
                <div className="qi-card-header">
                  <span className={`qi-status-pill ${quiz.status}`}>
                    {quiz.status === "upcoming" && "⏳ "}
                    {quiz.status === "graded" && "✅ "}
                    {quiz.status === "your_course" && "▶️ "}
                    {getStatusLabel(quiz.status)}
                  </span>
                </div>

                <div className="qi-card-body">
                  <h3 className="qi-card-title">{quiz.quizTitle}</h3>
                  <div className="qi-lesson">Lesson: {quiz.lessonTitle}</div>

                  <div className="qi-meta-row">
                    <div className="qi-question-count">
                      <span>{quiz.questions} Questions</span>
                    </div>
                    <div className={`qi-difficulty ${quiz.difficulty?.toLowerCase()}`}>
                      {quiz.difficulty}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  {quiz.status === "your_course" && (
                    <button
                      className="qi-action-btn"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <PlayCircle size={18} />
                      Join Quiz
                    </button>
                  )}
                  {quiz.status === "graded" && (
                    // Check if quiz is paused or completed
                    quiz.resultStatus === 'paused' ? (
                      <button
                        className="qi-action-btn secondary"
                        onClick={() => handleStartQuiz(quiz)}
                      >
                        <PlayCircle size={18} />
                        Resume Quiz
                      </button>
                    ) : (
                      <div className="qi-status-badge passed">
                        <Award size={18} />
                        Score: {quiz.score}%
                      </div>
                    )
                  )}
                  {quiz.status === "upcoming" && (
                    <button className="qi-action-btn secondary" disabled>
                      Upcoming
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
