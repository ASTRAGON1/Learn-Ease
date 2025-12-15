import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiagnosticQuiz.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DiagnosticQuiz() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState({
    section1: [],
    section2: [],
    section3: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/api/diagnostic-quiz/generate`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.data);
        // Initialize answers arrays
        setAnswers({
          section1: new Array(data.data.section1.length).fill(null),
          section2: new Array(data.data.section2.length).fill(null),
          section3: new Array(data.data.section3.length).fill(null)
        });
      } else {
        setError('Failed to load quiz. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Failed to load quiz. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (section, questionIndex, answerIndex) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[section][questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const canProceed = (section) => {
    const sectionAnswers = answers[section];
    return sectionAnswers.every(answer => answer !== null);
  };

  const handleNext = () => {
    if (currentSection < 3) {
      if (canProceed(`section${currentSection}`)) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('Please answer all questions before continuing.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed('section3')) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = window.sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/diagnostic-quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section1: answers.section1,
          section2: answers.section2,
          section3: answers.section3
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to dashboard with success message
        navigate('/student-dashboard-2', { 
          state: { 
            diagnosticComplete: true,
            studentType: data.data.studentType,
            message: data.data.message
          } 
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit quiz. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dq-page">
        <div className="dq-loading">
          <div className="dq-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="dq-page">
        <div className="dq-error">
          <p>{error || 'Failed to load quiz. Please try again later.'}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  const getCurrentSectionData = () => {
    if (currentSection === 1) return quiz.section1;
    if (currentSection === 2) return quiz.section2;
    return quiz.section3;
  };

  const getCurrentSectionAnswers = () => {
    if (currentSection === 1) return answers.section1;
    if (currentSection === 2) return answers.section2;
    return answers.section3;
  };

  const getSectionTitle = () => {
    if (currentSection === 1) return 'Section 1: How You Learn';
    if (currentSection === 2) return 'Section 2: What You Know';
    return 'Section 3: How You Like to Learn';
  };

  const getSectionDescription = () => {
    if (currentSection === 1) return 'Tell us how you prefer to learn. There are no right or wrong answers.';
    if (currentSection === 2) return 'Answer these questions to show what you know. Do your best!';
    return 'Tell us how you want the app to work with you.';
  };

  const currentQuestions = getCurrentSectionData();
  const currentAnswers = getCurrentSectionAnswers();
  const progress = ((currentSection - 1) * 33.33) + (currentAnswers.filter(a => a !== null).length / currentQuestions.length * 33.33);

  return (
    <div className="dq-page">
      <div className="dq-container">
        <div className="dq-header">
          <h1 className="dq-title">Welcome to LearnEase!</h1>
          <p className="dq-subtitle">Let's get to know you better. This quiz helps us create your personalized learning path.</p>
        </div>

        <div className="dq-progress-container">
          <div className="dq-progress-bar">
            <div className="dq-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="dq-progress-text">
            Section {currentSection} of 3
          </div>
        </div>

        <div className="dq-section-header">
          <h2 className="dq-section-title">{getSectionTitle()}</h2>
          <p className="dq-section-description">{getSectionDescription()}</p>
        </div>

        {error && (
          <div className="dq-error-message">
            {error}
          </div>
        )}

        <div className="dq-questions">
          {currentQuestions.map((question, qIndex) => (
            <div key={question.id} className="dq-question-card">
              <div className="dq-question-number">Question {qIndex + 1} of {currentQuestions.length}</div>
              <h3 className="dq-question-text">{question.question}</h3>
              <div className="dq-options">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`dq-option ${currentAnswers[qIndex] === oIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`section${currentSection}-q${qIndex}`}
                      value={oIndex}
                      checked={currentAnswers[qIndex] === oIndex}
                      onChange={() => handleAnswer(`section${currentSection}`, qIndex, oIndex)}
                    />
                    <span className="dq-option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="dq-navigation">
          <button
            className="dq-btn dq-btn-secondary"
            onClick={handlePrevious}
            disabled={currentSection === 1}
          >
            Previous
          </button>
          
          {currentSection < 3 ? (
            <button
              className="dq-btn dq-btn-primary"
              onClick={handleNext}
              disabled={!canProceed(`section${currentSection}`)}
            >
              Next Section
            </button>
          ) : (
            <button
              className="dq-btn dq-btn-primary"
              onClick={handleSubmit}
              disabled={!canProceed('section3') || submitting}
            >
              {submitting ? 'Submitting...' : 'Finish Quiz'}
            </button>
          )}
        </div>

        <div className="dq-info">
          <p>💡 Take your time. There is no time limit.</p>
          <p>💡 Answer honestly. This helps us help you better.</p>
        </div>
      </div>
    </div>
  );
}

