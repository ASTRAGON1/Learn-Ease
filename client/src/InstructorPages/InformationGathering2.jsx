import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InformationGathering2.css';

export default function InformationGathering2({ onNext, onBack }) {
    const navigate = useNavigate();
  return (
    
    <div className="info2-page">
      <div className="info2-content">

        <h1 className="info2-title">Information gathering</h1>

        <div className="info2-section">
          <label htmlFor="professional" className="info2-label">
            Professional information *
          </label>
          <div className="info2-file-input">
            <input
              type="file"
              id="professional"
              onChange={() => {}}
            />
            <span className="info2-file-placeholder">
              Attach here
            </span>
            <span className="info2-file-icon">📎</span>
          </div>
        </div>

        <div className="info2-section">
          <label htmlFor="notes" className="info2-label">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="info2-textarea"
            placeholder="(e.g LinkedIn account, more information …)"
          />
        </div>

        <div className="info2-progress">
          <div className="info2-bar" />
          <div className="info2-bar info2-bar-active" />
          <div className="info2-bar" />
        </div>

        <div className="info2-actions">
          <Link to="/InformationGathering1" className="info2-back" onClick={onBack}>
            ‹ Back
          </Link>
          <Link to="/InformationGathering3" className="info2-next" onClick={onNext}>
            Next
          </Link>
        </div>

      </div>
    </div>
  );
}
