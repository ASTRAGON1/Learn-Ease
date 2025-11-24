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
                <span className="badge purple">{path.CoursesTitle}</span>
              </div>
              <span className="sub">{path.Topics.length} topics</span>
            </div>

            <div className="list" style={{ marginTop: 10 }}>
              {path.Topics.map((topic, ti) => (
                <details key={ti} className="list-item topic" >
                  <summary className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row"><strong>{topic.TopicName}</strong></div>
                    <span className="sub">
                      {topic.Courses ? `${topic.Courses.length} courses` : "No courses"}
                    </span>
                  </summary>

                  {topic.Courses && (
                    <div className="list" style={{ marginTop: 8 }}>
                      {topic.Courses.map((course, ci) => (
                        <details key={ci} className="list-item course" >
                          <summary className="row" style={{ justifyContent: "space-between" }}>
                            <div className="row"><b>{course.CoursesTitle}</b></div>
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
