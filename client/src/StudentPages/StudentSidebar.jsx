import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./StudentSidebar.css";

import fullLogo from "../assets/fullLogo.png";
import smallLogo from "../assets/simpleLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";
import icMessages from "../assets/Messages2.svg";
import icProfile from "../assets/Profile.png"; // (optional)

export default function StudentSidebar({
  collapsed = true,
  onToggle,
  activeKey,
}) {
  const { pathname } = useLocation();

  const auto =
    pathname.startsWith("/messages")        ? "messages" :
    pathname.startsWith("/personalized")    ? "personalized" :
    pathname.startsWith("/StudentProfile")  ? "profile" :
    "courses";

  const active = activeKey ?? auto;

  const items = [
    { key: "courses",      label: "Courses",           icon: icCourse,            to: "/courses" },
    { key: "personalized", label: "Personalized Path", icon: icPersonalizedPath,  to: "/personalized" },
    { key: "messages",     label: "Messages",          icon: icMessages,          to: "/messages" },
  ];

  const handleEnter = () => { if (collapsed) onToggle?.(); };
  const handleLeave = () => { if (!collapsed) onToggle?.(); };

  return (
    <aside
      className={`sb2 ${collapsed ? "close" : ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="sb2-inner">
        {/* Logo -> Dashboard */}
        <Link to="/student-dashboard-2" className="sb2-brand" aria-label="Go to dashboard">
          <img
            className="sb2-logo"
            src={collapsed ? smallLogo : fullLogo}
            alt="LearnEase"
          />
        </Link>

        <ul className="sb2-nav">
          {items.map((it) => (
            <li key={it.key} className={active === it.key ? "active" : ""}>
              <Link to={it.to} className="sb2-link">
                <img className="sb2-icon" src={it.icon} alt="" />
                <span className="label">{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
