import React from "react";
import { Link, Outlet } from "react-router-dom";

const Admin: React.FC = () => {
  const role = localStorage.getItem("role") ?? null;
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-3">
          <Link
            to="/admin"
            className="hover:bg-gray-700 px-3 py-2 rounded-md"
          >
            Dashboard
          </Link>
          {role=="superadmin" &&<Link
            to="/superadmin/users"
            className="hover:bg-gray-700 px-3 py-2 rounded-md"
          >
            Administrateurs
          </Link>}
          <Link
            to="/admin/clients"
            className="hover:bg-gray-700 px-3 py-2 rounded-md"
          >
            Clients
          </Link>
          <Link
            to="/admin/annonces"
            className="hover:bg-gray-700 px-3 py-2 rounded-md"
          >
            Annonces
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* Nested routes render here */}
      </main>
    </div>
  );
};

export default Admin;
