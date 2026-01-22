import React, { useState, useEffect } from 'react';
import './ParentNotification.css';

const ParentNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  useEffect(() => {
    // Show notification immediately on first mount (login)
    const timer = setTimeout(() => {
      setShowNotification(true);
      setHasShownInitial(true);
    }, 2000); // Show 2 seconds after login

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only start the interval after initial notification has been shown
    if (!hasShownInitial) return;

    // Show notification every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      setShowNotification(true);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [hasShownInitial]);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <>
      {/* Overlay */}
      <div className="parent-notification-overlay" />
      
      {/* Notification Card */}
      <div className="parent-notification-card">
        <div className="parent-notification-icon">
          👨‍👩‍👧‍👦
        </div>
        
        <div className="parent-notification-content">
          <h3 className="parent-notification-title">
            Parent Supervision Reminder
          </h3>
          <p className="parent-notification-message">
            Dear Parent/Guardian,
            <br /><br />
            Please stay close to your child while they are learning. Your presence 
            and support help create a safe and effective learning environment.
            <br /><br />
            <strong>Your guidance makes a difference! 💙</strong>
          </p>
        </div>

        <button 
          className="parent-notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          Got it!
        </button>
      </div>
    </>
  );
};

export default ParentNotification;
