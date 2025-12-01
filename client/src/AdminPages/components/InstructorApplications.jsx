import React, { useMemo } from "react";
import Table from "./Table";

function InstructorApplications({ applications, users, search, onDecideApplication, onReopenApplication, onOpenInstructor }) {
  // Filter applications by search
  const filteredApplications = useMemo(() => {
    if (!search) return applications;
    const searchLower = search.toLowerCase();
    return applications.filter((app) =>
      app.name.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.category.toLowerCase().includes(searchLower) ||
      app.description.toLowerCase().includes(searchLower)
    );
  }, [applications, search]);

  const cols = [
    {
      key: "name",
      label: "Name",
      render: (name, row) => {
        // If application is accepted, check if user exists and make name clickable
        if (row.status === "accepted") {
          const user = users.find(u => u.name === name && u.role === "instructor");
          if (user) {
            return (
              <span
                style={{ cursor: "pointer", color: "#0066cc", textDecoration: "underline" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInstructor(user.id);
                }}
                title="Click to view instructor profile"
              >
                {name}
              </span>
            );
          }
        }
        return name;
      },
    },
    { key: "email", label: "Email" },
    { key: "category", label: "Category" },
    { key: "submittedAt", label: "Submitted" },
    { key: "cvUrl", label: "CV", render: (v) => <a href={v} target="_blank" rel="noreferrer">View</a> },
    { key: "description", label: "About" },
    {
      key: "status",
      label: "Status",
      render: (_, row) =>
        row.status === "pending"
          ? <span className="badge purple dot" title="Awaiting review">Pending</span>
          : row.status === "accepted"
          ? <span className="badge green dot">Accepted</span>
          : row.status === "declined"
          ? <span className="badge red dot" title={row.declinedReason || ""}>Declined</span>
          : row.status,
    },
  ];

  return (
    <div className="le-content">
      <div className="section-title">
        <h2>Instructor Applications</h2>
      </div>
      <Table
        columns={[
          ...cols,
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="row">
                {row.status === "pending" && (
                  <>
                    <button className="btn small success" onClick={() => onDecideApplication(row.id, "accept")} type="button">
                      Accept
                    </button>
                    <button className="btn small danger" onClick={() => onDecideApplication(row.id, "decline")} type="button">
                      Decline
                    </button>
                  </>
                )}
                {row.status !== "pending" && (
                  <button
                    className="btn small ghost"
                    onClick={() => onReopenApplication(row.id)}
                    type="button"
                  >
                    Reopen
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={filteredApplications}
      />
    </div>
  );
}

export default InstructorApplications;

