import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import { API_BASE } from '../lib/config';
import type { Annonce } from '../lib/types';

export default function Favoris() {
  const { ids } = useFavorites();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`${API_BASE}/api/annonces/${id}`)
          .then((r) => (r.ok ? (r.json() as Promise<Annonce>) : null))
          .catch(() => null)
      )
    ).then((list) => {
      if (cancelled) return;
      setAnnonces(list.filter((a): a is Annonce => a !== null));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="mc-shell" style={{ paddingTop: '2rem' }}>
      <p className="mc-eyebrow" style={{ marginBottom: '.4rem' }}>Ma sélection</p>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Mes favoris</h1>

      {loading && ids.length > 0 && <p style={{ color: 'var(--color-mute)' }}>Chargement…</p>}

      {ids.length === 0 ? (
        <div className="mc-empty">
          Vous n'avez pas encore de favoris. Cliquez sur le cœur d'une annonce pour la retrouver ici.
          <div style={{ marginTop: '1rem' }}><Link to="/" className="btn btn-primary">Parcourir les annonces</Link></div>
        </div>
      ) : (
        <div className="lc-grid">
          {annonces.map((a) => <ListingCard key={a._id} annonce={a} />)}
        </div>
      )}
    </div>
  );
}
