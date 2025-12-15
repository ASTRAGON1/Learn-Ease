import React, { useState } from "react";
import Achievements from "./Achievements";
import DiagnosticTest from "./DiagnosticTest";
import "./AchievementsAndTests.css";

function AchievementsAndTests({ 
  // Achievements props
  achievements,
  onCreateAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  // Diagnostic Test props
  diagnosticQuestions,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onToggleQuestionStatus
}) {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="admin-achievements-tests-container">
      {/* Tab Navigation */}
      <div className="admin-at-tabs">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`admin-at-tab ${activeTab === 'achievements' ? 'active' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <span>Achievements</span>
          <span className="admin-at-tab-badge">{achievements.length}</span>
        </button>
        
        <button
          onClick={() => setActiveTab('diagnostic-test')}
          className={`admin-at-tab ${activeTab === 'diagnostic-test' ? 'active' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Diagnostic Test</span>
          <span className="admin-at-tab-badge">{diagnosticQuestions.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-at-content">
        {activeTab === 'achievements' && (
          <Achievements
            achievements={achievements}
            onCreateAchievement={onCreateAchievement}
            onUpdateAchievement={onUpdateAchievement}
            onDeleteAchievement={onDeleteAchievement}
          />
        )}
        
        {activeTab === 'diagnostic-test' && (
          <DiagnosticTest
            questions={diagnosticQuestions}
            onCreateQuestion={onCreateQuestion}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onToggleStatus={onToggleQuestionStatus}
          />
        )}
      </div>
    </div>
  );
}

export default AchievementsAndTests;
