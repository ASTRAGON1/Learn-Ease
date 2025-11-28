import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering3.css';

export default function InformationGathering3({ onSubmit, onBack }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit();
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/InstructorDash');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
    navigate('/InformationGathering2');
  };

  return (
    <div className="info3-wrap">
      <div className="info3-card">
        <h1 className="info3-title">Submit Your Information</h1>
        <p className="info3-subtitle">Review your information before submitting</p>

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
          <button
            type="button"
            className="info3-back"
            onClick={handleBack}
          >
            ‹ Back
          </button>
          <button
            type="button"
            className="info3-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
