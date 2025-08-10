// src/pages/TeachingCenter.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TeachingCenter.css";

import Logo from "../assets/logoTeachingCenter.png";

// HERO illustrations (swap files as you like)
import TeachingPic1 from "../assets/teachingCenterPic1.png";
import TeachingPic2 from "../assets/teachingCenterPic2.png";
import TeachingPic3 from "../assets/teachingCenterPic3.png";
import TeachingPic4 from "../assets/teachingCenterPic4.png";
import TeachingPic5 from "../assets/teachingCenterPic5.png";

import Footer from "../components/Footer";

export default function TeachingCenter() {
  const navigate = useNavigate();

  // top-level tabs
  const [tab, setTab] = useState("teaching"); // "teaching" | "publishing" | "community" | "news"
  // sub-pages only for the Teaching tab
  const [page, setPage] = useState(1); // 1 or 2

  // --- DATA ------------------------------------------------------------------
  const TEACHING = {
    1: {
      heroTitle: "Start Teaching with LearnEase",
      heroSub:
        "Share your expertise and inspire students by creating high-quality lessons.",
      heroImg: TeachingPic1,
      sections: [
        {
          title: "Becoming a LearnEase Instructor",
          body:
            "To teach on LearnEase, professionals must first apply by submitting their CV, LinkedIn profile, and any other supporting documents that prove their expertise. Our team manually reviews each application to ensure the teacher is qualified—especially in working with students with special needs such as autism and Down syndrome. Only certified professionals will be accepted into the platform.",
        },
        {
          title: "Teacher Approval Process",
          body:
            "Once an application is submitted, the teacher is granted limited access to the platform’s dashboard. However, they won’t be able to publish any courses or upload content until they’re fully approved. This approval ensures a safe and credible environment for learners. We advise teachers to double-check all submitted information before finalizing their application.",
        },
        {
          title: "Teaching Paths and Platform Structure",
          body:
            "At LearnEase, we provide two structured learning paths tailored for students with specific needs. These paths include fixed courses designed by our admins. Teachers must follow this structure but are also encouraged to upload additional helpful content such as documents, videos, and images that support student learning.",
        },
        {
          title: "Profile and Student Interaction",
          body:
            "Each teacher has a public profile page that showcases their content and teaching progress. Students can view this profile, see their uploaded material, and even rate the teacher based on their experience. This builds trust and helps other learners choose the right educator for their journey.",
        },
        {
          title: "Why Teach on LearnEase?",
          body:
            "LearnEase is more than a teaching platform—it’s a mission-driven space for educators who want to make a difference. Our platform is uniquely built to serve kids and teens with autism and Down syndrome, offering teachers an opportunity to create a real impact. With structured paths, creative freedom, and a supportive community, teaching on LearnEase is both meaningful and fulfilling.",
        },
      ],
      cta: { title: "Ready to start teaching? Let’s go!", btn: "Create Your Course", to: "/create-course" },
    },
    2: {
      heroTitle: "Plan Your Path to Success",
      heroSub:
        "Use our intuitive tools to organize, structure, and map out your course content.",
      heroImg: TeachingPic2,
      sections: [
        {
          title: "Structured Learning Paths",
          body:
            "At LearnEase, students follow structured learning paths carefully designed by our platform administrators. These paths are built with expertise to suit the unique needs of learners with autism and Down syndrome. Each path includes essential courses that serve as a foundation for progress.",
        },
        {
          title: "Teacher Contributions to Courses",
          body:
            "While the learning paths are fixed, teachers enrich them by uploading supportive content—videos, documents, images, and quizzes. These contributions enhance the core learning experience and provide diverse teaching styles and resources for every student.",
        },
        {
          title: "Teaching Freedom and Flexibility",
          body:
            "Teachers at LearnEase have full freedom in how they explain and present their content. They are only asked to tag their videos accurately so that our AI system can understand the topic and categorize it accordingly. This helps personalize the student experience further.",
        },
        {
          title: "Course Archives and Visibility",
          body:
            "Uploaded videos are archived under each teacher’s profile and categorized by topic and course. Students can explore their teacher’s content in a way similar to browsing YouTube channels—encouraging deeper exploration and ongoing learning.",
        },
        {
          title: "Communication and Support",
          body:
            "Teachers can reach out to platform admins via a built-in chat or report system. This ensures smooth collaboration, allows teachers to request support, and helps maintain the quality and accuracy of all uploaded content.",
        },
      ],
      cta: { title: "Ready to start teaching? Let’s go!", btn: "Create Your Course", to: "/create-course" },
    },
  };

  const PUBLISHING = {
    heroTitle: "Publish and Share Your Knowledge",
    heroSub:
      "Easily upload your lessons, videos, and resources to the platform.",
    heroImg: TeachingPic3,
    sections: [
      {
        title: "Content Types and Formats",
        body:
          "Teachers can upload a variety of educational materials—video lectures, PDF documents, images, and supporting files. This gives them flexibility to explain in their preferred style and create engaging, informative resources for students following their assigned learning paths.",
      },
      {
        title: "Upload Flow and Moderation",
        body:
          "Uploaded content doesn’t go live immediately. Every submission enters a waiting list to be reviewed by platform admins or support. This ensures quality and appropriateness of the material. Teachers also have the option to save their uploads as drafts and edit or schedule them for later submission.",
      },
      {
        title: "Interaction and Feedback",
        body:
          "Once approved and published, content becomes visible to students who can like, rate, and engage with it. These interactions are reflected in the teacher’s profile, providing valuable feedback and helping students identify helpful resources.",
      },
      {
        title: "Ownership and Guidelines",
        body:
          "Teachers retain full ownership of the content they upload. However, all materials must follow platform guidelines—no nudity or inappropriate clothing, and teachers are encouraged to dress professionally in any video content. This helps maintain a formal and respectful learning environment.",
      },
    ],
    cta: { title: "Publish your videos, content here!", btn: "Publish your content", to: "/upload" },
  };

  const COMMUNITY = {
    heroTitle: "Connect and Grow Together",
    heroSub:
      "Join a vibrant community of educators and learners. Collaborate, exchange ideas, and support each other through interactive forums and group discussions.",
    heroImg: TeachingPic4,
    sections: [
      {
        title: "Engaging with Others",
        body:
          "Our platform encourages students and teachers to build a supportive educational environment. Users can like, comment on, and discuss learning materials, helping each other understand difficult concepts and celebrate progress.",
      },
      {
        title: "Teacher Profiles and Student Feedback",
        body:
          "Each teacher has a public profile displaying their content and student ratings. This helps students discover instructors who match their learning style and fosters trust between learners and educators.",
      },
      {
        title: "Student Forums and Peer Help",
        body:
          "Students can interact in dedicated discussion boards or course-based chatrooms to ask questions, share tips, or solve problems together. It’s a space to grow through shared knowledge and collaboration.",
      },
      {
        title: "Admin & Teacher Communication",
        body:
          "Teachers can directly reach out to platform admins or support through an integrated chat/report system. Whether it’s for questions, feedback, or assistance—help is always available.",
      },
      {
        title: "Safe and Inclusive Space",
        body:
          "We prioritize a respectful and inclusive atmosphere, especially for students with autism or Down syndrome. Our moderation system ensures a safe environment for all members of our community.",
      },
    ],
    cta: { title: "Join the community of instructors!", btn: "Join the community", to: "/community" },
  };

  const NEWS = {
    heroTitle: "Stay Updated",
    heroSub:
      "Check the latest news, updates, and announcements on LearnEase. Stay informed about platform improvements, upcoming events, and success stories from our community.",
    heroImg: TeachingPic5,
    sections: [
      {
        title: "1. Platform Updates & Announcements",
        body:
          "Stay informed with the latest changes to our platform — from new features and UI improvements to backend upgrades and accessibility enhancements.",
      },
      {
        title: "2. New Courses & Learning Paths",
        body:
          "We regularly update our course library. Get notified when new learning paths or specialized content for autism and Down syndrome support is released.",
      },
      {
        title: "3. Teacher Spotlights",
        body:
          "Celebrate outstanding educators! We highlight top-rated or most active teachers, showcasing their contributions, expertise, and student impact.",
      },
      {
        title: "4. Community Events & Live Sessions",
        body:
          "Catch up on platform-hosted webinars, Q&A sessions, and upcoming live class features. This section keeps users in the loop with real-time learning opportunities.",
      },
      {
        title: "5. Educational News & Research",
        body:
          "Stay ahead with curated news and research about inclusive education, teaching strategies, and advancements in learning technologies for special needs students.",
      },
    ],
    cta: { title: "Get Feedback from Admins", btn: "Get Feedback", to: "/feedback" },
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

  return (
    <div className="tc-root">
      {/* HEADER */}
      <header className="tc-header">
        <div className="tc-header-inner">
          <div className="tc-brand" onClick={() => navigate("/")}>
            <img
              src={Logo}
              alt="LearnEase"
              className="tc-logo-img"
              width={155}
              height={45}
            />
          </div>

          <nav className="tc-nav">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); switchTab("teaching"); }}
              className={tab === "teaching" ? "tc-active" : ""}
              aria-current={tab === "teaching" ? "page" : undefined}
            >
              Teaching on LearnEase
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); switchTab("publishing"); }}
              className={tab === "publishing" ? "tc-active" : ""}
              aria-current={tab === "publishing" ? "page" : undefined}
            >
              Publishing
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); switchTab("community"); }}
              className={tab === "community" ? "tc-active" : ""}
              aria-current={tab === "community" ? "page" : undefined}
            >
              Community
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); switchTab("news"); }}
              className={tab === "news" ? "tc-active" : ""}
              aria-current={tab === "news" ? "page" : undefined}
            >
              News
            </a>
          </nav>

          <div className="tc-search">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21 21l-4.2-4.2m1.4-5.3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input placeholder="Search for anything" />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="tc-hero">
        <div className="tc-hero-inner">
          <div className="tc-hero-copy">
            <Link to="/InstructorDash" className="tc-back">
              ‹ Back to dashboard
            </Link>
            <h1 className="tc-hero-title">{current.heroTitle}</h1>
            <p className="tc-hero-sub">{current.heroSub}</p>
          </div>

          <div className="tc-hero-illus">
            <img
              src={current.heroImg}
              alt="section hero"
              className={`tc-hero-img ${page === 2 ? "tc-hero-img--sm" : ""}`}
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="tc-content">
        {/* teaching pager (only on Teaching tab) */}
        {tab === "teaching" && (
          <div className="tc-pagination" role="tablist" aria-label="Teaching pages">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(1); }}
              aria-current={page === 1 ? "page" : undefined}
              style={{ textDecoration: page === 1 ? "underline" : "none" }}
            >
              1
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(2); }}
              aria-current={page === 2 ? "page" : undefined}
              style={{ textDecoration: page === 2 ? "underline" : "none" }}
            >
              2
            </a>
          </div>
        )}

        {/* sections */}
        {current.sections.map((s, i) => (
          <section className="tc-block" key={`${tab}-${i}`}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </section>
        ))}

        {/* CTA */}
        <section className="tc-cta">
          <h3>{current.cta.title}</h3>
          <button
            className="tc-primary-btn"
            onClick={() => navigate(current.cta.to)}
          >
            {current.cta.btn}
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
