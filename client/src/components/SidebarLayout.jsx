import React from "react";
import { Link } from "react-router-dom";
import "./SidebarLayout.css";
import fullLogo from "../assets/fullLogo.png";
import smallLogo from "../assets/simpleLogo.png";
/* PNG icons from /assets */
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import icProfile from "../assets/Profile.png";

export default function SidebarLayout({
  collapsed = true,
  onToggleCollapsed,
  activeKey = "course",
  onNavigate = () => {},
}) {
  const items = [
    { key: "course",      icon: icCourse,      label: "Course" },
    { key: "performance", icon: icPerformance, label: "Performance" },
    { key: "curriculum",  icon: icCurriculum,  label: "Curriculum" },
    { key: "resources",   icon: icResources,   label: "Resources" },
    { key: "Profile",   icon: icProfile,   label: "Profile" },
  ];

  const handleEnter = () => { if (collapsed) onToggleCollapsed?.(); };
  const handleLeave = () => { if (!collapsed) onToggleCollapsed?.(); };

  return (
    <aside
      className={`sidebar ${collapsed ? "close" : ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="sidebar-inner">
        <div className="brand">
          <img
            className="brand-logo"
            src={collapsed ? smallLogo : fullLogo}
            alt="LearnEase"
          />
        </div>

        <ul className="nav-main">
          {items.map((it) => (
            <li key={it.key} className={activeKey === it.key ? "active" : ""}>
              {it.key === "Profile" ? (
              <Link to="/ProfileSettings" className="nav-link">
                <img className="nav-icon" src={it.icon} alt="" />
                <span className="label">{it.label}</span>
              </Link>
            ) : (
              <button onClick={() => onNavigate(it.key)}>
                <img className="nav-icon" src={it.icon} alt="" />
                <span className="label">{it.label}</span>
              </button>
            )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
