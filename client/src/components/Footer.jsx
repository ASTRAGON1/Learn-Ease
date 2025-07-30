import React from "react";
import "./Footer.css";
import simpleLogo2 from "../assets/simpleLogo2.png"; // use your logo asset

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <ul className="col">
          <li>Teaching on LearnEase</li>
          <li>Publishing</li>
          <li>Community</li>
          <li>News</li>
          <li>Course</li>
        </ul>

        <ul className="col">
          <li>Terms & Conditions</li>
          <li>Privacy Policy</li>
          <li>Help Center / Support</li>
        </ul>

        <ul className="col contact">
          <li>Email: support@learnease.com</li>
          <li>Phone: 05979797979</li>
          <li>Address: Blbala magusa north cyprus</li>
        </ul>
      </div>

      <div className="footer-bottom">
        <img src={simpleLogo2} alt="LearnEase" className="ft-logo" />
        <span>LearnEase © 2025 — All rights reserved.</span>
      </div>
    </footer>
  );
}
