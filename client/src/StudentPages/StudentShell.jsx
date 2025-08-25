import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";

export default function StudentShell() {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <div style={{ display: "flex" }}>
      <StudentSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div style={{ width:"100%", paddingLeft: collapsed ? 95 : 370, transition:"padding .25s" }}>
        <Outlet />
      </div>
    </div>
  );
}
