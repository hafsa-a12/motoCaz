import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../lib/config';

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    dateNaissance: '',
    motDePasse: '',
  });

  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPieceIdentite(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    if (pieceIdentite) {
      dataToSend.append('pieceIdentite', pieceIdentite);
    } else {
      setMessage("Veuillez choisir un fichier de pièce d'identité");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: dataToSend,
      });

      const result = await response.json();
      setMessage(result.message || 'Inscription réussie');

      if (response.ok) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-card mc-auth-card--wide">
        <p className="mc-eyebrow mb-2">Nouveau membre</p>
        <h1 className="mc-auth-title">Créer un compte</h1>
        <p className="mc-auth-sub">Rejoignez Motocaz pour publier et gérer vos annonces.</p>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="mc-auth-form">
          <div className="mc-auth-row">
            <div>
              <label className="mc-label">Nom</label>
              <input className="mc-field" type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Prénom</label>
              <input className="mc-field" type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="mc-label">Email</label>
            <input className="mc-field" type="email" name="email" placeholder="vous@exemple.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mc-auth-row">
            <div>
              <label className="mc-label">Téléphone</label>
              <input className="mc-field" type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Ville</label>
              <input className="mc-field" type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} required />
            </div>
          </div>

          <div className="mc-auth-row">
            <div>
              <label className="mc-label">Date de naissance</label>
              <input className="mc-field" type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
            </div>
            <div>
              <label className="mc-label">Mot de passe</label>
              <input className="mc-field" type="password" name="motDePasse" placeholder="••••••••" value={formData.motDePasse} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="mc-label">Pièce d'identité</label>
            <input className="mc-file" type="file" name="pieceIdentite" accept="image/*,.pdf" onChange={handleFileChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-full">S'inscrire</button>
        </form>

        {message && <p className="mc-auth-msg">{message}</p>}

        <p className="mc-auth-foot">
          Déjà membre ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
