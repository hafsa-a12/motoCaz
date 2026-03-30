import { ArrowLeftCircleIcon, Check, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

const API_BASE = "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const AdminClientsDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  let preloadedClient = location.state?.c;
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger tous les clients
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

  useEffect(() => {
    if(preloadedClient !=null || preloadedClient != undefined){
      fetchClient();
    }
  }, []);

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

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur : {error}</p>;

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
      <div className="text-2xl font-bold mb-6 flex gap-x-4 items-center"><ArrowLeftCircleIcon size={29} className="cursor-pointer" onClick={()=>navigate(-1)}/> <span>{selectedClient?.prenom} {selectedClient?.nom}</span></div>
      <ul className="list-disc space-y-2 [&>li]:text-lg bg-white p-5 rounded-lg shadow-md mb-6 pl-10">
        <li><strong>NOM:</strong> {selectedClient?.nom}</li>
        <li><strong>PRENOM:</strong> {selectedClient?.prenom}</li>
        <li><strong>EMAIL:</strong> {selectedClient?.email}</li>
        <li><strong>TELEPHONE:</strong> {selectedClient?.telephone}</li>
        <li><strong>VILLE:</strong> {selectedClient?.ville}</li>
        <li><strong>DATE DE NAISSANCE:</strong> {selectedClient?.dateNaissance?formatDateTime(selectedClient?.dateNaissance):"-"}</li>
        <li><strong>BLOQUÉ:</strong> {selectedClient?.blocked ? (
                      <span className="text-red-600 font-semibold">Oui</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Non</span>
                    )}</li>
      </ul>
      <div className="annonces-grid grid gap-x-4 w-full
                grid-cols-[repeat(auto-fit,minmax(500px,600px))]">
        {annonces.length === 0 ? (
          <p>Aucune annonce trouvée pour ce client.</p>
        ) : (annonces.map((a) => (
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
    </div>
  );
};

const formatDateTime = (dateString:string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
export default AdminClientsDetails;
