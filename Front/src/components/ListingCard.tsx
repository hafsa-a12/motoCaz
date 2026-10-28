import { Link } from 'react-router-dom';
import { Fuel, Heart, MapPin, Sparkles, BadgeCheck, Bike } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Annonce } from '../lib/types';
import { photoUrl } from '../lib/media';
import { formatPrice } from '../lib/format';
import { useFavorites } from '../hooks/useFavorites';

interface Props {
  annonce: Annonce;
  /** boutons d'action optionnels (modifier, supprimer...) affichés en bas de carte */
  actions?: ReactNode;
}

export default function ListingCard({ annonce: a, actions }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(a._id);
  const neuve = a.etat === 'neuve';

  return (
    <article className={`lc ${neuve ? 'lc--neuve' : ''}`}>
      <Link to={`/annonce/${a._id}`} className="lc__media" aria-label={a.titre}>
        {a.photos?.[0] ? (
          <img src={photoUrl(a.photos[0])} alt={a.titre} loading="lazy" />
        ) : (
          <div className="lc__empty">Aucune photo</div>
        )}
        <span className={`lc__state ${neuve ? 'lc__state--neuve' : ''}`}>
          {neuve ? <Sparkles size={12} /> : <BadgeCheck size={12} />}
          {neuve ? 'Neuve' : 'Occasion'}
        </span>
      </Link>

      <div className="lc__body">
        <div className="lc__top">
          <h3 className="lc__title"><Link to={`/annonce/${a._id}`}>{a.titre}</Link></h3>
          <button
            type="button"
            className={`lc__fav ${fav ? 'is-active' : ''}`}
            onClick={() => toggle(a._id)}
            aria-pressed={fav}
            aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="lc__tags">
          <span className="lc__tag"><Bike size={13} /> {a.type}</span>
          {a.marque && <span className="lc__tag">{a.marque}</span>}
          <span className="lc__tag"><Fuel size={13} /> {a.energie}</span>
          <span className="lc__tag"><MapPin size={13} /> {a.ville}</span>
        </div>

        <p className="lc__desc">{a.description}</p>

        <div className="lc__foot">
          {actions ? <div className="lc__actions">{actions}</div> : <Link to={`/annonce/${a._id}`} className="lc__more">Voir le détail →</Link>}
          <span className="mc-plate">{formatPrice(a.prix)} <small>DH</small></span>
        </div>
      </div>
    </article>
  );
}
