import React, { useState } from 'react';
import './home.css';
import heroImg from '../assets/1.png';

function Home() {
  // FAQ state
  const [openFAQ, setOpenFAQ] = useState(null);
  const faqs = [
    { q: 'Who are the classes for?', a: 'Our classes are designed for kids and teens with Down Syndrome and other special needs.' },
    { q: 'Are the teachers qualified?', a: 'Yes, all our teachers are trained and experienced in special needs education.' },
    { q: 'Are the classes live or recorded?', a: 'We offer both live and recorded classes to suit different needs.' },
    { q: 'How do I sign up my child?', a: 'Click the Sign Up button at the top and follow the registration steps.' },
    { q: 'What devices can I use?', a: 'You can use any device with internet access: computer, tablet, or smartphone.' },
    { q: 'Can I see my child\'s progress?', a: 'Yes, parents can track progress through the parent dashboard.' },
    { q: 'How do I become a teacher on this platform?', a: 'Click the Become a Teacher link and fill out the application form.' },
  ];

  return (
    <div style={{ fontFamily: 'Poppins, Arial, sans-serif', background: '#faf8ff', color: '#222' }}>
      {/* Header */}
      <header className="header">
        <div className="logo">Logo</div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#faq">FAQ</a>
          <a href="#about">About Us</a>
          <a href="#teacher">Become a teacher</a>
        </nav>
        <div className="nav-btns">
          <button className="btn">Login</button>
          <button className="btn primary">Sign Up</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <h1 className="hero-title">Online Classes for Kids & Teens<br />with Down Syndrome</h1>
          <ul className="hero-list">
            <li>📚 Interactive personalized learning experience</li>
            <li>🎓 Trusted and qualified special needs educators</li>
            <li>🌟 Grow with confidence and track progress</li>
          </ul>
          <div className="get-started">
            <button className="btn primary" style={{ fontSize: '1.1rem', padding: '14px 36px' }}>Get started</button>
          </div>
        </div>
        <div className="hero-img-wrap">
          <div className="hero-decor"></div>
          <img className="hero-img" src={heroImg} alt="Happy child" />
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="section" id="about">
        <h2 className="section-title">WHO WE ARE</h2>
        <p className="section-subtitle">Empowering students with special needs through personalized, compassionate, and effective online learning.</p>
        <div className="about-cards">
          <div className="about-card">
            <div style={{ fontSize: '2rem' }}>🎯</div>
            <h3>Personalized Learning</h3>
            <p>Each student follows a path tailored to their pace, needs, and strengths — making learning engaging and accessible.</p>
          </div>
          <div className="about-card important">
            <div style={{ fontSize: '2rem' }}>👩‍🏫</div>
            <h3>Special Needs Experts</h3>
            <p>Our teachers are trained to support kids and teens with Down Syndrome and Autism, ensuring understanding and care.</p>
          </div>
          <div className="about-card">
            <div style={{ fontSize: '2rem' }}>💬</div>
            <h3>Supportive Community</h3>
            <p>We collaborate with parents, caregivers, and professionals to build confidence and consistent progress for every learner.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <h2 className="faq-title">FAQ</h2>
        <div className="faq-list">
          {faqs.map((item, idx) => (
            <div className="faq-item" key={idx} onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}>
              <div className="faq-q">{item.q} <span>{openFAQ === idx ? '▲' : '▼'}</span></div>
              {openFAQ === idx && <div className="faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Become a Teacher Section */}
      <section className="teacher-section" id="teacher">
        <h2 className="teacher-title">BECOME A TEACHER IN LearnEase</h2>
        <div className="teacher-desc">
          Make a difference in the lives of children with special needs. Join our community of dedicated educators.<br /><br />
          Are you passionate about inclusive education? We're always looking for qualified and caring teachers to help kids with Down syndrome and autism thrive. Share your knowledge, inspire growth, and be part of an impactful journey.
        </div>
        <button className="btn primary" style={{ fontSize: '1.1rem', padding: '14px 36px', marginTop: '24px' }}>Start Teaching</button>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <div className="newsletter-title">STAY CONNECTED WITH US</div>
          <div className="newsletter-title" style={{ color: '#5f2eea', fontWeight: 800 }}>GET EDUPLATFORM UPDATES</div>
          <div className="newsletter-desc">
            Be the first to receive updates about new features, class schedules, personalized learning tips, and platform improvements — straight to your inbox.<br />
            <b>Subscribe today and stay ahead!</b>
          </div>
          <form className="newsletter-form" onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
            <input className="newsletter-input" type="email" placeholder="Enter your email address" required />
            <button className="newsletter-btn" type="submit">NOTIFY ME</button>
          </form>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>
            Your email is safe with us. No spam! Just useful updates.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="footer-title">LearnEase</div>
            <div>Empowering personalized education for every learner.</div>
            <div style={{ marginTop: '16px', fontSize: '0.98rem' }}>
              <div>Email: support@Learnease.com</div>
              <div>Phone: +123 456 7890</div>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-title">Quick Links</div>
            <a className="footer-link" href="#home">Home</a>
            <a className="footer-link" href="#about">About Us</a>
            <a className="footer-link" href="#faq">FAQ</a>
            <a className="footer-link" href="#teacher">Teach on Edu</a>
            <a className="footer-link" href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <div className="footer-title">Support</div>
            <a className="footer-link" href="#help">Help Center</a>
            <a className="footer-link" href="#privacy">Privacy Policy</a>
            <a className="footer-link" href="#terms">Terms & Conditions</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 LearnEase™. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
  