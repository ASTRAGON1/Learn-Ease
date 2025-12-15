import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering1.css';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getMongoDBToken } from '../utils/auth';

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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Check Firebase Auth and fetch user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/all-login');
        return;
      }

      // Get MongoDB token
      const token = await getMongoDBToken();
      if (!token) {
        setError('Failed to authenticate. Please log in again.');
        return;
      }

      // Fetch user info from MongoDB
      try {
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          setError('Invalid or expired token. Please log in again.');
          navigate('/all-login');
          return;
        }

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
      // Get MongoDB token using Firebase Auth
      const token = await getMongoDBToken();

      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        navigate('/all-login');
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
      navigate('/InformationGathering-2');
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

  const confirmLogout = async () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate('/all-login', { replace: true });
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
      <div className="ig1-card">
        <div className="ig1-header">
          <h1 className="ig1-title">Select Your Expertise</h1>
          <button 
            type="button"
            className="ig1-logout" 
            onClick={handleLogout}
          >
            <span>‹</span> Log out
          </button>
        </div>

        {(fullName || email) && (
          <div className="ig1-user-info">
            {fullName && <div className="ig1-user-name">{fullName}</div>}
            {email && <div className="ig1-user-email">{email}</div>}
          </div>
        )}

        <p className="ig1-subtitle">
          Choose your areas of expertise (max 4 selections)
        </p>

        {error && (
          <div className="ig1-error" role="alert">
            {error}
          </div>
        )}

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

        <div className="ig1-grid">
          {OPTIONS.map(opt => {
            const isDisabled = !selected.includes(opt) && selected.length >= 4 && opt !== 'Others';
            return (
              <label 
                key={opt} 
                className="ig1-option"
                onClick={(e) => {
                  // Only handle clicks on the label itself, not the checkbox
                  // The checkbox onChange will handle clicks on the checkbox
                  if (e.target.type === 'checkbox') {
                    return; // Let the checkbox handle it via onChange
                  }
                  // For clicks on label text/area, manually trigger toggle
                  if (!isDisabled) {
                    e.preventDefault();
                    toggle(opt);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  disabled={isDisabled}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        <div className="ig1-progress">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`ig1-bar${i === 0 ? ' ig1-bar-active' : ''}`}
            />
          ))}
        </div>

        <div className="ig1-actions">
          <button
            type="button"
            className="ig1-next"
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
