import { Pen, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { photoUrl } from '../lib/media';
import { API_BASE } from '../lib/config';

interface Annonce {
  _id: string;
  titre: string;
  description: string;
  type: string;
  prix: number;
  energie: string;
  marque?: string;
  modele?: string;
  etat?: string;
  ville: string;
  datePublication?: string;
  photos?: string[];
}


const MesAnnonces = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [editAnnonce, setEditAnnonce] = useState<Annonce | null>(null);

  const token = localStorage.getItem('token');

  async function refetch() {
    fetch(`${API_BASE}/api/annonces/miennes`, { headers: { authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAnnonces(data))
      .catch(err => console.error('Erreur chargement annonces :', err));
  }
  useEffect(() => {
    if (!token) return;
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/annonces/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      });
      setAnnonces(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEditClick = (annonce: Annonce) => {
    setEditAnnonce({ ...annonce });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editAnnonce) return;
    const { name, value } = e.target;
    setEditAnnonce({ ...editAnnonce, [name]: name === "prix" ? Number(value) : value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editAnnonce) return;

    try {
      await fetch(`${API_BASE}/api/annonces/${editAnnonce._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editAnnonce),
      });
      refetch()
      setEditAnnonce(null);
    } catch (err) {
      console.error("Erreur modification :", err);
    }
  };

  return (
    <div className="mc-shell py-10">
      <p className="mc-eyebrow mb-2">Espace vendeur</p>
      <h2 className="text-2xl mb-8">Mes annonces</h2>

      {editAnnonce && (
        <form onSubmit={handleSubmit} className="mc-panel mb-8">
          <h3 className="text-lg mb-4 text-[var(--color-text)]">Modifier l'annonce</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mc-label">Titre</label>
              <input className="mc-field" type="text" name="titre" value={editAnnonce.titre} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Prix (DH)</label>
              <input className="mc-field" type="number" name="prix" value={editAnnonce.prix} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Description</label>
              <input className="mc-field" type="text" name="description" value={editAnnonce.description} onChange={handleChange} />
            </div>
            <div>
              <label className="mc-label">Type</label>
              <select className="mc-field" name="type" value={editAnnonce.type} onChange={handleChange}>
                <option value="Moto">Moto</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>
            <div>
              <label className="mc-label">Marque</label>
              <input className="mc-field" type="text" name="marque" value={editAnnonce.marque ?? ''} onChange={handleChange} />
            </div>
            <div>
              <label className="mc-label">État</label>
              <select className="mc-field" name="etat" value={editAnnonce.etat ?? 'occasion'} onChange={handleChange}>
                <option value="occasion">Occasion</option>
                <option value="neuve">Neuve</option>
              </select>
            </div>
            <div>
              <label className="mc-label">Énergie</label>
              <select className="mc-field" name="energie" value={editAnnonce.energie} onChange={handleChange}>
                <option value="Essence">Essence</option>
                <option value="Electrique">Électrique</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" type="submit">Enregistrer</button>
            <button className="btn btn-outline" type="button" onClick={() => setEditAnnonce(null)}>Annuler</button>
          </div>
        </form>
      )}

      {annonces.length === 0 ? (
        <div className="mc-empty">Vous n'avez publié aucune annonce pour l'instant.</div>
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
                <h3 className="mc-listing-title">{a.titre}</h3>
                <p className="mc-listing-meta">{a.type} · {a.energie} · {a.ville}</p>
                {a.description && <div className="mc-listing-desc">{a.description}</div>}
                <div className="mc-listing-foot">
                  <span className="mc-plate">{a.prix.toLocaleString('fr-FR')} <small>DH</small></span>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon" onClick={() => handleEditClick(a)} title="Modifier"><Pen size={16} /></button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a._id)} title="Supprimer"><Trash size={16} /></button>
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

export default MesAnnonces;
