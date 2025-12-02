import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        setMessage("Registration successful! Redirecting to map...");
        onRegisterSuccess && onRegisterSuccess();
        setTimeout(() => navigate("/map"), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(`Registration failed: ${error.message}`);
    }
  };
  

  return (
    <div className="page page-card auth-page">
      <h2 className="page-title">Create an account</h2>
      <p className="page-subtitle">
        Register once to securely access the campus weather map.
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
          Register
        </button>
      </form>
      <p className="auth-message">{message}</p>
    </div>
  );
}
