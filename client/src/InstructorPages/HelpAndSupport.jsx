import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HelpAndSupport.css";

const REPORT_TOPICS = [
  "Login or account issues","uploading","Content","Stats or analytics","Navigation",
];
const FEEDBACK_TOPICS = [
  "Instructor experience","Curriculum quality","design & usability","Feature suggestions","General feedback",
];

export default function HelpAndSupport() {
  const navigate = useNavigate();
  const [section, setSection] = useState("report");
  const [topic, setTopic] = useState(REPORT_TOPICS[0]);
  const [text, setText] = useState("");
  const MAX = 250;

  const handleBack = () => {
    navigate("/InstructorDash");
  };

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
    <div className="sup-page">
      <div className="sup-header-row">
        <button type="button" className="sup-back" onClick={handleBack}>
          <span className="sup-chev">‹</span> Dashboard
        </button>
        <h1 className="sup-title">
          {section === "report" ? "Help and support" : "Feedback and support"}
        </h1>
        <span aria-hidden />
      </div>

      <div className="sup-cards">
        <button
          type="button"
          className={`sup-card ${section === "report" ? "active" : ""}`}
          onClick={() => switchSection("report")}
        >
          <div className="sup-emoji">🛠️</div>
          <h3>Report an issue</h3>
          <p>Found a bug or something not working? Let us know so we can fix it as soon as possible.</p>
          <div className="sup-plus">+</div>
        </button>

        <button
          type="button"
          className={`sup-card ${section === "feedback" ? "active" : ""}`}
          onClick={() => switchSection("feedback")}
        >
          <div className="sup-emoji">💬</div>
          <h3>Give a feedback</h3>
          <p>Share your thoughts or suggestions to help us improve your experience.</p>
          <div className="sup-plus">+</div>
        </button>

        <button
          type="button"
          className="sup-card sup-link"
          onClick={() => navigate("/getSupport")}
        >
          <div className="sup-emoji">🤝</div>
          <h3>Get support</h3>
          <p>Need help with something? Contact our support team and we'll assist you shortly.</p>
          <div className="sup-plus">+</div>
        </button>
      </div>

      <section className="sup-card sup-form">
        <h2 className="sup-subtitle">
          {section === "report" ? "Report an issue" : "Give a feedback"}
        </h2>

        <div className="sup-field">
          <label>
            {section === "report"
              ? "Select a Topic that you have an issue in"
              : "Select a Topic You Want to Give Feedback On"}
          </label>
          <div className="sup-topics">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={`sup-chip ${topic === t ? "active" : ""}`}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="sup-field">
          <label>Description</label>
          <div className="sup-textarea-wrap">
            <textarea
              maxLength={MAX}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={section === "report" ? "Describe your issue here" : "Describe your feedback here"}
            />
            <span className="sup-counter">{text.length}/{MAX}</span>
          </div>
        </div>

        <div className="sup-actions">
          <button className="sup-send" onClick={send}>Send</button>
        </div>
      </section>

    </div>
  );
}
