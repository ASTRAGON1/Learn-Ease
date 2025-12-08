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

            // Load existing areas of expertise if available
            if (teacher.areasOfExpertise && teacher.areasOfExpertise.length > 0) {
              // Map existing expertise to selected state
              const existingSelected = teacher.areasOfExpertise
                .filter(area => OPTIONS.includes(area))
                .slice(0, 4);
              
              const hasOther = teacher.areasOfExpertise.some(area => !OPTIONS.includes(area));
              if (hasOther) {
                const otherArea = teacher.areasOfExpertise.find(area => !OPTIONS.includes(area));
                if (otherArea) {
                  setSelected([...existingSelected, 'Others']);
                  setOtherText(otherArea);
                  setShowOtherInput(true);
                }
              } else {
                setSelected(existingSelected);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking information gathering status:', error);
        // Continue anyway - user can still fill out the form
      }
    };

    checkTokenAndStatus();
  }, [navigate]);

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
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const areasOfExpertise = selected.map(area => 
        area === 'Others' && otherText.trim() ? otherText.trim() : area
      );

      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ areasOfExpertise })
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        
        if (response.status === 401) {
          throw new Error('Invalid or expired token. Please log in again.');
        } else {
          throw new Error('Server error. Please try again later.');
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid or expired token. Please log in again.');
        } else {
          throw new Error(data.error || 'Failed to save areas of expertise');
        }
      }

      if (typeof onNext === 'function') {
        onNext({ selected, otherText });
      }
      navigate('/InformationGathering-2');
    } catch (err) {
      console.error('Error saving areas of expertise:', err);
      
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
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    navigate('/all-signup');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="ig1-wrap">
      {showLogoutConfirm && (
        <div className="ig1-modal-overlay" onClick={cancelLogout}>
          <div className="ig1-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ig1-modal-title">Confirm Logout</h2>
            <p className="ig1-modal-message">
              Your account has already been created. If you log out now, you will need to 
              <strong> log in</strong> when you return, not sign up from the beginning.
            </p>
            <p className="ig1-modal-warning">
              Are you sure you want to log out?
            </p>
            <div className="ig1-modal-actions">
              <button
                type="button"
                className="ig1-modal-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ig1-modal-confirm"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="ig1-container">
        {/* Illustration Section */}
        <div className="ig1-illustration-section">
          <div className="ig1-illustration-content">
            {/* You can add an illustration image here if available */}
            <div className="ig1-illustration-placeholder">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="#F3EFFF" stroke="#4A0FAD" strokeWidth="3"/>
                <path d="M70 100 L90 120 L130 80" stroke="#4A0FAD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="ig1-content-section">
          <div className="ig1-card">
            {/* Progress Indicators */}
            <div className="ig1-progress-dots">
              <div className="ig1-dot ig1-dot-active"></div>
              <div className="ig1-dot"></div>
              <div className="ig1-dot"></div>
            </div>

            {/* Header */}
            <div className="ig1-header">
              <button 
                type="button"
                className="ig1-back-btn"
                onClick={handleLogout}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Log out</span>
              </button>
            </div>

            <h1 className="ig1-title">Select Your Expertise</h1>
            <p className="ig1-subtitle">
              Choose your areas of expertise (max 4 selections)
            </p>

            {error && (
              <div className="ig1-error" role="alert">
                {error}
              </div>
            )}

            {/* Selected Tags */}
            {selected.length > 0 && (
              <div className="ig1-tags">
                {selected.map(t => (
                  <span key={t} className="ig1-tag">
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

            {/* Other Input */}
            {showOtherInput && (
              <div className="ig1-other-input">
                <label htmlFor="other-expertise">Describe your expertise:</label>
                <textarea
                  id="other-expertise"
                  className="ig1-textarea"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Please describe your area of expertise..."
                  rows={3}
                />
              </div>
            )}

            {/* Options Grid */}
            <div className="ig1-grid">
              {OPTIONS.map(opt => (
                <label 
                  key={opt} 
                  className={`ig1-option ${selected.includes(opt) ? 'ig1-option-selected' : ''} ${!selected.includes(opt) && selected.length >= 4 && opt !== 'Others' ? 'ig1-option-disabled' : ''}`}
                >
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

            {/* Actions */}
            <div className="ig1-actions">
              <button
                type="button"
                className="ig1-next-btn"
                onClick={handleNext}
                disabled={loading || selected.length === 0}
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

