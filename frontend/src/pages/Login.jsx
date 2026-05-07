import React, { useState } from "react";
import api from "../api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 3;

export default function Login({ role, onLogin, onBack }) {
  const [tab, setTab] = useState("signin"); // signin or signup (admin only)
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validateEmail = (email) => emailRegex.test(email);

  // ── ADMIN SIGN UP ──────────────────────────────────────────
  const handleAdminSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      await api.post("/admin/register", {
        username: form.username,
        email: form.email,
        password: form.password
      });
      setSuccess("Account created! Please sign in.");
      setTab("signin");
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setApiError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN IN (both admin and employee use email + password) ──
  const handleSignin = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      const res = await api.post("/login", {
        email: form.email,
        password: form.password
      });
      if (res.data.role !== role) {
        setApiError(`This account is not ${role === "admin" ? "an admin" : "an employee"}. Please go back and use the correct login.`);
        setLoading(false);
        return;
      }
      localStorage.setItem("token", res.data.access_token);
      setFailedAttempts(0);
      onLogin();
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setShowForgot(true);
        setApiError("Too many failed attempts. Please reset your password.");
      } else {
        setApiError(`Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return <ForgotPassword onBack={() => {
      setShowForgot(false); setIsLocked(false);
      setFailedAttempts(0); setApiError("");
      setForm({ username: "", email: "", password: "" });
    }} />;
  }

  const inputClass = (field) =>
    `w-full bg-slate-800 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors placeholder-slate-600 ${errors[field] ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`;

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${isAdmin ? "bg-indigo-500" : "bg-slate-700"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-white text-2xl font-semibold">{isAdmin ? "Admin" : "Employee"}</h1>
          <p className="text-slate-400 text-sm mt-1">Employee Management Portal</p>
        </div>

        {/* Tabs — Admin only gets Sign Up tab */}
        {isAdmin && (
          <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-4">
            <button
              onClick={() => { setTab("signin"); setForm({ username: "", email: "", password: "" }); setErrors({}); setApiError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "signin" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); setForm({ username: "", email: "", password: "" }); setErrors({}); setApiError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "signup" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* Success message */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-3 mb-4">
              {success}
            </div>
          )}

          {/* Attempt dots — sign in only */}
          {tab === "signin" && failedAttempts > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-slate-500 text-xs">Attempts:</span>
              <div className="flex gap-1.5">
                {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < failedAttempts ? "bg-red-500" : "bg-slate-700"}`} />
                ))}
              </div>
            </div>
          )}

          {/* ── ADMIN SIGN UP FORM ── */}
          {isAdmin && tab === "signup" && (
            <form onSubmit={handleAdminSignup} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Username</label>
                <input type="text" value={form.username} onChange={e => handleChange("username", e.target.value)}
                  className={inputClass("username")} placeholder="Choose a username" />
                {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)}
                  className={inputClass("email")} placeholder="admin@example.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)}
                  className={inputClass("password")} placeholder="Min 6 characters" />
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
              </div>
              {apiError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{apiError}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-3 text-sm transition-colors mt-2">
                {loading ? "Creating account..." : "Create Admin Account"}
              </button>
            </form>
          )}

          {/* ── SIGN IN FORM (admin + employee) ── */}
          {tab === "signin" && (
            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)}
                  disabled={isLocked}
                  className={inputClass("email")}
                  placeholder={isAdmin ? "admin@example.com" : "your@email.com"} />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)}
                  disabled={isLocked}
                  className={inputClass("password")} placeholder="Enter your password" />
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
              </div>
              {apiError && (
                <div className={`border text-sm rounded-xl px-4 py-3 ${isLocked ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {apiError}
                </div>
              )}
              <button type="submit" disabled={loading || isLocked}
                className={`w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 text-sm transition-colors mt-2 ${isAdmin ? "bg-indigo-500 hover:bg-indigo-600" : "bg-slate-700 hover:bg-slate-600"}`}>
                {loading ? "Signing in..." : isLocked ? "Account locked" : "Sign In"}
              </button>
              {isLocked && (
                <button type="button" onClick={() => setShowForgot(true)}
                  className="w-full border border-indigo-500/40 hover:border-indigo-500 text-indigo-400 font-medium rounded-xl px-4 py-3 text-sm transition-colors">
                  Reset password
                </button>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          {isAdmin ? "Only one admin account is allowed" : "Contact your admin if you don't have an account"}
        </p>
      </div>
    </div>
  );
}

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) { setEmailError("Enter a valid email"); return; }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-white text-2xl font-semibold">Reset password</h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline points="20,6 9,17 4,12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Check your email</p>
              <p className="text-slate-400 text-sm">Reset link sent to <span className="text-slate-300">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Email address</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                  className={`w-full bg-slate-800 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors placeholder-slate-600 ${emailError ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
                  placeholder="you@example.com" required />
                {emailError && <p className="text-red-400 text-xs mt-1.5">{emailError}</p>}
              </div>
              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl px-4 py-3 text-sm transition-colors">
                Send reset link
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 transition-colors">Back to sign in</button>
        </p>
      </div>
    </div>
  );
}