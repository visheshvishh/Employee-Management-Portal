import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const ROLES = [
  "Junior Developer",
  "Senior Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Project Manager",
  "HR Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "Marketing Manager",
  "Sales Executive",
  "Accountant",
  "Other",
];

export default function AddEmployee() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", salary: "", role: "Junior Developer" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/create_employee", { ...form, salary: parseInt(form.salary) });
      setSuccess(true);
      setTimeout(() => navigate("/employees"), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-300";

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-semibold">Create Employee</h1>
        <p className="text-slate-500 text-sm mt-1">Set up login credentials and details</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Full Name</label>
            <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} className={inputClass} placeholder="e.g. John Smith" required />
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Username</label>
            <input type="text" value={form.username} onChange={e => handleChange("username", e.target.value)} className={inputClass} placeholder="Login username" required />
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Email</label>
            <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} className={inputClass} placeholder="employee@example.com" required />
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} className={inputClass} placeholder="Set a password for employee" required />
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Role / Position</label>
            <select value={form.role} onChange={e => handleChange("role", e.target.value)} className={inputClass} required>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Salary (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input type="number" value={form.salary} onChange={e => handleChange("salary", e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 placeholder-slate-300"
                placeholder="60000" min="0" required />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl px-4 py-3">Employee created! Redirecting...</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/employees")} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl px-4 py-3 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={loading || success} className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-3 text-sm transition-colors">
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}