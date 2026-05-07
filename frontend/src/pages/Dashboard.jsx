import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard({ role }) {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "admin") {
      Promise.all([
        api.get("/admin/employees"),
        api.get("/admin/tasks")
      ]).then(([empRes, taskRes]) => {
        setData(empRes.data);
        setTasks(taskRes.data);
        setLoading(false);
      });
    } else {
      Promise.all([
        api.get("/my/profile"),
        api.get("/my/tasks")
      ]).then(([profileRes, taskRes]) => {
        setData(profileRes.data);
        setTasks(taskRes.data);
        setLoading(false);
      });
    }
  }, [role]);

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;

  if (role === "admin") {
    const employees = data || [];
    const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const doneTasks = tasks.filter(t => t.status === "done").length;

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-slate-900 text-2xl font-semibold">Welcome, Vishesh 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Employees", value: employees.length, color: "bg-indigo-50", text: "#6366f1" },
            { label: "Total Salary", value: `$${totalSalary.toLocaleString()}`, color: "bg-emerald-50", text: "#10b981" },
            { label: "Pending Tasks", value: pendingTasks, color: "bg-amber-50", text: "#f59e0b" },
            { label: "Done Tasks", value: doneTasks, color: "bg-sky-50", text: "#0ea5e9" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-slate-200`}>
              <p className="text-slate-500 text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-semibold" style={{ color: s.text }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-slate-800 font-medium text-sm mb-4">Recent Employees</h2>
          {employees.length === 0 ? (
            <p className="text-slate-400 text-sm">No employees yet. Add one!</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-xs uppercase">
                <th className="text-left pb-3">Name</th>
                <th className="text-left pb-3">Username</th>
                <th className="text-left pb-3">Email</th>
                <th className="text-right pb-3">Salary</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {employees.slice(0, 5).map(e => (
                  <tr key={e.id}>
                    <td className="py-3 font-medium text-slate-800">{e.name}</td>
                    <td className="py-3 text-slate-500">{e.username}</td>
                    <td className="py-3 text-slate-500">{e.email}</td>
                    <td className="py-3 text-right text-slate-700">${e.salary?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Employee dashboard
  const profile = data;
  const pending = tasks.filter(t => t.status === "pending").length;
  const done = tasks.filter(t => t.status === "done").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-semibold">Welcome, {profile?.name} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Employee Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-slate-500 text-xs mb-1">My Salary</p>
          <p className="text-2xl font-semibold text-indigo-600">${profile?.salary?.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-slate-500 text-xs mb-1">Pending Tasks</p>
          <p className="text-2xl font-semibold text-amber-600">{pending}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-slate-500 text-xs mb-1">Completed Tasks</p>
          <p className="text-2xl font-semibold text-emerald-600">{done}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-slate-800 font-medium text-sm mb-4">My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-slate-400 text-sm">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-slate-800 font-medium text-sm">{t.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.description}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${t.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}