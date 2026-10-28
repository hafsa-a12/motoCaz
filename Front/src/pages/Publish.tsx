import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../lib/config';


function Publier() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    type: 'Moto',
    energie: 'Essence',
    marque: '',
    modele: '',
    etat: 'occasion',
    photos: [] as File[],
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('Vous devez être connecté pour publier une annonce.');
      navigate('/login');
    }
  }, [navigate, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'photos' && files) {
      setFormData({ ...formData, photos: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('titre', formData.titre);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('prix', formData.prix);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('energie', formData.energie);
    formDataToSend.append('marque', formData.marque);
    formDataToSend.append('modele', formData.modele);
    formDataToSend.append('etat', formData.etat);

    formData.photos.forEach((photo) => {
      formDataToSend.append('photos', photo);
    });

    try {
      const res = await fetch(`${API_BASE}/api/annonces`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await res.json();
      setMessage(result.message);

      if (res.ok) {
        setFormData({
          titre: '',
          description: '',
          prix: '',
          type: 'Moto',
          energie: 'Essence',
          marque: '',
          modele: '',
          etat: 'occasion',
          photos: [],
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur publication:', error);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-card mc-auth-card--wide">
        <p className="mc-eyebrow mb-2">Espace vendeur</p>
        <h1 className="mc-auth-title">Publier une annonce</h1>
        <p className="mc-auth-sub">Décrivez votre moto ou scooter pour la mettre en vente.</p>

        <form onSubmit={handleSubmit} className="mc-auth-form">
          <div>
            <label className="mc-label">Titre</label>
            <input className="mc-field" type="text" name="titre" placeholder="Ex. Yamaha MT-07 2021" value={formData.titre} onChange={handleChange} required />
          </div>

          <div>
            <label className="mc-label">Description</label>
            <textarea className="mc-field" name="description" placeholder="État, kilométrage, historique d'entretien…" rows={4} value={formData.description} onChange={handleChange} required />
          </div>

          <div className="mc-auth-row">
            <div>
              <label className="mc-label">Prix (DH)</label>
              <input className="mc-field" type="number" name="prix" placeholder="Prix" value={formData.prix} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Type</label>
              <select className="mc-field" name="type" value={formData.type} onChange={handleChange}>
                <option value="Moto">Moto</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>
          </div>

          <div className="mc-auth-row">
            <div>
              <label className="mc-label">Marque</label>
              <input className="mc-field" type="text" name="marque" placeholder="Ex. Yamaha" value={formData.marque} onChange={handleChange} />
            </div>
            <div>
              <label className="mc-label">Modèle</label>
              <input className="mc-field" type="text" name="modele" placeholder="Ex. MT-07" value={formData.modele} onChange={handleChange} />
            </div>
          </div>

          <div className="mc-auth-row">
            <div>
              <label className="mc-label">État</label>
              <select className="mc-field" name="etat" value={formData.etat} onChange={handleChange}>
                <option value="occasion">Occasion</option>
                <option value="neuve">Neuve</option>
              </select>
            </div>
            <div>
              <label className="mc-label">Énergie</label>
              <select className="mc-field" name="energie" value={formData.energie} onChange={handleChange}>
                <option value="Essence">Essence</option>
                <option value="Electrique">Électrique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mc-label">Photos</label>
            <input className="mc-file" type="file" name="photos" multiple accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary w-full">Publier l'annonce</button>
        </form>

        {message && <p className="mc-auth-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Publier;
