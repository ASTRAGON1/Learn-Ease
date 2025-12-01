// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./LandingPage/landPage";
import Login from "./StudentPages/Login";
import StudentSignUp from "./StudentPages/StudentSignUp";
import StudentDashboard from "./StudentPages/StudentDashboard";
import Courses from "./StudentPages/courses";
import QuizzApp from "./StudentPages/QuizzApp";
import PersonalizedPath from "./StudentPages/PersonalizedPath";
import MessagesPage from "./StudentPages/messages";
import MessageThread from "./StudentPages/MessageThread";
import CoursePlayer from "./StudentPages/CoursePlayer";
import AchievementPage from "./StudentPages/AchievementPage";
import QuizInformationPage from "./StudentPages/QuizInformation";
import StudentProfile from "./StudentPages/StudentProfile";
import StudentShell from "./StudentPages/StudentShell";   // student-only sidebar wrapper

// Instructor
import InstructorDashboard from "./InstructorPages/InstructorDash";
import InstructorLogin from "./InstructorPages/InstructorLogin";
import InstructorSignUp1 from "./InstructorPages/InstructorSignUp1";
import InstructorSignUp2 from "./InstructorPages/InstructorSignUp2";
import InformationGathering1 from "./InstructorPages/InformationGathering1";
import InformationGathering2 from "./InstructorPages/InformationGathering2";
import InformationGathering3 from "./InstructorPages/InformationGathering3";
import TeachingCenter from "./InstructorPages/TeachingCenter";
import InstructorUpload from "./InstructorPages/InstructorUpload";
import ProfileSettings from "./InstructorPages/ProfileSettings";
import HelpAndSupport from "./InstructorPages/HelpAndSupport";
import GetSupport from "./InstructorPages/getSupport";
import InstructorCommunity from "./InstructorPages/InstructorCommunity";
import AIQuiz from "./InstructorPages/AIQuiz";
import InstructorForgotPasswordStep1 from "./InstructorPages/InstructorForgotPasswordStep1";
import InstructorForgotPasswordStep2 from "./InstructorPages/InstructorForgotPasswordStep2";
import InstructorForgotPasswordStep3 from "./InstructorPages/InstructorForgotPasswordStep3";

// Admin
import AdminPanel from "./AdminPages/AdminPanel";

import "./App.css";

/* Dev helper */
function DevAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "student") {
      localStorage.setItem("token", "dev");
      localStorage.setItem("role", "student");
      localStorage.setItem("userId", "123");
      window.location.replace("/login");
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <Router>
      <DevAuth />

      <Routes>
        {/* Public / Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Student (no shell) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<StudentSignUp />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/quiz" element={<QuizzApp />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/achievements" element={<AchievementPage />} />
        <Route path="/quiz-information" element={<QuizInformationPage />} />
        <Route path="/CoursePlayer" element={<CoursePlayer />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />

        {/* Student pages WITH student-only sidebar */}
        <Route element={<StudentShell />}>
          <Route path="/courses" element={<Courses />} />
          <Route path="/personalized" element={<PersonalizedPath />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessageThread />} />
        </Route>

        {/* Instructor */}
        <Route path="/InstructorLogin" element={<InstructorLogin />} /> 
        <Route path="/InstructorDash" element={<InstructorDashboard />} />
        <Route path="/InstructorSignUp1" element={<InstructorSignUp1 />} />
        <Route path="/InstructorSignUp2" element={<InstructorSignUp2 />} />
        <Route path="/InformationGathering1" element={<InformationGathering1 />} />
        <Route path="/InformationGathering2" element={<InformationGathering2 />} />
        <Route path="/InformationGathering3" element={<InformationGathering3 />} />
        <Route path="/teachingCenter" element={<TeachingCenter />} />
        <Route path="/InstructorUpload" element={<InstructorUpload />} />
        <Route path="/ProfileSettings" element={<ProfileSettings />} />
        <Route path="/HelpAndSupport" element={<HelpAndSupport />} />
        <Route path="/getSupport" element={<GetSupport />} />
        <Route path="/InstructorCommunity" element={<InstructorCommunity />} />
        <Route path="/ai-quiz" element={<AIQuiz />} />
        <Route path="/InstructorForgotPassword" element={<InstructorForgotPasswordStep1 />} />
        <Route path="/InstructorForgotPassword/verify-code" element={<InstructorForgotPasswordStep2 />} />
        <Route path="/InstructorForgotPassword/new-password" element={<InstructorForgotPasswordStep3 />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
