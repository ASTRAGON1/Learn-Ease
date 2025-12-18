import React from "react";

const UserAvatar = ({ user }) => {
  const [imgError, setImgError] = React.useState(false);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (user.avatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="admin-users-avatar"
        style={{ objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="admin-users-avatar fallback">
      {getInitials(user.name)}
    </div>
  );
};

function Users({ users, search, userFilters, onSearchChange, onFilterChange, onSuspend, onReinstate, onDelete }) {
  const filteredUsers = users.filter(
    (u) =>
      (userFilters.role === "all" || u.role === userFilters.role) &&
      (userFilters.status === "all" || u.status === userFilters.status) &&
      (!search || u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const suspendedUsers = users.filter(u => u.status === "suspended").length;
  const onlineUsers = users.filter(u => u.online).length;

  return (
    <div className="admin-users">
      {/* Header Section */}
      <div className="admin-users-header">
        <div className="admin-users-header-content">
          <h1 className="admin-users-title">Users</h1>
          <p className="admin-users-subtitle">Manage all platform users and their access</p>
        </div>
        <div className="admin-users-stats">
          <div className="admin-users-stat-item">
            <div className="admin-users-stat-value">{totalUsers}</div>
            <div className="admin-users-stat-label">Total Users</div>
          </div>
          <div className="admin-users-stat-item">
            <div className="admin-users-stat-value">{activeUsers}</div>
            <div className="admin-users-stat-label">Active</div>
          </div>
          <div className="admin-users-stat-item">
            <div className="admin-users-stat-value">{onlineUsers}</div>
            <div className="admin-users-stat-label">Online</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="admin-users-filters">
        <div className="admin-users-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="admin-users-search-input"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="admin-users-filter-group">
          <select
            className="admin-users-filter-select"
            value={userFilters.role}
            onChange={(e) => onFilterChange({ ...userFilters, role: e.target.value })}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
          </select>
          <select
            className="admin-users-filter-select"
            value={userFilters.status}
            onChange={(e) => onFilterChange({ ...userFilters, status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="admin-users-card">
        <div className="admin-users-table-header">
          <h3 className="admin-users-table-title">All Users</h3>
          <div className="admin-users-table-badge">
            {filteredUsers.length} {search || userFilters.role !== "all" || userFilters.status !== "all" ? "found" : "total"}
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <div className="admin-users-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <p className="admin-users-empty-text">
              {search || userFilters.role !== "all" || userFilters.status !== "all"
                ? "No users found matching your filters"
                : "No users yet"}
            </p>
            {(search || userFilters.role !== "all" || userFilters.status !== "all") && (
              <p className="admin-users-empty-hint">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="admin-users-table-container">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Online</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-users-name">
                        <UserAvatar user={user} />
                        <span className="admin-users-name-text">{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-users-role-badge">
                        {user.role === "instructor" ? "Instructor" : "Student"}
                      </span>
                    </td>
                    <td>
                      {user.status === "active" ? (
                        <span className="admin-users-status-badge admin-users-status-active">
                          <span className="admin-users-status-dot"></span>
                          Active
                        </span>
                      ) : user.status === "pending" ? (
                        <span className="admin-users-status-badge admin-users-status-pending">
                          <span className="admin-users-status-dot"></span>
                          Pending
                        </span>
                      ) : (
                        <span className="admin-users-status-badge admin-users-status-suspended">
                          <span className="admin-users-status-dot"></span>
                          Suspended
                        </span>
                      )}
                    </td>
                    <td>
                      {user.online ? (
                        <span className="admin-users-online-badge admin-users-online-yes">
                          <span className="admin-users-online-dot"></span>
                          Online
                        </span>
                      ) : (
                        <span className="admin-users-online-badge admin-users-online-no">
                          Offline
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="admin-users-actions">
                        {user.status === "pending" ? (
                          <span className="admin-users-pending-note" title="Accept or decline this user in the Applications section first">
                            Pending Approval
                          </span>
                        ) : user.status === "active" ? (
                          <button
                            className="admin-users-btn admin-users-btn-warn"
                            onClick={() => onSuspend(user.id)}
                            type="button"
                            title="Suspend user"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Suspend
                          </button>
                        ) : (
                          <button
                            className="admin-users-btn admin-users-btn-success"
                            onClick={() => onReinstate(user.id)}
                            type="button"
                            title="Reinstate user"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                              <path d="M21 3v5h-5"></path>
                              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                              <path d="M3 21v-5h5"></path>
                            </svg>
                            Reinstate
                          </button>
                        )}
                        <button
                          className="admin-users-btn admin-users-btn-danger"
                          onClick={() => onDelete(user.id)}
                          type="button"
                          title="Delete user"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
