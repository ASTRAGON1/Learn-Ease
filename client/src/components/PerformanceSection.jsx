import React from "react";
import { Link } from "react-router-dom";
import Notifications from "./Notifications";
import RainfallChart from "./RainfallChart";
import QuizResults from "./QuizResults";
import RankingAndTags from "./RankingAndTags";
import "../InstructorPages/InstructorDash.css";

export default function PerformanceSection({ collapsed, sampleMetrics, sampleNotifs, instructors, categories }) {
  return (
    <div
      className="perf-container"
      style={{ marginLeft: collapsed ? 0 : 0, paddingTop: 60 }}
    >
      <div className="perf-header">
        <Link to="/InstructorDash" className="dahsboard-back">‹ Dashboard</Link>
      </div>

      <div className="perf-metrics-row">
        {sampleMetrics.map((m, i) => (
          <div key={i} className="metric-card">
            <span className="metric-label">{m.label}</span>
            <span className="metric-value">{m.value}</span>
            <span className="metric-change">{m.change}</span>
          </div>
        ))}
      </div>

      <div className="perf-main-row">
        <div className="perf-graph-section">
          <div className="graph-card">
            <RainfallChart tickPlacement="middle" tickLabelPlacement="middle" />
          </div>
        </div>
        <Notifications items={sampleNotifs} />
      </div>

      <QuizResults />
      <RankingAndTags instructors={instructors} categories={categories} />

      <div className="improve-section">
        <h2 className="title-improvement">Improve yourself to get better results!</h2>
        <Link to="/teachingCenter" className="improve-btn">Teaching center</Link>
      </div>
    </div>
  );
}

