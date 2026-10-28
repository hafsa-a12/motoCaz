import { Check, Trash, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { photoUrl } from '../lib/media';
import { API_BASE } from '../lib/config';
import Pagination from '../components/Pagination';

interface Annonce {
  _id: string;
  titre: string;
  description: string;
  type: string;
  prix: number;
  energie: string;
  ville: string;
  photos?: string[];
  statut: 'en attente' | 'validee' | 'rejete';
  userId?: { nom?: string; prenom?: string; email?: string } | null;
}

const STATUTS = [
  { value: 'en attente', label: 'En attente' },
  { value: 'validee', label: 'Validées' },
  { value: 'rejete', label: 'Rejetées' },
  { value: '', label: 'Toutes' },
];

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

function getStatutBadge(statut: string) {
  switch (statut) {
    case "rejete": return "mc-badge mc-badge--bad";
    case "validee": return "mc-badge mc-badge--ok";
    default: return "mc-badge mc-badge--pending";
  }
}

function AdminDashboard() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [statut, setStatut] = useState('en attente');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Le back-office utilise /api/admin/annonces : il liste TOUS les statuts (la liste publique, elle, ne montre que les annonces validées)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page) });
      if (statut) params.set('statut', statut);
      const res = await fetch(`${API_BASE}/api/admin/annonces?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? `Erreur ${res.status}`);
      setAnnonces(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [page, statut]);

  useEffect(() => { loadData(); }, [loadData]);

  const act = async (url: string, method: 'PUT' | 'DELETE', confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    const res = await fetch(`${API_BASE}${url}`, { method, headers: getAuthHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.message ?? "Action impossible");
    }
    loadData();
  };

  const validerAnnonce = (id: string) => act(`/api/admin/annonces/${id}/valider`, 'PUT');
  const rejeterAnnonce = (id: string) => act(`/api/admin/annonces/${id}/rejeter`, 'PUT');
  const handleDelete = (id: string) => act(`/api/annonces/byAdmin/${id}`, 'DELETE', "Supprimer définitivement cette annonce ?");

  return (
    <div>
      <p className="mc-eyebrow mb-2">Back-office</p>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl">Gestion des annonces</h2>
        <select
          className="mc-field"
          style={{ width: 200 }}
          value={statut}
          onChange={(e) => { setStatut(e.target.value); setPage(1); }}
          aria-label="Filtrer par statut"
        >
          {STATUTS.map((s) => <option key={s.label} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error && <p className="text-[var(--color-danger)] text-sm mb-4">Erreur : {error}</p>}
      {loading && <p className="text-[var(--color-mute)] text-sm">Chargement…</p>}

      {!loading && !error && annonces.length === 0 && <div className="mc-empty">Aucune annonce dans cette catégorie.</div>}

      <div className="mc-listing-grid">
        {annonces.map((a) => (
          <div key={a._id} className="mc-listing-card">
            {a.photos?.[0] ? (
              <img src={photoUrl(a.photos[0])} alt={a.titre} className="mc-listing-photo" />
            ) : (
              <div className="mc-listing-photo--empty">Aucune photo</div>
            )}
            <div className="mc-listing-body">
              <div className="flex items-start justify-between gap-2">
                <h3 className="mc-listing-title">{a.titre}</h3>
                <span className={getStatutBadge(a.statut)}>{a.statut}</span>
              </div>
              <p className="mc-listing-meta">{a.type} · {a.energie} · {a.ville}</p>
              {a.userId?.email && <p className="mc-listing-meta">Vendeur : {a.userId.prenom} {a.userId.nom} ({a.userId.email})</p>}
              {a.description && <div className="mc-listing-desc">{a.description}</div>}
              <div className="mc-listing-foot">
                <span className="mc-plate">{a.prix.toLocaleString('fr-FR')} <small>DH</small></span>
                <div className="flex gap-1">
                  {a.statut !== "validee" && (
                    <button className="btn btn-outline btn-icon" onClick={() => validerAnnonce(a._id)} title="Valider"><Check size={16} /></button>
                  )}
                  {a.statut !== "rejete" && (
                    <button className="btn btn-outline btn-icon" onClick={() => rejeterAnnonce(a._id)} title="Rejeter"><X size={16} /></button>
                  )}
                  <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a._id)} title="Supprimer"><Trash size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default AdminDashboard;
