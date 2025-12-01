import React, { useMemo } from "react";
import RainfallChart from "../../components/RainfallChartAdmin";
import StatCard from "./StatCard";

function Dashboard({ users, profiles, onReinstate, search, onOpenInstructor, applications = [], reports = [], feedbacks = [] }) {
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

  return (
    <div className="le-content">
      <div className="section-title">
        <div>
          <h2>Overview</h2>
          <div className="sub">Quick KPIs across your platform.</div>
        </div>
      </div>
      <div className="le-grid-3">
        <StatCard title="Total Users" value={totalUsers} hint={`${onlineStudents + onlineTeachers} online now`} />
        <StatCard title="Students" value={`${totalStudents} (${byCat.autism} Autism / ${byCat.down} Down)`} />
        <StatCard title="Instructors" value={totalInstructors} />
      </div>
      <div className="card">
        <div className="section-title">
          <h2>Platform Metrics</h2>
        </div>
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
      <div className="le-grid-2">
        <div className="card">
          <h3>Online Users</h3>
          <table className="table">
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
                  <td colSpan={4} className="sub">No online users found</td>
                </tr>
              ) : (
                filteredOnlineUsers.map((u) => (
                  <tr 
                    key={u.id}
                    style={u.role === "instructor" ? { cursor: "pointer" } : {}}
                    onClick={u.role === "instructor" ? () => onOpenInstructor(u.id) : undefined}
                    title={u.role === "instructor" ? "Click to view instructor profile" : undefined}
                  >
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.category}</td>
                    <td>
                      <span className="badge green dot">Online</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Suspended Users</h3>
          <div className="sub" style={{ marginBottom: 8 }}>
            {filteredSuspendedUsers.length} {search ? "found" : "total"}
          </div>

          <table className="table">
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
                  <td colSpan={4} className="sub">No suspended users found</td>
                </tr>
              ) : (
                filteredSuspendedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.category}</td>
                    <td className="action-cell">
                      <button
                        className="btn small success"
                        onClick={() => onReinstate(u.id)}
                        type="button"
                      >
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
  );
}

export default Dashboard;

