import React, { useMemo } from "react";
import RainfallChart from "../../components/RainfallChartAdmin";
import StatCard from "./StatCard";

function Dashboard({ users, profiles, onReinstate, search, onOpenInstructor, applications = [], reports = [], feedbacks = [], onNavigate }) {
  const studentsTotal = useMemo(
    () => (profiles.students || []).reduce((s, p) => s + (p.hours || 0), 0),
    [profiles]
  );
  
  const instructorsTotal = useMemo(
    () =>
      (profiles.instructors || []).reduce(
        (s, i) =>
          s +
          (i.videos?.length || 0) +
          (i.files?.length || 0) +
          (i.quizzes?.length || 0),
        0
      ),
    [profiles]
  );

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalInstructors = users.filter((u) => u.role === "instructor").length;
  
  // Calculate online/offline/suspended by role
  const onlineStudents = users.filter((u) => u.role === "student" && u.online && u.status === "active").length;
  const onlineTeachers = users.filter((u) => u.role === "instructor" && u.online && u.status === "active").length;
  const offlineStudents = users.filter((u) => u.role === "student" && !u.online && u.status === "active").length;
  const offlineTeachers = users.filter((u) => u.role === "instructor" && !u.online && u.status === "active").length;
  const suspendedStudents = users.filter((u) => u.role === "student" && u.status === "suspended").length;
  const suspendedTeachers = users.filter((u) => u.role === "instructor" && u.status === "suspended").length;
  
  // Calculate reports and feedbacks by role
  const reportsByStudent = reports.filter((r) => {
    const user = users.find(u => u.id === r.reporterId);
    return user && user.role === "student";
  }).length;
  const reportsByTeacher = reports.filter((r) => {
    const user = users.find(u => u.id === r.reporterId);
    return user && user.role === "instructor";
  }).length;
  
  const feedbacksByStudent = feedbacks.filter((f) => {
    const user = users.find(u => u.id === f.reporterId);
    return user && user.role === "student";
  }).length;
  const feedbacksByTeacher = feedbacks.filter((f) => {
    const user = users.find(u => u.id === f.reporterId);
    return user && user.role === "instructor";
  }).length;

  const byCat = useMemo(
    () => ({
      autism: users.filter(u => u.role === "student" && u.category === "Autism").length,
      down: users.filter(u => u.role === "student" && u.category === "Down Syndrome").length,
    }),
    [users]
  );

  // Filter users by search
  const filteredOnlineUsers = useMemo(() => {
    let filtered = users.filter((u) => u.online && u.status === "active");
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((u) => 
        u.name.toLowerCase().includes(searchLower) ||
        u.role.toLowerCase().includes(searchLower) ||
        u.category.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [users, search]);

  const filteredSuspendedUsers = useMemo(() => {
    let filtered = users.filter((u) => u.status === "suspended");
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((u) => 
        u.name.toLowerCase().includes(searchLower) ||
        u.role.toLowerCase().includes(searchLower) ||
        u.category.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [users, search]);

  // Calculate additional metrics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === "pending").length;
  const totalReports = reports.length;
  const totalFeedbacks = feedbacks.length;

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <h1 className="admin-dashboard-title">Dashboard Overview</h1>
          <p className="admin-dashboard-subtitle">Monitor and manage your platform at a glance</p>
        </div>
        <div className="admin-dashboard-date">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="admin-dashboard-metrics">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          hint={`${onlineStudents + onlineTeachers} online now`}
          icon="users"
          color="primary"
          onClick={onNavigate ? () => onNavigate("users") : undefined}
        />
        <StatCard 
          title="Students" 
          value={totalStudents}
          hint={`${byCat.autism} Autism / ${byCat.down} Down Syndrome`}
          icon="students"
          color="blue"
          onClick={onNavigate ? () => onNavigate("profiles") : undefined}
        />
        <StatCard 
          title="Instructors" 
          value={totalInstructors}
          hint={`${instructorsTotal} total uploads`}
          icon="instructors"
          color="purple"
          onClick={onNavigate ? () => onNavigate("profiles") : undefined}
        />
        <StatCard 
          title="Applications" 
          value={totalApplications}
          hint={`${pendingApplications} pending review`}
          icon="applications"
          color="orange"
          onClick={onNavigate ? () => onNavigate("applications") : undefined}
        />
      </div>

      {/* Platform Metrics Chart */}
      <div className="admin-dashboard-chart-section">
        <div className="admin-dashboard-chart-header">
          <div>
            <h2 className="admin-dashboard-section-title">Platform Metrics</h2>
            <p className="admin-dashboard-section-subtitle">Comprehensive view of user activity and engagement</p>
          </div>
        </div>
        <div className="admin-dashboard-chart-card">
          <RainfallChart
            onlineStudents={onlineStudents}
            onlineTeachers={onlineTeachers}
            offlineStudents={offlineStudents}
            offlineTeachers={offlineTeachers}
            suspendedStudents={suspendedStudents}
            suspendedTeachers={suspendedTeachers}
            applications={applications.length}
            reportsStudents={reportsByStudent}
            reportsTeachers={reportsByTeacher}
            feedbacksStudents={feedbacksByStudent}
            feedbacksTeachers={feedbacksByTeacher}
          />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="admin-dashboard-quick-stats">
        <div className="admin-dashboard-stat-box">
          <div className="admin-dashboard-stat-icon reports">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div className="admin-dashboard-stat-content">
            <div className="admin-dashboard-stat-value">{totalReports}</div>
            <div className="admin-dashboard-stat-label">Total Reports</div>
            <div className="admin-dashboard-stat-breakdown">
              {reportsByStudent} from students • {reportsByTeacher} from instructors
            </div>
          </div>
        </div>

        <div className="admin-dashboard-stat-box">
          <div className="admin-dashboard-stat-icon feedback">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="admin-dashboard-stat-content">
            <div className="admin-dashboard-stat-value">{totalFeedbacks}</div>
            <div className="admin-dashboard-stat-label">Total Feedbacks</div>
            <div className="admin-dashboard-stat-breakdown">
              {feedbacksByStudent} from students • {feedbacksByTeacher} from instructors
            </div>
          </div>
        </div>

        <div className="admin-dashboard-stat-box">
          <div className="admin-dashboard-stat-icon online">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <div className="admin-dashboard-stat-content">
            <div className="admin-dashboard-stat-value">{onlineStudents + onlineTeachers}</div>
            <div className="admin-dashboard-stat-label">Online Users</div>
            <div className="admin-dashboard-stat-breakdown">
              {onlineStudents} students • {onlineTeachers} instructors
            </div>
          </div>
        </div>

        <div className="admin-dashboard-stat-box">
          <div className="admin-dashboard-stat-icon suspended">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div className="admin-dashboard-stat-content">
            <div className="admin-dashboard-stat-value">{suspendedStudents + suspendedTeachers}</div>
            <div className="admin-dashboard-stat-label">Suspended Users</div>
            <div className="admin-dashboard-stat-breakdown">
              {suspendedStudents} students • {suspendedTeachers} instructors
            </div>
          </div>
        </div>
      </div>

      {/* User Tables Section */}
      <div className="admin-dashboard-tables">
        <div className="admin-dashboard-table-card">
          <div className="admin-dashboard-table-header">
            <div>
              <h3 className="admin-dashboard-table-title">Online Users</h3>
              <p className="admin-dashboard-table-subtitle">Currently active on the platform</p>
            </div>
            <div className="admin-dashboard-table-badge">
              {filteredOnlineUsers.length} {search ? "found" : "total"}
            </div>
          </div>
          <div className="admin-dashboard-table-container">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOnlineUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-dashboard-table-empty">
                      <div className="admin-dashboard-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>No online users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOnlineUsers.map((u) => (
                    <tr 
                      key={u.id}
                      className={u.role === "instructor" ? "admin-dashboard-table-row-clickable" : ""}
                      onClick={u.role === "instructor" ? () => onOpenInstructor(u.id) : undefined}
                      title={u.role === "instructor" ? "Click to view instructor profile" : undefined}
                    >
                      <td>
                        <div className="admin-dashboard-table-name">
                          <div className="admin-dashboard-table-avatar">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-dashboard-table-role">{u.role}</span>
                      </td>
                      <td>
                        <span className="admin-dashboard-table-category">{u.category}</span>
                      </td>
                      <td>
                        <span className="admin-dashboard-badge admin-dashboard-badge-online">
                          <span className="admin-dashboard-badge-dot"></span>
                          Online
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-dashboard-table-card">
          <div className="admin-dashboard-table-header">
            <div>
              <h3 className="admin-dashboard-table-title">Suspended Users</h3>
              <p className="admin-dashboard-table-subtitle">Users currently suspended from the platform</p>
            </div>
            <div className="admin-dashboard-table-badge">
              {filteredSuspendedUsers.length} {search ? "found" : "total"}
            </div>
          </div>
          <div className="admin-dashboard-table-container">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuspendedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-dashboard-table-empty">
                      <div className="admin-dashboard-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <p>No suspended users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSuspendedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-dashboard-table-name">
                          <div className="admin-dashboard-table-avatar admin-dashboard-table-avatar-suspended">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-dashboard-table-role">{u.role}</span>
                      </td>
                      <td>
                        <span className="admin-dashboard-table-category">{u.category}</span>
                      </td>
                      <td>
                        <button
                          className="admin-dashboard-btn admin-dashboard-btn-success admin-dashboard-btn-small"
                          onClick={() => onReinstate(u.id)}
                          type="button"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                          </svg>
                          Reinstate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
