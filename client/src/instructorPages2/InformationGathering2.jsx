import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering2.css';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getMongoDBToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InformationGathering2({ onNext, onBack }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

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
      // Get MongoDB token using Firebase Auth
      const token = await getMongoDBToken();

      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        navigate('/all-login');
        return;
      }

      // Get Firebase user for UID
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError('Firebase authentication required. Please log in again.');
        setLoading(false);
        navigate('/all-login');
        return;
      }

      // Upload CV to Firebase Storage in cv/{userId}/{fileName} path
      const { uploadFile } = await import('../utils/uploadFile');
      let cvUrl = '';
      
      try {
        const uploadResult = await uploadFile(file, 'cv', firebaseUser.uid);
        cvUrl = uploadResult.url;
        console.log('CV uploaded to Firebase Storage:', cvUrl);
      } catch (uploadError) {
        console.error('Error uploading CV to Firebase:', uploadError);
        throw new Error('Failed to upload CV. Please try again.');
      }

      // Save CV URL and bio (notes) to backend
      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cv: cvUrl, // Store the Firebase Storage URL
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
      navigate('/InformationGathering-3');
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
    navigate('/InformationGathering-1');
  };

  return (
    <div className="ig2-wrap">
      <div className="ig2-card">
        <h1 className="ig2-title">Information Gathering</h1>
        {(fullName || email) && (
          <div className="ig2-user-info">
            {fullName && <div className="ig2-user-name">{fullName}</div>}
            {email && <div className="ig2-user-email">{email}</div>}
          </div>
        )}
        <p className="ig2-subtitle">Upload your professional information and add any additional notes</p>

        {error && (
          <div className="ig2-error" role="alert">
            {error}
          </div>
        )}

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

          <div className="ig2-progress">
            <div className="ig2-bar" />
            <div className="ig2-bar ig2-bar-active" />
            <div className="ig2-bar" />
          </div>

          <div className="ig2-actions">
            <button
              type="button"
              className="ig2-back"
              onClick={handleBack}
            >
              ‹ Back
            </button>
            <button
              type="button"
              className="ig2-next"
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
