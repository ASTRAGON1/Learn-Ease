import React from "react";
import "./SidebarLayout.css";
import fullLogo from "../assets/fullLogo.png";
import smallLogo from "../assets/simpleLogo.png";

export default function SidebarLayout({
  collapsed = true,
  onToggleCollapsed,          // should toggle boolean in parent
  activeKey = "course",
  onNavigate = () => {},
}) {
  const items = [
    { key: "course",      icon: "bx bx-laptop",      label: "Course" },
    { key: "performance", icon: "bx bx-line-chart",  label: "Performance" },
    { key: "curriculum",  icon: "bx bx-menu",        label: "Curriculum" },
    { key: "resources",   icon: "bx bx-help-circle", label: "Resources" },
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
              <button onClick={() => onNavigate(it.key)}>
                <i className={it.icon}></i>
                <span className="label">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
