import React from "react";
import "./CurriculumSection.css";

// ===== READ-ONLY snapshot (no UI to edit/change) =====
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
      { label: "Speaking & Communication",
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
    <div className="uc-wrap" aria-readonly="true">
      {USER_CURRICULUM.map((path) => (
        <section key={path.key} className="uc-path">
          <h3 className="uc-title">{path.title}</h3>

          {/* labels row */}
          <div className="uc-labels">
            {path.items.map((it, i) => (
              <div key={i} className="uc-label">{it.label}</div>
            ))}
          </div>

          {/* timeline (purely visual) */}
          <div className="uc-timeline">
            {path.items.map((_, i) => (
              <div key={i} className="uc-point">
                <div className="uc-circle" />
              </div>
            ))}
          </div>

          {/* fully expanded details (no toggles) */}
          <div className="uc-details">
            {path.items.map((it, i) => (
              <div key={i} className="uc-group">
                {it.subsections && <h4 className="uc-group-title">{it.label}</h4>}
                {it.subsections?.map((sub, j) => (
                  <div key={j} className="uc-subblock">
                    <div className="uc-subtitle">{sub.title}</div>
                    {sub.lessons && (
                      <ul className="uc-lesson-list">
                        {sub.lessons.map((ls, k) => (
                          <li key={k} className="uc-lesson">{ls}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
