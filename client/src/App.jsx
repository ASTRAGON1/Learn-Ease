import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './StudentPages/Login';
import SignupStudent from './StudentPages/signupStudent';
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
// Importing necessary modules and components

function App() {
  return (
    <>  
    <Router>
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