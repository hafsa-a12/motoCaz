import { Pen, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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
}

const API_BASE = 'http://localhost:8000';

const MesAnnonces = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [editAnnonce, setEditAnnonce] = useState<Annonce | null>(null);

  const token = localStorage.getItem('token'); // ✅ MODIF : utiliser token

  async function refetch(){
    fetch(`${API_BASE}/api/annonces/miennes`, { headers: { authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAnnonces(data))
      .catch(err => console.error('Erreur chargement annonces :', err));
  }
  useEffect(() => {
    if (!token) return;
    refetch()
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/annonces/${id}`, {
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
      const res = await fetch(`http://localhost:8000/api/annonces/${editAnnonce._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // ✅ MODIF
        },
        body: JSON.stringify(editAnnonce),
      });
      refetch()
      // const data = await res.json();
      // setAnnonces(prev => prev.map(a => a._id === data.annonce._id ? data.annonce : a));
      setEditAnnonce(null);
    } catch (err) {
      console.error("Erreur modification :", err);
    }
  };

  return (
    <div>
      <h2>📋 Mes Annonces</h2>

      {editAnnonce && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" ,marginLeft:"20px"}}>
          <h3>Modifier l’annonce</h3>
          <div className='flex w-full gap-x-2'>
            <input className="bg-white border-2 rounded-lg p-2" type="text" name="titre" value={editAnnonce.titre} onChange={handleChange} required />
            <input className="bg-white border-2 rounded-lg p-2" type="number" name="prix" value={editAnnonce.prix} onChange={handleChange} required />
            <input className="bg-white border-2 rounded-lg p-2" type="text" name="description" value={editAnnonce.description} onChange={handleChange} />
          
          <select className="bg-white border-2 rounded-lg p-2" name="type" value={editAnnonce.type} onChange={handleChange}>
            <option value="moto">Moto</option>
            <option value="scooter">Scooter</option>
          </select>

          <select className="bg-white border-2 rounded-lg p-2" name="energie" value={editAnnonce.energie} onChange={handleChange}>
            <option value="essence">Essence</option>
            <option value="electrique">Électrique</option>
          </select>

          <button className="text-white" type="submit">💾 Enregistrer</button>
          <button className="text-white" type="button" onClick={() => setEditAnnonce(null)}>❌ Annuler</button>
          </div>
        </form>
      )}

      <div className="annonces-grid grid gap-4 w-full
                grid-cols-[repeat(auto-fit,minmax(600px,1fr))]">
        {annonces.map((a) => (
          <div key={a._id} className="annonce-card flex gap-x-3 max-w-[700px] min-w-[600px] h-[320px]">
              {a.photos?.[0] && (
                <img src={`${API_BASE}${a.photos[0]}`} alt={a.titre} className="annonce-thumb max-w-[250px] max-h-full object-contain" />
              )}
            <div className='flex-col relative w-full'>
              <h3>{a.titre}</h3>
              <div className="text-white border-[#128b9b] bg-[#7ebdc5] border-2 w-fit p-1 rounded-lg">{a.prix} DH</div>
              <p className='text-gray-700 font-[600]'>{a.type} - {a.energie} - {a.ville}</p>
              {a.description && <div className='max-w-[280px] break-words overflow-ellipsis line-clamp-4'>{a.description}</div>}
              <div className='flex gap-x-5 absolute bottom-0 mt-5 w-full max-w-[200px]'>
              <button className='text-white flex items-center gap-x-2 flex-1 justify-center' onClick={() => handleEditClick(a)}><Pen/> Modifier</button>
              <button className='text-white flex items-center gap-x-2 flex-1 justify-center' onClick={() => handleDelete(a._id)}><Trash/> Supprimer</button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MesAnnonces;

