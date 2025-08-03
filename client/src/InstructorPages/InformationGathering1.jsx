import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InformationGathering1.css';

export default function InformationGathering1({ onNext, onLogout }) {
  const OPTIONS = [
    'students with autism',
    'students with down syndrome',
    'both type of students',
    'video lessons',
    'visual aids/picture based content',
    'interactive exercises',
    'Personalized Learning Adaptation',
    'Personalized Learning Adaptation',
    'Personalized Learning Adaptation',
    'Others',
  ];
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggle = opt => {
    if (selected.includes(opt)) {
      setSelected(s => s.filter(x => x !== opt));
    } else if (selected.length < 4) {
      setSelected(s => [...s, opt]);
    }
  };

  return (
    <div className="info1-page">
      <header className="info1-header">
        <h1 className="info1-title">Information gathering</h1>
        <Link to="/" className="info1-logout" onClick={onLogout}>
            Log out ↗
        </Link>
      </header>

      <h2 className="info1-subtitle">
        Select your area of expertise (max 4)
      </h2>

      <div className="info1-tags">
        {selected.map(t => (
          <span key={t} className="info1-tag">
            {t}
            <button onClick={() => toggle(t)}>×</button>
          </span>
        ))}
      </div>

      <div className="info1-grid">
        {OPTIONS.map(opt => (
          <label key={opt} className="info1-option">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      <div className="info1-progress">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`info1-bar${i === 0 ? ' info1-bar-active' : ''}`}
          />
        ))}
      </div>

      <div className="info1-actions">
        <Link to="/InformationGathering2" className="info1-next" onClick={onNext}>
            Next
        </Link>
      </div>
    </div>
  );
}
