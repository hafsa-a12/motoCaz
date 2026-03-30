// controllers/annonces.controller.js
const path = require('path');
const Annonce = require('../models/Annonce');
const User = require('../models/User');

/**
 * GET /annonces
 * Filtres possibles: type, energie, modele, ville, minPrix, maxPrix, date (>=), dateMin, dateMax
 * Tri: sort = prix_asc|prix_desc|date_asc|date_desc|ville_asc|ville_desc
 * Par défaut: prix > 0 et tri par ville asc puis date desc
 */
exports.getAnnonces = async (req, res) => {
  try {
    const { type, energie, modele, ville, prixMin, prixMax, dateMin, dateMax, tri } = req.query;
    const q = { statut: 'validee' };

    if (type) q.type = type;
    if (energie) q.energie = energie;
    if (modele) q.modele = modele;
    if (ville) q.ville = ville;
    if (prixMin || prixMax) q.prix = {};
    if (prixMin) q.prix.$gte = Number(prixMin);
    if (prixMax) q.prix.$lte = Number(prixMax);
    if (dateMin || dateMax) q.datePublication = {};
    if (dateMin) q.datePublication.$gte = new Date(dateMin);
    if (dateMax) q.datePublication.$lte = new Date(dateMax);

    const sortObj = {};
    if (tri === 'prix') sortObj.prix = 1;
    if (tri === 'date') sortObj.datePublication = -1;
    if (tri === 'ville') sortObj.ville = 1;

    // --- Pagination ---
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Annonce.find(q).sort(sortObj).skip(skip).limit(limit),
      Annonce.countDocuments(q)
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * GET /annonces/:id
 * Si req.user présent (verifyTokenOptional), on renvoie email/téléphone du vendeur,
 * sinon on les masque.
 */
exports.getAnnonceById = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Annonce.findById(id)
      .populate({ path: 'userId', select: 'nom prenom email telephone' })
      .lean();

    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });

    // Masquer les coordonnées si pas connecté
    if (!req.user) {
      if (a.userId) {
        delete a.userId.email;
        delete a.userId.telephone;
      }
    }
    res.json(a);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};

/**
 * GET /annonces/miennes
 */
exports.getMesAnnonces = async (req, res) => {
  try {
    const userId = req.user.id;
    const annonces = await Annonce.find({ userId }).sort({ datePublication: -1 });
    res.json(annonces);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};

/**
 * POST /annonces
 * Utilise req.files pour photos (champ 'photos')
 */
exports.creerAnnonce = async (req, res) => {
  try {
    const { titre, description, type, energie, modele, prix } = req.body;

    const user = await User.findById(req.user.id)
    if(!user)
      return res.status(400).send({message:"User not found"})

    if (!titre || !description || !type || !energie)
      return res.status(400).json({ message: 'Champs requis manquants' });

    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0)
      return res.status(400).json({ message: 'Le prix doit être > 0' });

    const photos = (req.files || []).map(f =>
      path.posix.join('/annonces', path.basename(f.path))
    );

    const annonce = await Annonce.create({
      titre,
      description,
      type,
      energie,
      modele: modele || '',
      ville:user.ville,
      prix: prixNum,
      photos,
      statut: 'en attente',
      userId: req.user.id
    });

    res.status(201).json(annonce);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};

/**
 * PUT /annonces/:id
 */
exports.updateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });
    if (String(a.userId) !== String(req.user.id))
      return res.status(403).json({ message: 'Non autorisé' });

    const up = {};
    ['titre', 'description', 'type', 'energie', 'modele', 'ville', 'statut'].forEach(k => {
      if (k in req.body) up[k] = req.body[k];
    });
    if ('prix' in req.body) {
      const p = Number(req.body.prix);
      if (Number.isNaN(p) || p < 0) return res.status(400).json({ message: 'Prix invalide' });
      up.prix = p;
    }

    const updated = await Annonce.findByIdAndUpdate(id, up, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};
/*
 * PUT /annonces/:id/valider
 */
exports.updateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });
    if (String(a.userId) !== String(req.user.id))
      return res.status(403).json({ message: 'Non autorisé' });

    const up = {}; 
    up["status"] = "validee";

    const updated = await Annonce.findByIdAndUpdate(id, up, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};
/*
 * PUT /annonces/:id/rejeter
 */
exports.rejeterAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });
    
    const up = {}; 
    up["status"] = "rejete";

    const updated = await Annonce.findByIdAndUpdate(id, up, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};

/**
 * DELETE /annonces/:id
 */
exports.deleteAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Annonce.findById(id);
    if (!a) return res.status(404).json({ message: 'Annonce introuvable' });

    await a.deleteOne();
    res.json({ message: 'Annonce supprimée' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
};
