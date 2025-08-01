import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignupStudent from './pages/signupStudent';
import LandingPage from "./pages/LandingPage";
import StudentSignUp from './pages/StudentSignUp';
import InstructorDashboard from './pages/InstructorDash';
import InstructorLogin from './pages/InstructorLogin';
import InstructorSignUp1 from './pages/InstructorSignUp1';
import InstructorSignUp2 from './pages/InstructorSignUp2';
import InformationGathering1 from './pages/InformationGathering1';
import InformationGathering2 from './pages/InformationGathering2';
import InformationGathering3 from './pages/InformationGathering3';
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
// This code sets up a simple React application with React Router.
// It defines two routes: the home page ("/") and a login page ("/login").
// The `Home` and `Login` components are imported from their respective files.
// The `App` component uses the `BrowserRouter` to wrap the routes and render the appropriate component based on the URL path.
// The `Routes` component is used to define the different routes in the application.
// The `Route` component specifies the path and the component to render for that path.
// The `element` prop is used to specify the component to render when the route matches.
// The `App` component is then exported as the default export of the module.
// This code is a basic setup for a React application with routing.
// It can be expanded with more routes and components as needed.
// The `Home` component is rendered when the user visits the root URL ("/").
// The `Login` component is rendered when the user visits the "/login" URL. 