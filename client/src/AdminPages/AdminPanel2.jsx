// AdminPanel2.jsx - New Admin Panel using Instructor Dashboard Design
import React from "react";
import "./AdminPanel2.css";

// Hooks
import useAdminPanel from "./hooks/useAdminPanel";

// Components
import AdminLogin2 from "./components/AdminLogin2";
import Dashboard from "./components/Dashboard";
import InstructorApplications from "./components/InstructorApplications";
import Reports from "./components/Reports";
import Feedback from "./components/Feedback";
import Users from "./components/Users";
import LearningPaths from "./components/LearningPaths";
import Profiles from "./components/Profiles";
import InstructorProfile from "./components/InstructorProfile";
import Settings from "./components/Settings";
import AchievementsAndTests from "./components/AchievementsAndTests";

// Icons
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";

export default function AdminPanel2() {
  const { state, actions } = useAdminPanel();

  // Sidebar items
  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      onClick: () => actions.setSection("dashboard")
    },
    {
      key: "applications",
      label: "Applications",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      onClick: () => actions.setSection("applications")
    },
    {
      key: "reports",
      label: "Reports",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      ),
      onClick: () => actions.setSection("reports")
    },
    {
      key: "feedback",
      label: "Feedback",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      onClick: () => actions.setSection("feedback")
    },
    {
      key: "users",
      label: "Users",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      onClick: () => actions.setSection("users")
    },
    {
      key: "learning",
      label: "Learning Paths",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      onClick: () => actions.setSection("learning")
    },
    {
      key: "achievements-tests",
      label: "Achievements & Tests",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      ),
      onClick: () => actions.setSection("achievements-tests")
    },
    {
      key: "profiles",
      label: "Profiles",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      onClick: () => actions.setSection("profiles")
    },
    {
      key: "settings",
      label: "Settings",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
        </svg>
      ),
      onClick: () => actions.setSection("settings")
    },
  ];

  if (!state.isAuthed) {
    return (
      <AdminLogin2
        loginForm={state.loginForm}
        setLoginForm={actions.setLoginForm}
        loginBusy={state.loginBusy}
        loginError={state.loginError}
        onLogin={actions.doLogin}
      />
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar with Hover Animation */}
      <aside
        className={`ld-sidebar-expandable ${state.sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={actions.handleSidebarEnter}
        onMouseLeave={actions.handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          {/* Logo */}
          <div className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={state.sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase Admin"
            />
          </div>

          {/* Navigation Items */}
          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={state.section === item.key ? "active" : ""}>
                <button onClick={item.onClick} className="ld-sidebar-link">
                  <span className="ld-sidebar-icon-wrapper">
                    {item.icon}
                  </span>
                  <span className="ld-sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="ld-sidebar-footer">
            <button
              className="ld-sidebar-link ld-sidebar-logout"
              onClick={actions.handleLogout}
            >
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${state.sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Top Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <h1 className="ld-welcome">
              Admin <span className="ld-brand">Dashboard</span>
            </h1>
          </div>
          <div className="ld-header-center">
            <div className="ld-search-container">
              <input
                className="ld-search-input"
                type="text"
                placeholder={
                  state.section === "users"
                    ? "Users have their own search below"
                    : state.section === "settings" || state.section === "learning" || state.section === "achievements-tests"
                      ? "Search not available in this section"
                      : "Search anything..."
                }
                value={state.section === "users" || state.section === "settings" || state.section === "learning" || state.section === "achievements-tests" ? "" : state.search}
                onChange={(e) => {
                  if (state.section !== "users" && state.section !== "settings" && state.section !== "learning" && state.section !== "achievements-tests") {
                    actions.setSearch(e.target.value);
                  }
                }}
                disabled={state.section === "users" || state.section === "settings" || state.section === "learning" || state.section === "achievements-tests"}
                style={
                  state.section === "users" || state.section === "settings" || state.section === "learning" || state.section === "achievements-tests"
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              />
              <button
                className="ld-search-btn"
                type="button"
                disabled={state.section === "users" || state.section === "settings" || state.section === "learning" || state.section === "achievements-tests"}
                style={
                  state.section === "users" || state.section === "settings" || state.section === "learning" || state.section === "achievements-tests"
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button className="ld-profile-trigger">
                <div className="ld-profile-avatar-wrapper">
                  <div className="ld-profile-avatar">{state.adminName.slice(0, 2).toUpperCase()}</div>
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{state.adminName}</div>
                  <div className="ld-profile-email">Administrator</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ld-content">
          {state.section === "dashboard" && (
            <Dashboard
              users={state.users}
              profiles={state.profiles}
              onReinstate={actions.handleReinstate}
              search={state.search}
              onOpenInstructor={actions.openInstructor}
              applications={state.applications}
              reports={state.reports}
              feedbacks={state.feedback}
              onNavigate={actions.setSection}
            />
          )}
          {state.section === "applications" && (
            <InstructorApplications
              applications={state.applications}
              users={state.users}
              search={state.search}
              onDecideApplication={actions.decideApplication}
              onReopenApplication={actions.onReopenApplication}
              onOpenInstructor={actions.openInstructor}
            />
          )}
          {state.section === "reports" && <Reports reports={state.reports} users={state.users} search={state.search} onOpenInstructor={actions.openInstructor} />}
          {state.section === "feedback" && (
            <Feedback
              feedback={state.feedback}
              users={state.users}
              search={state.search}
              onToggleVisibility={actions.toggleFeedback}
              onOpenInstructor={actions.openInstructor}
            />
          )}
          {state.section === "users" && (
            <Users
              users={state.users}
              search={state.userSearch}
              userFilters={state.userFilters}
              onSearchChange={actions.setUserSearch}
              onFilterChange={actions.setUserFilters}
              onSuspend={actions.handleSuspend}
              onReinstate={actions.handleReinstate}
              onDelete={actions.handleDelete}
            />
          )}
          {state.section === "learning" && (
            <LearningPaths
              learningPaths={state.learningPaths}
              onRenameCourse={actions.handleRenameCourse}
              onRenameTopic={actions.handleRenameTopic}
              onRenameLesson={actions.handleRenameLesson}
              onCreatePath={actions.handleCreatePath}
              onCreateCourse={actions.handleCreateCourse}
              onCreateTopic={actions.handleCreateTopic}
              onCreateLesson={actions.handleCreateLesson}
              onBulkImport={actions.handleBulkImport}
              onDeletePath={actions.handleDeletePath}
              onDeleteCourse={actions.handleDeleteCourse}
              onDeleteTopic={actions.handleDeleteTopic}
              onDeleteLesson={actions.handleDeleteLesson}
            />
          )}
          {state.section === "achievements-tests" && (
            <AchievementsAndTests
              achievements={state.achievements}
              onCreateAchievement={actions.handleCreateAchievement}
              onUpdateAchievement={actions.handleUpdateAchievement}
              onDeleteAchievement={actions.handleDeleteAchievement}
              diagnosticQuestions={state.diagnosticQuestions}
              onCreateQuestion={actions.handleCreateDiagnosticQuestion}
              onUpdateQuestion={actions.handleUpdateDiagnosticQuestion}
              onDeleteQuestion={actions.handleDeleteDiagnosticQuestion}
              onToggleQuestionStatus={actions.handleToggleDiagnosticQuestionStatus}
            />
          )}
          {state.section === "profiles" && (
            <Profiles
              profiles={state.profiles}
              users={state.users}
              search={state.search}
              onOpenInstructor={actions.openInstructor}
              latestUploadFor={actions.latestUploadFor}
            />
          )}
          {state.section === "settings" && <Settings />}
          {state.section === "instructorProfile" && state.selectedInstructorId && (
            <InstructorProfile
              id={state.selectedInstructorId}
              users={state.users}
              modLog={state.modLog}
              onBack={() => actions.setSection("profiles")}
              onDeleteUpload={actions.deleteInstructorUpload}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {state.deleteConfirmModal.show && (
        <div className="admin-modal-overlay" onClick={() => actions.setDeleteConfirmModal({ show: false, userId: null, userName: '', userRole: '' })}>
          <div className="admin-modal-content admin-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-warning">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="admin-modal-title">Delete User Account?</h3>
            <p className="admin-modal-message">
              Are you sure you want to permanently delete <strong>{state.deleteConfirmModal.userName}</strong>'s {state.deleteConfirmModal.userRole === 'instructor' ? 'teacher' : 'student'} account? This action cannot be undone and all data will be lost.
            </p>

            <div className="admin-modal-actions">
              <button
                className="admin-modal-btn admin-modal-btn-secondary"
                onClick={() => actions.setDeleteConfirmModal({ show: false, userId: null, userName: '', userRole: '' })}
              >
                Cancel
              </button>
              <button
                className="admin-modal-btn admin-modal-btn-danger"
                onClick={actions.confirmDelete}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {state.toast.show && (
        <div className={`admin-toast admin-toast-${state.toast.type}`}>
          <div className="admin-toast-content">
            {state.toast.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span className="admin-toast-message">{state.toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
