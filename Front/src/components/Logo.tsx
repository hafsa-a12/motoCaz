import { Bike } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Motocaz — accueil">
      <span className="brand__mark"><Bike size={22} strokeWidth={2.2} /></span>
      <span className="brand__name">Moto<span>caz</span></span>
    </Link>
  );
}
