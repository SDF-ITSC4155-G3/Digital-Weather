import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import About from "./pages/about.jsx";
import Contact from "./pages/contact.jsx";
import Map from "./pages/map.jsx";
import RegisterPage from "./pages/register.jsx";
import LoginPage from "./pages/login.jsx";


function App() {

  return (
    <div>
    <Router>

      <nav>
       
        <Link to="/about">About</Link> |{" "}
        <Link to="/contact">Contact</Link> |{" "}
        <Link to ="/map">Map</Link> |{" "}
        <Link to="/register">Register</Link> |{" "} 
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    
    


    </Router>
    </div>
  )
}

export default App