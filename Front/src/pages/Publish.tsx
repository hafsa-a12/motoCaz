import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Publier.css';

const API_BASE = 'http://localhost:8000';

function Publier() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    type: 'Moto',
    energie: 'Essence',
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
    <div className="publier-page">
      <h1>Publier une annonce</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="titre" placeholder="Titre" value={formData.titre} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input type="number" name="prix" placeholder="Prix" value={formData.prix} onChange={handleChange} required />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="Moto">Moto</option>
          <option value="Scooter">Scooter</option>
        </select>
        <select name="energie" value={formData.energie} onChange={handleChange}>
          <option value="Essence">Essence</option>
          <option value="Electrique">Électrique</option>
        </select>
        <input type="file" name="photos" multiple accept="image/*" onChange={handleChange} />
        <button type="submit">Publier</button>
      </form>
      <p>{message}</p>
    </div>
  );

}


export default Publier;

