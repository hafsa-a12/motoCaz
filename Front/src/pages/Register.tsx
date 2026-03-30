import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

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
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        body: dataToSend,
      });

      const result = await response.json();
      setMessage(result.message || 'Inscription réussie');

      if (response.ok) {
        navigate('/login'); // ✅ Redirection après succès
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="register-page">
      <h1>Créer un compte</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
        <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required />
        <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} required />
        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
        <input type="password" name="motDePasse" placeholder="Mot de passe" value={formData.motDePasse} onChange={handleChange} required />
        <input type="file" name="pieceIdentite" accept="image/*,.pdf" onChange={handleFileChange} required />

        <button type="submit">S'inscrire</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
