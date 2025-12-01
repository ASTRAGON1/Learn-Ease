import React, { useState } from 'react';
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

    // Check file size (max 5MB to avoid issues with base64 encoding)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size is too large. Please upload a file smaller than 5MB.');
      return;
    }

    // Check notes length (bio field has max 1000 characters)
    if (notes.trim().length > 1000) {
      setError('Additional notes cannot exceed 1000 characters.');
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
        setLoading(false);
        return;
      }

      // Store just the filename instead of the full base64 file
      // This is more efficient and avoids MongoDB document size limits
      // The actual file can be uploaded to cloud storage later if needed
      const cvFileName = fileName || 'cv.pdf';

      // Save CV filename and bio (notes) to backend
      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cv: cvFileName, // Store just the filename
          bio: notes.trim() || '' // Store notes in bio field
        })
      });

      // Check if response is JSON before parsing
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

      // Success - proceed to next step
      if (typeof onNext === 'function') {
        onNext({ file, notes });
      }
      navigate('/InformationGathering3');
    } catch (err) {
      console.error('Error saving CV and notes:', err);
      // Show more detailed error message
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
    navigate('/InformationGathering1');
  };

  return (
    <div className="info2-wrap">
      <div className="info2-card">
        <h1 className="info2-title">Information Gathering</h1>
        <p className="info2-subtitle">Upload your professional information and add any additional notes</p>

        {error && (
          <div className="info2-error" role="alert">
            {error}
          </div>
        )}

        <div className="info2-form">
          <div className="info2-field">
            <label htmlFor="professional" className="info2-label">
              Professional information *
              <small>Upload your CV, resume, or professional documents</small>
            </label>
            <div className="info2-file-input">
              <input
                type="file"
                id="professional"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              <span className="info2-file-placeholder">
                {fileName || 'Click to attach file or drag and drop'}
              </span>
              <span className="info2-file-icon">📎</span>
            </div>
            {fileName && (
              <small className="info2-file-name">Selected: {fileName}</small>
            )}
          </div>

          <div className="info2-field">
            <label htmlFor="notes" className="info2-label">
              Additional Notes (Optional)
              <small>e.g., LinkedIn account, more information about your background</small>
            </label>
            <textarea
              id="notes"
              className="info2-textarea"
              placeholder="(e.g LinkedIn account, more information …)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>

          <div className="info2-progress">
            <div className="info2-bar" />
            <div className="info2-bar info2-bar-active" />
            <div className="info2-bar" />
          </div>

          <div className="info2-actions">
            <button
              type="button"
              className="info2-back"
              onClick={handleBack}
            >
              ‹ Back
            </button>
            <button
              type="button"
              className="info2-next"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
