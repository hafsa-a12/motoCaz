import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import { photoUrl } from "../lib/media";
import { API_BASE } from '../lib/config';

type Vendeur = {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
};

type Annonce = {
  _id: string;
  titre: string;
  description: string;
  type: string;
  energie: string;
  marque?: string;
  etat?: string;
  modele?: string;
  ville: string;
  prix: number;
  photos: string[];
  userId?: Vendeur;
  datePublication?: string;
};


function AnnonceDetail() {
  const { id } = useParams();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/annonces/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setAnnonce(res.ok ? await res.json() : null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  if (loading) return <p className="text-center py-20 text-[var(--color-mute)]  text-sm">Chargement…</p>;
  if (!annonce) return <p className="text-center py-20 text-[var(--color-mute)]  text-sm">Annonce introuvable.</p>;

  const isCoordsVisible = Boolean(annonce.userId?.email || annonce.userId?.telephone);

  const nextSlide = () =>
    setCurrentIndex((prev) =>
      annonce.photos && annonce.photos.length > 0
        ? (prev + 1) % annonce.photos.length
        : 0
    );

  const prevSlide = () =>
    setCurrentIndex((prev) =>
      annonce.photos && annonce.photos.length > 0
        ? (prev - 1 + annonce.photos.length) % annonce.photos.length
        : 0
    );

  return (
    <div className="w-full">
      {/* Title */}
      <div className="border-b border-[var(--color-line-soft)] bg-[var(--color-bg-soft)]">
        <div className="mc-shell py-6 flex items-center justify-between gap-6 flex-wrap">
          <h1 className="text-2xl md:text-3xl text-[var(--color-text)]">{annonce.titre}</h1>
          <span className="mc-plate mc-plate--lg">{annonce.prix.toLocaleString('fr-FR')} <small>DH</small></span>
        </div>
      </div>

      {/* Image Slideshow */}
      <div className="relative w-full h-[50vh] flex items-center justify-center bg-[var(--color-bg-soft)] overflow-hidden">
        {annonce.photos && annonce.photos.length > 0 ? (
          <>
            <img
              src={photoUrl(annonce.photos[currentIndex])}
              alt={annonce.titre}
              className="h-full w-auto max-w-full object-contain"
            />
            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {annonce.photos.map((_, i) => (
                <span
                  key={i + "ANNONCE"}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-[var(--color-primary)]" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-center py-20 text-[var(--color-mute)]  text-sm">Aucune photo.</p>
        )}
      </div>

      {/* Info + Coords */}
      <div className="mc-shell mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        {/* Info Section */}
        <div className="md:col-span-2 mc-panel space-y-4">
          <p className="text-[var(--color-mute)] leading-relaxed">{annonce.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span><strong className="text-[var(--color-text)]">État :</strong> <span className="text-[var(--color-mute)]">{annonce.etat === 'neuve' ? 'Neuve' : 'Occasion'}</span></span>
            {annonce.marque && (
              <span><strong className="text-[var(--color-text)]">Marque :</strong> <span className="text-[var(--color-mute)]">{annonce.marque}</span></span>
            )}
            <span><strong className="text-[var(--color-text)]">Type :</strong> <span className="text-[var(--color-mute)]">{annonce.type}</span></span>
            <span><strong className="text-[var(--color-text)]">Énergie :</strong> <span className="text-[var(--color-mute)]">{annonce.energie}</span></span>
            {annonce.modele && (
              <span><strong className="text-[var(--color-text)]">Modèle :</strong> <span className="text-[var(--color-mute)]">{annonce.modele}</span></span>
            )}
            <span><strong className="text-[var(--color-text)]">Ville :</strong> <span className="text-[var(--color-mute)]">{annonce.ville}</span></span>
          </div>
          {annonce.datePublication && (
            <p className="text-xs text-[var(--color-mute-2)] uppercase tracking-wider">
              Publié le {new Date(annonce.datePublication).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Coords Section */}
        <div className="mc-panel">
          {isCoordsVisible ? (
            <>
              <h3 className="text-lg mb-3 text-[var(--color-text)]">
                Coordonnées du vendeur
              </h3>
              <p className="text-[var(--color-mute)] mb-3">
                {annonce.userId?.nom} {annonce.userId?.prenom}
              </p>
              {annonce.userId?.email && (
                <p className="flex my-2 gap-x-2 items-center text-sm text-[var(--color-mute)]">
                  <Mail size={16} className="text-[var(--color-primary-ink)]" /> {annonce.userId.email}
                </p>
              )}
              {annonce.userId?.telephone && (
                <p className="flex my-2 gap-x-2 items-center text-sm text-[var(--color-mute)]">
                  <Phone size={16} className="text-[var(--color-primary-ink)]" /> {annonce.userId.telephone}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--color-mute)]">
              <a href="/login" className="text-[var(--color-primary-ink)] hover:underline font-semibold">
                Connectez-vous
              </a>{" "}
              pour voir les coordonnées du vendeur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnonceDetail;
