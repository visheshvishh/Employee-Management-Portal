import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/my/tasks").then(res => {
      setTasks(res.data);
      setLoading(false);
    });
  }, []);

  const markDone = async (taskId) => {
    await api.patch(`/my/tasks/${taskId}`, { status: "done" });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done" } : t));
  };

  const pending = tasks.filter(t => t.status === "pending");
  const done = tasks.filter(t => t.status === "done");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-semibold">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">{pending.length} pending · {done.length} completed</p>
      </div>

      {loading ? <p className="text-slate-400 text-sm">Loading...</p> : tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-slate-700 font-medium text-sm mb-3">Pending ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map(t => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-slate-800 font-medium">{t.title}</p>
                      <p className="text-slate-500 text-sm mt-1">{t.description}</p>
                      <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700">pending</span>
                    </div>
                    <button
                      onClick={() => markDone(t.id)}
                      className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      Mark Done
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div>
              <h2 className="text-slate-700 font-medium text-sm mb-3">Completed ({done.length})</h2>
              <div className="space-y-3">
                {done.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 opacity-70">
                    <p className="text-slate-700 font-medium line-through">{t.title}</p>
                    <p className="text-slate-400 text-sm mt-1">{t.description}</p>
                    <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">done ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}