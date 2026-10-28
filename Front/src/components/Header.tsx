import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bike, Heart, Plus } from 'lucide-react';
import { API_BASE } from '../lib/config';
import { useFavorites } from '../hooks/useFavorites';

const Header = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { ids } = useFavorites();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.role === 'admin' || data.role === 'superadmin'))
      .catch(() => setIsAdmin(false));
  }, [token]);

  const handleLogout = () => {
    ['userId', 'token', 'nom', 'prenom', 'role'].forEach((k) => localStorage.removeItem(k));
    setIsAdmin(false);
    navigate('/login');
  };

  const link = (to: string, label: React.ReactNode) => (
    <Link to={to} className={`mc-nav__link ${pathname === to ? 'is-active' : ''}`}>
      {label}
    </Link>
  );

  return (
    <header className="mc-header">
      <div className="mc-shell mc-header__inner">
        <Link to="/" className="mc-brand">
          <span className="mc-brand__mark"><Bike size={22} /></span>
          <span>Moto<span className="mc-brand__accent">caz</span></span>
        </Link>

        <nav className="mc-nav">
          {link('/', 'Accueil')}
          {link(
            '/favoris',
            <>
              <Heart size={16} /> Favoris{' '}
              {ids.length > 0 && <span className="mc-nav__count">{ids.length}</span>}
            </>
          )}

          {userId && !isAdmin && link('/mes-annonces', 'Mes annonces')}
          {userId && isAdmin && link('/admin', 'Administration')}
          {!userId && link('/login', 'Connexion')}

          <div className="mc-nav__actions">
            {!isAdmin && (
              <Link to="/publish" className="mc-btn mc-btn--primary">
                <Plus size={16} /> Publier
              </Link>
            )}
            {!userId && (
              <Link to="/register" className="mc-btn mc-btn--outline-light">Inscription</Link>
            )}
            {userId && (
              <button onClick={handleLogout} className="mc-btn mc-btn--outline-light">Déconnexion</button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;