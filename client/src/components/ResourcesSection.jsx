import React from "react";
import { Link } from "react-router-dom";
import teachPic from "../assets/teachPic.png";
import community from "../assets/community.png";
import feedbackSupport from "../assets/feedback&support.png";
import "../InstructorPages/InstructorDash.css";

export default function ResourcesSection() {
  const items = [
    { title: "Teaching Center",       img: teachPic,  link: "/TeachingCenter", paragraph: "Find articles on LearnEase teaching — from course creation to marketing."},
    { title: "Instructor Community",  img: community,  link: "/InstructorCommunity", paragraph: "Share your progress and ask other instructors questions in our community."},
    { title: "Help and support",      img: feedbackSupport,    link: "/HelpAndSupport", paragraph: "Can't find what you need? Our support team is happy to help." },
  ];

  return (
    <div className="res-section">
      <h2 className="res-section-title">Resources</h2>
      <div className="res-cards">
        {items.map((it) => (
          <Link key={it.title} to={it.link} className="res-card">
            <img src={it.img} alt={it.title} className="res-card-img" />
            <h4 className="res-card-title">{it.title}</h4>
            <p className="res-card-paragraph">{it.paragraph}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

