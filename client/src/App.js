import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import About from "./pages/about.jsx";
import Contact from "./pages/contact.jsx";
import Map from "./pages/map.jsx";


function App() {

  return (
    <div>
    <Router>

      <nav>
       
        <Link to="/about">About</Link> |{" "}
        <Link to="/contact">Contact</Link>
        <Link to ="/map">Map</Link>
      </nav>

      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    
    


    </Router>
    </div>
  )
}

export default App