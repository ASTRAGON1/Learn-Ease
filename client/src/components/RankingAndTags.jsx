import React from "react";
import "./RankingAndTags.css";

export default function RankingTagsPanel({ instructors, categories }) {
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

            return (
              <div key={inst.id || i} className="rtp-item">
                <div className="rtp-student">
                  <div className="rtp-avatar" />
                  {inst.name}
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
