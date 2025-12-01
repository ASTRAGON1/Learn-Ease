import React, { useMemo } from "react";

function InstructorProfile({ id, users, modLog, onBack, onDeleteUpload }) {
  const u = users.find((x) => x.id === id);
  const inf = u?.instructor || {};
  const uploads = inf.uploads || { videos: [], files: [], quizzes: [] };
  const myLog = useMemo(() => modLog.filter(e => e.userId === id), [modLog, id]);

  if (!u) {
    return (
      <div className="le-content">
        <div className="section-title">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>Instructor not found</h2>
            <button className="btn ghost back-button" onClick={onBack} type="button">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  const uploadsCount = (uploads.videos?.length || 0) + (uploads.files?.length || 0);

  return (
    <div className="le-content">
      <div className="section-title">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>Instructor Profile</h2>
          <button className="btn ghost back-button" onClick={onBack} type="button">← Back</button>
        </div>
      </div>

      {/* Futuristic header like LinkedIn */}
      <div className="card profile-hero">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div className="row" style={{ gap: 16, alignItems: "center" }}>
            {u.profilePic ? (
              <img 
                src={u.profilePic} 
                alt={u.name}
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div className="avatar xl">{u.name.slice(0, 2).toUpperCase()}</div>
            )}
            <div>
              <div className="profile-name">{u.name}</div>
              {u.headline && <div className="sub" style={{ marginTop: 4 }}>{u.headline}</div>}
              <div className="sub" style={{ marginTop: 4 }}>{u.country || u.location || "—"}</div>
            </div>
          </div>

          <div className="metrics">
            <div className="stat">
              <div className="num">{inf.likes || 0}</div>
              <div className="label">Likes</div>
            </div>
            <div className="stat">
              <div className="num">{uploadsCount}</div>
              <div className="label">Uploads</div>
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          {inf.cvUrl && <a className="btn secondary" href={inf.cvUrl} target="_blank" rel="noreferrer">View CV</a>}
        </div>
      </div>

      {/* About */}
      <div className="le-grid-2">
        <div className="card glass">
          <h3>About</h3>
          <p style={{ marginTop: 6 }}>{u.description || "—"}</p>
        </div>

        <div className="card">
          <h3>Quick Facts</h3>
          <ul className="facts">
            <li><b>Joined:</b> {u.joinedAt}</li>
            <li><b>Status:</b> {u.status === "suspended" ? "Suspended" : "Active"}</li>
          </ul>
        </div>
      </div>

      {/* Uploads (with delete + reason) */}
      <div className="le-grid-2">
        <div className="card">
          <h3>Latest Videos</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {(uploads.videos?.length ? uploads.videos : ["—"]).map((v, i) => (
                <tr key={`v-${i}`}>
                  <td>{v}</td>
                  <td>
                    {v !== "—" && (
                      <button
                        className="btn small danger"
                        type="button"
                        onClick={() => {
                          const reason = prompt("Reason for deleting this video?");
                          if (reason === null) return;
                          onDeleteUpload(id, "videos", i, reason);
                        }}
                      >Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Latest Files</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {(uploads.files?.length ? uploads.files : ["—"]).map((f, i) => (
                <tr key={`f-${i}`}>
                  <td>{f}</td>
                  <td>
                    {f !== "—" && (
                      <button
                        className="btn small danger"
                        type="button"
                        onClick={() => {
                          const reason = prompt("Reason for deleting this file?");
                          if (reason === null) return;
                          onDeleteUpload(id, "files", i, reason);
                        }}
                      >Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Deleted Content</h3>
          <table className="table">
            <thead><tr><th>When</th><th>Action</th><th>Reason</th></tr></thead>
            <tbody>
              {myLog.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.at).toLocaleString()}</td>
                  <td>Deleted {e.type.slice(0, -1)}: <b>{e.name}</b></td>
                  <td>{e.reason}</td>
                </tr>
              ))}
              {myLog.length === 0 && (
                <tr><td colSpan={3} className="sub">No deleted content yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InstructorProfile;

