import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, reload, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import './InstructorSignUp2.css';

const API_URL = import.meta.env. VITE_API_URL || 'http://localhost:5000';

// Helper function to store auth data in both localStorage and sessionStorage
const storeAuthData = (token, teacher) => {
  const authData = {
    'token': token,
    'le_instructor_token': token,
    'role': 'teacher',
    'userId': teacher.id,
    'le_instructor_id': teacher.id,
    'userName': teacher. fullName || 'Instructor',
    'le_instructor_name': teacher.fullName || 'Instructor',
    'userEmail': teacher. email
  };

  // Store in both localStorage and sessionStorage for consistency
  Object.entries(authData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  });
};

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Get email from sessionStorage
    const signupEmail = sessionStorage.getItem('instructorSignupEmail');
    if (! signupEmail) {
      navigate('/InstructorSignUp1');
      return;
    }
    setEmail(signupEmail);

    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email === signupEmail) {
        // Reload user to get latest emailVerified status
        await reload(user);
        if (user.emailVerified) {
          setIsVerified(true);
          setChecking(false);
          
          // Automatically log in to get JWT token using the same flow as regular login
          try {
            const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: user.email, 
                firebaseUID: user. uid 
              }),
            });

            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
            } else {
              const text = await response.text();
              console.error('Non-JSON response during auto-login:', text);
              setGeneralError('Failed to authenticate.  Please try logging in manually.');
              return;
            }

            if (! response.ok) {
              console.error('Auto-login failed:', data. error);
              setGeneralError(data.error || 'Failed to authenticate.  Please try logging in manually.');
              return;
            }

            if (data.data && data.data.token) {
              // Store authentication data in BOTH localStorage and sessionStorage
              storeAuthData(data.data.token, data. data.teacher);

              // Check if information gathering is complete - same logic as regular login
              const isInfoGatheringComplete = data.data.teacher.informationGatheringComplete === true;
              
              // Navigate based on information gathering status
              setTimeout(async () => {
                if (isInfoGatheringComplete) {
                  navigate('/InstructorDash');
                } else {
                  const areasOfExpertise = data.data.teacher.areasOfExpertise || [];
                  const cv = data.data. teacher.cv || '';
                  
                  if (areasOfExpertise.length === 0 || cv.trim() === '') {
                    navigate('/InformationGathering1');
                  } else {
                    try {
                      await fetch(`${API_URL}/api/teachers/me`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${data.data. token}`
                        },
                        body: JSON.stringify({ informationGatheringComplete: true })
                      });
                      navigate('/InstructorDash');
                    } catch (error) {
                      console.error('Error marking information gathering as complete:', error);
                      navigate('/InstructorDash');
                    }
                  }
                }
              }, 1500);
            } else {
              setGeneralError('Failed to get authentication token. Please try logging in manually.');
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            setGeneralError('Network error during authentication. Please try logging in manually.');
          }
        } else {
          setChecking(false);
        }
      } else {
        setChecking(false);
        setGeneralError('Please complete the signup process first.');
      }
    });

    // Check verification status periodically
    const checkInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === signupEmail) {
        await reload(currentUser);
        if (currentUser.emailVerified) {
          setIsVerified(true);
          clearInterval(checkInterval);
          
          // Automatically log in to get JWT token using the same flow as regular login
          try {
            const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: currentUser.email, 
                firebaseUID: currentUser.uid 
              }),
            });

            const contentType = response. headers.get('content-type');
            let data;
            
            if (contentType && contentType. includes('application/json')) {
              data = await response.json();
            } else {
              const text = await response.text();
              console. error('Non-JSON response during auto-login:', text);
              return;
            }

            if (!response. ok) {
              console.error('Auto-login failed:', data.error);
              return;
            }

            if (data.data && data. data.token) {
              // Store authentication data in BOTH localStorage and sessionStorage
              storeAuthData(data.data.token, data.data. teacher);

              // Check if information gathering is complete
              const isInfoGatheringComplete = data.data.teacher. informationGatheringComplete === true;
              
              if (isInfoGatheringComplete) {
                navigate('/InstructorDash');
              } else {
                const areasOfExpertise = data.data.teacher. areasOfExpertise || [];
                const cv = data. data.teacher.cv || '';
                
                if (areasOfExpertise. length === 0 || cv.trim() === '') {
                  navigate('/InformationGathering1');
                } else {
                  try {
                    await fetch(`${API_URL}/api/teachers/me`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data. data.token}`
                      },
                      body: JSON. stringify({ informationGatheringComplete: true })
                    });
                    navigate('/InstructorDash');
                  } catch (error) {
                    console. error('Error marking information gathering as complete:', error);
                    navigate('/InstructorDash');
                  }
                }
              }
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
          }
        }
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [navigate]);

  const handleResendVerification = async () => {
    setLoading(true);
    setGeneralError('');
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: window.location.origin + '/InstructorSignUp2',
          handleCodeInApp: false
        });
        setGeneralError('Verification email sent!  Please check your inbox (and spam folder).');
        console.log('Verification email resent successfully');
      } else {
        setGeneralError('Please complete the signup process first.');
      }
    } catch (error) {
      console. error('Resend error:', error);
      if (error.code === 'auth/too-many-requests') {
        setGeneralError('Too many requests. Please wait a few minutes before requesting another email.');
      } else {
        setGeneralError(`Failed to resend verification email: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="signupInst2-wrap">
        <div className="signupInst2-card">
          <h1 className="signupInst2-title">Checking Verification... </h1>
          <p className="signupInst2-subtitle">Please wait while we verify your email. </p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="signupInst2-wrap">
        <div className="signupInst2-card">
          <h1 className="signupInst2-title">Email Verified!</h1>
          <p className="signupInst2-subtitle">Your email has been verified.  Redirecting... </p>
        </div>
      </div>
    );
  }

  return (
    <div className="signupInst2-wrap">
      <div className="signupInst2-card">
        <Link to="/InstructorSignUp1" className="signupInst2-back">
          ‹ Go Back
        </Link>

        <h1 className="signupInst2-title">Confirm Your Email</h1>
        <p className="signupInst2-subtitle">
          We've sent a verification link to <strong>{email}</strong>. Please click the link in the email to verify your account.
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
          💡 <strong>Tip:</strong> Check your spam/junk folder if you don't see the email.
        </p>

        {generalError && (
          <div className={`signupInst2-alert ${generalError.includes('sent') ? 'signupInst2-alert-success' : ''}`} role="alert">
            {generalError}
          </div>
        )}

        <div className="signupInst2-form">
          <div className="signupInst2-info-box">
            <p>After clicking the verification link in your email, this page will automatically update. </p>
          </div>

          <button
            className="signupInst2-btn"
            onClick={handleResendVerification}
            disabled={loading}
            type="button"
          >
            {loading ? 'Sending…' : 'Resend Verification Email'}
          </button>

          <p className="signupInst2-resend">
            Already verified? {' '}
            <button
              type="button"
              className="signupInst2-link"
              onClick={async () => {
                const user = auth. currentUser;
                if (user) {
                  await reload(user);
                  if (user.emailVerified) {
                    // Automatically log in using the same flow as regular login
                    try {
                      const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          email: user.email, 
                          firebaseUID: user.uid 
                        }),
                      });

                      const contentType = response. headers.get('content-type');
                      let data;
                      
                      if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                      } else {
                        const text = await response. text();
                        console.error('Non-JSON response during auto-login:', text);
                        setGeneralError('Failed to authenticate. Please try again.');
                        return;
                      }

                      if (! response.ok) {
                        console. error('Auto-login failed:', data.error);
                        setGeneralError(data.error || 'Failed to authenticate. Please try again.');
                        return;
                      }

                      if (data.data && data.data. token) {
                        // Store authentication data in BOTH localStorage and sessionStorage
                        storeAuthData(data.data.token, data.data. teacher);

                        // Check if information gathering is complete
                        const isInfoGatheringComplete = data. data.teacher.informationGatheringComplete === true;
                        
                        if (isInfoGatheringComplete) {
                          navigate('/InstructorDash');
                        } else {
                          const areasOfExpertise = data.data.teacher.areasOfExpertise || [];
                          const cv = data.data.teacher.cv || '';
                          
                          if (areasOfExpertise.length === 0 || cv.trim() === '') {
                            navigate('/InformationGathering1');
                          } else {
                            try {
                              await fetch(`${API_URL}/api/teachers/me`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${data.data.token}`
                                },
                                body: JSON.stringify({ informationGatheringComplete: true })
                              });
                              navigate('/InstructorDash');
                            } catch (error) {
                              console.error('Error marking information gathering as complete:', error);
                              navigate('/InstructorDash');
                            }
                          }
                        }
                      } else {
                        setGeneralError('Failed to get authentication token. Please try again.');
                      }
                    } catch (loginError) {
                      console.error('Auto-login error:', loginError);
                      setGeneralError('Network error during authentication. Please try again.');
                    }
                  } else {
                    setGeneralError('Email not verified yet. Please check your inbox and click the verification link.');
                  }
                }
              }}
            >
              Check Again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}