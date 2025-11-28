import React, { useMemo } from "react";

function LearningPaths({ learningPaths, search, onRenameCourse, onRenameTopic, onRenameLesson }) {
  // Filter learning paths by search
  // Structure: Path → Courses → Topics → Lessons
  const filteredPaths = useMemo(() => {
    if (!search) return learningPaths;
    const searchLower = search.toLowerCase();
    
    return learningPaths
      .map(path => {
        const matchingCourses = path.courses
          .map(course => {
            const matchingTopics = course.topics
              .map(topic => {
                const matchingLessons = topic.lessons.filter(lesson =>
                  lesson.name.toLowerCase().includes(searchLower)
                );
                if (matchingLessons.length > 0 || topic.name.toLowerCase().includes(searchLower)) {
                  return { ...topic, lessons: matchingLessons.length > 0 ? matchingLessons : topic.lessons };
                }
                return null;
              })
              .filter(Boolean);
            
            if (matchingTopics.length > 0 || course.name.toLowerCase().includes(searchLower)) {
              return { ...course, topics: matchingTopics.length > 0 ? matchingTopics : course.topics };
            }
            return null;
          })
          .filter(Boolean);
        
        if (matchingCourses.length > 0 || path.name.toLowerCase().includes(searchLower)) {
          return { ...path, courses: matchingCourses.length > 0 ? matchingCourses : path.courses };
        }
        return null;
      })
      .filter(Boolean);
  }, [learningPaths, search]);
  return (
    <div className="le-content">
      <div className="section-title">
        <h2>Learning Paths</h2>
      </div>
      <div className="sub">
        Two paths: Autism and Down Syndrome. Structure: Path → Courses → Topics → Lessons. You can
        rename courses, topics, and lessons.
      </div>
      {search && (
        <div className="sub" style={{ marginTop: 8, marginBottom: 8 }}>
          Showing {filteredPaths.length} path(s) matching "{search}"
        </div>
      )}
      <div className="list" style={{ marginTop: 12 }}>
        {filteredPaths.length === 0 ? (
          <div className="sub">No learning paths found matching your search.</div>
        ) : (
          filteredPaths.map((path) => (
          <div key={path.id} className="list-item">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <span className="badge purple">{path.name}</span>
              </div>
            </div>
            <div style={{ marginTop: 10 }} className="list">
              {path.courses.map((course) => (
                <details key={course.id} className="list-item">
                  <summary className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row">
                      <strong>{course.name}</strong>
                      <button
                        className="btn small ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          const name = prompt("Rename course", course.name);
                          if (name) onRenameCourse(path.id, course.id, name);
                        }}
                        type="button"
                      >
                        Rename
                      </button>
                    </div>
                    <span className="sub">{course.topics.length} topics</span>
                  </summary>
                  <div className="list" style={{ marginTop: 10 }}>
                    {course.topics.map((topic) => (
                      <details key={topic.id} className="list-item">
                        <summary className="row" style={{ justifyContent: "space-between" }}>
                          <div className="row">
                            <b>{topic.name}</b>
                            <button
                              className="btn small ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                const name = prompt("Rename topic", topic.name);
                                if (name) onRenameTopic(path.id, course.id, topic.id, name);
                              }}
                              type="button"
                            >
                              Rename
                            </button>
                          </div>
                          <span className="sub">{topic.lessons.length} lessons</span>
                        </summary>
                        <div className="list" style={{ marginTop: 8 }}>
                          {topic.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="row"
                              style={{ justifyContent: "space-between" }}
                            >
                              <span>{lesson.name}</span>
                              <button
                                className="btn small ghost"
                                onClick={() => {
                                  const name = prompt("Rename lesson", lesson.name);
                                  if (name)
                                    onRenameLesson(
                                      path.id,
                                      course.id,
                                      topic.id,
                                      lesson.id,
                                      name
                                    );
                                }}
                                type="button"
                              >
                                Rename
                              </button>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LearningPaths;

