import { Search, Sparkles, BadgeCheck } from 'lucide-react';
import type { Etat } from '../lib/types';

export interface Filters {
  type: string;
  energie: string;
  marque: string;
  modele: string;
  ville: string;
  etat: '' | Etat;
}

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onSubmit: () => void;
}

export default function FilterBar({ filters, onChange, onSubmit }: Props) {
  const toggleEtat = (etat: Etat) => onChange({ etat: filters.etat === etat ? '' : etat });

  return (
    <section className="filters" aria-label="Recherche">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="filters__row">
          <select className="mc-field" value={filters.type} onChange={(e) => onChange({ type: e.target.value })} aria-label="Type">
            <option value="">Type</option>
            <option value="Moto">Moto</option>
            <option value="Scooter">Scooter</option>
          </select>
          <select className="mc-field" value={filters.energie} onChange={(e) => onChange({ energie: e.target.value })} aria-label="Énergie">
            <option value="">Énergie</option>
            <option value="Essence">Essence</option>
            <option value="Electrique">Électrique</option>
          </select>
          <input className="mc-field" placeholder="Marque" value={filters.marque} onChange={(e) => onChange({ marque: e.target.value })} />
          <input className="mc-field" placeholder="Modèle" value={filters.modele} onChange={(e) => onChange({ modele: e.target.value })} />
          <input className="mc-field" placeholder="Ville" value={filters.ville} onChange={(e) => onChange({ ville: e.target.value })} />
          <button type="submit" className="btn btn-primary filters__submit"><Search size={17} /> Rechercher</button>
        </div>

        <div className="condition">
          <button type="button" className={`condition__btn condition__btn--neuve ${filters.etat === 'neuve' ? 'is-active' : ''}`} onClick={() => toggleEtat('neuve')}>
            <Sparkles size={18} /> Motos neuves
          </button>
          <button type="button" className={`condition__btn condition__btn--occasion ${filters.etat === 'occasion' ? 'is-active' : ''}`} onClick={() => toggleEtat('occasion')}>
            <BadgeCheck size={18} /> Motos d'occasion
          </button>
        </div>
      </form>
    </section>
  );
}
