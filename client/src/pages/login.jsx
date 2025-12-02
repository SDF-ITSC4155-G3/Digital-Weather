import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

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
    <div className="page page-card auth-page">
      <h2 className="page-title">Login</h2>
      <p className="page-subtitle">
        Sign in to access the UNC Charlotte digital weather map.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-button" type="submit">
          Login
        </button>
      </form>
      <p className="auth-message">{message}</p>
      <p className="auth-subtext">
        Don&apos;t have an account?{" "}
        <Link className="auth-link" to="/register">
          Register here
        </Link>
      </p>
    </div>
  );
}