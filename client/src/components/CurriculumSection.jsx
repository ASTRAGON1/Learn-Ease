import React from "react";
import "./CurriculumSection.css";

const USER_CURRICULUM = Object.freeze([
  {
    key: "autism",
    title: "General path for Autism students",
    items: [
      {
        label: "Listening Skills",
        subsections: [
          {
            title: "Listening 1 – Understanding Emotions",
            lessons: [
              "Lesson 1 – Identifying Happy and Sad",
              "Lesson 2 – Recognizing Angry and Calm Faces",
              "Lesson 3 – Matching Emotions to Situations",
              "Lesson 4 – Facial Expressions Practice",
              "Lesson 5 – Responding to Emotions in Others",
            ],
          },
          { title: "Listening 2 – Asking for Help" },
          { title: "Listening 3 – Expressing Needs" },
          { title: "Listening 4 – Listening and Responding" },
          { title: "Listening 5 – Daily Conversations" },
        ],
      },
      {
        label: "Speaking & Communication",
        subsections: [
          {
            title: "Communication 1 – Understanding Emotions",
            lessons: [
              "Lesson 1 – Identifying Happy and Sad",
              "Lesson 2 – Recognizing Angry and Calm Faces",
              "Lesson 3 – Matching Emotions to Situations",
              "Lesson 4 – Facial Expressions Practice",
              "Lesson 5 – Responding to Emotions in Others",
            ],
          },
          { title: "Communication 2 – Asking for Help" },
          { title: "Communication 3 – Expressing Needs" },
          { title: "Communication 4 – Listening and Responding" },
          { title: "Communication 5 – Daily Conversations" },
        ],
      },
      { label: "Reading Comprehension" },
      { label: "Writing Practice" },
      { label: "Math Basics" },
      { label: "Daily Life Skills" },
      { label: "Social Interaction" },
      { label: "Emotional Recognition & Expression" },
      { label: "How to talk to girls like a boss" },
    ],
  },
  {
    key: "down",
    title: "General path for Down syndrome students",
    items: [
      { label: "Basic Communication Skills" },
      { label: "Reading and Phonics" },
      { label: "Writing and Drawing" },
      { label: "Number Recognition & Counting" },
      { label: "Personal Hygiene and Self-care" },
      { label: "Daily Routines & Independence" },
      { label: "Emotional Understanding" },
      { label: "Social Skills and Group Activities" },
    ],
  },
]);

export default function CurriculumSection() {
  return (
    <div className="le-content">
      <div className="section-title"><h2>Learning Paths</h2></div>
      <div className="sub">Two paths: Autism and Down Syndrome.</div>

      <div className="list" style={{ marginTop: 12 }}>
        {USER_CURRICULUM.map((path) => (
          <div key={path.key} className="list-item">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <span className="badge purple">{path.title}</span>
              </div>
              <span className="sub">{path.items.length} topics</span>
            </div>

            <div className="list" style={{ marginTop: 10 }}>
              {path.items.map((topic, ti) => (
                <details key={ti} className="list-item topic" >
                  <summary className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row"><strong>{topic.label}</strong></div>
                    <span className="sub">
                      {topic.subsections ? `${topic.subsections.length} courses` : "No courses"}
                    </span>
                  </summary>

                  {topic.subsections && (
                    <div className="list" style={{ marginTop: 8 }}>
                      {topic.subsections.map((course, ci) => (
                        <details key={ci} className="list-item course" >
                          <summary className="row" style={{ justifyContent: "space-between" }}>
                            <div className="row"><b>{course.title}</b></div>
                            <span className="sub">
                              {course.lessons ? `${course.lessons.length} lessons` : "No lessons"}
                            </span>
                          </summary>

                          {course.lessons && (
                            <div className="list" style={{ marginTop: 8 }}>
                              {course.lessons.map((lesson, li) => (
                                <div key={li} className="row" style={{ justifyContent: "space-between" }}>
                                  <span>{lesson}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </details>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
