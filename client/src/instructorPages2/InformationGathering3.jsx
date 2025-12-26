import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering3.css';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getMongoDBToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InformationGathering3({ onSubmit, onBack }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Get MongoDB token using Firebase Auth
      const token = await getMongoDBToken();

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

      // Create application for admin review
      const applicationResponse = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!applicationResponse.ok) {
        // Check if application already exists (409 conflict)
        if (applicationResponse.status === 409) {
          // Application already exists, that's okay - continue
        } else {
          const contentType = applicationResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await applicationResponse.json();
            throw new Error(errorData.error || 'Failed to submit application.');
          } else {
            throw new Error('Failed to submit application.');
          }
        }
      } else {
        // Successfully created application
        const appData = await applicationResponse.json();
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

  // Fetch user info on mount using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (!token) return;

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

            if (teacher.fullName) {
              setFullName(teacher.fullName);
            }

            if (teacher.email) {
              setEmail(teacher.email);
            } else if (firebaseUser.email) {
              setEmail(firebaseUser.email);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
    navigate('/InformationGathering-2');
  };

  return (
    <div className="ig3-wrap">
      <div className="ig3-card">
        <h1 className="ig3-title">Submit Your Information</h1>
        {(fullName || email) && (
          <div className="ig3-user-info">
            {fullName && <div className="ig3-user-name">{fullName}</div>}
            {email && <div className="ig3-user-email">{email}</div>}
          </div>
        )}
        <p className="ig3-subtitle">Review your information before submitting</p>

        {error && (
          <div className="ig3-error" role="alert" style={{
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

        <div className="ig3-progress">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`ig3-bar${i === 2 ? ' ig3-bar-active' : ''}`}
            />
          ))}
        </div>

        <div className="ig3-actions">
          <button
            type="button"
            className="ig3-back"
            onClick={handleBack}
          >
            ‹ Back
          </button>
          <button
            type="button"
            className="ig3-submit"
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
