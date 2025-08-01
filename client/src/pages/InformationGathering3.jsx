import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InformationGathering3.css';

export default function InformationGathering3({ onSubmit, onBack }) {
    const navigate = useNavigate();
  return (
    <div className="info3-page">
      <div className="info3-content">

        <h1 className="info3-title">Submit your information</h1>

        <div className="info3-note">
          <strong>Note before submitting:</strong>
          <p>
            Please make sure all your information is accurate before submitting
            your application. Our admin team will review your profile, and you
            will receive an approval notification once verified. We highly
            recommend including a LinkedIn profile to help us confirm your
            identity and professional background.
          </p>
        </div>

        <div className="info3-progress">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`info3-bar${i === 2 ? ' info3-bar-active' : ''}`}
            />
          ))}
        </div>

        <div className="info3-actions">
          <Link to="/InformationGathering2" className="info3-back" onClick={onBack}>
            ‹ Back
          </Link>
          <Link to="/InstructorDash" className="info3-submit" onClick={onSubmit}>
            Submit
          </Link>
        </div>

      </div>
    </div>
  );
}
