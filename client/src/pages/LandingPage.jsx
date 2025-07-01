import React from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "../components/navigation-menu";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";
import {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import './LandingPage.css';

function LandingPage() {
  const navLinks = [
    { text: "Home", href: "#" },
    { text: "FAQ", href: "#" },
    { text: "About Us", href: "#" },
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

  return (
    <div className="page-wrapper">
      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="logo">Logo</div>
        <ul className="nav-list">
          {navLinks.map((link, i) => (
            <li key={i}><a href={link.href}>{link.text}</a></li>
          ))}
          <li><a href="#">Become a teacher</a></li>
        </ul>
        <div className="nav-actions">
          <button className="button-login">Login</button>
          <button className="button-signup">Sign Up</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section-bg">
        <div className="hero-content">
          <h1 className="hero-title">Online Classes for Kids & Teens with Down Syndrome</h1>
          <ul className="hero-features">
            {features.map((f, i) => (
              <li key={i}><span className="feature-icon">{f.icon}</span> {f.text}</li>
            ))}
          </ul>
          <button className="get-started">Get started</button>
        </div>
        <div className="hero-images">
          <img src="./public/yellowShape.png" alt="Yellow Shape" className="yellow-shape" />
          <img src="./public/childPhoto.png" alt="Child" className="child-photo" />
          <img src="./public/heart.png" alt="Heart" className="heart-icon" />
          <img src="./public/leftSign.png" alt="Left Sign" className="left-sign" />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="card-section">
        <h2 className="section-title">WHO WE ARE</h2>
        <p className="section-desc">Empowering students with special needs through personalized, compassionate, and effective online learning.</p>
        <div className="card-list">
          {cards.map((card, i) => (
            <div className="card" key={i}>
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <h2 className="section-title">FAQ</h2>
        <ul className="faq-list">
          {faqItems.map((q, i) => (
            <li className="faq-item" key={i}>
              <details>
                <summary>{q}</summary>
                <div className="faq-answer">Answer coming soon.</div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* TEACHER SECTION */}
      <section className="teacher-section">
        <h2 className="section-title">BECOME A TEACHER IN <span className="brand">LearnEase</span></h2>
        <p className="section-desc">Make a difference in the lives of children with special needs. Join our community of dedicated educators.</p>
        <p className="section-desc">Are you passionate about inclusive education? We're always looking for qualified and caring teachers to help kids with Down syndrome and autism thrive. Share your knowledge, inspire growth, and be part of an impactful journey.</p>
        <button className="start-teaching">Start Teaching</button>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="newsletter-section">
        <div className="newsletter-card">
          <img src="/newsletter-illustration.png" alt="Newsletter" className="newsletter-img" />
          <div className="newsletter-content">
            <div className="newsletter-title">STAY CONNECTED WITH US</div>
            <div className="newsletter-desc">Be the first to receive updates about new features, class schedules, personalized learning tips, and platform improvements – straight to your inbox. <b>Subscribe today and stay ahead!</b></div>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="newsletter-input" />
              <button className="newsletter-btn">NOTIFY ME</button>
            </form>
            <div className="newsletter-disclaimer">Your email is safe with us. No spam, just useful updates.</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>LearnEase</h2>
            <p>Empowering personalized education for every learner.</p>
            <div>Email: support@Learnease.com<br />Phone: +123 456 7890</div>
          </div>
          <div className="footer-links">
            <ul>
              {mainLinks.map((link, i) => (
                <li key={i}><a href="#">{link}</a></li>
              ))}
            </ul>
            <ul>
              {legalLinks.map((link, i) => (
                <li key={i}><a href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© 2025 LearnEase™. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default LandingPage;
