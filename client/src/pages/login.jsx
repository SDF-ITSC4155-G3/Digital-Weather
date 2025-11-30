import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      onLoginSuccess && onLoginSuccess();
      const timer = setTimeout(() => {
        navigate("/map");
      }, 2000); // Redirect after 2 seconds to show the message
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate, onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        setMessage("You are logged in! Redirecting to map...");
        setIsLoggedIn(true);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Network error: Unable to login. Please try again later.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
