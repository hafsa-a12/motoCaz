import { ArrowLeftCircleIcon, Check, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from 'react-router-dom';
import { photoUrl } from '../lib/media';
import { API_BASE } from '../lib/config';

interface Annonce {
  _id: string;
  titre: string;
  description: string;
  type: string;
  prix: number;
  energie: string;
  modele?: string;
  ville: string;
  datePublication?: string;
  photos?: string[];
  statut: 'en attente'|'validee'|'rejete'
}

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  dateNaissance:string;
  blocked:boolean;
}


function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const AdminClientsDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/clients/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json()
      setAnnonces(data?.annonces || []);
      setSelectedClient(data["client"] as Client);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      console.error("Erreur chargement clients :", e);
    } finally {
      setLoading(false);
    }
  };

  // Charge toujours le client depuis l'API (le lien reste valable après un rafraîchissement de la page)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchClient(); }, [id]);

  const handleDelete = async (id: string) => {
    try {
      const result = await fetch(`${API_BASE}/api/annonces/byAdmin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await result.json()
      if(!result.ok)
    {
      alert(data?.["message"] ?? "Could not do action")
    }
      fetchClient()
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  if (loading) return <p className="text-[var(--color-mute)]  text-sm">Chargement…</p>;
  if (error) return <p className="text-[var(--color-danger)]  text-sm">Erreur : {error}</p>;

  const validerAnnonce = async (id: string) => {
    const result = await fetch(`${API_BASE}/api/admin/annonces/${id}/valider`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const data = await result.json()
    if(!result.ok)
    {
      alert(data?.["message"] ?? "Could not do action")
    }

    fetchClient();
  };
  const rejeterAnnonce = async (id: string) => {
    const result = await fetch(`${API_BASE}/api/admin/annonces/${id}/rejeter`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const data = await result.json()
    if(!result.ok)
    {
      alert(data?.["message"] ?? "Could not do action")
    }

    fetchClient();
  };

  function getStatutBadge(statut: string) {
    switch (statut) {
      case "rejete":
        return "mc-badge mc-badge--bad";
      case "validee":
        return "mc-badge mc-badge--ok";
      default:
        return "mc-badge mc-badge--pending";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ArrowLeftCircleIcon size={26} className="cursor-pointer text-[var(--color-mute)] hover:text-[var(--color-primary-ink)] transition-colors" onClick={() => navigate(-1)} />
        <h2 className="text-2xl">{selectedClient?.prenom} {selectedClient?.nom}</h2>
      </div>

      <div className="mc-panel mb-8">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><dt className="mc-label mb-1">Nom</dt><dd className="text-[var(--color-text)]">{selectedClient?.nom}</dd></div>
          <div><dt className="mc-label mb-1">Prénom</dt><dd className="text-[var(--color-text)]">{selectedClient?.prenom}</dd></div>
          <div><dt className="mc-label mb-1">Email</dt><dd className="text-[var(--color-text)]">{selectedClient?.email}</dd></div>
          <div><dt className="mc-label mb-1">Téléphone</dt><dd className="text-[var(--color-text)]">{selectedClient?.telephone}</dd></div>
          <div><dt className="mc-label mb-1">Ville</dt><dd className="text-[var(--color-text)]">{selectedClient?.ville}</dd></div>
          <div><dt className="mc-label mb-1">Date de naissance</dt><dd className="text-[var(--color-text)]">{selectedClient?.dateNaissance ? formatDateTime(selectedClient?.dateNaissance) : "-"}</dd></div>
          <div>
            <dt className="mc-label mb-1">Bloqué</dt>
            <dd>{selectedClient?.blocked ? (
              <span className="mc-badge mc-badge--bad">Oui</span>
            ) : (
              <span className="mc-badge mc-badge--ok">Non</span>
            )}</dd>
          </div>
        </dl>
      </div>

      {annonces.length === 0 ? (
        <div className="mc-empty">Aucune annonce trouvée pour ce client.</div>
      ) : (
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
                {a.description && <div className="mc-listing-desc">{a.description}</div>}
                <div className="mc-listing-foot">
                  <span className="mc-plate">{a.prix.toLocaleString('fr-FR')} <small>DH</small></span>
                  <div className="flex gap-1">
                    {a.statut === "en attente" && (
                      <button className="btn btn-outline btn-icon" onClick={() => validerAnnonce(a._id)}><Check size={16} /></button>
                    )}
                    {a.statut === "en attente" && (
                      <button className="btn btn-outline btn-icon" onClick={() => rejeterAnnonce(a._id)}><X size={16} /></button>
                    )}
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a._id)}><Trash size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const formatDateTime = (dateString:string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

export default AdminClientsDetails;
