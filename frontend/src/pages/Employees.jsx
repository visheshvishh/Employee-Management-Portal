import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [firing, setFiring] = useState(null);
  const [confirmFire, setConfirmFire] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = () => {
    api.get("/admin/employees").then(res => {
      setEmployees(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleFire = async (emp) => {
    setFiring(emp.id);
    try {
      await api.delete(`/admin/employees/${emp.id}`);
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
      setConfirmFire(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to fire employee");
    } finally {
      setFiring(null);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700"
  ];

  return (
    <div className="p-8">

      {/* Confirm Fire Modal */}
      {confirmFire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-slate-800 font-semibold text-center mb-1">Fire Employee?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              Are you sure you want to fire <span className="font-medium text-slate-700">{confirmFire.name}</span>? This will delete their account and all assigned tasks.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmFire(null)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFire(confirmFire)}
                disabled={firing === confirmFire.id}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
              >
                {firing === confirmFire.id ? "Firing..." : "Yes, Fire"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-semibold">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">{employees.length} total</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-400 w-48 placeholder-slate-400"
          />
          <button
            onClick={() => navigate("/add-employee")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No employees found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium">Employee</th>
                <th className="text-left px-6 py-4 font-medium">Username</th>
                <th className="text-left px-6 py-4 font-medium">Position</th>
                <th className="text-right px-6 py-4 font-medium">Salary</th>
                <th className="text-center px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp, i) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>
                        {emp.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-slate-800 font-medium">{emp.name}</p>
                        <p className="text-slate-400 text-xs">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.username}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {emp.position || "Employee"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 font-medium">
                    ${emp.salary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setConfirmFire(emp)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                    >
                      🔥 Fire
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}