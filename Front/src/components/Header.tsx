
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifions si l'utilisateur est admin
  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.role === 'admin' || data.role ==="superadmin") {
            setIsAdmin(true);
          }
        })
        .catch((err) => {
          console.error("Erreur de la vérification admin :", err);
          setIsAdmin(false);
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    localStorage.removeItem('role');
    setIsAdmin(false)
    navigate('/login');
  };

  return (
    <header className='bg-[#222] text-white px-[0.5rem] py-[1.5rem] flex justify-between items-center h-[80px]'>
      <h1 className=''>MOTOCAZ</h1>
      <nav>
        <Link to="/">Accueil</Link>

        {!userId && <Link to="/login">Connexion</Link>}
        {!userId && <Link to="/register">Inscription</Link>}

        {userId && !isAdmin && <Link to="/publish">Publier</Link>}
        {userId && !isAdmin && <Link to="/mes-annonces">Mes Annonces</Link>}

        {/* ceci est visible uniquement si admin */}
        {userId && isAdmin && <Link to="/admin">Admin</Link>}

        {userId && (
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Déconnexion
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
