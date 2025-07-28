import React, { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "../components/navigation-menu";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";
import {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import './LandingPage.css';
import Newsletter from '../assets/newsletter.png';
import { useNavigate } from 'react-router-dom';
import Landingpicture from "../assets/landingpicture.png";
import Instructor from "../assets/instructor.png";
import Logo from "../assets/logo.png";

function LandingPage() {
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
    {
      icon: "🎯",
      title: "Personalized Learning",
      description:
        "Each student follows a path tailored to their pace, needs, and strengths — making learning engaging and accessible.",
    },
    {
      icon: "👩",
      title: "Special Needs Experts",
      description:
        "Our teachers are trained to support kids and teens with Down Syndrome and Autism, ensuring understanding and care.",
    },
    {
      icon: "💬",
      title: "Supportive Community",
      description:
        "We collaborate with parents, caregivers, and professionals to build confidence and consistent progress for every learner.",
    },
  ];
  const faqItems = [
    "Who are the classes for?",
    "Are the teachers qualified?",
    "Are the classes live or recorded?",
    "How do I sign up my child?",
    "What devices can I use?",
    "Can I see my child's progress?",
    "How do I become a teacher on this platform?",
  ];
  const mainLinks = ["Home", "About Us", "FAQ", "Teach on Edu", "Contact"];
  const legalLinks = ["Help Center", "Privacy Policy", "Terms & Conditions"];

  // Scroll to top button logic
  const [showScrollTop, setShowScrollTop] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 120); // Show after scrolling 120px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // state + fetch (put near other state/hooks)
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const base = import.meta?.env?.VITE_API_URL || "";
    fetch(`${base}/api/reviews?published=1`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]));
  }, []);


  return (
    <div className="page-wrapper">
      {/* NAVIGATION */}
      <nav className="navbar">
        <img src={Logo} alt="logo image" className="logo"/>
        <ul className="nav-list">
          {navLinks.map((link, i) => (
            <li key={i}><a href={link.href}>{link.text}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="button-login" onClick={() => navigate('/login')}>Login</button>
          <button className="button-signup" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero-section-bg">
        <div className="hero-content">
          <h1 className="hero-title">Online Classes for Kids & Teens with Down Syndrome</h1>
          <ul className="hero-features">
            {features.map((f, i) => (
              <li key={i}><span className="feature-icon">{f.icon}</span> {f.text}</li>
            ))}
          </ul>
          <button className="get-started">Get started</button>
        </div>
        <img src={Landingpicture} alt="landing picture" className="landing-picture" />
      </section>

      {/* WHO WE ARE */}
      <section id="who-we-are" className="card-section">
        <h2 className="section-title">WHO WE ARE</h2>
        <p className="section-desc">Empowering students with special needs through personalized, compassionate, and effective online learning.</p>
        <div className="card-list">
          {cards.map((card, i) => (
            <div className={`card${i === 1 ? " card-highlighted" : ""}`} key={i}>
              <div className="card-line top"></div>
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.description}</div>
              <div className="card-line bottom"></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="faq-section">
        <h2 className="faq-gradient">FAQ</h2>
        <ul className="faq-list">
          <li className="faq-item">
            <details>
              <summary>Who are the classes for?</summary>
              <div className="faq-answer">
                Our classes are specially designed for kids and teens with Down Syndrome or similar learning needs.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>Are the teachers qualified?</summary>
              <div className="faq-answer">
                Yes, all our teachers are trained in special education and have experience working with children with special needs.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>How do I become a teacher on this platform?</summary>
              <div className="faq-answer">
                Click "Teach on Edu" and fill out your information. We'll review and get back to you quickly.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>How do I sign up my child?</summary>
              <div className="faq-answer">
                Click on the "Sign Up" button at the top right, then fill in your child's details. It's easy and takes only a few minutes.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>What devices can I use?</summary>
              <div className="faq-answer">
                You can use any device with a browser—phone, tablet, or computer.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>Can I see my child's progress?</summary>
              <div className="faq-answer">
                Yes, parents get regular updates and reports about their child's learning and engagement.
              </div>
            </details>
          </li>
          <li className="faq-item">
            <details>
              <summary>Are the classes live or recorded?</summary>
              <div className="faq-answer">
                Currently, all our classes are pre-recorded to give students the flexibility to learn at their own pace. However, we're working on introducing live video classes in future updates to enhance interactivity and engagement.
              </div>
            </details>
          </li>
        </ul>
      </section>

      {/* TEACHER SECTION */}
      <section id="become-a-teacher" className="teacher-section">
        <h2 className="section-title">BECOME A TEACHER IN <span className="brand">LearnEase</span></h2>
        <p className="section-desc">Make a difference in the lives of children with special needs. Join our community of dedicated educators.</p>
        <p className="section-desc">Are you passionate about inclusive education? We're always looking for qualified and caring teachers to help kids with Down syndrome and autism thrive. Share your knowledge, inspire growth, and be part of an impactful journey.</p>
        <img src={Instructor} alt="instructor" className="instructor"/>
        <button className="start-teaching">Start Teaching</button>
      </section>

      {/* NEWSLETTER SECTION */}
      <section id="newsletter" className="newsletter-section">
        <div className="newsletter-card">
          <img src={Newsletter} alt="Newsletter" className="newsletter-illustration" />
          <div className="newsletter-content">
            <div className="newsletter-title">STAY CONNECTED WITH US</div>
            <div className="newsletter-headline">
              <span className="newsletter-get">GET</span>
              <span className="newsletter-highlight">LearnEase</span>
              <span className="newsletter-updates">UPDATES</span>
            </div>
            <div className="newsletter-desc">Be the first to receive updates about new features, class schedules, personalized learning tips, and platform improvements – straight to your inbox.<br/><b>Subscribe today and stay ahead!</b></div>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="newsletter-input" />
              <button className="newsletter-btn">NOTIFY ME</button>
            </form>
            <div className="newsletter-disclaimer">Your email is safe with us. No spam, just useful updates.</div>
          </div>
        </div>
      </section>

      {/* REVIEWS (auto from admin-published) */}
      <section id="reviews" className="reviews-section">
        <h2 className="reviews-title">WHAT PARENTS SAY</h2>
        <div className="review-grid">
          {reviews.map((r) => (
            <div className="review-card" key={r.id || `${r.name}-${r.createdAt || Math.random()}`}>
              <div className="review-header">
                <div className="review-avatar">{(r.name || "?").charAt(0)}</div>
                <div className="review-meta">
                  <div className="review-name">{r.name}</div>
                  <div className="review-relation">{r.relation}</div>
                </div>
              </div>
              <div className="review-stars">
                {"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
          {reviews.length === 0 && <div className="review-empty">No reviews yet.</div>}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-main">
          <ul className="footer-col">
            {mainLinks.map((link, i) => (
              <li key={i}><a href="#">{link}</a></li>
            ))}
          </ul>

          <ul className="footer-col">
            {legalLinks.map((link, i) => (
              <li key={i}><a href="#">{link}</a></li>
            ))}
          </ul>

          <div className="footer-contact">
            <div>Email: support@learnease.com</div>
            <div>Phone: 05979797979</div>
            <div>Address: Blbala, Magusa, North Cyprus</div>
          </div>
        </div>

        <div className="footer-bottom">
          <img src={Logo} alt="LearnEase" className="footer-logo" />
          <span>LearnEase © 2025 — All rights reserved.</span>
        </div>
      </footer>
      
      {/* Scroll to Top Button */}
      <button
        className={`scroll-to-top-btn${showScrollTop ? " visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}

export default LandingPage;