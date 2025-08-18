import React, { useMemo, useRef, useState } from "react";
import Logo from "../assets/Logo.png";
import "./landPage.css";

export default function LandingPage({ logoSrc = "/assets/fullLogo.png", onSignup }) {
  const [faqOpen, setFaqOpen] = useState([false, false, false]);
  const [newsEmail, setNewsEmail] = useState("");
  const [newsMsg, setNewsMsg] = useState("");
  const revTrackRef = useRef(null);
  const year = useMemo(() => new Date().getFullYear(), []);

  const onRevPrev = () => revTrackRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const onRevNext = () => revTrackRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  const toggleFaq = (i) => setFaqOpen((p) => p.map((v, idx) => (idx === i ? !v : v)));

  const handleNewsSubmit = (e) => {
    e.preventDefault();
    const valid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(newsEmail);
    if (!valid) { setNewsMsg("Please enter a valid email."); return; }
    setNewsMsg("Subscribed! Check your inbox for confirmation.");
    setNewsEmail("");
  };

  const becomeInstructor = () => {
    if (onSignup) onSignup(); else window.location.href = "/signup";
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="nav-wrap">
        <nav className="container nav">
          <a href="#home" className="brand">
            <img src={Logo} alt="Platform logo" />
          </a>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#who">Who We Are</a>
            <a href="#faq">FAQ</a>
            <a href="#newsletter">Newsletter</a>
            <a href="#reviews">Reviews</a>
            <a href="#start-teaching" className="pill">Start Teaching</a>
            <a href="/login" className="btn ghost">Log in</a>
            <a href="/signup" className="btn">Sign up</a>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <header id="home" className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-badges">
              <span className="pill">Autism & Down Syndrome</span>
              <span className="pill">Personalized with AI</span>
              <span className="pill">Verified Teachers</span>
            </div>
            <h1 className="title">Personalized learning for every unique mind.</h1>
            <p className="subtitle">Our platform connects students with autism and Down syndrome to caring teachers. AI adapts lessons to each learner. Families see progress. Teachers get tools.</p>
            <div className="cta-row">
              <a className="btn" href="/signup">Get Started</a>
              <a className="btn outline" href="#who">Learn more</a>
            </div>
          </div>
          <div className="hero-card">
            <strong>Today’s snapshot</strong>
            <div className="grid-2 mt-12">
              <div className="card p-14">
                <div className="muted sm-text">Active students</div>
                <div className="stat">1,248</div>
              </div>
              <div className="card p-14">
                <div className="muted sm-text">Certified teachers</div>
                <div className="stat">312</div>
              </div>
            </div>
            <ul className="checklist mt-12">
              <li><span className="icon">✔</span>IEP‑friendly goals & visual supports</li>
              <li><span className="icon">✔</span>Sensory‑aware activities & schedules</li>
              <li><span className="icon">✔</span>Parent dashboard & simple reports</li>
            </ul>
          </div>
        </div>
      </header>

      {/* WHO WE ARE */}
      <section id="who" className="section">
        <div className="container two-col">
          <div>
            <h2 className="title">Who we are</h2>
            <p className="subtitle">We’re an inclusive learning platform built with specialists. Our mission: empower teachers and families to deliver consistent, joyful learning experiences for students with autism and Down syndrome.</p>
            <div className="grid-2">
              <div className="card">
                <strong>Special‑education focus</strong>
                <p className="muted">Structured routines, visual schedules, PECS‑style prompts, and behavioral supports.</p>
              </div>
              <div className="card">
                <strong>AI personalization</strong>
                <p className="muted">Adaptive activities and pacing based on student attention, sensory needs, and mastery.</p>
              </div>
            </div>
          </div>
          <div className="illus">Add an illustration here</div>
        </div>
      </section>

      {/* START TEACHING */}
      <section id="start-teaching" className="section teaching">
        <div className="container teaching-grid">
          <div>
            <h2 className="title">Start teaching on LearnEase</h2>
            <p className="subtitle">Join a caring community. Get templates, visual aids, and AI lesson helpers. Make a difference every week.</p>
            <ul className="checklist">
              <li><span className="icon">✔</span>Simple onboarding & verification</li>
              <li><span className="icon">✔</span>Lesson plans tailored by AI</li>
              <li><span className="icon">✔</span>Secure messaging with families</li>
            </ul>
            <div className="cta-row mt-14">
              <button className="btn" onClick={becomeInstructor}>Become an Instructor</button>
              <a className="btn outline" href="#faq">See teacher FAQs</a>
            </div>
          </div>
          <div className="card">
            <strong>What you’ll need</strong>
            <ol className="muted pad-left-18">
              <li>Teaching background or caregiving experience</li>
              <li>Willingness to follow IEP‑friendly routines</li>
              <li>Commitment to accessibility & patience</li>
            </ol>
            <div className="muted mt-10">You can set availability and pricing. We’ll support you with resources and community.</div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section reviews">
        <div className="container">
          <h2 className="title">What families & teachers say</h2>
          <p className="subtitle">Real feedback from our community.</p>
          <div className="rev-row">
            <div className="rev-track" ref={revTrackRef} aria-label="Reviews carousel">
              <article className="rev-card"><div className="stars">★★★★★</div><p>“The visual schedules and short activities keep my son calm and engaged. We finally see steady progress.”</p><small className="muted">— Amina, Parent</small></article>
              <article className="rev-card"><div className="stars">★★★★★</div><p>“AI suggestions helped me adapt lessons quickly. Students love the picture‑based tasks.”</p><small className="muted">— Selim, Teacher</small></article>
              <article className="rev-card"><div className="stars">★★★★☆</div><p>“Reports are simple to share with therapists. We’re aligned on goals each week.”</p><small className="muted">— Derya, Parent</small></article>
              <article className="rev-card"><div className="stars">★★★★★</div><p>“I can plan sensory breaks and use social stories easily. Huge time saver.”</p><small className="muted">— Marc, Teacher</small></article>
            </div>
            <div className="rev-nav">
              <button className="rev-btn" onClick={onRevPrev} aria-label="Previous">‹</button>
              <button className="rev-btn" onClick={onRevNext} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <h2 className="title">FAQ</h2>
          {[
            { q: "How does the AI personalize learning?", a: "It adapts tasks by difficulty, supports (visual/auditory prompts), and pacing based on progress and attention patterns." },
            { q: "Is LearnEase suitable for Down syndrome and autism?", a: "Yes. The platform is co‑designed with specialists and families, focusing on structure, clarity, and sensory‑aware activities." },
            { q: "Can parents see progress?", a: "Parents get simple weekly reports, goals, and shared routines, plus messaging with teachers." },
          ].map((item, i) => (
            <div className={`faq-item ${faqOpen[i] ? "open" : ""}`} key={i}>
              <div className="faq-q" onClick={() => toggleFaq(i)}>
                <span>{item.q}</span>
                <span>{faqOpen[i] ? "–" : "+"}</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="section">
        <div className="container">
          <div className="news-card">
            <div>
              <h2 className="title no-margin">Join our newsletter</h2>
              <p className="subtitle mt-6">Get strategies, visual aids, and new features. No spam.</p>
            </div>
            <form className="grid-2" onSubmit={handleNewsSubmit}>
              <input type="email" placeholder="Your email" value={newsEmail} onChange={(e) => setNewsEmail(e.target.value)} required aria-label="Email address" />
              <button className="btn" type="submit">Subscribe</button>
              <small className="muted grid-span-2">{newsMsg}</small>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container foot">
          <div>
            <div className="logo-lockup">
              <img src={logoSrc} alt="Platform logo" />
              LearnEase
            </div>
            <p className="mt-12"><small>Inclusive learning for autism & Down syndrome. Personalized, structured, and joyful.</small></p>
          </div>
          <div>
            <strong>Product</strong>
            <div className="link-col">
              <a href="#home">Home</a>
              <a href="#who">Who We Are</a>
              <a href="#faq">FAQ</a>
              <a href="#reviews">Reviews</a>
            </div>
          </div>
          <div>
            <strong>For teachers</strong>
            <div className="link-col">
              <a href="#start-teaching">Start teaching</a>
              <a href="/signup">Sign up</a>
              <a href="#newsletter">Newsletter</a>
            </div>
          </div>
          <div>
            <strong>Legal</strong>
            <div className="link-col">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className="copyright">© {year} LearnEase. All rights reserved.</div>
      </footer>
    </div>
  );
}
