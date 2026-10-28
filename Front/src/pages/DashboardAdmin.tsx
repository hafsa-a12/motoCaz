import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Users, FileText } from 'lucide-react';

export default function DashboardAdmin() {
  const location = useLocation();
  const base = location.pathname.startsWith("/superadmin") ? "/superadmin" : "/admin";

  const role = localStorage.getItem("role");


  return (
    <div>
      <p className="mc-eyebrow mb-2">Back-office</p>
      <h2 className="text-2xl mb-8">Tableau de bord</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {role === "superadmin" && (
          <Link to="/superadmin/users" className="mc-panel flex flex-col gap-4 hover:border-[var(--color-primary-dark)] transition-colors group">
            <ShieldCheck size={24} className="text-[var(--color-primary-ink)]" />
            <div>
              <h3 className="text-lg text-[var(--color-text)] mb-1">Administrateurs</h3>
              <p className="text-sm text-[var(--color-mute)]">Gérer les comptes administrateurs</p>
            </div>
          </Link>
        )}
        <Link to={`${base}/clients`} className="mc-panel flex flex-col gap-4 hover:border-[var(--color-primary-dark)] transition-colors group">
          <Users size={24} className="text-[var(--color-primary-ink)]" />
          <div>
            <h3 className="text-lg text-[var(--color-text)] mb-1">Clients</h3>
            <p className="text-sm text-[var(--color-mute)]">Consulter et gérer les clients</p>
          </div>
        </Link>
        <Link to={`${base}/annonces`} className="mc-panel flex flex-col gap-4 hover:border-[var(--color-primary-dark)] transition-colors group">
          <FileText size={24} className="text-[var(--color-primary-ink)]" />
          <div>
            <h3 className="text-lg text-[var(--color-text)] mb-1">Annonces</h3>
            <p className="text-sm text-[var(--color-mute)]">Valider, rejeter ou supprimer des annonces</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
