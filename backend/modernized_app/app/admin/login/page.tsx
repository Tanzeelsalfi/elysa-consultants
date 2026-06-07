"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/admin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        router.push("/admin");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-body">
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <i className="fas fa-shield-alt"></i>
          </div>

          <h1>Admin Access</h1>
          <p className="login-subtitle">Elysa Consultants Dashboard</p>

          <form id="loginForm" onSubmit={handleLogin} noValidate>
            <div className="login-form-group">
              <label htmlFor="admin-username">
                <i className="fas fa-user"></i> Username
              </label>
              <input
                type="text"
                id="admin-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="admin-password">
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  id="togglePw"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} id="pwIcon"></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" id="loginError" style={{ display: "flex" }}>
                <i className="fas fa-exclamation-circle"></i>
                <span id="loginErrorText">{error}</span>
              </div>
            )}

            <button type="submit" className="btn-login" id="loginBtn" disabled={loading}>
              {!loading ? (
                <span id="loginBtnText">
                  <i className="fas fa-sign-in-alt"></i> Login
                </span>
              ) : (
                <span id="loginBtnLoad">
                  <i className="fas fa-spinner fa-spin"></i> Logging in...
                </span>
              )}
            </button>
          </form>

          <Link href="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
