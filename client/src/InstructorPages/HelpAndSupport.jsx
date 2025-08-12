import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HelpAndSupport.css";
import Footer from "../components/Footer";

const REPORT_TOPICS = [
  "Login or account issues","uploading","Content","Stats or analytics","Navigation",
];
const FEEDBACK_TOPICS = [
  "Instructor experience","Curriculum quality","design & usability","Feature suggestions","General feedback",
];

export default function HelpAndSupport() {
  const [section, setSection] = useState("report");
  const [topic, setTopic] = useState(REPORT_TOPICS[0]);
  const [text, setText] = useState("");
  const MAX = 250;

  const topics = section === "report" ? REPORT_TOPICS : FEEDBACK_TOPICS;

  const switchSection = (s) => {
    setSection(s);
    setTopic((s === "report" ? REPORT_TOPICS : FEEDBACK_TOPICS)[0]);
    setText("");
  };

  const send = () => {
    console.log({ type: section, topic, message: text });
    alert("Thanks! We got your message.");
  };

  return (
    <div className="hs-page">
      <div className="hs-topline">
        <Link to="/InstructorDash" className="hs-back"><span className="chev">‹</span> Dashboard</Link>
      </div>

      <h1 className="hs-title">
        {section === "report" ? "Help and support" : "Feedback and support"}
      </h1>

      <div className="hs-cards">
        <button
          type="button"
          className={`hs-card ${section === "report" ? "active" : ""}`}
          onClick={() => switchSection("report")}
        >
          <div className="hs-emoji">🛠️</div>
          <h3>Report an issue</h3>
          <p>Found a bug or something not working? Let us know so we can fix it as soon as possible.</p>
          <div className="hs-plus">+</div>
        </button>

        <button
          type="button"
          className={`hs-card ${section === "feedback" ? "active" : ""}`}
          onClick={() => switchSection("feedback")}
        >
          <div className="hs-emoji">💬</div>
          <h3>Give a feedback</h3>
          <p>Share your thoughts or suggestions to help us improve your experience.</p>
          <div className="hs-plus">+</div>
        </button>

        <Link to="/getSupport" className="hs-card hs-link">
          <div className="hs-emoji">🤝</div>
          <h3>Get support</h3>
          <p>Need help with something? Contact our support team and we’ll assist you shortly.</p>
          <div className="hs-plus">+</div>
        </Link>
      </div>

      <section className="hs-card form">
        <h2 className="hs-subtitle">
          {section === "report" ? "Report an issue" : "Give a feedback"}
        </h2>

        <div className="hs-field">
          <label>
            {section === "report"
              ? "Select a Topic that you have an issue in"
              : "Select a Topic You Want to Give Feedback On"}
          </label>
          <div className="hs-topics">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={`hs-chip ${topic === t ? "active" : ""}`}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="hs-field">
          <label>Description</label>
          <div className="hs-textarea-wrap">
            <textarea
              maxLength={MAX}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={section === "report" ? "Describe your issue here" : "Describe your feedback here"}
            />
            <span className="hs-counter">{text.length}/{MAX}</span>
          </div>
        </div>

        <div className="hs-actions">
          <button className="hs-send" onClick={send}>Send</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
