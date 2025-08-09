import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './StudentPages/Login';

import LandingPage from "./LandingPage/LandingPage";
import StudentSignUp from './StudentPages/StudentSignUp';
import InstructorDashboard from './InstructorPages/InstructorDash';
import InstructorLogin from './InstructorPages/InstructorLogin';
import InstructorSignUp1 from './InstructorPages/InstructorSignUp1';
import InstructorSignUp2 from './InstructorPages/InstructorSignUp2';
import InformationGathering1 from './InstructorPages/InformationGathering1';
import InformationGathering2 from './InstructorPages/InformationGathering2';
import InformationGathering3 from './InstructorPages/InformationGathering3';
import './App.css';
import StudentDashboard from "./StudentPages/StudentDashboard";
<Route path="/student-dashboard" element={<StudentDashboard />} />

// ✅ Small helper inside the same file
function DevAuth() {
  const { search } = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(search);
    if (p.get("dev") === "student") {
      localStorage.setItem("token", "dev");
      localStorage.setItem("role", "student");
      localStorage.setItem("userId", "123");
      window.location.replace("/signup"); // Or change to your student page route
    }
  }, [search]);
  return null;
}

function App() {
  return (
    <>
      <Router>
        {/* ✅ This runs before routes */}
        <DevAuth />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/InstructorLogin" element={<InstructorLogin />} />
          <Route path="/InstructorDash" element={<InstructorDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<StudentSignUp />} />
          <Route path="/InstructorSignUp1" element={<InstructorSignUp1 />} />
          <Route path="/InstructorSignUp2" element={<InstructorSignUp2 />} />
          <Route path="/InformationGathering1" element={<InformationGathering1 />} />
          <Route path="/InformationGathering2" element={<InformationGathering2 />} />
          <Route path="/InformationGathering3" element={<InformationGathering3 />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
