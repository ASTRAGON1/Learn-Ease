import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import LandingPage from "./LandingPage/LandingPage";
import Login from "./StudentPages/Login";
import StudentSignUp from "./StudentPages/StudentSignUp";
import StudentDashboard from "./StudentPages/StudentDashboard";
import Courses from "./StudentPages/courses";
import QuizzApp from "./StudentPages/QuizzApp";
// Default page + named Sidebar
import PersonalizedPath, { Sidebar as StudentSidebar } from "./StudentPages/PersonalizedPath";
import MessagesPage from "./StudentPages/messages";
import MessageThread from "./StudentPages/MessageThread"; // ✅ NEW

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

import AdminPanel from "./AdminPages/AdminPanel";
import "./App.css";

/* Dev helper */
function DevAuth() {
  const { search } = window.location;
  useEffect(() => {
    const p = new URLSearchParams(search);
    if (p.get("dev") === "student") {
      localStorage.setItem("token", "dev");
      localStorage.setItem("role", "student");
      localStorage.setItem("userId", "123");
      window.location.replace("/login");
    }
  }, [search]);
  return null;
}

/** Shell to reuse the student sidebar */
function StudentShell({ children }) {
  return (
    <div className="pp-layout">
      <StudentSidebar />
      <div className="pp-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <DevAuth />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Student */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<StudentSignUp />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/quiz" element={<QuizzApp />} />
        {/* PersonalizedPath already renders its own Sidebar */}
        <Route path="/personalized" element={<PersonalizedPath />} />

        {/* Messages + Thread use the same Sidebar via the shell */}
        <Route
          path="/messages"
          element={
            <StudentShell>
              <MessagesPage />
            </StudentShell>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <StudentShell>
              <MessageThread />
            </StudentShell>
          }
        />

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

        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
