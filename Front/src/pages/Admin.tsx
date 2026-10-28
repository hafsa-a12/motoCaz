import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, FileText } from "lucide-react";

const Admin: React.FC = () => {
  const role = localStorage.getItem("role") ?? null;
  const location = useLocation();
  const base = location.pathname.startsWith("/superadmin") ? "/superadmin" : "/admin";

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-sm ${
      isActive(path)
        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-ink)] border-l-2 border-[var(--color-primary)]"
        : "text-[var(--color-mute)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border-l-2 border-transparent"
    }`;

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[var(--color-bg-soft)] border-r border-[var(--color-line-soft)] p-5">
        <p className="mc-eyebrow mb-6 px-3">Back-office</p>
        <nav className="flex flex-col gap-1">
          <Link to={base} className={linkClass(base)}>
            <LayoutDashboard size={17} /> Tableau de bord
          </Link>
          {role === "superadmin" && (
            <Link to="/superadmin/users" className={linkClass("/superadmin/users")}>
              <ShieldCheck size={17} /> Administrateurs
            </Link>
          )}
          <Link to={`${base}/clients`} className={linkClass(`${base}/clients`)}>
            <Users size={17} /> Clients
          </Link>
          <Link to={`${base}/annonces`} className={linkClass(`${base}/annonces`)}>
            <FileText size={17} /> Annonces
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-[var(--color-bg)]">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
