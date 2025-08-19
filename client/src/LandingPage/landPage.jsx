import React, { useMemo, useRef, useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import Logo2 from "../assets/fullLogo.png";
import illus from "../assets/illustration.png";
import "./landPage.css";
export const REVIEWS_DEMO = [
  { id: "r1", rating: 5, text: "The visual schedules and short activities keep my son calm and engaged. We finally see steady progress.", authorName: "Amina", authorRole: "Parent" },
  { id: "r2", rating: 5, text: "AI suggestions helped me adapt lessons quickly. Students love the picture-based tasks.", authorName: "Selim", authorRole: "Teacher" },
  { id: "r3", rating: 4, text: "Reports are simple to share with therapists. We’re aligned on goals each week.", authorName: "Derya", authorRole: "Parent" },
  { id: "r4", rating: 5, text: "I can plan sensory breaks and use social stories easily. Huge time saver.", authorName: "Marc", authorRole: "Teacher" },
  { id: "r5", rating: 5, text: "I can plan sensory breaks and use social stories easily. Huge time saver.", authorName: "Marc", authorRole: "Teacher" },
  { id: "r6", rating: 5, text: "I can plan sensory breaks and use social stories easily. Huge time saver.", authorName: "Marc", authorRole: "Teacher" },
  { id: "r7", rating: 1, text: "wlad l97ab kheoroni makaina la kraya la wlo gha zho ", authorName: "Marc", authorRole: "Teacher" },
];
export default function LandingPage({ logoSrc = "/assets/fullLogo.png", onSignup }) {
  const stars = (n) => "★".repeat(Math.max(0, n)) + "☆".repeat(Math.max(0, 5 - n));
  const [reviews, setReviews] = useState(REVIEWS_DEMO);
  const [faqOpen, setFaqOpen] = useState({});
  const [newsEmail, setNewsEmail] = useState("");
  const [newsMsg, setNewsMsg] = useState("");
  const revTrackRef = useRef(null);
  const year = useMemo(() => new Date().getFullYear(), []);

  const onRevPrev = () => revTrackRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const onRevNext = () => revTrackRef.current?.scrollBy({ left: 320, behavior: "smooth" });
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

  const becomeInstructor = () => {
    if (onSignup) onSignup(); else window.location.href = "/InstructorSignUp1";
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="landPage-nav-wrap">
        <nav className="landPage-container landPage-nav">
          <a href="#home" className="landPage-brand">
            <img src={Logo} alt="Platform logo" />
          </a>
          <div className="landPage-nav-links">
            <a href="#home">Home</a>
            <a href="#who">Who We Are</a>
            <a href="#faq">FAQ</a>
            <a href="#newsletter">Newsletter</a>
            <a href="#reviews">Reviews</a>
            <a href="#start-teaching" className="landPage-pill">Start Teaching</a>
            <a href="/login" className="landPage-btn landPage-ghost">Log in</a>
            <a href="/signup" className="landPage-btn">Sign up</a>
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
              <a className="landPage-btn" href="/signup">Get Started</a>
              <a className="landPage-btn landPage-outline" href="#who">Learn more</a>
            </div>
          </div>
          <div className="landPage-hero-card">
            <strong>Today’s snapshot</strong>
            <div className="landPage-grid-2 landPage-mt-12">
              <div className="landPage-card landPage-p-14">
                <div className="landPage-muted landPage-sm-text">Active students</div>
                <div className="landPage-stat">1,248</div>
              </div>
              <div className="landPage-card landPage-p-14">
                <div className="landPage-muted landPage-sm-text">Certified teachers</div>
                <div className="landPage-stat">312</div>
              </div>
            </div>
            <ul className="landPage-checklist landPage-mt-12">
              <li><span className="landPage-icon">✔</span>IEP-friendly goals & visual supports</li>
              <li><span className="landPage-icon">✔</span>Sensory-aware activities & schedules</li>
              <li><span className="landPage-icon">✔</span>Parent dashboard & simple reports</li>
            </ul>
          </div>
        </div>
      </header>

      {/* WHO WE ARE */}
      <section id="who" className="landPage-section">
        <div className="landPage-container landPage-two-col">
          <div>
            <h2 className="landPage-title">Who we are</h2>
            <p className="landPage-subtitle">We’re an inclusive learning platform built with specialists. Our mission: empower teachers and families to deliver consistent, joyful learning experiences for students with autism and Down syndrome.</p>
            <div className="landPage-grid-2">
              <div className="landPage-card">
                <strong>Special-education focus</strong>
                <p className="landPage-muted">Structured routines, visual schedules, PECS-style prompts, and behavioral supports.</p>
              </div>
              <div className="landPage-card">
                <strong>AI personalization</strong>
                <p className="landPage-muted">Adaptive activities and pacing based on student attention, sensory needs, and mastery.</p>
              </div>
            </div>
          </div>
          <img className="landPage-illus" src={illus} alt="LearnEase illustration" />
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
              <button className="landPage-btn" onClick={becomeInstructor}>Become an Instructor</button>
              <a className="landPage-btn landPage-outline" href="#faq">See teacher FAQs</a>
            </div>
          </div>
          <div className="landPage-card">
            <strong>What you’ll need</strong>
              <ol className="landPage-muted landPage-pad-left-18">
              <li>Teaching background or caregiving experience</li>
              <li>Willingness to follow IEP-friendly routines</li>
              <li>Commitment to accessibility & patience</li>
            </ol>
            <div className="landPage-muted landPage-mt-10">You can set availability and pricing. We’ll support you with resources and community.</div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="landPage-section landPage-reviews">
        <div className="landPage-container">
          <h2 className="landPage-title">What families & teachers say</h2>
          <p className="landPage-subtitle">Real feedback from our community.</p>

          <div className="landPage-rev-viewport">
            <div className="landPage-rev-track landPage-auto" aria-label="Reviews carousel">
              {[...reviews, ...reviews].map((r, i) => (
                <article
                  key={`${r.id}-${i}`}
                  className="landPage-rev-card"
                  aria-hidden={i >= reviews.length ? "true" : undefined}
                >
                  <div className="landPage-stars">{stars(r.rating)}</div>
                  <p>“{r.text}”</p>
                  <small className="landPage-muted">— {r.authorName}, {r.authorRole}</small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

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

            {/* changed class + added control classes */}
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
              <img src={Logo2} alt="Platform logo" />
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
              <a href="/signup">Sign up</a>
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
