import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./InstructorDashboard2.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import icProfile from "../assets/Profile.png";
import testPath from "../assets/testPath.png";
import community from "../assets/community.png";
import teachPic from "../assets/teachPic.png";
import performanceIcon from "../assets/performance.png";
import feedbackSupport from "../assets/feedback&support.png";
import InstructorDailyChart from "../components/InstructorDailyChart";
import QuizResults from "../components/QuizResults";
import RankingTagsPanel from "../components/RankingAndTags";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";


const ProfileAvatar = ({ src, name, className, style, fallbackClassName }) => {
  const [error, setError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt="Profile"
        className={className}
        style={style}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {(name || "User").slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function InstructorDashboard2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState("course");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [mongoToken, setMongoToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userStatus, setUserStatus] = useState('pending'); // 'pending', 'active', 'suspended'
  const [dailyTip, setDailyTip] = useState("Boost your teaching with daily strategies tailored for students with autism and Down syndrome. Practical, short, and easy to apply.");
  const [tipLoading, setTipLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [suspensionModal, setSuspensionModal] = useState({ show: false, message: '', title: '' });
  const [curriculumData, setCurriculumData] = useState([]);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [contentMetrics, setContentMetrics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalUploads: 0
  });
  const [quizResults, setQuizResults] = useState([]);

  // Real Notifications State
  const [notifications, setNotifications] = useState([]);

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  // Check Firebase Auth and get MongoDB token
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      try {
        const token = await getMongoDBToken();
        if (!token) {
          console.error('Failed to get MongoDB token');
          setLoading(false);
          navigate('/all-login');
          return;
        }

        setMongoToken(token);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          setLoading(false);
          navigate('/all-login');
          return;
        }

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            const teacher = data.data || data;

            if (teacher._id) setCurrentUserId(teacher._id.toString());
            if (teacher.fullName) setInstructorName(teacher.fullName.split(' ')[0]);
            if (teacher.userStatus) setUserStatus(teacher.userStatus);
            if (teacher.email) setEmail(teacher.email);
            if (teacher.profilePic) setProfilePic(teacher.profilePic);

            // Information gathering check
            const isInfoGatheringComplete = teacher.informationGatheringComplete === true;
            if (!isInfoGatheringComplete) {
              const areasOfExpertise = teacher.areasOfExpertise || [];
              const cv = teacher.cv || '';
              if (areasOfExpertise.length === 0) {
                setLoading(false);
                navigate('/InformationGathering-1');
                return;
              } else if (!cv || cv.trim() === '') {
                setLoading(false);
                navigate('/InformationGathering-2');
                return;
              } else {
                setLoading(false);
                navigate('/InformationGathering-3');
                return;
              }
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking information gathering status:', error);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Set active section
  useEffect(() => {
    if (location.state?.section === 'resources') setActiveSection('resources');
  }, [location]);

  // Fetch daily tip
  useEffect(() => {
    const fetchDailyTip = async () => {
      try {
        setTipLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/ai/daily-tip`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.tip) setDailyTip(data.data.tip);
        }
      } catch (error) {
        console.error('Error fetching daily tip:', error);
      } finally {
        setTipLoading(false);
      }
    };
    fetchDailyTip();
  }, []);

  // Fetch learning paths
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setCurriculumLoading(true);
        const response = await fetch(`${API_URL}/api/admin/learning-paths`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const transformed = result.data.map(path => ({
              GeneralPath: path.id.includes('autism') ? 'autism' : path.id.includes('down') ? 'downSyndrome' : path.id,
              pathTitle: path.name,
              Courses: path.courses.map(course => ({
                CoursesTitle: course.name,
                Topics: course.topics.map(topic => ({
                  TopicsTitle: topic.name,
                  lessons: topic.lessons.map(lesson => lesson.name)
                }))
              }))
            }));
            setCurriculumData(transformed);
          }
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      } finally {
        setCurriculumLoading(false);
      }
    };
    fetchPaths();
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!mongoToken) return;
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${mongoToken}` }
      });
      if (response.ok) {
        const resData = await response.json();
        const formatted = (resData.data || []).map(n => ({
          ...n,
          id: n._id,
          text: n.message,
          time: formatTimeAgo(n.createdAt)
        }));
        setNotifications(formatted);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (mongoToken) {
      fetchNotifications();
    }
  }, [mongoToken]);

  // Fetch instructor's content metrics
  useEffect(() => {
    const fetchContentMetrics = async () => {
      if (!email) {
        console.log('[Metrics] No email available yet');
        return;
      }

      console.log('[Metrics] Fetching for email:', email);

      try {
        const Content = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(email)}/content`);
        const Quiz = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(email)}/quizzes`);

        let totalViews = 0;
        let totalLikes = 0;
        let totalUploads = 0;

        if (Content.ok) {
          const contentData = await Content.json();
          const contents = contentData.data || [];
          console.log('[Metrics] Content items:', contents.length, contents);
          totalViews += contents.reduce((sum, item) => sum + (item.views || 0), 0);
          totalLikes += contents.reduce((sum, item) => sum + (item.likes || 0), 0);
          totalUploads += contents.length;
        } else {
          console.error('[Metrics] Content fetch failed:', Content.status);
        }

        if (Quiz.ok) {
          const quizData = await Quiz.json();
          const quizzes = quizData.data || [];
          console.log('[Metrics] Quiz items:', quizzes.length, quizzes);
          totalViews += quizzes.reduce((sum, item) => sum + (item.views || 0), 0);
          totalLikes += quizzes.reduce((sum, item) => sum + (item.likes || 0), 0);
          totalUploads += quizzes.length;
        } else {
          console.error('[Metrics] Quiz fetch failed:', Quiz.status);
        }

        console.log('[Metrics] Final totals - Views:', totalViews, 'Likes:', totalLikes, 'Uploads:', totalUploads);

        setContentMetrics({
          totalViews,
          totalLikes,
          totalUploads
        });
      } catch (error) {
        console.error('[Metrics] Error fetching content metrics:', error);
      }
    };

    fetchContentMetrics();
  }, [email]);

  // Fetch quiz results
  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!email) return;

      try {
        const response = await fetch(`${API_URL}/api/admin/teacher/${encodeURIComponent(email)}/quiz-results`);
        if (response.ok) {
          const data = await response.json();
          setQuizResults(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      }
    };

    fetchQuizResults();
  }, [email]);

  // Sample data for instructor dashboard
  const sampleMetrics = [
    { label: "Content views", value: contentMetrics.totalViews.toLocaleString(), change: "+11.01%" },
    { label: "Likes given", value: contentMetrics.totalLikes.toLocaleString(), change: "+1.01%" },
    { label: "Total Uploads", value: contentMetrics.totalUploads.toLocaleString(), change: "+15.01%" },
  ];

  // Function to mark notification as read
  const markAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${mongoToken}` }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to delete notification
  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${mongoToken}` }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${mongoToken}` }
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Sample quiz results data
  const sampleQuizResults = [
    { student: "ByeWind", date: "Jun 24, 2025", grade: "85%", status: "Complete" },
    { student: "Natali Craig", date: "Mar 10, 2025", grade: "50%", status: "Complete" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "John Smith", date: "Mar 11, 2025", grade: "92%", status: "Complete" },
    { student: "Sarah Johnson", date: "Mar 11, 2025", grade: "78%", status: "Complete" },
    { student: "Mike Davis", date: "Mar 12, 2025", grade: "65%", status: "Complete" },
    { student: "Emily Brown", date: "Mar 12, 2025", grade: "--%", status: "Paused" },
    { student: "Chris Wilson", date: "Mar 13, 2025", grade: "88%", status: "Complete" },
    { student: "Lisa Anderson", date: "Mar 13, 2025", grade: "71%", status: "Complete" },
    { student: "David Martinez", date: "Mar 14, 2025", grade: "--%", status: "Paused" },
    { student: "Amy Taylor", date: "Mar 14, 2025", grade: "95%", status: "Complete" },
    { student: "James Garcia", date: "Mar 15, 2025", grade: "82%", status: "Complete" },
    { student: "Jessica Lee", date: "Mar 15, 2025", grade: "--%", status: "Paused" },
  ];

  // Instructor ranking data (fetched from API)
  const [instructorsRanking, setInstructorsRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  const handleLogout = async () => {
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    // Always navigate to login page, even if signOut fails
    navigate("/all-login", { replace: true });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.ld-profile-container')) {
        setProfileDropdownOpen(false);
      }
      if (notificationOpen && !event.target.closest('.ld-notification-wrapper')) {
        setNotificationOpen(false);
      }
    };

    if (profileDropdownOpen || notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen, notificationOpen]);

  // Fetch instructor ranking
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/ranking`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInstructorsRanking(data.data || []);
        } else {
          console.error('Failed to fetch instructor ranking');
          setInstructorsRanking([]);
        }
      } catch (error) {
        console.error('Error fetching instructor ranking:', error);
        setInstructorsRanking([]);
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchRanking();
  }, []);

  const handleChatbotClick = () => {
    navigate("/getSupport-2", { state: { focusInput: true } });
  };

  // Sidebar items
  const sidebarItems = [
    {
      key: "course",
      label: "Course",
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => setActiveSection("course")
    },
    {
      key: "performance",
      label: "Performance",
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => {
        if (userStatus !== 'active') {
          const title = userStatus === 'suspended' ? 'Account Suspended' : 'Account Pending Approval';
          const message = userStatus === 'suspended'
            ? "Your account has been suspended. You cannot access performance metrics. Please contact support for more information."
            : "You need to be accepted by the admin to view performance metrics.";
          setSuspensionModal({ show: true, title, message });
          return;
        }
        setActiveSection("performance");
      }
    },
    {
      key: "curriculum",
      label: "Curriculum",
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => setActiveSection("curriculum")
    },
    {
      key: "resources",
      label: "Resources",
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => setActiveSection("resources")
    },
  ];

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  // Render Course Section
  const renderCourseSection = () => (
    <>
      <section className="ld-welcome-section">
        <div className="ld-welcome-card">
          <h2 className="ld-welcome-title">Welcome {instructorName}, ready to teach?</h2>
          <p className="ld-welcome-subtitle">Upload your content and start teaching today</p>
        </div>
      </section>

      <section className="ld-upload-section">
        <div className={`ld-upload-card ${userStatus !== 'active' ? 'ld-disabled' : ''}`}>
          <div className="ld-upload-content">
            <h3 className="ld-upload-title">Upload your content here</h3>
            <p className="ld-upload-desc">Share your knowledge with students</p>
            {userStatus !== 'active' && (
              <p className="ld-approval-message" style={{
                marginTop: '12px',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {userStatus === 'suspended'
                  ? '🚫 Your account has been suspended. Please contact support for more information.'
                  : '⚠️ You need to be accepted by the admin to upload content'
                }
              </p>
            )}
          </div>
          <button
            className="ld-upload-btn"
            onClick={() => {
              if (userStatus === 'active') {
                navigate("/instructor-upload-2");
              } else {
                const title = userStatus === 'suspended' ? 'Account Suspended' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. Please contact support for more information."
                  : "You need to be accepted by the admin to upload content and generate quizzes.";
                setSuspensionModal({ show: true, title, message });
              }
            }}
            disabled={userStatus !== 'active'}
            style={userStatus !== 'active' ? {
              opacity: 0.5,
              cursor: 'not-allowed',
              background: '#9ca3af'
            } : {}}
          >
            Let's dive in
          </button>
        </div>
      </section>

      <section className="ld-ai-section">
        <div className={`ld-ai-card ${userStatus !== 'active' ? 'ld-disabled' : ''}`}>
          <h3 className="ld-ai-title">Generate quizzes using AI</h3>
          <p className="ld-ai-desc">
            Our AI-powered quiz tool helps you generate personalized quizzes based on the curriculum
            you follow on our platform — perfect for assessing student progress quickly and effectively.
          </p>
          {userStatus !== 'active' && (
            <p className="ld-approval-message" style={{
              marginTop: '12px',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {userStatus === 'suspended'
                ? '🚫 Your account has been suspended. Please contact support for more information.'
                : '⚠️ You need to be accepted by the admin to generate quizzes'
              }
            </p>
          )}
          <button
            className="ld-ai-btn"
            onClick={() => {
              if (userStatus === 'active') {
                navigate("/ai-quiz-2");
              } else {
                const title = userStatus === 'suspended' ? 'Account Suspended' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. Please contact support for more information."
                  : "You need to be accepted by the admin to upload content and generate quizzes.";
                setSuspensionModal({ show: true, title, message });
              }
            }}
            disabled={userStatus !== 'active'}
            style={userStatus !== 'active' ? {
              opacity: 0.5,
              cursor: 'not-allowed',
              background: '#9ca3af'
            } : {}}
          >
            Generate
          </button>
        </div>
      </section>

      <div className="ld-tips-grid">
        <div className="ld-tip-card">
          <h4 className="ld-tip-title">Tip of the day</h4>
          <p className="ld-tip-text">
            {tipLoading ? "Loading today's tip..." : dailyTip}
          </p>
        </div>
        <div className="ld-tip-card">
          <h4 className="ld-tip-title">Community & Support</h4>
          <p className="ld-tip-text">Ask questions, share tips, and connect with other instructors.</p>
          {userStatus !== 'active' && (
            <p className="ld-approval-message" style={{
              marginTop: '12px',
              marginBottom: '12px',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {userStatus === 'suspended'
                ? '🚫 Your account has been suspended. Community access is restricted.'
                : '⚠️ You need admin approval to access the community'
              }
            </p>
          )}
          <button
            className="ld-community-btn"
            onClick={() => {
              if (userStatus !== 'active') {
                const title = userStatus === 'suspended' ? 'Access Restricted' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. You cannot access the community. Please contact support for more information."
                  : "You need to be accepted by the admin to access the community.";
                setSuspensionModal({ show: true, title, message });
              } else {
                navigate("/InstructorCommunity-2");
              }
            }}
            disabled={userStatus !== 'active'}
            style={userStatus !== 'active' ? {
              opacity: 0.5,
              cursor: 'not-allowed',
              background: '#9ca3af'
            } : {}}
          >
            Join Now
          </button>
        </div>
      </div>

      <section className="ld-resources-section">
        <h3 className="ld-resources-heading">
          Have questions? Here are our most popular instructor resources.
        </h3>
        <div className="ld-resources-grid">
          <Link to="/teachingCenter-2" className="ld-resource-card">
            <img src={testPath} alt="Test Video" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Test Video</h5>
            <p className="ld-resource-desc">See how your videos gets treated</p>
          </Link>
          <div
            className={`ld-resource-card ${userStatus !== 'active' ? 'ld-resource-card-disabled' : ''}`}
            onClick={() => {
              if (userStatus !== 'active') {
                const title = userStatus === 'suspended' ? 'Access Restricted' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. You cannot access the community. Please contact support for more information."
                  : "You need to be accepted by the admin to access the community.";
                setSuspensionModal({ show: true, title, message });
              } else {
                navigate("/InstructorCommunity-2");
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={community} alt="Community" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Community</h5>
            <p className="ld-resource-desc">
              Communicate with other instructors. Ask questions, have discussions, and more.
            </p>
          </div>
          <Link to="/teachingCenter-2" className="ld-resource-card">
            <img src={teachPic} alt="How to teach" className="ld-resource-icon" />
            <h5 className="ld-resource-title">How to teach in LearnEase</h5>
            <p className="ld-resource-desc">
              Learn how to use our platform to get the best results and satisfy the students.
            </p>
          </Link>
          <div
            className={`ld-resource-card ${userStatus !== 'active' ? 'ld-resource-card-disabled' : ''}`}
            onClick={() => {
              if (userStatus !== 'active') {
                const title = userStatus === 'suspended' ? 'Account Suspended' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. You cannot access performance metrics. Please contact support for more information."
                  : "You need to be accepted by the admin to view performance metrics.";
                setSuspensionModal({ show: true, title, message });
              } else {
                setActiveSection("performance");
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={performanceIcon} alt="Performance" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Performance</h5>
            <p className="ld-resource-desc">
              See how students like your contents, quiz results analysis, and more.
            </p>
          </div>
          <div
            className={`ld-resource-card ${userStatus === 'pending' ? 'ld-resource-card-disabled' : ''}`}
            onClick={() => {
              if (userStatus === 'pending') {
                setSuspensionModal({
                  show: true,
                  title: 'Account Pending Approval',
                  message: 'You need to be accepted by the admin to access support.'
                });
              } else {
                navigate("/HelpAndSupport-2");
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={feedbackSupport} alt="Feedback & Support" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Feedback & Support</h5>
            <p className="ld-resource-desc">Get feedback and support from students.</p>
          </div>
        </div>
      </section>

      <section className="ld-cta-section">
        <div className="ld-cta-card">
          <p className="ld-cta-text">Are You Ready to Begin?</p>
          <button className="ld-cta-btn" onClick={() => navigate("/instructor-upload-2")}>
            Upload Your Content
          </button>
        </div>
      </section>
    </>
  );

  // Render Performance Section
  const renderPerformanceSection = () => (
    <>
      <section className="ld-metrics-section">
        <h2 className="ld-section-title">Performance Metrics</h2>
        <div className="ld-metrics-grid">
          {sampleMetrics.map((metric, index) => (
            <div key={index} className="ld-metric-card">
              <span className="ld-metric-label">{metric.label}</span>
              <span className="ld-metric-value">{metric.value}</span>
              <span className={`ld-metric-change ${metric.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {metric.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Chart and Notifications Side by Side */}
      <section className="ld-chart-notifications-section">
        <div className="ld-chart-notifications-grid">
          {/* Views and Likes Chart */}
          <div className="ld-chart-wrapper">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    margin: "0 0 4px 0",
                    color: "#1a1a1a",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Total Views & Likes
                  </h2>
                  <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0",
                    fontWeight: "500",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Daily overview of your content engagement
                  </p>
                </div>
              </div>
              <div style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s ease"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(74, 15, 173, 0.1)";
                  e.currentTarget.style.borderColor = "#F3EFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <InstructorDailyChart
                  totalViews={contentMetrics.totalViews}
                  totalLikes={contentMetrics.totalLikes}
                />
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="ld-notifications-wrapper">
            <div className="ld-notifications-card">
              <h3 className="ld-notifications-title">Recent Notifications</h3>
              <div className="ld-notifications-list">
                {notifications.length === 0 ? (
                  <div className="ld-notification-empty">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`ld-notification-item ${notif.read ? 'read' : ''}`}
                      data-type={notif.type}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="ld-notification-icon">
                        {notif.type === "likes" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        ) : notif.type === "approved" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : notif.type === "views" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : notif.type === "uploaded" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        ) : notif.type === "report" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        ) : notif.type === "feedback" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            <path d="M13 8H7"></path>
                            <path d="M17 12H7"></path>
                          </svg>
                        ) : "📢"}
                      </div>
                      <div className="ld-notification-content">
                        <p className="ld-notification-text">{notif.text}</p>
                        <span className="ld-notification-time">{notif.time}</span>
                      </div>
                      {!notif.read && <div className="ld-notification-unread-indicator"></div>}
                      <button
                        className="ld-notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Results and Instructor Ranking Grid */}
      <section className="ld-results-ranking-section">
        <div className="ld-results-ranking-grid">
          <div className="ld-quiz-results-wrapper">
            <QuizResults data={quizResults} />
          </div>
          <div className="ld-ranking-wrapper">
            {loadingRanking ? (
              <div className="ld-loading">Loading ranking...</div>
            ) : (
              <RankingTagsPanel instructors={instructorsRanking} categories={[]} currentUserId={currentUserId} />
            )}
          </div>
        </div>
      </section>
    </>
  );

  const toggleCourse = (courseKey) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseKey)) {
        newSet.delete(courseKey);
      } else {
        newSet.add(courseKey);
      }
      return newSet;
    });
  };

  const toggleTopic = (topicKey) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicKey)) {
        newSet.delete(topicKey);
      } else {
        newSet.add(topicKey);
      }
      return newSet;
    });
  };

  // Render Curriculum Section
  const renderCurriculumSection = () => {
    if (curriculumLoading) {
      return <div style={{ padding: "40px", textAlign: "center" }}>Loading curriculum...</div>;
    }

    const totalCourses = curriculumData.reduce((sum, path) => sum + (path.Courses?.length || 0), 0);
    const totalTopics = curriculumData.reduce((sum, path) =>
      sum + (path.Courses?.reduce((cSum, course) => cSum + (course.Topics?.length || 0), 0) || 0), 0
    );
    const totalLessons = curriculumData.reduce((sum, path) =>
      sum + (path.Courses?.reduce((cSum, course) =>
        cSum + (course.Topics?.reduce((tSum, topic) => tSum + (topic.lessons?.length || 0), 0) || 0), 0
      ) || 0), 0
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "32px",
          background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(74, 15, 173, 0.2)",
          color: "white"
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: "36px",
              fontWeight: "800",
              margin: "0 0 8px 0",
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em"
            }}>
              Learning Paths
            </h1>
            <p style={{
              fontSize: "16px",
              margin: "0",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: "500",
              fontFamily: "'Poppins', sans-serif"
            }}>
              Two paths: Autism and Down Syndrome. Structure: Path → Courses → Topics → Lessons.
            </p>
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
                marginBottom: "4px",
                fontFamily: "'Poppins', sans-serif"
              }}>
                {curriculumData.length}
              </div>
              <div style={{
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
                fontFamily: "'Poppins', sans-serif"
              }}>
                Paths
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
                marginBottom: "4px",
                fontFamily: "'Poppins', sans-serif"
              }}>
                {totalCourses}
              </div>
              <div style={{
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
                fontFamily: "'Poppins', sans-serif"
              }}>
                Courses
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
                marginBottom: "4px",
                fontFamily: "'Poppins', sans-serif"
              }}>
                {totalTopics}
              </div>
              <div style={{
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
                fontFamily: "'Poppins', sans-serif"
              }}>
                Topics
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1",
                marginBottom: "4px",
                fontFamily: "'Poppins', sans-serif"
              }}>
                {totalLessons}
              </div>
              <div style={{
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
                fontFamily: "'Poppins', sans-serif"
              }}>
                Lessons
              </div>
            </div>
          </div>
        </div>

        {/* Learning Paths Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {curriculumData.map((path) => {
            const courseCount = path.Courses.length;
            const topicCount = path.Courses.reduce((sum, c) => sum + (c.Topics?.length || 0), 0);
            const lessonCount = path.Courses.reduce((sum, c) =>
              sum + (c.Topics?.reduce((tSum, t) => tSum + (t.lessons?.length || 0), 0) || 0), 0
            );

            return (
              <div key={path.GeneralPath} style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s ease"
              }}>
                {/* Path Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "20px",
                  borderBottom: "2px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "20px",
                      boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 4px 0",
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {path.pathTitle}
                      </h3>
                      <p style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: "0",
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {courseCount} courses • {topicCount} topics • {lessonCount} lessons
                      </p>
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {path.Courses.map((course, ci) => {
                    const courseKey = `${path.GeneralPath}-${ci}`;
                    const isCourseExpanded = expandedCourses.has(courseKey);

                    return (
                      <div key={ci} style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        overflow: "hidden",
                        transition: "all 0.2s ease"
                      }}>
                        {/* Course Header */}
                        <div
                          onClick={() => toggleCourse(courseKey)}
                          style={{
                            padding: "16px 20px",
                            background: isCourseExpanded ? "#F3EFFF" : "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            if (!isCourseExpanded) {
                              e.currentTarget.style.background = "#f9fafb";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCourseExpanded) {
                              e.currentTarget.style.background = "#ffffff";
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                transform: isCourseExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                                color: "#4A0FAD",
                                flexShrink: 0
                              }}
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            <span style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              {course.CoursesTitle}
                            </span>
                            <span style={{
                              fontSize: "13px",
                              color: "#6b7280",
                              background: "#f3f4f6",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              {course.Topics ? course.Topics.length : 0} {course.Topics?.length === 1 ? "topic" : "topics"}
                            </span>
                          </div>
                        </div>

                        {/* Topics (Expanded) */}
                        {isCourseExpanded && course.Topics && (
                          <div style={{
                            padding: "12px 20px 20px 52px",
                            background: "#ffffff",
                            borderTop: "1px solid #e5e7eb"
                          }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {course.Topics.map((topic, ti) => {
                                const topicKey = `${path.GeneralPath}-${ci}-${ti}`;
                                const isTopicExpanded = expandedTopics.has(topicKey);

                                return (
                                  <div key={ti} style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    overflow: "hidden"
                                  }}>
                                    {/* Topic Header */}
                                    <div
                                      onClick={() => toggleTopic(topicKey)}
                                      style={{
                                        padding: "12px 16px",
                                        background: isTopicExpanded ? "#f9fafb" : "#ffffff",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        transition: "all 0.2s ease"
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isTopicExpanded) {
                                          e.currentTarget.style.background = "#f9fafb";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isTopicExpanded) {
                                          e.currentTarget.style.background = "#ffffff";
                                        }
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          style={{
                                            transform: isTopicExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease",
                                            color: "#6b7280",
                                            flexShrink: 0
                                          }}
                                        >
                                          <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                        <span style={{
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          color: "#374151",
                                          fontFamily: "'Poppins', sans-serif"
                                        }}>
                                          {topic.TopicsTitle}
                                        </span>
                                        <span style={{
                                          fontSize: "12px",
                                          color: "#9ca3af",
                                          background: "#f3f4f6",
                                          padding: "3px 8px",
                                          borderRadius: "10px",
                                          fontFamily: "'Poppins', sans-serif"
                                        }}>
                                          {topic.lessons ? topic.lessons.length : 0} {topic.lessons?.length === 1 ? "lesson" : "lessons"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Lessons (Expanded) */}
                                    {isTopicExpanded && topic.lessons && (
                                      <div style={{
                                        padding: "8px 16px 12px 42px",
                                        background: "#ffffff",
                                        borderTop: "1px solid #e5e7eb"
                                      }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                          {topic.lessons.map((lesson, li) => (
                                            <div
                                              key={li}
                                              style={{
                                                padding: "10px 12px",
                                                background: "#f9fafb",
                                                borderRadius: "6px",
                                                transition: "all 0.2s"
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#f3f4f6";
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#f9fafb";
                                              }}
                                            >
                                              <span style={{
                                                fontSize: "13px",
                                                color: "#374151",
                                                fontFamily: "'Poppins', sans-serif"
                                              }}>
                                                {lesson}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Resources Section
  const renderResourcesSection = () => (
    <>
      <section className="ld-resources-main-section">
        <h2 className="ld-section-title">Resources</h2>
        <div className="ld-resources-main-grid">
          <Link to="/TeachingCenter-2" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="8" y1="7" x2="18" y2="7"></line>
                <line x1="8" y1="11" x2="18" y2="11"></line>
                <line x1="8" y1="15" x2="14" y2="15"></line>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Teaching Center</h4>
            <p className="ld-resource-main-desc">
              Find articles on LearnEase teaching — from course creation to marketing.
            </p>
          </Link>
          <div
            className={`ld-resource-main-card ${userStatus !== 'active' ? 'ld-resource-card-disabled' : ''}`}
            onClick={() => {
              if (userStatus !== 'active') {
                const title = userStatus === 'suspended' ? 'Access Restricted' : 'Account Pending Approval';
                const message = userStatus === 'suspended'
                  ? "Your account has been suspended. You cannot access the community. Please contact support for more information."
                  : "You need to be accepted by the admin to access the community.";
                setSuspensionModal({ show: true, title, message });
              } else {
                navigate("/InstructorCommunity-2");
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Instructor Community</h4>
            <p className="ld-resource-main-desc">
              Share your progress and ask other instructors questions in our community.
            </p>
          </div>
          <div
            className={`ld-resource-main-card ${userStatus === 'pending' ? 'ld-resource-card-disabled' : ''}`}
            onClick={() => {
              if (userStatus === 'pending') {
                setSuspensionModal({
                  show: true,
                  title: 'Account Pending Approval',
                  message: 'You need to be accepted by the admin to access support.'
                });
              } else {
                navigate("/HelpAndSupport-2");
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Help and support</h4>
            <p className="ld-resource-main-desc">
              Can't find what you need? Our support team is happy to help.
            </p>
          </div>
        </div>
      </section>
    </>
  );

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="ld-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '12px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar with Hover Animation */}
      <aside
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          {/* Logo */}
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          {/* Navigation Items */}
          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={activeSection === item.key ? "active" : ""}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">
                      {item.icon}
                    </span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">
                      {item.icon}
                    </span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="ld-sidebar-footer">
            <button
              className="ld-sidebar-link ld-sidebar-logout"
              onClick={handleLogout}
            >
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Top Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <h1 className="ld-welcome">
              Welcome to <span className="ld-brand">LearnEase</span>
            </h1>
          </div>
          <div className="ld-header-right">
            <div className="ld-notification-wrapper">
              <button
                className="ld-notification-btn"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="ld-notification-badge">{unreadCount}</span>
                )}
              </button>
              <div
                className="ld-notification-popover"
                style={{
                  opacity: notificationOpen ? 1 : undefined,
                  visibility: notificationOpen ? 'visible' : undefined,
                  transform: notificationOpen ? 'translateY(0)' : undefined,
                  pointerEvents: notificationOpen ? 'auto' : undefined
                }}
              >
                <div className="ld-notification-popover-header">
                  <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                  {notifications.length > 0 && (
                    <button
                      className="ld-notification-clear-btn"
                      onClick={clearAllNotifications}
                      title="Clear all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="ld-notification-popover-list">
                  {notifications.length === 0 ? (
                    <div className="ld-notification-empty">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`ld-notification-popover-item ${notif.read ? 'read' : ''}`}
                        data-type={notif.type}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="ld-notification-popover-icon">
                          {notif.type === "likes" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          ) : notif.type === "approved" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : notif.type === "views" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : notif.type === "uploaded" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          ) : notif.type === "report" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          ) : notif.type === "feedback" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              <path d="M13 8H7"></path>
                              <path d="M17 12H7"></path>
                            </svg>
                          ) : "📢"}
                        </div>
                        <div className="ld-notification-popover-content">
                          <div className="ld-notification-popover-text">{notif.text}</div>
                          <div className="ld-notification-popover-time">{notif.time}</div>
                        </div>
                        {!notif.read && <div className="ld-notification-unread-dot"></div>}
                        <button
                          className="ld-notification-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="ld-profile-container">
              <button
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  <ProfileAvatar
                    src={profilePic}
                    name={instructorName}
                    className="ld-profile-avatar-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    fallbackClassName="ld-profile-avatar"
                  />
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  {email && <div className="ld-profile-email">{email}</div>}
                </div>
                <svg
                  className={`ld-profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ld-profile-dropdown">
                  <div className="ld-profile-dropdown-header">
                    <ProfileAvatar
                      src={profilePic}
                      name={instructorName}
                      className="ld-profile-dropdown-avatar-img"
                      fallbackClassName="ld-profile-dropdown-avatar"
                    />
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">{email || 'No email'}</div>
                    </div>
                  </div>
                  <div className="ld-profile-dropdown-divider"></div>
                  <Link to="/profile-2" className="ld-profile-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </Link>
                  <button className="ld-profile-dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="ld-content">
          {activeSection === "course" && renderCourseSection()}
          {activeSection === "performance" && renderPerformanceSection()}
          {activeSection === "curriculum" && renderCurriculumSection()}
          {activeSection === "resources" && renderResourcesSection()}
        </div>
      </div>

      {/* AI Assistant Chatbot Icon */}
      <div
        className={`ai-chatbot-icon ${scrollDirection}`}
        onClick={handleChatbotClick}
        role="button"
        tabIndex={0}
        aria-label="AI Assistant"
      >
        <div className="ai-chatbot-icon-inner">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ai-chatbot-svg"
          >
            <rect x="4" y="6" width="16" height="14" rx="2" fill="currentColor" />
            <circle cx="12" cy="4" r="1.5" fill="currentColor" />
            <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="11" r="1.5" fill="white" />
            <circle cx="15" cy="11" r="1.5" fill="white" />
            <circle cx="9" cy="11" r="0.8" fill="#7d4cff" opacity="0.8" />
            <circle cx="15" cy="11" r="0.8" fill="#7d4cff" opacity="0.8" />
            <rect x="9" y="15" width="6" height="2" rx="1" fill="white" />
            <circle cx="7" cy="9" r="0.5" fill="white" opacity="0.6" />
            <circle cx="17" cy="9" r="0.5" fill="white" opacity="0.6" />
          </svg>
        </div>
        <div className="ai-chatbot-pulse"></div>
      </div>

      {/* Suspension/Restriction Modal */}
      {suspensionModal.show && (
        <div
          className="ld-modal-overlay"
          onClick={() => setSuspensionModal({ show: false, message: '', title: '' })}
        >
          <div
            className="ld-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ld-modal-header">
              <h3 className="ld-modal-title">{suspensionModal.title}</h3>
              <button
                className="ld-modal-close"
                onClick={() => setSuspensionModal({ show: false, message: '', title: '' })}
              >
                ×
              </button>
            </div>
            <div className="ld-modal-body">
              <p>{suspensionModal.message}</p>
            </div>
            <div className="ld-modal-footer">
              <button
                className="ld-modal-btn"
                onClick={() => setSuspensionModal({ show: false, message: '', title: '' })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

