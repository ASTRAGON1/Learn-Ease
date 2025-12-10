import React from "react";

const icons = {
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  students: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  instructors: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  applications: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  ),
};

const colorClasses = {
  primary: "admin-stat-card-primary",
  blue: "admin-stat-card-blue",
  purple: "admin-stat-card-purple",
  orange: "admin-stat-card-orange",
};

function StatCard({ title, value, hint, icon, color = "primary", onClick }) {
  const IconComponent = icons[icon] || icons.users;
  const colorClass = colorClasses[color] || colorClasses.primary;

  return (
    <div 
      className={`admin-stat-card ${colorClass} ${onClick ? 'admin-stat-card-clickable' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className="admin-stat-card-header">
        <div className="admin-stat-card-icon">
          {IconComponent}
        </div>
        <div className="admin-stat-card-title">{title}</div>
      </div>
      <div className="admin-stat-card-body">
        <div className="admin-stat-card-value">{value}</div>
        {hint && (
          <div className="admin-stat-card-hint">
            {hint}
          </div>
        )}
      </div>
      <div className="admin-stat-card-footer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  );
}

export default StatCard;
