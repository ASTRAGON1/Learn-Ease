import React, { useState } from "react";
import StatCard from "./StatCard";
import "./DiagnosticTest.css";

// Section titles
const sectionTitles = {
  1: "Section 1: How You Learn",
  2: "Section 2: What You Know",
  3: "Section 3: How You Like to Learn"
};

function DiagnosticTest({ 
  questions, 
  onCreateQuestion, 
  onUpdateQuestion, 
  onDeleteQuestion,
  onToggleStatus
}) {
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionId: '',
    section: 1,
    order: 1,
    question: '',
    options: ['', '', '', ''],
    scoring: {
      autism: {},
      downSyndrome: {}
    },
    correctAnswer: null
  });

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSection = selectedSection === 'all' || q.section === parseInt(selectedSection);
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.questionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Group by section
  const questionsBySection = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.section]) {
      acc[q.section] = [];
    }
    acc[q.section].push(q);
    return acc;
  }, {});

  const handleCreateClick = () => {
    setFormData({
      questionId: `s${Date.now()}`,
      section: 1,
      order: questions.filter(q => q.section === 1).length + 1,
      question: '',
      options: ['', '', '', ''],
      scoring: {
        autism: {},
        downSyndrome: {}
      },
      correctAnswer: null
    });
    setCreateModalOpen(true);
  };

  const handleEditClick = (question) => {
    setCurrentQuestion(question);
    setFormData({
      questionId: question.questionId,
      section: question.section,
      order: question.order,
      question: question.question,
      options: [...question.options],
      scoring: question.scoring || { autism: {}, downSyndrome: {} },
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : null
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (question) => {
    setCurrentQuestion(question);
    setDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await onCreateQuestion(formData);
    setCreateModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await onUpdateQuestion(currentQuestion._id || currentQuestion.id, formData);
    setEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteQuestion(currentQuestion._id || currentQuestion.id);
    setDeleteModalOpen(false);
  };

  const sections = [
    { value: 'all', label: 'All Sections', icon: '📋' },
    { value: '1', label: 'Section 1', icon: '🎓' },
    { value: '2', label: 'Section 2', icon: '📝' },
    { value: '3', label: 'Section 3', icon: '💭' }
  ];

  return (
    <div className="admin-diagnostic-test">
      {/* Welcome Section */}
      <div className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <h1 className="admin-dashboard-title">Diagnostic Test Management</h1>
          <p className="admin-dashboard-subtitle">Manage questions for the initial student assessment</p>
        </div>
        <div className="admin-achievements-actions">
          <button onClick={handleCreateClick} className="admin-btn admin-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Question
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-dashboard-metrics">
        <StatCard 
          title="Total Questions" 
          value={questions.length} 
          icon="list"
          color="primary"
        />
        <StatCard 
          title="Section 1" 
          value={questions.filter(q => q.section === 1).length}
          hint="Learning Preferences"
          icon="book"
          color="blue"
        />
        <StatCard 
          title="Section 2" 
          value={questions.filter(q => q.section === 2).length}
          hint="Knowledge Assessment"
          icon="check"
          color="green"
        />
        <StatCard 
          title="Section 3" 
          value={questions.filter(q => q.section === 3).length}
          hint="App Preferences"
          icon="settings"
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="admin-achievements-filters">
        <div className="admin-achievements-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search questions by text or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-achievements-search-input"
          />
        </div>
        
        <div className="admin-achievements-tabs">
          {sections.map(sec => (
            <button
              key={sec.value}
              onClick={() => setSelectedSection(sec.value)}
              className={`admin-tab ${selectedSection === sec.value ? 'active' : ''}`}
            >
              <span className="admin-tab-icon">{sec.icon}</span>
              <span className="admin-tab-label">{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {Object.keys(questionsBySection).length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">📝</div>
          <h3 className="admin-empty-title">No questions found</h3>
          <p className="admin-empty-subtitle">Create your first diagnostic question to get started</p>
          <button onClick={handleCreateClick} className="admin-btn admin-btn-primary" style={{ marginTop: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create First Question
          </button>
        </div>
      ) : (
        Object.entries(questionsBySection).sort(([a], [b]) => a - b).map(([section, sectionQuestions]) => (
          <div key={section} className="admin-achievements-category">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                <span className="admin-section-icon">{sections.find(s => s.value === section)?.icon}</span>
                {sectionTitles[section]}
                <span className="admin-section-count">({sectionQuestions.length})</span>
              </h2>
            </div>
            
            <div className="admin-diagnostic-questions-list">
              {sectionQuestions.sort((a, b) => a.order - b.order).map(question => (
                <div
                  key={question._id || question.id}
                  className={`admin-diagnostic-question-card ${!question.isActive ? 'inactive' : ''}`}
                >
                  <div className="admin-diagnostic-question-header">
                    <div className="admin-diagnostic-question-id">
                      {question.questionId}
                      <span className="admin-diagnostic-question-order">Order: {question.order}</span>
                    </div>
                    <span className={`admin-badge ${question.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {question.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <h3 className="admin-diagnostic-question-text">{question.question}</h3>
                  
                  <div className="admin-diagnostic-question-options">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="admin-diagnostic-option">
                        <span className="admin-diagnostic-option-label">{String.fromCharCode(65 + idx)}.</span>
                        <span className="admin-diagnostic-option-text">{option}</span>
                        {question.correctAnswer === idx && (
                          <span className="admin-diagnostic-correct-badge">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {(question.scoring?.autism || question.scoring?.downSyndrome) && (
                    <div className="admin-diagnostic-scoring">
                      <div className="admin-diagnostic-scoring-title">Scoring:</div>
                      {Object.keys(question.scoring.autism || {}).length > 0 && (
                        <span className="admin-diagnostic-scoring-tag autism">
                          Autism: {JSON.stringify(question.scoring.autism)}
                        </span>
                      )}
                      {Object.keys(question.scoring.downSyndrome || {}).length > 0 && (
                        <span className="admin-diagnostic-scoring-tag down-syndrome">
                          Down Syndrome: {JSON.stringify(question.scoring.downSyndrome)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="admin-achievement-actions">
                    <button onClick={() => handleEditClick(question)} className="admin-achievement-btn admin-achievement-btn-edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => onToggleStatus(question._id || question.id, !question.isActive)}
                      className={`admin-achievement-btn ${question.isActive ? 'admin-achievement-btn-disable' : 'admin-achievement-btn-enable'}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {question.isActive ? (
                          <>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                          </>
                        ) : (
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        )}
                      </svg>
                      {question.isActive ? "Disable" : "Enable"}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(question)}
                      className="admin-achievement-btn admin-achievement-btn-delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && currentQuestion && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Question</h2>
              <button onClick={() => setDeleteModalOpen(false)} className="admin-modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div className="admin-delete-warning">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Are you sure you want to delete this question?</h3>
                <p className="admin-delete-question-preview">
                  <strong>{currentQuestion.questionId}:</strong> {currentQuestion.question}
                </p>
                <p className="admin-delete-warning-text">
                  This action cannot be undone. The question will be permanently removed from the database.
                </p>
              </div>
              
              <div className="admin-form-actions" style={{ marginTop: '24px' }}>
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="admin-btn admin-btn-danger"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosticTest;
