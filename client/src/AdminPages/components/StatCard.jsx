import React from "react";

function StatCard({ title, value, hint }) {
  return (
    <div className="card kpi">
      <div>
        <h3>{title}</h3>
        <h2>{value}</h2>
        {hint && <div className="sub">{hint}</div>}
      </div>
      <span className="badge">{new Date().toLocaleDateString()}</span>
    </div>
  );
}

export default StatCard;

