import React, { useState, useEffect } from "react";
import SidebarLayout from "../components/SidebarLayout";
import Footer from "../components/Footer";
import CurriculumSection from "../components/CurriculumSection";
import CourseSection from "../components/CourseSection";
import PerformanceSection from "../components/PerformanceSection";
import ResourcesSection from "../components/ResourcesSection";

import "./InstructorDash.css";

export default function InstructorDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive]     = useState("course");
  const name = "Adolf";

  const sampleMetrics = [
    { label: "Content views",  value: "2,315", change: "+11.01%" },
    { label: "Likes given", value: "1,032", change: "+1.01%" },
    { label: "Favorites given",      value: "300",   change: "+15.01%" },
    { label: "Engagement",     value: "600",   change: "-12.01%" },
  ];
  const sampleNotifs = [
    { type: "follow",   text: "New student followed you",        time: "59 minutes ago" },
    { type: "bug",      text: "Bug fixed",                       time: "59 minutes ago" },
    { type: "like",     text: "New student liked your video",    time: "59 minutes ago" },
    { type: "approve",  text: "Admin approved your content",     time: "59 minutes ago" },
    { type: "visit",    text: "1,000 students visited your page", time: "59 minutes ago" },
    { type: "follow",   text: "New student followed you",        time: "59 minutes ago" },
    { type: "bug",      text: "Bug fixed",                       time: "59 minutes ago" },
    { type: "like",     text: "New student liked your video",    time: "59 minutes ago" },
    { type: "approve",  text: "Admin approved your content",     time: "59 minutes ago" },
    { type: "visit",    text: "1,000 students visited your page", time: "59 minutes ago" },
  ];

  const instructors = [
    { id:1, name:"Alice", likes:2500 },
    { id:2, name:"Bob",   likes:2400 },
    { id:3, name:"Carol", likes:2300 },
    { id:4, name:"Dave",  likes:2200 },
    { id:5, name:"Eve",   likes:2100 },
    { id:6, name:"Frank", likes:2000 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
  ];
  const categories = [
    { tag:"Listening", pct:100 },
    { tag:"Reading",   pct:60  },
    { tag:"Writing",   pct:80  },
    { tag:"Recognizing",pct:0 },
    { tag:"Memorizing", pct:50 },
  ];


  return (
    <div className="dash-root">
      <SidebarLayout
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        activeKey={active}
        onNavigate={setActive}
      />

      <main className={`dash-home ${active === "curriculum" ? "is-curriculum" : ""}`}>
        {active === "course" && <CourseSection name={name} />}
        {active === "performance" && (
          <PerformanceSection 
            collapsed={collapsed}
            sampleMetrics={sampleMetrics}
            sampleNotifs={sampleNotifs}
            instructors={instructors}
            categories={categories}
          />
        )}
        {active === "curriculum" && (
          <div
            className="curriculum-wrap"
            style={{ marginLeft: collapsed ? 44 : 320 }}
          >
            <CurriculumSection />
          </div>
        )}
        {active === "resources" && <ResourcesSection />}
      </main>

      <Footer />
    </div>
  );
}
