import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    'Others',
  ];
  const [selected, setSelected] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggle = opt => {
    if (opt === 'Others') {
      if (selected.includes(opt)) {
        setSelected(s => s.filter(x => x !== opt));
        setShowOtherInput(false);
        setOtherText('');
      } else {
        if (selected.length < 4) {
          setSelected(s => [...s, opt]);
          setShowOtherInput(true);
        }
      }
    } else {
      if (selected.includes(opt)) {
        setSelected(s => s.filter(x => x !== opt));
      } else if (selected.length < 4) {
        setSelected(s => [...s, opt]);
      }
    }
  };

  const handleNext = () => {
    if (selected.length === 0) {
      alert('Please select at least one area of expertise');
      return;
    }
    if (selected.includes('Others') && !otherText.trim()) {
      alert('Please describe your expertise in the "Others" field');
      return;
    }
    if (typeof onNext === 'function') {
      onNext({ selected, otherText });
    }
    navigate('/InformationGathering2');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="info1-wrap">
      {showLogoutConfirm && (
        <div className="info1-modal-overlay" onClick={cancelLogout}>
          <div className="info1-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="info1-modal-title">Confirm Logout</h2>
            <p className="info1-modal-message">
              Your account has already been created. If you log out now, you will need to 
              <strong> log in</strong> when you return, not sign up from the beginning.
            </p>
            <p className="info1-modal-warning">
              Are you sure you want to log out?
            </p>
            <div className="info1-modal-actions">
              <button
                type="button"
                className="info1-modal-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                type="button"
                className="info1-modal-confirm"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="info1-card">
        <div className="info1-header">
          <h1 className="info1-title">Information Gathering</h1>
          <button 
            type="button"
            className="info1-logout" 
            onClick={handleLogout}
          >
            <span>‹</span> Log out
          </button>
        </div>

        <p className="info1-subtitle">
          Select your area of expertise (max 4)
        </p>

        {selected.length > 0 && (
          <div className="info1-tags">
            {selected.map(t => (
              <span key={t} className="info1-tag">
                {t === 'Others' && otherText ? otherText : t}
                <button 
                  type="button"
                  onClick={() => {
                    toggle(t);
                    if (t === 'Others') {
                      setOtherText('');
                    }
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {showOtherInput && (
          <div className="info1-other-input">
            <label htmlFor="other-expertise">Describe your expertise:</label>
            <textarea
              id="other-expertise"
              className="info1-textarea"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Please describe your area of expertise..."
              rows={3}
            />
          </div>
        )}

        <div className="info1-grid">
          {OPTIONS.map(opt => (
            <label key={opt} className="info1-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                disabled={!selected.includes(opt) && selected.length >= 4 && opt !== 'Others'}
              />
              <span>{opt}</span>
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
          <button
            type="button"
            className="info1-next"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
