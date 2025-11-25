import React from "react";
import "./CurriculumSection.css";
import { USER_CURRICULUM } from "../data/curriculum";


export default function CurriculumSection() {
  return (
    <div className="le-content">
      <div className="section-title"><h2>Learning Paths</h2></div>
      <div className="sub">Two paths: Autism and Down Syndrome.</div>

      <div className="list" style={{ marginTop: 12 }}>
        {USER_CURRICULUM.map((path) => (
          <div key={path.GeneralPath} className="list-item">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <span className="badge purple">{path.pathTitle}</span>
              </div>
              <span className="sub">{path.Courses.length} courses</span>
            </div>

            <div className="list" style={{ marginTop: 10 }}>
              {path.Courses.map((course, ci) => (
                <details key={ci} className="list-item topic" >
                  <summary className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row"><strong>{course.CoursesTitle}</strong></div>
                    <span className="sub">
                      {course.Topics ? `${course.Topics.length} topics` : "No topics"}
                    </span>
                  </summary>

                  {course.Topics && (
                    <div className="list" style={{ marginTop: 8 }}>
                      {course.Topics.map((topic, ti) => (
                        <details key={ti} className="list-item course" >
                          <summary className="row" style={{ justifyContent: "space-between" }}>
                            <div className="row"><b>{topic.TopicsTitle}</b></div>
                            <span className="sub">
                              {topic.lessons ? `${topic.lessons.length} lessons` : "No lessons"}
                            </span>
                          </summary>

                          {topic.lessons && (
                            <div className="list" style={{ marginTop: 8 }}>
                              {topic.lessons.map((lesson, li) => (
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