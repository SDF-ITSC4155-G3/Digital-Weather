import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        setError("Username and password are required");
        return;
      }

      const res = await invoke("register", { username, password });
      // Success - navigate to dashboard
      navigate("/dashboard");
    } catch (e: any) {
      const msg = e?.message || e?.toString() || String(e);
      setError(msg);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
