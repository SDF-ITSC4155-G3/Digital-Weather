import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        setError("Username and password are required");
        return;
      }
      const ok = await invoke("login", { username, password });
      // If login resolves to true, go to dashboard. If the backend returned an error, invoke would throw.
      if (ok === true) {
        navigate("/dashboard");
      } else {
        // unexpected but show raw
        setError(String(ok));
      }
    } catch (e: any) {
      // Tauri returns an error object with a message or a string
      const msg = e?.message || e?.toString() || String(e);
      setError(msg);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{color:'red'}}>{error}</p>}
      <p>Don't have an account? <span style={{color:'blue', cursor:'pointer'}} onClick={() => navigate("/register")}>Register here</span></p>
    </div>
  );
}
