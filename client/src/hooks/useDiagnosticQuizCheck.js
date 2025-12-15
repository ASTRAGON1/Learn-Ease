import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hook to check if student has completed diagnostic quiz
 * Redirects to diagnostic quiz if not completed
 */
export const useDiagnosticQuizCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkQuizStatus = async () => {
      const token = window.sessionStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/diagnostic-quiz/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.data.completed) {
            // Redirect to diagnostic quiz if not completed
            navigate('/diagnostic-quiz', { replace: true });
          }
        } else if (response.status === 403) {
          // Quiz required - redirect to diagnostic quiz
          navigate('/diagnostic-quiz', { replace: true });
        } else {
          // If status check fails, redirect to diagnostic quiz to be safe
          navigate('/diagnostic-quiz', { replace: true });
        }
      } catch (error) {
        console.error('Error checking diagnostic quiz status:', error);
        // On error, redirect to diagnostic quiz to be safe
        navigate('/diagnostic-quiz', { replace: true });
      }
    };

    checkQuizStatus();
  }, [navigate]);
};
