import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering3.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InformationGathering3({ onSubmit, onBack }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      // Get token from storage
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        setSubmitting(false);
        return;
      }

      // First, verify that areasOfExpertise and cv are saved
      const verifyResponse = await fetch(`${API_URL}/api/teachers/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify your information. Please try again.');
      }

      const verifyData = await verifyResponse.json();
      const teacher = verifyData.data;
      
      const areasOfExpertise = teacher.areasOfExpertise || [];
      const cv = teacher.cv || '';

      // Verify both are present
      if (areasOfExpertise.length === 0) {
        setError('Areas of expertise are missing. Please go back to Step 1.');
        setSubmitting(false);
        return;
      }

      if (cv.trim() === '') {
        setError('CV is missing. Please go back to Step 2.');
        setSubmitting(false);
        return;
      }

      // Mark information gathering as complete
      const completeResponse = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          informationGatheringComplete: true 
        })
      });

      if (!completeResponse.ok) {
        const contentType = completeResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await completeResponse.json();
          throw new Error(errorData.error || 'Failed to mark information gathering as complete.');
        } else {
          throw new Error('Failed to mark information gathering as complete.');
        }
      }

      if (typeof onSubmit === 'function') {
        await onSubmit();
      }

      // Navigate to dashboard
      navigate('/InstructorDash');
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to submit. Please try again.');
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

        {error && (
          <div className="info3-error" role="alert" style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

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
