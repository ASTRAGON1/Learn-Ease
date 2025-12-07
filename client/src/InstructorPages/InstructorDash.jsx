import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import CurriculumSection from "../components/CurriculumSection";
import CourseSection from "../components/CourseSection";
import PerformanceSection from "../components/PerformanceSection";
import ResourcesSection from "../components/ResourcesSection";

import "./InstructorDash.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive]     = useState("course");
  const [name, setName] = useState(() => {
    // Get name from storage as initial value and extract first name
    const fullName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || 
                     'Instructor';
    return fullName.split(' ')[0]; // Get first name only
  });

  // Check if information gathering is complete on mount
  useEffect(() => {
    const checkInfoGathering = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('le_instructor_token') || 
                    sessionStorage.getItem('token') || sessionStorage.getItem('le_instructor_token');

      if (!token) {
        navigate('/InstructorLogin');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          navigate('/InstructorLogin');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const teacher = data.data;
          
          // Update name from API response (first name only)
          if (teacher?.fullName) {
            setName(teacher.fullName.split(' ')[0]);
          }
          
          // Check if information gathering is complete
          // First check the completion flag - if true, user has completed it
          const isInfoGatheringComplete = teacher.informationGatheringComplete === true;
          
          if (!isInfoGatheringComplete) {
            // If not marked as complete, check if data exists
            const areasOfExpertise = teacher.areasOfExpertise || [];
            const cv = teacher.cv || '';
            
            // If data is missing, redirect to Step 1
            if (areasOfExpertise.length === 0 || cv.trim() === '') {
              navigate('/InformationGathering1');
            } else {
              // All data exists but not marked complete - automatically mark as complete
              try {
                await fetch(`${API_URL}/api/teachers/me`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ informationGatheringComplete: true })
                });
                // Stay on dashboard - already here
              } catch (error) {
                console.error('Error marking information gathering as complete:', error);
                // Stay on dashboard anyway
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking information gathering status:', error);
        // Don't redirect on error, let user access dashboard
      }
    };

    checkInfoGathering();
  }, [navigate]);

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
    </div>
  );
}
