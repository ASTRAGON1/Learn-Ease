import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationGathering2.css';

export default function InformationGathering2({ onNext, onBack }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleNext = () => {
    if (!file) {
      alert('Please attach your professional information file');
      return;
    }
    if (typeof onNext === 'function') {
      onNext({ file, notes });
    }
    navigate('/InformationGathering3');
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
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
