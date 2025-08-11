import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import LandingPage from "./LandingPage/LandingPage";
import Login from "./StudentPages/Login";
import StudentSignUp from "./StudentPages/StudentSignUp";
import StudentDashboard from "./StudentPages/StudentDashboard";
import Courses from "./StudentPages/courses"; // <-- path matches file name

import InstructorDashboard from "./InstructorPages/InstructorDash";
import InstructorLogin from "./InstructorPages/InstructorLogin";
import InstructorSignUp1 from "./InstructorPages/InstructorSignUp1";
import InstructorSignUp2 from "./InstructorPages/InstructorSignUp2";
import InformationGathering1 from "./InstructorPages/InformationGathering1";
import InformationGathering2 from "./InstructorPages/InformationGathering2";
import InformationGathering3 from "./InstructorPages/InformationGathering3";
import TeachingCenter from "./InstructorPages/TeachingCenter";
import InstructorUpload from "./InstructorPages/InstructorUpload";
import PersonalizedPath from "./StudentPages/PersonalizedPath";
import ProfileSettings from "./InstructorPages/ProfileSettings"; 
import "./App.css";

/* Dev helper (single copy) */
function DevAuth() {
  const { search } = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(search);
    if (p.get("dev") === "student") {
      localStorage.setItem("token", "dev");
      localStorage.setItem("role", "student");
      localStorage.setItem("userId", "123");
      window.location.replace("/login"); // dev jump
    }
  }, [search]);
  return null;
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
        <Route path="/personalized" element={<PersonalizedPath />} />


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
      </Routes>
    </Router>
  );
}

export default App;
