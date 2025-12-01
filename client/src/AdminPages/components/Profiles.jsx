import React, { useMemo } from "react";

function Profiles({ profiles, users, search, onOpenInstructor, latestUploadFor }) {
  // Filter profiles by search
  const filteredStudentProfiles = useMemo(() => {
    let filtered = profiles.students;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((sp) => {
        const u = users.find((x) => x.id === sp.userId);
        return u && u.name.toLowerCase().includes(searchLower);
      });
    }
    return filtered;
  }, [profiles.students, users, search]);

  const filteredInstructorProfiles = useMemo(() => {
    let filtered = profiles.instructors;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((ip) => {
        const u = users.find((x) => x.id === ip.userId);
        return u && u.name.toLowerCase().includes(searchLower);
      });
    }
    return filtered;
  }, [profiles.instructors, users, search]);
  return (
    <div className="le-content">
      <div className="section-title">
        <h2>Profiles</h2>
      </div>
      <div className="le-grid-2">
        <div className="card">
          <h3>Students</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Hours Studied</th>
                <th>Avg Score</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudentProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="sub">No students found</td>
                </tr>
              ) : (
                filteredStudentProfiles.map((sp) => {
                const u = users.find((x) => x.id === sp.userId) || { name: sp.userId };
                return (
                  <tr key={sp.userId}>
                    <td>{u.name}</td>
                    <td>{sp.hours}</td>
                    <td>{sp.performance.avgScore}%</td>
                    <td>{Math.round(sp.performance.completionRate * 100)}%</td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Instructors</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Latest file/video upload</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructorProfiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sub">No instructors found</td>
                </tr>
              ) : (
                filteredInstructorProfiles.map((ip) => {
                const u = users.find((x) => x.id === ip.userId) || { name: ip.userId, category: "—" };
                return (
                  <tr
                    key={ip.userId}
                    className="row-click"
                    onClick={() => onOpenInstructor(ip.userId)}
                    title="Open instructor profile"
                  >
                    <td>{u.name}</td>
                    <td>{latestUploadFor(ip.userId)}</td>
                    <td>{u.category}</td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Profiles;

