import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./LandingPage/landPage";
import AllPagesLogin from "./AllPages/Login";
import AllPagesSignup from "./AllPages/Signup";
import Courses from "./StudentPages/courses";
import QuizzApp from "./StudentPages/QuizzApp";
import PersonalizedPath from "./StudentPages/PersonalizedPath";
// import MessagesPage from "./StudentPages/messages";
// import MessageThread from "./StudentPages/MessageThread";
import CoursePlayer from "./StudentPages/CoursePlayer";
import AchievementPage from "./StudentPages/AchievementPage";
import QuizInformationPage from "./StudentPages/QuizInformation";
import StudentProfile from "./StudentPages/StudentProfile";
import StudentShell from "./StudentPages/StudentShell";
import StudentDashboard2 from "./StudentPages/StudentDashboard2";
import DiagnosticQuiz from "./StudentPages/DiagnosticQuiz";

import InstructorDashboard2 from "./instructorPages2/InstructorDashboard2";
import InstructorUpload2 from "./instructorPages2/InstructorUpload2";
import TeachingCenter2 from "./instructorPages2/TeachingCenter2";
import HelpAndSupport2 from "./instructorPages2/HelpAndSupport2";
import GetSupport2 from "./instructorPages2/GetSupport2";
import AIQuiz2 from "./instructorPages2/AIQuiz2";
import Profile2 from "./instructorPages2/Profile2";
import InstructorCommunity2 from "./instructorPages2/InstructorCommunity2";
import InformationGathering1_2 from "./instructorPages2/InformationGathering1";
import InformationGathering2_2 from "./instructorPages2/InformationGathering2";
import InformationGathering3_2 from "./instructorPages2/InformationGathering3";

import AdminPanel2 from "./AdminPages/AdminPanel2";

import EmailVerification from "./AllPages/EmailVerification";

import "./App.css";

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

import TimeTracker from "./components/TimeTracker";

export default function App() {
  return (
    <Router>
      <TimeTracker />
      <DevAuth />
      <Routes>

        <Route path="/login" element={<AllPagesLogin />} />
        <Route path="/signup" element={<AllPagesSignup />} />
        <Route path="/student-dashboard-2" element={<StudentDashboard2 />} />
        <Route path="/diagnostic-quiz" element={<DiagnosticQuiz />} />
        <Route path="/quiz/:id" element={<QuizzApp />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/achievements" element={<AchievementPage />} />
        <Route path="/quiz-information" element={<QuizInformationPage />} />
        <Route path="/CoursePlayer" element={<CoursePlayer />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/personalized" element={<PersonalizedPath />} />
        <Route path="/courses" element={<Courses />} />
        <Route element={<StudentShell />}>
          {/* <Route path="/messages" element={<MessagesPage />} /> */}
          {/* <Route path="/messages/:id" element={<MessageThread />} /> */}
        </Route>

        <Route path="/instructor-dashboard-2" element={<InstructorDashboard2 />} />
        <Route path="/instructor-upload-2" element={<InstructorUpload2 />} />
        <Route path="/TeachingCenter-2" element={<TeachingCenter2 />} />
        <Route path="/HelpAndSupport-2" element={<HelpAndSupport2 />} />
        <Route path="/getSupport-2" element={<GetSupport2 />} />
        <Route path="/ai-quiz-2" element={<AIQuiz2 />} />
        <Route path="/profile-2" element={<Profile2 />} />
        <Route path="/InstructorCommunity-2" element={<InstructorCommunity2 />} />
        <Route path="/InformationGathering-1" element={<InformationGathering1_2 />} />
        <Route path="/InformationGathering-2" element={<InformationGathering2_2 />} />
        <Route path="/InformationGathering-3" element={<InformationGathering3_2 />} />

        <Route path="/admin" element={<AdminPanel2 />} />
        <Route path="/all-login" element={<AllPagesLogin />} />
        <Route path="/all-signup" element={<AllPagesSignup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/" element={<LandingPage />} />

        {/* Redirect to landing page if route is not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
