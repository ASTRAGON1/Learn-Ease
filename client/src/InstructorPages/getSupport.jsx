import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./getSupport.css";
import Footer from "../components/Footer";

export default function GetSupport() {
  // ---- AI chat (local mock) ----
  const [chat, setChat] = useState([
    { who: "bot", text: "Hi! Ask anything about LearnEase." },
  ]);
  const [q, setQ] = useState("");

  const sendAI = () => {
    if (!q.trim()) return;
    setChat((c) => [...c, { who: "me", text: q }]);
    setTimeout(() => {
      setChat((c) => [
        ...c,
        { who: "bot", text: "Thanks! AI will be wired soon." },
      ]);
    }, 400);
    setQ("");
  };

  // ---- Admin ticket (placeholder) ----
  const [subj, setSubj] = useState("");
  const [cat, setCat] = useState("General");
  const [msg, setMsg] = useState("");
  const [tickets, setTickets] = useState([
    { id: "T-1021", subject: "Video upload stuck", status: "Open" },
    { id: "T-1017", subject: "Profile image not saving", status: "Closed" },
  ]);

  const sendTicket = () => {
    if (!subj.trim() || !msg.trim()) return;
    setTickets((t) => [
      { id: `T-${1000 + t.length + 1}`, subject: subj, status: "Open" },
      ...t,
    ]);
    setSubj("");
    setMsg("");
    alert("Ticket sent to admin (backend hook later).");
  };

  return (
    <div className="sp-page">
      <div className="sp-head">
        <Link to="/HelpAndSupport" className="sp-back">‹ Get Back</Link>
        <h1 className="sp-title">Get support</h1>
        <span aria-hidden />
      </div>

      <div className="sp-grid">
        {/* Left: AI chat */}
        <section className="sp-card">
          <h3 className="sp-sub">Ask the assistant</h3>

          <div className="sp-chat">
            {chat.map((m, i) => (
              <div key={i} className={`sp-msg ${m.who}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="sp-row">
            <input
              className="sp-input"
              placeholder="Type your question…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAI()}
            />
            <button className="sp-primary" onClick={sendAI}>Send</button>
          </div>
        </section>

        {/* Right: Admin contact + tickets */}
        <section className="sp-card">
          <h3 className="sp-sub">Contact admin</h3>

          <div className="sp-field">
            <label>Subject</label>
            <input
              className="sp-input"
              value={subj}
              onChange={(e) => setSubj(e.target.value)}
              placeholder="Brief summary"
            />
          </div>

          <div className="sp-field">
            <label>Category</label>
            <select
              className="sp-input"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option>General</option>
              <option>Account</option>
              <option>Publishing</option>
              <option>Performance</option>
              <option>Payments</option>
            </select>
          </div>

          <div className="sp-field">
            <label>Message</label>
            <textarea
              className="sp-textarea"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Describe your issue…"
            />
          </div>

          <div className="sp-actions">
            <button className="sp-primary" onClick={sendTicket}>
              Send to admin
            </button>
          </div>

          <h4 className="sp-mini">Your tickets</h4>
          <ul className="sp-tickets">
            {tickets.map((t) => (
              <li key={t.id}>
                <span className="sp-id">{t.id}</span>
                <span className="sp-subject">{t.subject}</span>
                <span className={`sp-status ${t.status.toLowerCase()}`}>{t.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
