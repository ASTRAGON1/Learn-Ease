import React, { useState, useEffect } from "react";
import "./RankingAndTags.css";


const ProfileAvatar = ({ src, name, className, style, fallbackClassName, fallbackStyle }) => {
  const [error, setError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={style}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName} style={fallbackStyle}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
};

export default function RankingTagsPanel({ instructors, categories, currentUserId }) {
  return (
    <div className="rtp-container">
      {/* LEFT: Instructors Ranking */}
      <div className="rtp-ranking">
        <h3 className="rtp-title">Instructors ranking</h3>
        <div className="rtp-header">
          <span className="rtp-col-name">instructor name</span>
          <span className="rtp-col-likes">Number of likes</span>
          <span className="rtp-col-rank">Ranking</span>
        </div>
        <div className="rtp-list">
          {instructors.map((inst, i) => {
            const pos = i + 1;
            let medal = "";
            if (pos === 1) medal = "🥇";
            else if (pos === 2) medal = "🥈";
            else if (pos === 3) medal = "🥉";

            // Check if this is the current user
            const isCurrentUser = currentUserId && (inst.id?.toString() === currentUserId || inst.id === currentUserId);

            return (
              <div key={inst.id || i} className="rtp-item">
                <div className="rtp-student">
                  <div className="rtp-avatar">
                    <ProfileAvatar
                      src={inst.profilePic}
                      name={inst.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      fallbackStyle={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                  {inst.name} {isCurrentUser && <span style={{ color: '#1a1a1a', fontWeight: '600', marginLeft: '4px' }}>(You)</span>}
                </div>
                <div className="rtp-likes">{inst.likes.toLocaleString()}</div>
                <div className="rtp-rank">
                  #{pos} <span className="rtp-medal">{medal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
