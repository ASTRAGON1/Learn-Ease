import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering2.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InformationGathering2({ onNext, onBack }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
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

            // Check if areas of expertise exist (required before step 2)
            if (!teacher.areasOfExpertise || teacher.areasOfExpertise.length === 0) {
              navigate('/InformationGathering-1');
              return;
            }

            // Load existing CV and bio if available
            if (teacher.cv) {
              setFileName(teacher.cv);
            }
            if (teacher.bio) {
              setNotes(teacher.bio);
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleNext = async () => {
    if (!file) {
      setError('Please attach your professional information file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size is too large. Please upload a file smaller than 5MB.');
      return;
    }

    if (notes.trim().length > 1000) {
      setError('Additional notes cannot exceed 1000 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const cvFileName = fileName || 'cv.pdf';

      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cv: cvFileName,
          bio: notes.trim() || ''
        })
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
        } else if (response.status === 400) {
          throw new Error(data.error || 'Invalid data. Please check your file and try again.');
        } else if (response.status === 413) {
          throw new Error('File is too large. Please upload a smaller file.');
        } else {
          throw new Error(data.error || `Failed to save CV and notes. (Status: ${response.status})`);
        }
      }

      if (typeof onNext === 'function') {
        onNext({ file, notes });
      }
      navigate('/InformationGathering-3');
    } catch (err) {
      console.error('Error saving CV and notes:', err);
      if (err.message) {
        setError(err.message);
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to save. Please try again. If the problem persists, try uploading a smaller file.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
    navigate('/InformationGathering-1');
  };

  return (
    <div className="ig2-wrap">
      <div className="ig2-container">
        {/* Illustration Section */}
        <div className="ig2-illustration-section">
          <div className="ig2-illustration-content">
            <div className="ig2-illustration-placeholder">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Envelope */}
                <rect x="50" y="70" width="100" height="70" rx="4" fill="#F3EFFF" stroke="#4A0FAD" strokeWidth="4"/>
                <path d="M50 70 L100 105 L150 70" stroke="#4A0FAD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Notification dot */}
                <circle cx="155" cy="65" r="8" fill="#4A0FAD"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="ig2-content-section">
          <div className="ig2-card">
            {/* Progress Indicators */}
            <div className="ig2-progress-dots">
              <div className="ig2-dot"></div>
              <div className="ig2-dot ig2-dot-active"></div>
              <div className="ig2-dot"></div>
            </div>

            {/* Header */}
            <div className="ig2-header">
              <button 
                type="button"
                className="ig2-back-btn"
                onClick={handleBack}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back</span>
              </button>
            </div>

            <h1 className="ig2-title">Upload Your Professional Info</h1>
            <p className="ig2-subtitle">
              Upload your CV, resume, or professional documents and add any additional notes
            </p>

            {error && (
              <div className="ig2-error" role="alert">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="ig2-form">
              <div className="ig2-field">
                <label htmlFor="professional" className="ig2-label">
                  Professional information *
                  <small>Upload your CV, resume, or professional documents</small>
                </label>
                <div className="ig2-file-input">
                  <input
                    type="file"
                    id="professional"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <span className="ig2-file-placeholder">
                    {fileName || 'Click to attach file or drag and drop'}
                  </span>
                  <span className="ig2-file-icon">📎</span>
                </div>
                {fileName && (
                  <small className="ig2-file-name">Selected: {fileName}</small>
                )}
              </div>

              <div className="ig2-field">
                <label htmlFor="notes" className="ig2-label">
                  Additional Notes (Optional)
                  <small>e.g., LinkedIn account, more information about your background</small>
                </label>
                <textarea
                  id="notes"
                  className="ig2-textarea"
                  placeholder="(e.g LinkedIn account, more information …)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="ig2-actions">
              <button
                type="button"
                className="ig2-back-btn-action"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="ig2-next-btn"
                onClick={handleNext}
                disabled={loading || !file}
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

