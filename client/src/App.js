import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import About from "./pages/about.jsx";
import Contact from "./pages/contact.jsx";
import Map from "./pages/map.jsx";
import RegisterPage from "./pages/register.jsx";
import LoginPage from "./pages/login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { isLoggedIn, removeToken } from "./utils/auth.js";

function AppContent() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <div>
      <nav>
        <Link to="/about">About</Link> |{" "}
        <Link to="/contact">Contact</Link> |{" "}
        <Link to ="/map">Map</Link> |{" "}
        {!loggedIn ? (
          <Link to="/login">Login</Link>
        ) : (
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
            Logout
          </button>
        )}
      </nav>
      <Routes>
        <Route path="/register" element={<RegisterPage onRegisterSuccess={() => setLoggedIn(true)} />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={() => setLoggedIn(true)} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App