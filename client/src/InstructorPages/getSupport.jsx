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
    <div className="gs2-page">
        <div className="gs2-head">
            <Link to="/HelpAndSupport" className="gs2-back">‹ Get Back</Link>
            <h1 className="gs2-title">Get support</h1>
            <span aria-hidden />
        </div>
      <div className="gs2-grid">
        {/* Left: AI chat */}
        <section className="gs2-card">
          <h3 className="gs2-sub">Ask the assistant</h3>

          <div className="gs2-chat">
            {chat.map((m, i) => (
              <div key={i} className={`gs2-msg ${m.who}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="gs2-row">
            <input
              className="gs2-input"
              placeholder="Type your question…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAI()}
            />
            <button className="gs2-primary" onClick={sendAI}>Send</button>
          </div>
        </section>

        {/* Right: Admin contact + tickets */}
        <section className="gs2-card">
          <h3 className="gs2-sub">Contact admin</h3>

          <div className="gs2-field">
            <label>Subject</label>
            <input
              className="gs2-input"
              value={subj}
              onChange={(e) => setSubj(e.target.value)}
              placeholder="Brief summary"
            />
          </div>

          <div className="gs2-field">
            <label>Category</label>
            <select
              className="gs2-input"
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

          <div className="gs2-field">
            <label>Message</label>
            <textarea
              className="gs2-textarea"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Describe your issue…"
            />
          </div>

          <div className="gs2-actions">
            <button className="gs2-primary" onClick={sendTicket}>
              Send to admin
            </button>
          </div>

          <h4 className="gs2-mini">Your tickets</h4>
          <ul className="gs2-tickets">
            {tickets.map((t) => (
              <li key={t.id}>
                <span className="id">{t.id}</span>
                <span className="subject">{t.subject}</span>
                <span className={`status ${t.status.toLowerCase()}`}>{t.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
