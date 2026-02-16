// File: src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUser, isAuthenticated } from "../utils/auth";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  if (isAuthenticated()) {
    nav("/", { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password) {
      setErr("Please enter username and password.");
      return;
    }

    const user = {
      username: username.trim(),
      displayName: username.trim(),
      loggedAt: new Date().toISOString(),
    };

    setUser(user);
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/prod_back.jpg')" }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome to the System</h1>
          <p className="text-sm text-gray-300 mb-6 text-center">Sign in to continue to Grocery MIS</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-black/40 border border-gray-700 text-gray-200"
                placeholder="your username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-black/40 border border-gray-700 text-gray-200"
                placeholder="password"
              />
            </div>

            {err && <div className="text-sm text-rose-400">{err}</div>}

            <div className="flex items-center justify-between">
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">Sign in</button>
              <button
                type="button"
                onClick={() => { setUsername("demo"); setPassword("demo"); }}
                className="text-sm text-gray-300 underline"
              >
                Test Fill for Class
              </button>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
}
