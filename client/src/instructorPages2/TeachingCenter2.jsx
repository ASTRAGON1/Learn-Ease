import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./TeachingCenter2.css";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import TeachingPic1 from "../assets/teachingCenterPic1.png";
import TeachingPic2 from "../assets/teachingCenterPic2.png";
import TeachingPic3 from "../assets/teachingCenterPic3.png";
import TeachingPic4 from "../assets/teachingCenterPic4.png";
import TeachingPic5 from "../assets/teachingCenterPic5.png";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";

export default function TeachingCenter2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tab, setTab] = useState("teaching"); // "teaching" | "publishing" | "community" | "news"
  const [page, setPage] = useState(1); // 1 or 2

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Get instructor name from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (token) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const teacher = data.data || data;
            if (teacher.fullName) {
              setInstructorName(teacher.fullName.split(' ')[0]);
            }
            if (teacher.email) {
              setEmail(teacher.email);
            }
            if (teacher.profilePic) {
              setProfilePic(teacher.profilePic);
            }
          }
        } catch (error) {
          console.error('Error fetching instructor name:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // --- DATA ------------------------------------------------------------------
  const TEACHING = {
    1: {
      heroTitle: "Start Teaching with LearnEase",
      heroSub: "Share your expertise and inspire students by creating high-quality lessons.",
      heroImg: TeachingPic1,
      sections: [
        {
          title: "Becoming a LearnEase Instructor",
          body: "To teach on LearnEase, professionals must first apply by submitting their CV, LinkedIn profile, and any other supporting documents that prove their expertise. Our team manually reviews each application to ensure the teacher is qualified—especially in working with students with special needs such as autism and Down syndrome. Only certified professionals will be accepted into the platform.",
        },
        {
          title: "Teacher Approval Process",
          body: "Once an application is submitted, the teacher is granted limited access to the platform's dashboard. However, they won't be able to publish any courses or upload content until they're fully approved. This approval ensures a safe and credible environment for learners. We advise teachers to double-check all submitted information before finalizing their application.",
        },
        {
          title: "Teaching Paths and Platform Structure",
          body: "At LearnEase, we provide two structured learning paths tailored for students with specific needs. These paths include fixed courses designed by our admins. Teachers must follow this structure but are also encouraged to upload additional helpful content such as documents, videos, and images that support student learning.",
        },
        {
          title: "Profile and Student Interaction",
          body: "Each teacher has a public profile page that showcases their content and teaching progress. Students can view this profile, see their uploaded material, and even rate the teacher based on their experience. This builds trust and helps other learners choose the right educator for their journey.",
        },
        {
          title: "Why Teach on LearnEase?",
          body: "LearnEase is more than a teaching platform—it's a mission-driven space for educators who want to make a difference. Our platform is uniquely built to serve kids and teens with autism and Down syndrome, offering teachers an opportunity to create a real impact. With structured paths, creative freedom, and a supportive community, teaching on LearnEase is both meaningful and fulfilling.",
        },
      ],
      cta: { title: "Ready to start teaching? Let's go!", btn: "Start your journey", to: "/instructor-upload-2" },
    },
    2: {
      heroTitle: "Plan Your Path to Success",
      heroSub: "Use our intuitive tools to organize, structure, and map out your course content.",
      heroImg: TeachingPic2,
      sections: [
        {
          title: "Structured Learning Paths",
          body: "At LearnEase, students follow structured learning paths carefully designed by our platform administrators. These paths are built with expertise to suit the unique needs of learners with autism and Down syndrome. Each path includes essential courses that serve as a foundation for progress.",
        },
        {
          title: "Teacher Contributions to Courses",
          body: "While the learning paths are fixed, teachers enrich them by uploading supportive content—videos, documents, images, and quizzes. These contributions enhance the core learning experience and provide diverse teaching styles and resources for every student.",
        },
        {
          title: "Teaching Freedom and Flexibility",
          body: "Teachers at LearnEase have full freedom in how they explain and present their content. They are only asked to tag their videos accurately so that our AI system can understand the topic and categorize it accordingly. This helps personalize the student experience further.",
        },
        {
          title: "Course Archives and Visibility",
          body: "Uploaded videos are archived under each teacher's profile and categorized by topic and course. Students can explore their teacher's content in a way similar to browsing YouTube channels—encouraging deeper exploration and ongoing learning.",
        },
        {
          title: "Communication and Support",
          body: "Teachers can reach out to platform admins via a built-in chat or report system. This ensures smooth collaboration, allows teachers to request support, and helps maintain the quality and accuracy of all uploaded content.",
        },
      ],
      cta: { title: "Ready to start teaching? Let's go!", btn: "Start your journey", to: "/instructor-upload-2" },
    },
  };

  const PUBLISHING = {
    heroTitle: "Publish and Share Your Knowledge",
    heroSub: "Easily upload your lessons, videos, and resources to the platform.",
    heroImg: TeachingPic3,
    sections: [
      {
        title: "Content Types and Formats",
        body: "Teachers can upload a variety of educational materials—video lectures, PDF documents, images, and supporting files. This gives them flexibility to explain in their preferred style and create engaging, informative resources for students following their assigned learning paths.",
      },
      {
        title: "Upload Flow and Moderation",
        body: "Uploaded content doesn't go live immediately. Every submission enters a waiting list to be reviewed by platform admins or support. This ensures quality and appropriateness of the material. Teachers also have the option to save their uploads as drafts and edit or schedule them for later submission.",
      },
      {
        title: "Interaction and Feedback",
        body: "Once approved and published, content becomes visible to students who can like, rate, and engage with it. These interactions are reflected in the teacher's profile, providing valuable feedback and helping students identify helpful resources.",
      },
      {
        title: "Ownership and Guidelines",
        body: "Teachers retain full ownership of the content they upload. However, all materials must follow platform guidelines—no nudity or inappropriate clothing, and teachers are encouraged to dress professionally in any video content. This helps maintain a formal and respectful learning environment.",
      },
    ],
    cta: { title: "Publish your videos, content here!", btn: "Publish your content", to: "/instructor-upload-2" },
  };

  const COMMUNITY = {
    heroTitle: "Connect and Grow Together",
    heroSub: "Join a vibrant community of educators and learners. Collaborate, exchange ideas, and support each other through interactive forums and group discussions.",
    heroImg: TeachingPic4,
    sections: [
      {
        title: "Engaging with Others",
        body: "Our platform encourages students and teachers to build a supportive educational environment. Users can like, comment on, and discuss learning materials, helping each other understand difficult concepts and celebrate progress.",
      },
      {
        title: "Teacher Profiles and Student Feedback",
        body: "Each teacher has a public profile displaying their content and student ratings. This helps students discover instructors who match their learning style and fosters trust between learners and educators.",
      },
      {
        title: "Student Forums and Peer Help",
        body: "Students can interact in dedicated discussion boards or course-based chatrooms to ask questions, share tips, or solve problems together. It's a space to grow through shared knowledge and collaboration.",
      },
      {
        title: "Admin & Teacher Communication",
        body: "Teachers can directly reach out to platform admins or support through an integrated chat/report system. Whether it's for questions, feedback, or assistance—help is always available.",
      },
      {
        title: "Safe and Inclusive Space",
        body: "We prioritize a respectful and inclusive atmosphere, especially for students with autism or Down syndrome. Our moderation system ensures a safe environment for all members of our community.",
      },
    ],
    cta: { title: "Join the community of instructors!", btn: "Join the community", to: "/InstructorCommunity" },
  };

  const NEWS = {
    heroTitle: "Stay Updated",
    heroSub: "Check the latest news, updates, and announcements on LearnEase. Stay informed about platform improvements, upcoming events, and success stories from our community.",
    heroImg: TeachingPic5,
    sections: [
      {
        title: "1. Platform Updates & Announcements",
        body: "Stay informed with the latest changes to our platform — from new features and UI improvements to backend upgrades and accessibility enhancements.",
      },
      {
        title: "2. New Courses & Learning Paths",
        body: "We regularly update our course library. Get notified when new learning paths or specialized content for autism and Down syndrome support is released.",
      },
      {
        title: "3. Teacher Spotlights",
        body: "Celebrate outstanding educators! We highlight top-rated or most active teachers, showcasing their contributions, expertise, and student impact.",
      },
      {
        title: "4. Community Events & Live Sessions",
        body: "Catch up on platform-hosted webinars, Q&A sessions, and upcoming live class features. This section keeps users in the loop with real-time learning opportunities.",
      },
      {
        title: "5. Educational News & Research",
        body: "Stay ahead with curated news and research about inclusive education, teaching strategies, and advancements in learning technologies for special needs students.",
      },
    ],
    cta: { title: "Give Feedback to the Admins", btn: "Give Feedback", to: "/HelpAndSupport-2" },
  };

  // pick current dataset
  const current =
    tab === "teaching" ? TEACHING[page] :
    tab === "publishing" ? PUBLISHING :
    tab === "community" ? COMMUNITY :
    NEWS;

  // reset teaching subpage when leaving/entering the tab
  const switchTab = (next) => {
    setTab(next);
    if (next === "teaching" && page !== 1 && page !== 2) setPage(1);
    if (next !== "teaching") setPage(1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login");
  };

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.ld-profile-container')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  // Sidebar items
  const sidebarItems = [
    { 
      key: "course", 
      label: "Course", 
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "performance", 
      label: "Performance", 
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "curriculum", 
      label: "Curriculum", 
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "resources", 
      label: "Resources", 
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
  ];

  return (
    <div className="ld-page">
      {/* Left Sidebar */}
      <aside 
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={tab === item.key ? "active" : ""}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ld-sidebar-footer">
            <button className="ld-sidebar-link ld-sidebar-logout" onClick={handleLogout}>
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
        {/* Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2")}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button 
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="ld-profile-avatar-image"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                  <div className="ld-profile-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                  )}
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
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt="Profile" 
                        className="ld-profile-dropdown-avatar-img"
                      />
                    ) : (
                    <div className="ld-profile-dropdown-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                    )}
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

        {/* Content Area */}
        <div className="ld-content">
          {/* Navigation Tabs */}
          <div className="tc-tabs">
            <button
              className={`tc-tab ${tab === "teaching" ? "active" : ""}`}
              onClick={() => switchTab("teaching")}
            >
              Teaching on LearnEase
            </button>
            <button
              className={`tc-tab ${tab === "publishing" ? "active" : ""}`}
              onClick={() => switchTab("publishing")}
            >
              Publishing
            </button>
            <button
              className={`tc-tab ${tab === "community" ? "active" : ""}`}
              onClick={() => switchTab("community")}
            >
              Community
            </button>
            <button
              className={`tc-tab ${tab === "news" ? "active" : ""}`}
              onClick={() => switchTab("news")}
            >
              News
            </button>
          </div>

          {/* Hero Section */}
          <section className="tc-hero-section">
            <div className="tc-hero-content">
              <div className="tc-hero-text">
                <h1 className="tc-hero-title">{current.heroTitle}</h1>
                <p className="tc-hero-subtitle">{current.heroSub}</p>
              </div>
              <div className="tc-hero-image">
                <img src={current.heroImg} alt={current.heroTitle} />
              </div>
            </div>
          </section>

          {/* Teaching Pagination */}
          {tab === "teaching" && (
            <div className="tc-pagination">
              <button
                className={`tc-page-btn ${page === 1 ? "active" : ""}`}
                onClick={() => setPage(1)}
              >
                1
              </button>
              <button
                className={`tc-page-btn ${page === 2 ? "active" : ""}`}
                onClick={() => setPage(2)}
              >
                2
              </button>
            </div>
          )}

          {/* Content Sections */}
          <div className="tc-sections">
            {current.sections.map((s, i) => (
              <section className="tc-section-card" key={`${tab}-${i}`}>
                <h3 className="tc-section-title">{s.title}</h3>
                <p className="tc-section-body">{s.body}</p>
              </section>
            ))}
          </div>

          {/* CTA Section */}
          <section className="tc-cta-section">
            <div className="tc-cta-card">
              <h3 className="tc-cta-title">{current.cta.title}</h3>
              <button
                className="tc-cta-button"
                onClick={() => navigate(current.cta.to)}
              >
                {current.cta.btn}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

