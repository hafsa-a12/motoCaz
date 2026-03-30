import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', { // ⚠️ mets ton port backend ici
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      });

      const result = await res.json();

      if (res.ok) {
        // ✅ Sauvegarder token et infos utilisateur
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);
        localStorage.setItem('nom', result.nom);
        localStorage.setItem('prenom', result.prenom);
        localStorage.setItem('userId', result.userId);

        setMessage('Connexion réussie ✅');

        // ✅ Redirection selon rôle
        if (result.role === 'superadmin') {
          navigate('/super-dashboard');
        } else if (result.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setMessage(result.message || 'Erreur de connexion ❌');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setMessage('Erreur serveur ❌');
    }
  };

  return (
    <div className="login-page">
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
