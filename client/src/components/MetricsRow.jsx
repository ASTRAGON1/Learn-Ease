import React from "react";
import "./MetricsRow.css";

export default function MetricsRow({ metrics }) {
  return (
    <div className="perf-metrics-row">
      {metrics.map((m, i) => (
        <div key={i} className="metric-card">
          <span className="metric-label">{m.label}</span>
          <span className="metric-value">{m.value}</span>
          <span className="metric-change">{m.change}</span>
        </div>
      ))}
    </div>
  );
}
