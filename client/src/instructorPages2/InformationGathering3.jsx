import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering3.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InformationGathering3({ onSubmit, onBack }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check token and information gathering status on component mount
  useEffect(() => {
    const checkTokenAndStatus = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setTimeout(() => navigate('/all-login'), 2000);
        return;
      }

      // Check if information gathering is already complete
      try {
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            const teacher = data.data || data;
            
            // If information gathering is complete, redirect to dashboard
            if (teacher.informationGatheringComplete === true) {
              navigate('/instructor-dashboard-2');
              return;
            }

            // Check if required data exists before step 3
            if (!teacher.areasOfExpertise || teacher.areasOfExpertise.length === 0) {
              navigate('/InformationGathering-1');
              return;
            }
            if (!teacher.cv || teacher.cv.trim() === '') {
              navigate('/InformationGathering-2');
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking information gathering status:', error);
        // Continue anyway - user can still complete the form
      }
    };

    checkTokenAndStatus();
  }, [navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        setSubmitting(false);
        return;
      }

      // Verify that areasOfExpertise and cv are saved
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
      navigate('/instructor-dashboard-2');
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
    navigate('/InformationGathering-2');
  };

  return (
    <div className="ig3-wrap">
      <div className="ig3-container">
        {/* Illustration Section */}
        <div className="ig3-illustration-section">
          <div className="ig3-illustration-content">
            <div className="ig3-illustration-placeholder">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="60" fill="#F3EFFF" stroke="#4A0FAD" strokeWidth="3"/>
                <path d="M80 100 L95 115 L120 85" stroke="#4A0FAD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="150" cy="50" r="20" fill="#4A0FAD" opacity="0.2"/>
                <circle cx="50" cy="150" r="15" fill="#6B2FD4" opacity="0.3"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="ig3-content-section">
          <div className="ig3-card">
            {/* Progress Indicators */}
            <div className="ig3-progress-dots">
              <div className="ig3-dot"></div>
              <div className="ig3-dot"></div>
              <div className="ig3-dot ig3-dot-active"></div>
            </div>

            {/* Header */}
            <div className="ig3-header">
              <button 
                type="button"
                className="ig3-back-btn"
                onClick={handleBack}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back</span>
              </button>
            </div>

            <h1 className="ig3-title">Submit Your Information</h1>
            <p className="ig3-subtitle">
              Review your information before submitting
            </p>

            {error && (
              <div className="ig3-error" role="alert">
                {error}
              </div>
            )}

            {/* Note Section */}
            <div className="ig3-note">
              <strong>Note before submitting:</strong>
              <p>
                Please make sure all your information is accurate before submitting
                your application. Our admin team will review your profile, and you
                will receive an approval notification once verified. We highly
                recommend including a LinkedIn profile to help us confirm your
                identity and professional background.
              </p>
            </div>

            {/* Actions */}
            <div className="ig3-actions">
              <button
                type="button"
                className="ig3-back-btn-action"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="ig3-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

