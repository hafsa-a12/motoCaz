import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

type Annonce = {
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
};

const API_BASE = 'http://localhost:8000';

function Home() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filtres, setFiltres] = useState({
    type: '',
    energie: '',
    modele: '',
    ville: '',
    prixMin: '',
    prixMax: '',
    dateMin: '',
    sort: 'date_desc',
  });

  const fetchAnnonces = async (extra: Record<string, string | number> = {}) => {
    try {
      setLoading(true);
      let url = `${API_BASE}/api/annonces`;

      const query = { ...filtres, page, ...extra };
      const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([, v]) => String(v ?? '').trim() !== '')
      );

      const params = new URLSearchParams(filteredQuery as Record<string, string>).toString();
      if (params) url += `?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const data = await res.json();

      setAnnonces(data.items);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('Erreur lors du chargement des annonces :', e);
      setAnnonces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltres({ ...filtres, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnnonces({ page: 1 });
  };

  return (
    <div>
      <section className="hero">
        <h2>Bienvenue sur MOTOCAZ</h2>
        <p>La meilleure plateforme pour acheter ou vendre une moto ou un scooter.</p>
      </section>

      {/* Filtres */}
      <section className="filtre">
        <h3>Rechercher :</h3>
        <form onSubmit={handleSubmit}>
          <select id="type" value={filtres.type} onChange={handleChange}>
            <option value="">Type</option>
            <option value="Moto">Moto</option>
            <option value="Scooter">Scooter</option>
          </select>

          <select id="energie" value={filtres.energie} onChange={handleChange}>
            <option value="">Énergie</option>
            <option value="Essence">Essence</option>
            <option value="Electrique">Électrique</option>
          </select>

          <input id="modele" placeholder="Modèle" value={filtres.modele} onChange={handleChange} />
          <input id="ville" placeholder="Ville" value={filtres.ville} onChange={handleChange} />

          <input id="prixMin" type="number" placeholder="Prix min" value={filtres.prixMin} onChange={handleChange} />
          <input id="prixMax" type="number" placeholder="Prix max" value={filtres.prixMax} onChange={handleChange} />

          <input id="dateMin" type="date" value={filtres.dateMin} onChange={handleChange} />

          <select id="sort" value={filtres.sort} onChange={handleChange}>
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="ville_asc">Ville A→Z</option>
            <option value="ville_desc">Ville Z→A</option>
          </select>

          <button type="submit">Rechercher</button>
        </form>
      </section>

      {/* Résultats */}
      <div id="annonces" className='m-5'>
        <h3>Annonces disponibles</h3>
        {loading && <p>Chargement…</p>}
        {!loading && annonces.length === 0 && <p>Aucune annonce trouvée.</p>}
        <div className="annonces-grid grid gap-4 w-full
                grid-cols-[repeat(auto-fit,minmax(600px,1fr))]">
          {annonces.map((a) => (
            <div key={a._id} className="annonce-card flex gap-x-3 max-w-[700px] min-w-[600px] h-[350px]">
              {a.photos?.[0] && (
                <img src={`${API_BASE}${a.photos[0]}`} alt={a.titre} className="annonce-thumb max-w-[250px] max-h-full object-contain" />
              )}
              <div className='flex-col relative'>
                <h3>{a.titre}</h3>
              <div className="text-white border-[#128b9b] bg-[#7ebdc5] border-2 w-fit p-1 rounded-lg">{a.prix} DH</div>
              <p className='text-gray-700 font-[600]'>{a.type} - {a.energie} - {a.ville}</p>
              <div className='max-w-[280px] break-words overflow-ellipsis line-clamp-4'>{a.description}</div>
              <div className='w-fit absolute bottom-0 left-0'>
              <Link className='font-[500] text-[#646cff] hover:text-[#535bf2]' to={`/annonce/${a._id}`} >Voir détails</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
          <span>  Page {page} / {totalPages}  </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
