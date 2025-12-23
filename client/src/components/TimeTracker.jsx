import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TimeTracker() {
    const location = useLocation();
    const intervalRef = useRef(null);

    // Track active state
    const isActiveRef = useRef(document.visibilityState === 'visible');

    useEffect(() => {
        const handleVisibilityChange = () => {
            isActiveRef.current = document.visibilityState === 'visible';
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Only run if user is logged in as student
        // We check this inside the interval or effect?
        // Better to check inside effect to setup/teardown

        const token = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
        const role = window.sessionStorage.getItem('role') || window.localStorage.getItem('role');

        // Simple check: if not student, do nothing
        // Note: This relies on component re-mounting or re-running on route change if these values change? 
        // Usually these are set on login. App.jsx mounts once.
        // However, location changes.

        // Actually, we should check token inside the interval callback so that if user logs out, it stops sending requests
        // Or simpler: The request will fail (401) and we can stop.

        const sendHeartbeat = async () => {
            // Re-read token/role to be sure
            const currentToken = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
            const currentRole = window.sessionStorage.getItem('role') || window.localStorage.getItem('role');

            if (!currentToken || currentRole !== 'student') return;
            // Removed visibility check to allow background pings
            // if (!isActiveRef.current) return; 

            try {
                if (isActiveRef.current) {
                    // Tab active: Track time AND keep online
                    await fetch(`${API_URL}/api/students/track-time`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({ minutes: 1 })
                    });
                } else {
                    // Tab background: Just keep online (Ping)
                    await fetch(`${API_URL}/api/students/auth/activity`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({ ping: true })
                    });
                }
            } catch (err) {
                console.error('Time tracker error:', err);
            }
        };

        // Send heartbeat every 60 seconds (1 minute)
        intervalRef.current = setInterval(sendHeartbeat, 60000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [location]);

    // Send "I'm Online" ping on route change to keep status fresh immediately
    useEffect(() => {
        const pingOnlineStatus = async () => {
            const currentToken = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
            const currentRole = window.sessionStorage.getItem('role') || window.localStorage.getItem('role');

            if (!currentToken || currentRole !== 'student') return;

            try {
                // Use /auth/activity for ping to update online status without adding time
                await fetch(`${API_URL}/api/students/auth/activity`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ ping: true })
                });
            } catch (err) {
                console.error('Online status ping error:', err);
            }
        };

        pingOnlineStatus();
    }, [location]);

    return null; // Render nothing
}
