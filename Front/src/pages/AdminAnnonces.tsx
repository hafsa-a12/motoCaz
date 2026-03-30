import { Check, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";

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

const API_BASE = "http://localhost:8000";
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}
function AdminDashboard() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  const token = localStorage.getItem("token");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
     loadData()
    }, []);

  const loadData = async () => {
    console.log("Is this called")
    try {
      setLoading(true)

      const result = await fetch(`${API_BASE}/api/annonces?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await result.json()
      console.log(data)
      setAnnonces(data?.items || []);
      setTotalPages(data.totalPages);
    } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        console.error("Erreur suppression :", e);
    } finally {
      setLoading(false)
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await fetch(`${API_BASE}/api/annonces/byAdmin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await result.json()
      loadData()
    } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        console.error("Erreur suppression :", e);
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur : {error}</p>;

  const validerAnnonce = async (id: string) => {
    const result = await fetch(`${API_BASE}/api/admin/annonces/${id}/valider`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const data = await result.json()
    console.log(data)
    if(!result.ok)
    {
      alert(data?.["message"] ?? "Could not do action")
    }

    loadData();
  };
  const rejeterAnnonce = async (id: string) => {
    const result = await fetch(`${API_BASE}/api/admin/annonces/${id}/rejeter`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const data = await result.json()
    console.log(data)
    if(!result.ok)
    {
      alert(data?.["message"] ?? "Could not do action")
    }

    loadData();
  };

  function getStatutColor(statut: string) {
    switch (statut){
      case "rejete":
        return "bg-[#9f0712]";
      case "validee":
        return "bg-[#03d3b9]";
      default:
        return "bg-[#3b3b3f]";
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold mb-6 flex gap-x-4 items-center">Gestion des annonces</div>
      <div className="annonces-grid grid gap-x-4 w-full
                grid-cols-[repeat(auto-fit,minmax(500px,600px))]">
        {annonces.length === 0 ? (
          <p>Aucune annonce trouvée pour ce client.</p>
        ) : (annonces?.map((a) => (
          <div key={a._id} className="annonce-card flex gap-x-3 max-w-[500px] min-w-[600px] h-[320px]">
              {a.photos?.[0] && (
                <img src={`${API_BASE}${a.photos[0]}`} alt={a.titre} className="annonce-thumb max-w-[250px] max-h-full object-contain" />
              )}
            <div className='flex-col relative w-full'>
              <h3>{a.titre}</h3>
              <div className="text-white border-[#128b9b] bg-[#7ebdc5] border-2 w-fit p-1 rounded-lg">{a.prix} DH</div>
              <p className='text-gray-700 font-[600]'>{a.type} - {a.energie} - {a.ville}</p>
              {a.description && <div className='max-w-[280px] break-words overflow-ellipsis line-clamp-4'>{a.description}</div>}
              <div className='flex gap-x-3 absolute bottom-0 mt-5 w-full max-w-[200px] justify-end right-0'>
              {a.statut=="en attente" && <button className='text-white' onClick={()=>validerAnnonce(a._id)}><Check/></button>}
              {a.statut=="en attente" && <button className='text-white' onClick={()=>rejeterAnnonce(a._id)}><X/></button>}
              <button className='text-white' onClick={() => handleDelete(a._id)}><Trash/></button>
            </div>
              <div className={"absolute top-0 right-0 rounded p-1 text-white "+getStatutColor(a.statut)}>{a.statut}</div>
            </div>
          </div>
        )))}
      </div>
      {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
          <span>  Page {page} / {totalPages}  </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
        </div>
    </div>
  );
}

export default AdminDashboard;
