import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../lib/config';

function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);
        localStorage.setItem('nom', result.nom);
        localStorage.setItem('prenom', result.prenom);
        localStorage.setItem('userId', result.userId);

        setMessage('Connexion réussie');

        if (result.role === 'superadmin') {
          navigate('/superadmin');
        } else if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setMessage(result.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-card">
        <p className="mc-eyebrow mb-2">Espace membre</p>
        <h1 className="mc-auth-title">Connexion</h1>
        <p className="mc-auth-sub">Accédez à vos annonces et à votre compte Motocaz.</p>

        <form onSubmit={handleSubmit} className="mc-auth-form">
          <div>
            <label className="mc-label">Email</label>
            <input
              className="mc-field"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mc-label">Mot de passe</label>
            <input
              className="mc-field"
              type="password"
              placeholder="••••••••"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Se connecter</button>
        </form>

        {message && <p className="mc-auth-msg">{message}</p>}

        <p className="mc-auth-foot">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
