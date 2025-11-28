import React from "react";

function Stars({ value = 0 }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" title={`${value.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rounded ? "on" : "off"}>★</span>
      ))}
    </span>
  );
}

export default Stars;

