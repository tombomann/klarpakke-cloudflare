"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<unknown>(null);

  const handleRegister = async () => {
    const res = await authClient.signUp.email({
      email,
      password,
      name: name || email.split("@")[0],
    });
    setResult(res);
  };

  const handleLogin = async () => {
    const res = await authClient.signIn.email({ email, password });
    setResult(res);
  };

  const handleMe = async () => {
    const res = await authClient.getSession();
    setResult(res);
  };

  const handleLogout = async () => {
    const res = await authClient.signOut();
    setResult(res);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Better Auth + D1 Spike</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Name (register)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleRegister} style={{ padding: "0.5rem 1rem" }}>
            Register
          </button>
          <button onClick={handleLogin} style={{ padding: "0.5rem 1rem" }}>
            Login
          </button>
          <button onClick={handleMe} style={{ padding: "0.5rem 1rem" }}>
            Me
          </button>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
            Logout
          </button>
        </div>
      </div>
      <pre
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f4f4f4",
          borderRadius: "4px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
