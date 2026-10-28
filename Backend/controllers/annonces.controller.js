// controllers/annonces.controller.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Annonce = require('../models/Annonce');
const User = require('../models/User');

const TYPES = ['Moto', 'Scooter'];
const ENERGIES = ['Essence', 'Electrique'];
const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'annonces');

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const contains = (value) => new RegExp(escapeRegex(String(value).trim()), 'i');
const isAdminRole = (role) => role === 'admin' || role === 'superadmin';

const SORTS = {
  date_desc: { datePublication: -1 },
  date_asc: { datePublication: 1 },
  prix_asc: { prix: 1 },
  prix_desc: { prix: -1 },
  ville_asc: { ville: 1 },
  ville_desc: { ville: -1 },
};

/** Supprime les photos uploadées par un vendeur (fichiers "<timestamp>-<n>.ext"), jamais les photos de démo. */
function removeUploadedPhotos(photos = []) {
  for (const p of photos) {
    const name = path.basename(String(p));
    if (/^\d+-\d+\.\w+$/.test(name) && String(p).startsWith('/annonces/')) {
      fs.unlink(path.join(PHOTOS_DIR, name), () => {});
    }
  }
}

/**
 * GET /api/annonces — annonces VALIDÉES uniquement
 * Filtres : type, energie, etat, marque, modele, ville, prixMin, prixMax, dateMin, dateMax
 * Tri : sort ; pagination : page, limit
 */
exports.getAnnonces = async (req, res) => {
  try {
    const { type, energie, etat, marque, modele, ville, prixMin, prixMax, dateMin, dateMax, sort } = req.query;
    const q = { statut: 'validee' };

    if (type) q.type = String(type);
    if (energie) q.energie = String(energie);
    if (etat) q.etat = String(etat);
    if (marque) q.marque = contains(marque);
    if (modele) q.modele = contains(modele);
    if (ville) q.ville = contains(ville);
    if (prixMin || prixMax) {
      q.prix = {};
      if (prixMin) q.prix.$gte = Number(prixMin);
      if (prixMax) q.prix.$lte = Number(prixMax);
    }
    if (dateMin || dateMax) {
      q.datePublication = {};
      if (dateMin) q.datePublication.$gte = new Date(dateMin);
      if (dateMax) q.datePublication.$lte = new Date(dateMax);
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    const [items, total] = await Promise.all([
      Annonce.find(q).sort(SORTS[sort] || SORTS.date_desc).skip((page - 1) * limit).limit(limit),
      Annonce.countDocuments(q),
    ]);

    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * GET /api/annonces/:id
 * - une annonce non validée n'est visible que par son auteur et les admins
 * - email / téléphone du vendeur : visibles seulement si on est connecté
 */
exports.getAnnonceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Annonce introuvable' });

    const a = await Annonce.findById(id)
      .populate({ path: 'userId', select: 'nom prenom email telephone' })
      .lean();
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });

    const ownerId = String(a.userId?._id ?? a.userId);
    const isOwner = req.user && String(req.user.id) === ownerId;
    const isAdmin = req.user && isAdminRole(req.user.role);

    if (a.statut !== 'validee' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Annonce introuvable' });
    }

    if (!req.user && a.userId) {
      delete a.userId.email;
      delete a.userId.telephone;
    }
    res.json(a);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** GET /api/annonces/miennes */
exports.getMesAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find({ userId: req.user.id }).sort({ datePublication: -1 });
    res.json(annonces);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** POST /api/annonces (multipart, champ "photos") */
exports.creerAnnonce = async (req, res) => {
  const cleanup = () => removeUploadedPhotos((req.files || []).map((f) => `/annonces/${path.basename(f.path)}`));
  try {
    const { titre, description, type, energie, marque, modele, etat, prix } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) { cleanup(); return res.status(401).json({ message: 'Compte introuvable' }); }
    if (user.blocked) { cleanup(); return res.status(403).json({ message: 'Compte bloqué' }); }

    if (!titre || !description || !type || !energie) {
      cleanup();
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    if (!TYPES.includes(type) || !ENERGIES.includes(energie)) {
      cleanup();
      return res.status(400).json({ message: 'Type ou énergie invalide' });
    }
    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0) {
      cleanup();
      return res.status(400).json({ message: 'Le prix doit être supérieur à 0' });
    }
    const ville = user.ville || req.body.ville;
    if (!ville) { cleanup(); return res.status(400).json({ message: 'Ville manquante' }); }

    const photos = (req.files || []).map((f) => path.posix.join('/annonces', path.basename(f.path)));

    const annonce = await Annonce.create({
      titre, description, type, energie,
      marque: marque || '',
      modele: modele || '',
      etat: etat === 'neuve' ? 'neuve' : 'occasion',
      ville,
      prix: prixNum,
      photos,
      statut: 'en attente', // visible après validation par un admin
      userId: req.user.id,
    });

    res.status(201).json({ message: 'Annonce envoyée, elle sera visible après validation', annonce });
  } catch (e) {
    cleanup();
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** PUT /api/annonces/:id — modifier sa propre annonce */
exports.updateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Annonce introuvable' });

    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });
    if (String(a.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Non autorisé' });

    const up = {};
    ['titre', 'description', 'type', 'energie', 'marque', 'modele', 'etat', 'ville'].forEach((k) => {
      if (k in req.body) up[k] = req.body[k];
    });
    if (up.type && !TYPES.includes(up.type)) return res.status(400).json({ message: 'Type invalide' });
    if (up.energie && !ENERGIES.includes(up.energie)) return res.status(400).json({ message: 'Énergie invalide' });
    if (up.etat && !['neuve', 'occasion'].includes(up.etat)) return res.status(400).json({ message: 'État invalide' });
    if ('prix' in req.body) {
      const p = Number(req.body.prix);
      if (Number.isNaN(p) || p <= 0) return res.status(400).json({ message: 'Prix invalide' });
      up.prix = p;
    }

    const updated = await Annonce.findByIdAndUpdate(id, up, { new: true, runValidators: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** PUT /api/annonces/:id/rejeter (admin) */
exports.rejeterAnnonce = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Annonce introuvable' });
    const updated = await Annonce.findByIdAndUpdate(req.params.id, { statut: 'rejete' }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ message: 'Annonce rejetée', annonce: updated });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** DELETE /api/annonces/:id — l'auteur ou un admin */
exports.deleteAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Annonce introuvable' });

    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });

    const isOwner = String(a.userId) === String(req.user.id);
    if (!isOwner) {
      // pas l'auteur : seul un admin (vérifié en base) peut supprimer
      const user = await User.findById(req.user.id);
      if (!user || !isAdminRole(user.role) || user.blocked) {
        return res.status(403).json({ message: 'Non autorisé' });
      }
    }

    removeUploadedPhotos(a.photos);
    await a.deleteOne();
    res.json({ message: 'Annonce supprimée' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
