import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import FilterBar, { type Filters } from '../components/FilterBar';
import ListingCard from '../components/ListingCard';
import Pagination from '../components/Pagination';
import { API_BASE } from '../lib/config';
import type { Annonce } from '../lib/types';

const EMPTY_FILTERS: Filters = { type: '', energie: '', marque: '', modele: '', ville: '', etat: '' };

export default function Home() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [sort, setSort] = useState('date_desc');

  const fetchAnnonces = async (targetPage = page) => {
    try {
      setLoading(true);
      const query: Record<string, string> = { ...filters, prixMin, prixMax, sort, page: String(targetPage) };
      const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v.trim() !== ''));
      const res = await fetch(`${API_BASE}/api/annonces?${params}`);
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      const data = await res.json();
      setAnnonces(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('Erreur lors du chargement des annonces :', e);
      setAnnonces([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Recharge quand la page, le tri ou l'état (neuve / occasion) change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAnnonces(); }, [page, sort, filters.etat]);

  const patchFilters = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    if ('etat' in patch) setPage(1);
  };

  const submit = () => {
    setPage(1);
    fetchAnnonces(1);
  };

  return (
    <div className="mc-shell">
      <Hero />
      <FilterBar filters={filters} onChange={patchFilters} onSubmit={submit} />

      <div className="results__head">
        <h2 className="results__title">
          Annonces disponibles
          <span className="results__count">{loading ? 'Chargement…' : `${total} résultat${total > 1 ? 's' : ''}`}</span>
        </h2>
        <div className="results__tools">
          <input className="mc-field" type="number" min={0} placeholder="Min (DH)" value={prixMin}
                 onChange={(e) => setPrixMin(e.target.value)} onBlur={submit} />
          <input className="mc-field" type="number" min={0} placeholder="Max (DH)" value={prixMax}
                 onChange={(e) => setPrixMax(e.target.value)} onBlur={submit} />
          <select className="mc-field" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Trier">
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="ville_asc">Ville A → Z</option>
            <option value="ville_desc">Ville Z → A</option>
          </select>
        </div>
      </div>

      {!loading && annonces.length === 0 && <div className="mc-empty">Aucune annonce ne correspond à votre recherche.</div>}

      <div className="lc-grid">
        {annonces.map((a) => <ListingCard key={a._id} annonce={a} />)}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
