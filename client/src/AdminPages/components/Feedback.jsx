import React, { useMemo } from "react";
import Table from "./Table";

function Feedback({ feedback, users, search, onToggleVisibility, onOpenInstructor }) {
  const cols = [
    { key: "id", label: "ID" },
    {
      key: "topic",
      label: "Topic",
      render: (topic) => {
        if (!topic) return "—";
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
      label: "Name",
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
                {u.name}
              </span>
            );
          }
          return u.name;
        }
        return row.fromRole || "—";
      },
    },
    { key: "description", label: "Description" },
    {
      key: "visible",
      label: "Shown on Landing?",
      render: (v) => (v ? <span className="badge green dot">Shown</span> : <span className="badge">Hidden</span>),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="row">
          {!row.visible ? (
            <button className="btn small secondary" onClick={() => onToggleVisibility(row.id, true)} type="button">
              Show feedback
            </button>
          ) : (
            <button className="btn small ghost" onClick={() => onToggleVisibility(row.id, false)} type="button">
              Hide
            </button>
          )}
        </div>
      ),
    },
  ];

  const rows = useMemo(() => {
    let filtered = [...feedback];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((f) => {
        const u = users.find(x => x.id === f.reporterId);
        return (
          f.id.toLowerCase().includes(searchLower) ||
          (f.topic && f.topic.toLowerCase().includes(searchLower)) ||
          f.description.toLowerCase().includes(searchLower) ||
          (u && u.name.toLowerCase().includes(searchLower))
        );
      });
    }
    
    return filtered.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [feedback, search, users]);

  return (
    <div className="le-content">
      <div className="section-title"><h2>Feedback</h2></div>
      <Table columns={cols} rows={rows} />
    </div>
  );
}

export default Feedback;

