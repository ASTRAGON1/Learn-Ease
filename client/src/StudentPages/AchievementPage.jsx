import React from "react";
import { Trophy, Lock, CheckCircle2, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AchievementPage.css";
import logo from "../assets/simpleLogo2.png";

/* ===================== Demo Data ===================== */
const demoCourses = [
  {
    id: "c-ux101",
    title: "UX Fundamentals",
    instructor: "Jane Doe",
    cover:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1200&auto=format&fit=crop",
    finalGrade: 92,
    quizzesPassed: 6,
    quizzesTotal: 6,
    completed: true,
    completedAt: "2025-08-01",
  },
  {
    id: "c-js201",
    title: "Modern JavaScript",
    instructor: "Ahmed N.",
    cover:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    finalGrade: 78,
    quizzesPassed: 5,
    quizzesTotal: 6,
    completed: false,
  },
  {
    id: "c-ml301",
    title: "Intro to Machine Learning",
    instructor: "Iliass K.",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    finalGrade: 97,
    quizzesPassed: 7,
    quizzesTotal: 7,
    completed: true,
    completedAt: "2025-07-22",
  },
];

/* ===================== Helpers ===================== */
function getBadgeTier(grade) {
  if (grade >= 95) return "Platinum"; // 95-100
  if (grade >= 80) return "Gold";     // 80-94
  if (grade >= 65) return "Silver";   // 65-79
  if (grade >= 50) return "Bronze";   // 50-64
  return "No Badge";                   // <50
}

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="progress">
      <div className="progress__bar" style={{ width: `${v}%` }} />
    </div>
  );
}

function Badge({ tier, grade }) {
  const tierClass =
    tier === "Platinum" ? "badge badge--platinum" :
    tier === "Gold" ? "badge badge--gold" :
    tier === "Silver" ? "badge badge--silver" :
    tier === "Bronze" ? "badge badge--bronze" :
    "badge badge--none";

  return (
    <div className={tierClass}>
      <div className="badge__row">
        <div className="badge__icon"><Trophy className="i" /></div>
        <div className="badge__meta">
          <p className="badge__label">Achievement</p>
          <h4 className="badge__title">{tier} Badge</h4>
          <p className="badge__grade">Final grade: {grade}%</p>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const {
    title,
    instructor,
    cover,
    finalGrade,
    quizzesPassed,
    quizzesTotal,
    completed,
    completedAt,
  } = course;

  const tier = getBadgeTier(finalGrade);
  const progress =
    Math.max(0, Math.min(100, ((quizzesPassed ?? 0) / Math.max(quizzesTotal ?? 1, 1)) * 100));

  return (
    <article className="course">
      <div className="course__cover">
        {cover ? <img src={cover} alt="course cover" /> : null}
      </div>

      <div className="course__body">
        <div className="course__top">
          <div className="course__info">
            <h3 className="course__title">{title}</h3>
            <p className="course__instructor">Instructor: {instructor}</p>
          </div>

          {completed ? (
            <span className="pill pill--done">
              <CheckCircle2 className="i" /> Completed
            </span>
          ) : (
            <span className="pill pill--lock">
              <Lock className="i" /> In progress
            </span>
          )}
        </div>

        <div className="course__stats">
          <div className="course__quiz">
            Quizzes: {quizzesPassed}/{quizzesTotal}
          </div>
          <div className="course__grade">Grade: {finalGrade}%</div>
        </div>

        <ProgressBar value={progress} />

        {completed ? (
          <div className="course__earned">
            <Badge tier={tier} grade={finalGrade} />
            {completedAt && (
              <p className="course__date">
                Earned on {new Date(completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="course__hint">
            <Star className="i" /> Finish all quizzes to unlock your badge
          </div>
        )}
      </div>
    </article>
  );
}

/* ===================== Page ===================== */
export default function AchievementPage({ courses = demoCourses }) {
  const navigate = useNavigate();
  const earned = courses.filter((c) => c.completed);
  const inProgress = courses.filter((c) => !c.completed);

  return (
    <div className="achv-page">
      <header className="achv-header">
        <div className="achv-header__inner">
          <div className="brand">
            <img src={logo} alt="Logo" className="brand__img" />
            <h1 className="brand__title">Your Achievements</h1>
          </div>

          {/* purple arrow only */}
          <button
            className="back-arrow"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            <ArrowLeft className="icon-arrow" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="achv-main">
        {/* Earned Badges */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Earned Badges</h2>
            <p className="section__meta">{earned.length} course(s) completed</p>
          </div>
          {earned.length === 0 ? (
            <div className="empty">You haven&apos;t earned any badges yet. Keep learning!</div>
          ) : (
            <div className="grid">
              {earned.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        {/* In Progress */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">In Progress</h2>
            <p className="section__meta">{inProgress.length} course(s)</p>
          </div>
          {inProgress.length === 0 ? (
            <div className="empty">No courses in progress.</div>
          ) : (
            <div className="grid">
              {inProgress.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        {/* Legend */}
        <section className="legend">
          <h3 className="legend__title">Badge Tiers</h3>
          <ul className="legend__list">
            <li className="legend__item">
              <span className="dot dot--bronze" /> Bronze: 50–64%
            </li>
            <li className="legend__item">
              <span className="dot dot--silver" /> Silver: 65–79%
            </li>
            <li className="legend__item">
              <span className="dot dot--gold" /> Gold: 80–94%
            </li>
            <li className="legend__item">
              <span className="dot dot--platinum" /> Platinum: 95–100%
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
