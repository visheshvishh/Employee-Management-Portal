import React from "react";

export default function Landing({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-500 mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-white text-3xl font-semibold tracking-tight">Employee Management Portal</h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Welcome! Please select your role to continue.<br/>
            Manage your team or view your tasks below.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Admin */}
          <button
            onClick={() => onSelectRole("admin")}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-2xl px-6 py-4 text-base transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Admin</p>
                <p className="text-indigo-200 text-xs">Sign up or Sign in</p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Employee */}
          <button
            onClick={() => onSelectRole("employee")}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-2xl px-6 py-4 text-base transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-600/50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Employee</p>
                <p className="text-slate-400 text-xs">Sign in to your account</p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Employees — contact your admin for login credentials
        </p>
      </div>
    </div>
  );
}