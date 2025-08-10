import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import Newsletter from "../assets/newsletter.png";
import { Link, useNavigate } from "react-router-dom";
import Landingpicture from "../assets/landingpicture.png";
import Instructor from "../assets/instructor.png";
import Logo from "../assets/logo.png";

function LandingPage() {
  const navigate = useNavigate();
  const goToLogin = () => navigate("/InstructorLogin");

  const navLinks = [
    { text: "Home", href: "#home" },
    { text: "Who We Are", href: "#who-we-are" },
    { text: "FAQ", href: "#faq" },
    { text: "Become a Teacher", href: "#become-a-teacher" },
    { text: "Newsletter", href: "#newsletter" },
  ];
  const features = [
    { icon: "📚", text: "Interactive personalized learning experience" },
    { icon: "🎓", text: "Trusted and qualified special needs educators" },
    { icon: "🌟", text: "Grow with confidence and track progress" },
  ];
  const cards = [
    { icon: "🎯", title: "Personalized Learning", description: "Each student follows a path tailored to their pace, needs, and strengths — making learning engaging and accessible." },
    { icon: "👩", title: "Special Needs Experts", description: "Our teachers are trained to support kids and teens with Down Syndrome and Autism, ensuring understanding and care." },
    { icon: "💬", title: "Supportive Community", description: "We collaborate with parents, caregivers, and professionals to build confidence and consistent progress for every learner." },
  ];
  const mainLinks = ["Home", "About Us", "FAQ", "Teach on Edu", "Contact"];
  const legalLinks = ["Help Center", "Privacy Policy", "Terms & Conditions"];

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const base = import.meta?.env?.VITE_API_URL || "";
    fetch(`${base}/api/reviews?published=1`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]));
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="land-root land-page-wrapper">
      {/* NAVIGATION */}
      <nav className="land-navbar">
        <img src={Logo} alt="logo image" className="land-logo" />
        <ul className="land-nav-list">
          {navLinks.map((link, i) => (
            <li key={i}><a href={link.href}>{link.text}</a></li>
          ))}
        </ul>
        <div className="land-nav-actions">
          <button className="land-button-login" onClick={() => navigate("/login")}>Login</button>
          <button className="land-button-signup" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="land-hero-section-bg">
        <div className="land-hero-content">
          <h1 className="land-hero-title">Online Classes for Kids & Teens with Down Syndrome</h1>
          <ul className="land-hero-features">
            {features.map((f, i) => (
              <li key={i}><span className="land-feature-icon">{f.icon}</span> {f.text}</li>
            ))}
          </ul>
          <button className="land-get-started">Get started</button>
        </div>
        <img src={Landingpicture} alt="landing" className="land-landing-picture" />
      </section>

      {/* WHO WE ARE */}
      <section id="who-we-are" className="land-card-section">
        <h2 className="land-section-title">WHO WE ARE</h2>
        <p className="land-section-desc">Empowering students with special needs through personalized, compassionate, and effective online learning.</p>
        <div className="land-card-list">
          {cards.map((card, i) => (
            <div className={`land-card${i === 1 ? " land-card-highlighted" : ""}`} key={i}>
              <div className="land-card-line land-top"></div>
              <div className="land-card-icon">{card.icon}</div>
              <div className="land-card-title">{card.title}</div>
              <div className="land-card-desc">{card.description}</div>
              <div className="land-card-line land-bottom"></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="land-faq-section">
        <h2 className="land-faq-gradient">FAQ</h2>
        <ul className="land-faq-list">
          <li className="land-faq-item">
            <details>
              <summary>Who are the classes for?</summary>
              <div className="land-faq-answer">Our classes are specially designed for kids and teens with Down Syndrome or similar learning needs.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>Are the teachers qualified?</summary>
              <div className="land-faq-answer">Yes, all our teachers are trained in special education and have experience working with children with special needs.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>How do I become a teacher on this platform?</summary>
              <div className="land-faq-answer">Click "Teach on Edu" and fill out your information. We'll review and get back to you quickly.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>How do I sign up my child?</summary>
              <div className="land-faq-answer">Click on the "Sign Up" button at the top right, then fill in your child's details. It's easy and takes only a few minutes.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>What devices can I use?</summary>
              <div className="land-faq-answer">You can use any device with a browser—phone, tablet, or computer.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>Can I see my child's progress?</summary>
              <div className="land-faq-answer">Yes, parents get regular updates and reports about their child's learning and engagement.</div>
            </details>
          </li>
          <li className="land-faq-item">
            <details>
              <summary>Are the classes live or recorded?</summary>
              <div className="land-faq-answer">Currently, all our classes are pre-recorded to give students the flexibility to learn at their own pace. However, we're working on introducing live video classes in future updates to enhance interactivity and engagement.</div>
            </details>
          </li>
        </ul>
      </section>

      {/* TEACHER */}
      <section id="become-a-teacher" className="land-teacher-section">
        <h2 className="land-section-title">BECOME A TEACHER IN <span className="land-brand">LearnEase</span></h2>
        <p className="land-section-desc">Make a difference in the lives of children with special needs. Join our community of dedicated educators.</p>
        <p className="land-section-desc">Are you passionate about inclusive education? We're always looking for qualified and caring teachers to help kids with Down syndrome and autism thrive. Share your knowledge, inspire growth, and be part of an impactful journey.</p>
        <img src={Instructor} alt="instructor" className="land-instructor" />
        <button className="land-start-teaching" onClick={goToLogin}>Start Teaching</button>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="land-newsletter-section">
        <div className="land-newsletter-card">
          <img src={Newsletter} alt="Newsletter" className="land-newsletter-illustration" />
          <div className="land-newsletter-content">
            <div className="land-newsletter-title">STAY CONNECTED WITH US</div>
            <div className="land-newsletter-headline">
              <span className="land-newsletter-get">GET</span>
              <span className="land-newsletter-highlight">LearnEase</span>
              <span className="land-newsletter-updates">UPDATES</span>
            </div>
            <div className="land-newsletter-desc">
              Be the first to receive updates about new features, class schedules, personalized learning tips, and platform improvements – straight to your inbox.<br />
              <b>Subscribe today and stay ahead!</b>
            </div>
            <form className="land-newsletter-form">
              <input type="email" placeholder="Enter your email address" className="land-newsletter-input" />
              <button className="land-newsletter-btn">NOTIFY ME</button>
            </form>
            <div className="land-newsletter-disclaimer">Your email is safe with us. No spam, just useful updates.</div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="land-reviews-section">
        <h2 className="land-reviews-title">WHAT PARENTS SAY</h2>
        <div className="land-review-grid">
          {reviews.map(r => (
            <div className="land-review-card" key={r.id || `${r.name}-${r.createdAt || Math.random()}`}>
              <div className="land-review-header">
                <div className="land-review-avatar">{(r.name || "?").charAt(0)}</div>
                <div className="land-review-meta">
                  <div className="land-review-name">{r.name}</div>
                  <div className="land-review-relation">{r.relation}</div>
                </div>
              </div>
              <div className="land-review-stars">
                {"★".repeat(r.rating || 0)}
                {"☆".repeat(5 - (r.rating || 0))}
              </div>
              <p className="land-review-text">{r.text}</p>
            </div>
          ))}
          {reviews.length === 0 && <div className="land-review-empty">No reviews yet.</div>}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="land-footer-main">
          <ul className="land-footer-col">
            {mainLinks.map((link, i) => (
              <li key={i}><a href="#">{link}</a></li>
            ))}
          </ul>
          <ul className="land-footer-col">
            {legalLinks.map((link, i) => (
              <li key={i}><a href="#">{link}</a></li>
            ))}
          </ul>
          <div className="land-footer-contact">
            <div>Email: support@learnease.com</div>
            <div>Phone: 05979797979</div>
            <div>Address: Blbala, Magusa, North Cyprus</div>
          </div>
        </div>
        <div className="land-footer-bottom">
          <img src={Logo} alt="LearnEase" className="land-footer-logo" />
          <span>LearnEase © 2025 — All rights reserved.</span>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button
        className={`land-scroll-to-top-btn${showScrollTop ? " land-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}

export default LandingPage;
