import React, { useMemo, useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import "./landPage.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LandingPage() {
  const stars = (n) => "★".repeat(Math.max(0, n)) + "☆".repeat(Math.max(0, 5 - n));
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  // Fetch visible feedbacks from API (only admin-approved feedbacks)
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/feedback/visible`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            // Transform feedback data to review format
            const feedbackReviews = result.data.map((f, index) => ({
              id: f._id?.toString() || `fb-${index}`,
              rating: f.rating || 5,
              text: f.description || "",
              authorName: f.userName || "User",
              authorRole: f.topic || "User"
            }));
            setReviews(feedbackReviews);
          } else {
            setReviews([]);
          }
        }
      } catch (error) {
        console.error('Error fetching visible feedbacks:', error);
        setReviews([]);
      }
    };
    fetchFeedbacks();
  }, []);

  // Fetch snapshot statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stats/snapshot`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching snapshot statistics:', error);
        // Keep default values if API fails
      }
    };
    fetchStats();
  }, []);
  const [faqOpen, setFaqOpen] = useState({});
  const [newsEmail, setNewsEmail] = useState("");
  const [newsMsg, setNewsMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  const toggleFaq = (i) => setFaqOpen(prev => ({ ...prev, [i]: !prev[i] }));
  const faqItems = [
    { q: "How does the AI personalize learning?", a: "It adapts tasks by difficulty, supports (visual/auditory prompts), and pacing based on progress and attention patterns." },
    { q: "Is LearnEase suitable for Down syndrome and autism?", a: "Yes. The platform is co-designed with specialists and families, focusing on structure, clarity, and sensory-aware activities." },
    { q: "Can parents see progress?", a: "Parents get simple weekly reports, goals, and shared routines, plus messaging with teachers." },
    { q: "Who are the classes for?", a: "Our classes are specially designed for kids and teens with Down Syndrome or similar learning needs." },
    { q: "Are the teachers qualified?", a: "Yes, all our teachers are trained in special education and have experience working with children with special needs." },
    { q: "How do I become a teacher on this platform?", a: "Click 'Teach on Edu' and fill out your information. We'll review and get back to you quickly." },
    { q: "How do I sign up my child?", a: "Click on the 'Sign Up' button at the top right, then fill in your child's details. It's easy and takes only a few minutes." },
    { q: "What devices can I use?", a: "You can use a browser for now, but we are planning to add more devices in the future" },
    { q: "Are the classes live or recorded?", a: "Currently, all our classes are pre-recorded to give students the flexibility to learn at their own pace. However, we're working on introducing live video classes in future updates to enhance interactivity and engagement." },
  ];
  const handleNewsSubmit = (e) => {
    e.preventDefault();
    const valid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(newsEmail);
    if (!valid) { setNewsMsg("Please enter a valid email."); return; }
    setNewsMsg("Subscribed! Check your inbox for confirmation.");
    setNewsEmail("");
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="landPage-nav-wrap">
        <nav className="landPage-container landPage-nav">
          <a href="#home" className="landPage-brand" onClick={() => setMobileMenuOpen(false)}>
            <img src={Logo} alt="Platform logo" />
          </a>
          <button
            className="landPage-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={mobileMenuOpen ? "landPage-open" : ""}></span>
            <span className={mobileMenuOpen ? "landPage-open" : ""}></span>
            <span className={mobileMenuOpen ? "landPage-open" : ""}></span>
          </button>
          <div className={`landPage-nav-links ${mobileMenuOpen ? "landPage-mobile-open" : ""}`}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#who" onClick={() => setMobileMenuOpen(false)}>Who We Are</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <a href="#newsletter" onClick={() => setMobileMenuOpen(false)}>Newsletter</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <a href="#start-teaching" className="landPage-pill" onClick={() => setMobileMenuOpen(false)}>Start Teaching</a>
            <a href="/all-login" className="landPage-btn landPage-ghost" onClick={() => setMobileMenuOpen(false)}>Log in</a>
            <a href="/all-signup" className="landPage-btn landPage-ghost" onClick={() => setMobileMenuOpen(false)}>Sign up</a>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <header id="home" className="landPage-hero">
        <div className="landPage-container landPage-hero-grid">
          <div>
            <div className="landPage-hero-badges">
              <span className="landPage-pill">Autism & Down Syndrome</span>
              <span className="landPage-pill">Personalized with AI</span>
              <span className="landPage-pill">Verified Teachers</span>
            </div>
            <h1 className="landPage-title">Personalized learning for every unique mind.</h1>
            <p className="landPage-subtitle">Our platform connects students with autism and Down syndrome to caring teachers. AI adapts lessons to each learner. Families see progress. Teachers get tools.</p>
            <div className="landPage-cta-row">
              <a className="landPage-btn landPage-ghost" href="/all-signup">Get Started</a>
              <a className="landPage-btn landPage-outline" href="#who">Learn more</a>
            </div>
          </div>
          <div className="landPage-hero-card">
            <strong>Today's snapshot</strong>
            <div className="landPage-grid-2 landPage-mt-12">
              <div className="landPage-card landPage-p-14">
                <div className="landPage-muted landPage-sm-text">Active students</div>
                <div className="landPage-stat">{stats.students.toLocaleString()}</div>
              </div>
              <div className="landPage-card landPage-p-14">
                <div className="landPage-muted landPage-sm-text">Certified teachers</div>
                <div className="landPage-stat">{stats.teachers.toLocaleString()}</div>
              </div>
            </div>
            <ul className="landPage-checklist landPage-mt-12">
              <li><span className="landPage-icon">✔</span>AI-powered quiz generation & personalization</li>
              <li><span className="landPage-icon">✔</span>Diagnostic assessment & personalized paths</li>
              <li><span className="landPage-icon">✔</span>Progress tracking & achievement system</li>
            </ul>
          </div>
        </div>
      </header>

      {/* WHO WE ARE */}
      <section id="who" className="landPage-section landPage-who-section">
        <div className="landPage-container">
          <div className="landPage-who-header">
            <h2 className="landPage-title">Who we are</h2>
            <p className="landPage-subtitle landPage-who-subtitle">
              We're an inclusive learning platform built with specialists. Our mission is to empower teachers and families to deliver consistent, joyful learning experiences for students with autism and Down syndrome.
            </p>
          </div>

          <div className="landPage-who-features">
            <div className="landPage-who-feature-card">
              <div className="landPage-who-feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Special-Education Focus</h3>
              <p>Structured routines, visual schedules, PECS-style prompts, and behavioral supports designed by experts in special education.</p>
            </div>

            <div className="landPage-who-feature-card">
              <div className="landPage-who-feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3>AI Personalization</h3>
              <p>Adaptive activities and pacing based on student attention, sensory needs, and mastery levels for truly personalized learning.</p>
            </div>

            <div className="landPage-who-feature-card">
              <div className="landPage-who-feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Family-Centered</h3>
              <p>Simple progress reports, goal tracking, and seamless communication between teachers and families for complete transparency.</p>
            </div>

            <div className="landPage-who-feature-card">
              <div className="landPage-who-feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <h3>Expert-Built</h3>
              <p>Co-designed with specialists, therapists, and families to ensure every feature meets real-world needs and best practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* START TEACHING */}
      <section id="start-teaching" className="landPage-section landPage-teaching">
        <div className="landPage-container landPage-teaching-grid">
          <div>
            <h2 className="landPage-title">Start teaching on LearnEase</h2>
            <p className="landPage-subtitle">Join a caring community. Get templates, visual aids, and AI lesson helpers. Make a difference every week.</p>
            <ul className="landPage-checklist">
              <li><span className="landPage-icon">✔</span>Simple onboarding & verification</li>
              <li><span className="landPage-icon">✔</span>Lesson plans tailored by AI</li>
              <li><span className="landPage-icon">✔</span>Secure messaging with families</li>
            </ul>
            <div className="landPage-cta-row landPage-mt-14">
              <a className="landPage-btn landPage-ghost" href="/all-signup">Become an Instructor</a>
              <a className="landPage-btn landPage-outline" href="#faq">See teacher FAQs</a>
            </div>
          </div>
          <div className="landPage-teaching-card">
            <div className="landPage-teaching-card-header">
              <div className="landPage-teaching-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <strong>What you'll need</strong>
            </div>
            <div className="landPage-teaching-requirements">
              <div className="landPage-requirement-item">
                <div className="landPage-requirement-number">1</div>
                <div className="landPage-requirement-content">
                  <strong>Teaching background</strong>
                  <p>Teaching background or caregiving experience</p>
                </div>
              </div>
              <div className="landPage-requirement-item">
                <div className="landPage-requirement-number">2</div>
                <div className="landPage-requirement-content">
                  <strong>IEP-friendly approach</strong>
                  <p>Willingness to follow IEP-friendly routines</p>
                </div>
              </div>
              <div className="landPage-requirement-item">
                <div className="landPage-requirement-number">3</div>
                <div className="landPage-requirement-content">
                  <strong>Commitment & patience</strong>
                  <p>Commitment to accessibility & patience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS - Only show if there are admin-approved feedbacks */}
      {reviews.length > 0 && (
        <section id="reviews" className="landPage-section landPage-reviews">
          <div className="landPage-container">
            <h2 className="landPage-title">What users have to say</h2>
            <p className="landPage-subtitle">Real feedback from our community.</p>

            <div className="landPage-rev-viewport">
              <div className="landPage-rev-track landPage-auto" aria-label="Reviews carousel">
                {[...reviews, ...reviews].map((r, i) => (
                  <article
                    key={`${r.id}-${i}`}
                    className="landPage-rev-card"
                    aria-hidden={i >= reviews.length ? "true" : undefined}
                  >
                    <div className="landPage-rev-card-header">
                      <div className="landPage-rev-avatar">
                        {r.authorName ? r.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="landPage-rev-author-info">
                        <div className="landPage-rev-author-name">{r.authorName}</div>
                        <div className="landPage-rev-author-role">{r.authorRole}</div>
                      </div>
                    </div>
                    <div className="landPage-stars">{stars(r.rating)}</div>
                    <p className="landPage-rev-text">"{r.text}"</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="landPage-section">
        <div className="landPage-container">
          <h2 className="landPage-title">FAQ</h2>
          {faqItems.map((item, i) => (
            <div className={`landPage-faq-item ${faqOpen[i] ? "landPage-open" : ""}`} key={i}>
              <div className="landPage-faq-q" onClick={() => toggleFaq(i)}>
                <span>{item.q}</span>
                <span>{faqOpen[i] ? "–" : "+"}</span>
              </div>
              <div className="landPage-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>


      {/* NEWSLETTER */}
      <section id="newsletter" className="landPage-section">
        <div className="landPage-container">
          <div className="landPage-news-card">
            <div>
              <h2 className="landPage-title landPage-no-margin">Join our newsletter</h2>
              <p className="landPage-subtitle landPage-mt-6">
                Get strategies, visual aids, and new features. No spam.
              </p>
            </div>

            <form className="landPage-news-form" onSubmit={handleNewsSubmit}>
              <input
                className="landPage-news-input"
                type="email"
                placeholder="Your email"
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <button className="landPage-btn landPage-btn-news" type="submit">
                Subscribe
              </button>
              <small className="landPage-muted landPage-grid-span-2">{newsMsg}</small>
            </form>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer>
        <div className="landPage-container landPage-foot">
          <div>
            <div className="landPage-logo-lockup">
              <img src={Logo} alt="Platform logo" />
            </div>
            <p className="landPage-mt-12"><small>Inclusive learning for autism & Down syndrome. Personalized, structured, and joyful.</small></p>
          </div>
          <div>
            <strong>Product</strong>
            <div className="landPage-link-col">
              <a href="#home">Home</a>
              <a href="#who">Who We Are</a>
              <a href="#faq">FAQ</a>
              <a href="#reviews">Reviews</a>
            </div>
          </div>
          <div>
            <strong>For teachers</strong>
            <div className="landPage-link-col">
              <a href="#start-teaching">Start teaching</a>
              <a href="/all-signup">Sign up</a>
              <a href="#newsletter">Newsletter</a>
            </div>
          </div>
          <div>
            <strong>Legal</strong>
            <div className="landPage-link-col">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className="landPage-copyright">© {year} LearnEase. All rights reserved.</div>
      </footer>
    </div>
  );
}
