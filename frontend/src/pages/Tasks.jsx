import React, { useEffect, useState } from "react";
import api from "../api";

export default function Tasks() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchTasks = () => api.get("/admin/tasks").then(res => setTasks(res.data));

  useEffect(() => {
    api.get("/admin/employees").then(res => setEmployees(res.data));
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/tasks", {
        title: form.title,
        description: form.description,
        assigned_to: parseInt(form.assigned_to)
      });
      setSuccess(true);
      setForm({ title: "", description: "", assigned_to: "" });
      await fetchTasks();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    setDeleting(taskId);
    try {
      await api.delete(`/admin/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    } finally {
      setDeleting(null);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-300";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-semibold">Assign Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">Create and manage employee tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-slate-800 font-medium mb-5">New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Task Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass} placeholder="e.g. Fix login bug" required />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} resize-none h-24`} placeholder="Describe the task..." required />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium uppercase tracking-wider mb-2">Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                className={inputClass} required>
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.user_id} value={emp.user_id}>{emp.name} ({emp.username})</option>
                ))}
              </select>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl px-4 py-3">✅ Task assigned successfully!</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-3 text-sm transition-colors">
              {loading ? "Assigning..." : "Assign Task"}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-slate-800 font-medium mb-5">All Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="text-slate-400 text-sm">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {tasks.map(t => (
                <div key={t.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium text-sm truncate">{t.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{t.description}</p>
                      <p className="text-indigo-400 text-xs mt-1">→ {t.assigned_to_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${t.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {t.status}
                      </span>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                        title="Delete task"
                      >
                        {deleting === t.id ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="animate-spin">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4" strokeDashoffset="10"/>
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}