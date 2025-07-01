import React, { useState } from "react";

// Simple Accordion wrapper
function Accordion({ children, className = "" }) {
  return <div className={`accordion ${className}`}>{children}</div>;
}

// Each Accordion Item
function AccordionItem({ children, className = "" }) {
  return <div className={`accordion-item ${className}`}>{children}</div>;
}

// Trigger to open/close (shows a down arrow)
function AccordionTrigger({ children, onClick, isOpen, className = "" }) {
  return (
    <button
      className={`accordion-trigger ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
      <span style={{ marginLeft: 8, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
        ▼
      </span>
    </button>
  );
}

// Content that is shown/hidden
function AccordionContent({ children, isOpen, className = "" }) {
  if (!isOpen) return null;
  return <div className={`accordion-content ${className}`}>{children}</div>;
}

// Example usage of all together (copy this for your FAQ or other sections)
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

