import React from "react";
import Table from "./Table";

function Users({ users, search, userFilters, onSearchChange, onFilterChange, onSuspend, onReinstate, onDelete }) {
  const cols = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "category", label: "Category" },
    {
      key: "status",
      label: "Status",
      render: (v) =>
        v === "active" ? (
          <span className="badge green dot">Active</span>
        ) : (
          <span className="badge red dot">Suspended</span>
        ),
    },
    {
      key: "online",
      label: "Online",
      render: (v) => (v ? <span className="badge green dot">Online</span> : <span className="badge">Offline</span>),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="row">
          {row.status === "active" && (
            <button className="btn small warn" onClick={() => onSuspend(row.id)} type="button">
              Suspend
            </button>
          )}
          {row.status === "suspended" && (
            <button className="btn small success" onClick={() => onReinstate(row.id)} type="button">
              Reinstate
            </button>
          )}
          <button className="btn small danger" onClick={() => onDelete(row.id)} type="button">
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      (userFilters.role === "all" || u.role === userFilters.role) &&
      (userFilters.status === "all" || u.status === userFilters.status) &&
      (userFilters.category === "all" || u.category === userFilters.category) &&
      (!search || u.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="le-content">
      <div className="section-title">
        <h2>Users</h2>
      </div>
      <div className="row">
        <input
          className="input"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select
          value={userFilters.role}
          onChange={(e) => onFilterChange({ ...userFilters, role: e.target.value })}
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
        </select>
        <select
          value={userFilters.status}
          onChange={(e) => onFilterChange({ ...userFilters, status: e.target.value })}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={userFilters.category}
          onChange={(e) => onFilterChange({ ...userFilters, category: e.target.value })}
        >
          <option value="all">All categories</option>
          <option value="Autism">Autism</option>
          <option value="Down Syndrome">Down Syndrome</option>
        </select>
      </div>
      <Table columns={cols} rows={filteredUsers} />
    </div>
  );
}

export default Users;

