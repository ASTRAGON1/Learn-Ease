import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ← single import
import "./Courses.css";
import cover from "../assets/quizpic.png";


/* ---- demo data ---- */
const DATA = [
  { id: "c1", title: "Speaking I", desc: "Build basic speaking confidence.", author: "Shams Tabrez", lessons: 12, quizzes: 7, category: "Speaking",   level: "Beginner",    cover, featured: true  },
  { id: "c2", title: "Emotion Recognition", desc: "Understand expressions and tone.", author: "Shams Tabrez", lessons: 5,  quizzes: 4, category: "Emotions",   level: "Beginner",    cover, featured: false },
  { id: "c3", title: "Conversation Skills", desc: "Practice daily dialogs.", author: "Shams Tabrez", lessons: 6,  quizzes: 5, category: "Speaking",   level: "Intermediate", cover, featured: true  },
  { id: "c4", title: "Vocabulary Builder", desc: "Grow your word bank fast.", author: "Shams Tabrez", lessons: 8,  quizzes: 4, category: "Vocabulary", level: "All",         cover, featured: false },
  { id: "c5", title: "Listening Drills", desc: "Sharpen your ears.", author: "Shams Tabrez", lessons: 5,  quizzes: 3, category: "Listening",  level: "All",         cover, featured: false },
  { id: "c6", title: "Public Speaking Basics", desc: "Present with clarity.", author: "Shams Tabrez", lessons: 7,  quizzes: 4, category: "Speaking",   level: "Beginner",    cover, featured: true  },
];

/* ---- single course card ---- */
function CourseCard({ item }) {
  return (
    <article className={`crs-card ${item.featured ? "dark" : ""}`}>
      <div className="crs-cover">
        <img src={item.cover} alt="" />
        {item.featured && <span className="crs-pill">Featured</span>}
      </div>

      <div className="crs-body">
        <h3 className="crs-title">{item.title}</h3>
        <p className="crs-desc">{item.desc}</p>

        <div className="crs-meta">
          <span>{item.lessons} lessons</span>
          <span className="dot">•</span>
          <span>{item.quizzes} quizzes</span>
        </div>

        <div className="crs-footer">
          <div className="crs-author">👤 {item.author}</div>
          <div className="crs-level">
            {item.category} • {item.level}
          </div>
        </div>

<div className="crs-actions-row">
  <Link to="/CoursePlayer" className="crs-btn ghost">Details</Link>
</div>

      </div>
    </article>
  );
}

/* ---- page ---- */
export default function Courses() {
  const navigate = useNavigate();
  const [q, setQ]   = useState("");
  const [tag, setTag] = useState("All");

  const tags = useMemo(() => {
    const cats = Array.from(new Set(DATA.map(d => (d.category || "").trim())));
    return ["All", ...cats];
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DATA.filter(d => {
      const cat = (d.category || "").trim();
      const okTag = tag === "All" || cat === tag;
      const okText =
        term === "" ||
        d.title.toLowerCase().includes(term) ||
        d.desc.toLowerCase().includes(term);
      return okTag && okText;
    });
  }, [q, tag]);

  // stagger fade-up for cards
  useEffect(() => {
    document.querySelectorAll(".crs-card").forEach((el, i) => {
      el.style.animationDelay = `${i * 60}ms`;
    });
  }, [list.length]);

  return (
    <div className="crs-page">
      <header className="crs-head">
        <div className="crs-head-left">

          <div className="crs-titlebox">
            <h1>Course Catalog</h1>
            <p className="crumbs">My Courses / catalog</p>
          </div>
        </div>

        <div className="crs-actions">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search"
            className="crs-search"
          />
          <button className="icon-btn" aria-label="Search">🔍</button>
        </div>
      </header>

      <div className="crs-tags">
        {tags.map((t) => (
          <button
            key={t}
            className={`crs-tag ${tag === t ? "active" : ""}`}
            onClick={() => setTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="crs-grid">
        {list.map((item) => (
          <CourseCard key={item.id} item={item} />
        ))}
        {!list.length && <div className="crs-empty">No courses match your search.</div>}
      </section>
    </div>
  );
}
