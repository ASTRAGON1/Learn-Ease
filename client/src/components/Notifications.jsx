import React from "react";
import "./Notifications.css";


// map notification types → icons
const iconMap = {
  follow:   "👤",
  bug:      "🐞",
  like:     "👍",
  approve:  "✅",
  visit:    "👁️",
};

function getIcon(type) {
  return iconMap[type] || "🔔";
}

export default function Notifications({ items }) {
  return (
    <div className="notifications-section">
      <h3>Notifications</h3>
      <div className="notifications-list">
        {items.map((n, i) => (
          <div key={i} className="notification-item">
            <div className="notif-icon">
              {getIcon(n.type)}
            </div>
            <div>
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

