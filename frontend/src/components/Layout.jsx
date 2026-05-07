import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout({ onLogout, role }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={onLogout} role={role} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}