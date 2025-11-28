import React, { useMemo } from "react";
import Table from "./Table";

function Reports({ reports, users, search, onOpenInstructor }) {
  const cols = [
    { key: "id", label: "ID" },
    {
      key: "topic",
      label: "Topic",
      render: (topic) => {
        const topicLabels = {
          "Login or account issues": "Login or account issues",
          "uploading": "Uploading",
          "Content": "Content",
          "Stats or analytics": "Stats or analytics",
          "Navigation": "Navigation",
        };
        return topicLabels[topic] || topic;
      },
    },
    {
      key: "reporterId",
      label: "From",
      render: (_, row) => {
        const u = users.find(x => x.id === row.reporterId);
        if (u) {
          if (u.role === "instructor") {
            return (
              <span
                style={{ cursor: "pointer", color: "#0066cc", textDecoration: "underline" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInstructor(u.id);
                }}
                title="Click to view instructor profile"
              >
                {u.name} ({u.role})
              </span>
            );
          }
          return `${u.name} (${u.role})`;
        }
        return row.fromRole || "—";
      },
    },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Date" },
  ];

  const rows = useMemo(() => {
    let filtered = [...reports];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((r) => {
        const u = users.find(x => x.id === r.reporterId);
        return (
          r.id.toLowerCase().includes(searchLower) ||
          (r.topic && r.topic.toLowerCase().includes(searchLower)) ||
          r.description.toLowerCase().includes(searchLower) ||
          (u && u.name.toLowerCase().includes(searchLower))
        );
      });
    }
    
    return filtered.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [reports, search, users]);

  return (
    <div className="le-content">
      <div className="section-title"><h2>Reports</h2></div>
      <Table columns={cols} rows={rows} />
    </div>
  );
}

export default Reports;

