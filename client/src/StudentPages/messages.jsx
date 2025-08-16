import React from "react";
import { Link } from "react-router-dom";
import "./messages.css";

const conversations = [
  { id: 1, title: "3D Place solution", author: "Shams Tabrez", ago: "7h", comments: 9 },
  { id: 2, title: "what is the pcb board made of?", author: "Shams Tabrez", ago: "7h", comments: 3 },
  { id: 3, title: "will reactjs take over the web development sector?", author: "Shams Tabrez", ago: "7h", comments: 62 },
  { id: 4, title: "Soil Moisture Prediction with ML", author: "Shams Tabrez", ago: "7h", comments: 5 },
  { id: 5, title: "Deep Learning in the field of labour.", author: "Shams Tabrez", ago: "7h", comments: 1 },
  { id: 6, title: "Multioutput Regressor as a wrapper", author: "Shams Tabrez", ago: "7h", comments: 12 },
  { id: 7, title: "Big Opportunity of IoT in Africa", author: "Shams Tabrez", ago: "7h", comments: 7 },
];

export default function MessagesPage() {
  return (
    <main className="msg">
      <header className="msg-head">
        <h1>Discussions</h1>
        <div className="msg-actions">
          <div className="msg-search">
            <span className="i i-search" />
            <input placeholder="search discussion" />
          </div>
          <button className="btn-primary">
            <span className="i i-plus" /> Ask New
          </button>
        </div>
      </header>

      <section className="msg-list">
        {conversations.map((c) => (
          <Link to={`/messages/${c.id}`} key={c.id} className="msg-row">
            <div className="msg-avatar">
              <img src="https://i.pravatar.cc/80" alt="" />
            </div>

            <div className="msg-main">
              <div className="msg-title">{c.title}</div>
              <div className="msg-meta">
                {c.author} · Last comment {c.ago} ago
              </div>
            </div>

            <div className="msg-right">
              <div className="msg-badge">
                <span className="i i-reply" /> {c.comments}
              </div>
              <div className="msg-sub">comments</div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
