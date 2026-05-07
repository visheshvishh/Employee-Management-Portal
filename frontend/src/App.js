import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";
import Layout from "./components/Layout";

function getTokenData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

// Page states
const PAGE = { LANDING: "landing", LOGIN: "login", APP: "app" };

export default function App() {
  // Always start from landing — never auto-login
  const [page, setPage] = useState(PAGE.LANDING);
  const [selectedRole, setSelectedRole] = useState(null);
  const [tokenData, setTokenData] = useState(null);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setPage(PAGE.LOGIN);
  };

  const handleLogin = () => {
    const data = getTokenData();
    setTokenData(data);
    setPage(PAGE.APP);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTokenData(null);
    setSelectedRole(null);
    setPage(PAGE.LANDING);
  };

  const handleBack = () => {
    setPage(PAGE.LANDING);
    setSelectedRole(null);
  };

  if (page === PAGE.LANDING) {
    return <Landing onSelectRole={handleSelectRole} />;
  }

  if (page === PAGE.LOGIN) {
    return <Login role={selectedRole} onLogin={handleLogin} onBack={handleBack} />;
  }

  const role = tokenData?.role;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} role={role} />}>
          <Route index element={<Dashboard role={role} />} />
          {role === "admin" && (
            <>
              <Route path="employees" element={<Employees />} />
              <Route path="add-employee" element={<AddEmployee />} />
              <Route path="tasks" element={<Tasks />} />
            </>
          )}
          {role === "employee" && (
            <Route path="my-tasks" element={<MyTasks />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}