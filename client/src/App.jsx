import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
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