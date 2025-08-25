import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./messages.css";

// demo data (replace with API later)
const topics = {
  1: { title: "3D Place solution" },
  2: { title: "what is the pcb board made of?" },
  3: { title: "will reactjs take over the web development sector?" },
};

const seed = [
  { id: 1, from: "teacher", text: "Hey, did you try the approach from lecture 3?", at: "10:02" },
  { id: 2, from: "student", text: "Yes, but I’m stuck on preprocessing.", at: "10:05" },
  { id: 3, from: "teacher", text: "Share the snippet; I’ll point the fix.", at: "10:06" },
];

export default function MessageThread() {
  const { id } = useParams();
  const topic = topics[id] || { title: "Discussion" };

  const [msgs, setMsgs] = useState(seed);
  const [text, setText] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: Date.now(), from: "student", text: text.trim(), at: "now" }]);
    setText("");
  };

  return (
    <main className="thread">
      {/* Header */}
      <header className="thread-head">
        <div className="thread-title">
          <Link to="/messages" className="back" aria-label="Back">‹</Link>
          <div>
            <h2>{topic.title}</h2>
            <p className="muted">Teacher ↔ Student</p>
          </div>
        </div>
        <button className="btn-primary small">Close</button>
      </header>

      {/* Messages */}
      <section className="chat">
        {msgs.map((m) => (
          <div key={m.id} className={`bubble ${m.from}`}>
            <div className="bubble-text">{m.text}</div>
            <div className="bubble-meta">{m.from === "teacher" ? "Shams" : "You"} · {m.at}</div>
          </div>
        ))}
      </section>

      {/* Composer */}
      <form className="composer" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
        />
        <button className="btn-primary" type="submit">Send</button>
      </form>
    </main>
  );
}
