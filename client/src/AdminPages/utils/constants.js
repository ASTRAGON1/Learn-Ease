// Demo data generators and constants
import { USER_CURRICULUM } from "../../data/curriculum";

/**
 * Convert curriculum.js data structure to learning paths format
 * Structure: Path → Courses → Topics → Lessons
 */
export function loadLearningPathsFromCurriculum() {
  return USER_CURRICULUM.map((pathData, pathIndex) => {
    const pathId = pathData.GeneralPath.toLowerCase().replace(/\s+/g, "-");
    
    const courses = pathData.Courses.map((courseData, courseIndex) => {
      const courseId = `${pathId}-course-${courseIndex + 1}`;
      
      const topics = courseData.Topics.map((topicData, topicIndex) => {
        const topicId = `${courseId}-topic-${topicIndex + 1}`;
        
        const lessons = topicData.lessons.map((lessonName, lessonIndex) => ({
          id: `${topicId}-lesson-${lessonIndex + 1}`,
          name: lessonName,
        }));
        
        return {
          id: topicId,
          name: topicData.TopicsTitle,
          lessons,
        };
      });
      
      return {
        id: courseId,
        name: courseData.CoursesTitle,
        topics,
      };
    });
    
    return {
      id: pathId,
      name: pathData.pathTitle,
      courses,
    };
  });
}

export const demoEngagement = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i)); // oldest → newest
  return {
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    value: Math.round(100 + Math.sin(i / 2) * 40 + Math.random() * 30),
  };
});

export const demoApplications = [
  {
    id: "app-1",
    name: "Amina Yılmaz",
    email: "amina@le.com",
    category: "Autism",
    submittedAt: "2025-08-01",
    cvUrl: "#",
    description: "8 years experience in special education.",
    status: "pending",
  },
  {
    id: "app-2",
    name: "Omar Hanieh",
    email: "omar@le.com",
    category: "Down Syndrome",
    submittedAt: "2025-08-10",
    cvUrl: "#",
    description: "Speech therapy background.",
    status: "pending",
  },
];

export const demoReports = [
  {
    id: "r1",
    topic: "Content",
    reporterId: "u1",
    description: "Inappropriate message in chat",
    createdAt: "2025-08-09",
  },
  {
    id: "r2",
    topic: "uploading",
    reporterId: "u3",
    description: "Video encoding issue",
    createdAt: "2025-08-08",
  },
  {
    id: "r3",
    topic: "Login or account issues",
    reporterId: "u2",
    description: "Cannot reset password",
    createdAt: "2025-08-10",
  },
  {
    id: "r4",
    topic: "Stats or analytics",
    reporterId: "u5",
    description: "Dashboard statistics not updating",
    createdAt: "2025-08-07",
  },
  {
    id: "r5",
    topic: "Navigation",
    reporterId: "u1",
    description: "Menu items not loading correctly",
    createdAt: "2025-08-06",
  },
];

export const demoFeedback = [
  {
    id: "f1",
    topic: "Content",
    reporterId: "u5",
    description: "Loving the new dashboard!",
    visible: false,
    createdAt: "2025-08-07",
  },
  {
    id: "f2",
    topic: "uploading",
    reporterId: "u4",
    description: "Please add bulk upload for quizzes.",
    visible: false,
    createdAt: "2025-08-06",
  },
  {
    id: "f3",
    topic: "Navigation",
    reporterId: "u1",
    description: "The interface is very user-friendly. Great work!",
    visible: true,
    createdAt: "2025-08-05",
  },
  {
    id: "f4",
    topic: "Content",
    reporterId: "u3",
    description: "Would love to see more video content options.",
    visible: false,
    createdAt: "2025-08-04",
  },
  {
    id: "f5",
    topic: "Stats or analytics",
    reporterId: "u2",
    description: "The analytics dashboard is very helpful.",
    visible: true,
    createdAt: "2025-08-03",
  },
];

export const demoPeople = [
  // STUDENTS
  {
    id: "u1", name: "Lina Ahmed", role: "student", category: "Autism",
    online: true, status: "active", joinedAt: "2025-06-10",
    student: { hours: 42, performance: { avgScore: 86, completionRate: 0.72 } },
  },
  {
    id: "u2", name: "Mehmet Ali", role: "student", category: "Down Syndrome",
    online: false, status: "active", joinedAt: "2025-06-18",
    student: { hours: 25, performance: { avgScore: 80, completionRate: 0.55 } },
  },
  {
    id: "u5", name: "Layla Karim", role: "student", category: "Autism",
    online: true, status: "active", joinedAt: "2025-07-20",
    student: { hours: 18, performance: { avgScore: 74, completionRate: 0.40 } },
  },

  // INSTRUCTORS
  {
    id: "u3", name: "Sara Noor", role: "instructor", category: "Autism",
    online: false, status: "active", joinedAt: "2025-05-02",
    headline: "Speech Therapist & Autism Specialist",
    location: "Istanbul, TR",
    bio: "Speech-language pathologist focused on ASD communication strategies and family coaching.",
    description: "8+ years creating IEPs, ABA-informed sessions, and caregiver training.",
    instructor: {
      uploads: {
        videos: ["Autism Basics.mp4", "Advanced Strategies.mp4"],
        files: ["guide.pdf"], quizzes: ["Quiz 1", "Quiz 2"],
      },
      cvUrl: "#", likes: 128, followers: 542, rating: 4.6,
      skills: ["Autism", "ABA", "Speech Therapy", "IEP"],
    },
  },
  {
    id: "u4", name: "Yusuf Can", role: "instructor", category: "Down Syndrome",
    online: true, status: "suspended", joinedAt: "2025-04-11",
    headline: "Special Ed Instructor — DS early intervention",
    location: "Ankara, TR",
    bio: "Designs motor-skill and speech routines for DS students; mentors junior teachers.",
    description: "Former clinic educator; videos on articulation and daily-living routines.",
    instructor: {
      uploads: {
        videos: ["Speech Warmups.mp4"],
        files: ["speech-exercises.pdf"], quizzes: ["Assessment A"],
      },
      cvUrl: "#", likes: 73, followers: 301, rating: 4.2,
      skills: ["Down Syndrome", "Early Intervention", "Motor Skills", "Parent Coaching"],
    },
  },
];

