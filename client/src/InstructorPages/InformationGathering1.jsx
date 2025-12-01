import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering1.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check token on component mount and verify it's valid
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // Try to verify token by making a test request
      try {
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          setError('Invalid or expired token. Please log in again.');
        } else if (response.status === 404) {
          // Teacher not found - this shouldn't happen if account was just created
          // But don't block the user, they can still proceed
          console.warn('Teacher not found in database, but token is valid');
          // Don't set error - allow user to continue
        } else if (!response.ok) {
          // Other errors - don't block user
          console.log('Token check response:', response.status);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        // Don't show error on mount, just log it
      }
    };

    checkToken();
  }, []);

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

  const handleNext = async () => {
    if (selected.length === 0) {
      setError('Please select at least one area of expertise');
      return;
    }
    if (selected.includes('Others') && !otherText.trim()) {
      setError('Please describe your expertise in the "Others" field');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get token from storage
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Prepare areas of expertise array
      // Replace "Others" with the custom text if provided
      const areasOfExpertise = selected.map(area => 
        area === 'Others' && otherText.trim() ? otherText.trim() : area
      );

      // Save to backend
      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ areasOfExpertise })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text to see what we got
        const text = await response.text();
        console.error('Non-JSON response:', text);
        
        if (response.status === 401) {
          throw new Error('Invalid or expired token. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('User not found. Please contact support.');
        } else {
          throw new Error('Server error. Please try again later.');
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid or expired token. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please log in again.');
        } else {
          throw new Error(data.error || 'Failed to save areas of expertise');
        }
      }

      // Success - proceed to next step
      if (typeof onNext === 'function') {
        onNext({ selected, otherText });
      }
      navigate('/InformationGathering2');
    } catch (err) {
      console.error('Error saving areas of expertise:', err);
      
      // More specific error messages
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to save. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="info1-error" role="alert">
            {error}
          </div>
        )}

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
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
