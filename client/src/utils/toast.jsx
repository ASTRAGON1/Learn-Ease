import React, { useState, useEffect } from 'react';
import '../instructorPages2/Profile2.css';

// Toast Context for global toast management
const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.show && (
        <div className={`pf-toast pf-toast-${toast.type}`}>
          <div className="pf-toast-content">
            {toast.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span className="pf-toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Fallback: create a simple toast hook that works without context
    return {
      showToast: (message, type = "success") => {
        // Create a temporary toast element
        const toastDiv = document.createElement('div');
        toastDiv.className = `pf-toast pf-toast-${type}`;
        toastDiv.innerHTML = `
          <div class="pf-toast-content">
            ${type === "success" 
              ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
              : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
            }
            <span class="pf-toast-message">${message}</span>
          </div>
        `;
        document.body.appendChild(toastDiv);
        setTimeout(() => {
          toastDiv.style.animation = 'slideOutRight 0.3s ease-out';
          setTimeout(() => toastDiv.remove(), 300);
        }, 4000);
      }
    };
  }
  return context;
};

// Simple hook for components that don't use context
export const useSimpleToast = () => {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const ToastComponent = () => {
    if (!toast.show) return null;
    
    return (
      <div className={`pf-toast pf-toast-${toast.type}`}>
        <div className="pf-toast-content">
          {toast.type === "success" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span className="pf-toast-message">{toast.message}</span>
        </div>
      </div>
    );
  };

  return { showToast, ToastComponent };
};

