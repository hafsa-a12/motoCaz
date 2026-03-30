import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Publish from "./pages/Publish";
import Header from "./components/Header";
import MesAnnonces from "./pages/MesAnnonces";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminClients from "./pages/AdminClients";
import DashboardAdmin from "./pages/DashboardAdmin";
import Home from "./pages/Home";

import './index.css'
import AnnonceDetail from "./pages/AnnonceDetail";
import AdminDashboard from "./pages/AdminAnnonces";
import AdminClientsDetails from "./pages/AdminClientsDetails";
// 🔒 Composant pour protéger les routes admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = localStorage.getItem("role") ?? null;
  return role && (role === "admin" || role === "superadmin") ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" />
  );
};

// 🔒 Composant pour protéger les routes client
const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = localStorage.getItem("role") ?? null;
  return role && role === "client" ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" />
  );
};

// 🔒 Composant pour protéger les routes superadmin
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = localStorage.getItem("role") ?? null;
  return role && (role === "admin" || role === "superadmin") ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/publish" element={<Publish />} />
        {/* <Route path="/mes-annonces" element={<MesAnnonces />} /> */}
        <Route path="/annonce/:id" element={<AnnonceDetail />} />

        {/* Route client protégée */}
        <Route
          path="/mes-annonces"
          element={
            <ClientRoute>
              <MesAnnonces />
            </ClientRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin /> {/* layout with <Outlet /> */}
            </AdminRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="annonces" element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:id" element={<AdminClientsDetails />} />
        </Route>

        {/* Route superadmin protégée */}
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <Admin /> {/* layout with <Outlet /> */}
            </SuperAdminRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="annonces" element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:id" element={<AdminClientsDetails />} />
        </Route>

        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
