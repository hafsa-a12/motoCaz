import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";

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
  modele?: string;
  ville: string;
  prix: number;
  photos: string[];
  userId?: Vendeur;
  datePublication?: string;
};

const API_BASE = "http://localhost:8000";

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
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAnnonce(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  if (loading) return <p className="text-center py-10">Chargement...</p>;
  if (!annonce) return <p className="text-center py-10">Annonce introuvable.</p>;

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
      <div className="text-3xl font-bold text-center w-full relative"><div className="py-3">{annonce.titre}</div> <span className="absolute top-0 right-0 text-white bg-teal-700 h-full flex items-center px-5 font-[400]">{annonce.prix} DH</span></div>

      {/* Image Slideshow */}
      <div className="border-t-2 border-gray-200 relative w-full h-[50vh] flex items-center justify-center bg-gray-300 overflow-hidden shadow-lg">
        {annonce.photos && annonce.photos.length > 0 ? (
          <>
            <img
              src={`${API_BASE}${annonce.photos[currentIndex]}`}
              alt={annonce.titre}
              className="h-full w-auto max-w-full object-contain bg-gray-300"
            />
            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {annonce.photos.map((_, i) => (
                <span
                  key={i+"ANNONCE"}
                  className={`w-3 h-3 rounded-full shadow ${
                    i === currentIndex ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-center py-20">Aucune photo.</p>
        )}
      </div>

      {/* Info + Coords */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Section */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-2xl p-6 space-y-4">
          <p className="text-gray-700">{annonce.description}</p>
          <p>
            <strong>Type:</strong> {annonce.type} | <strong>Énergie:</strong>{" "}
            {annonce.energie}
          </p>
          {annonce.modele && (
            <p>
              <strong>Modèle:</strong> {annonce.modele}
            </p>
          )}
          <p>
            <strong>Ville:</strong> {annonce.ville}
          </p>
          {annonce.datePublication && (
            <p className="text-sm text-gray-500">
              Publié le{" "}
              {new Date(annonce.datePublication).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Coords Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          {isCoordsVisible ? (
            <>
              <h3 className="text-lg font-semibold mb-1">
                Coordonnées du vendeur
              </h3>
              <p>
                {annonce.userId?.nom} {annonce.userId?.prenom}
              </p>
              {annonce.userId?.email && <p className="flex my-2 gap-x-2"><Mail/> {annonce.userId.email}</p>}
              {annonce.userId?.telephone && (
                <p className="flex my-2 gap-x-2"><Phone/> {annonce.userId.telephone}</p>
              )}
            </>
          ) : (
            <p>
              <a href="/login" className="text-blue-600 hover:underline">
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
