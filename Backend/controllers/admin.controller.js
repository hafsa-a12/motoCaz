// controllers/admin.controller.js
const mongoose = require('mongoose');
const Annonce = require('../models/Annonce');

const STATUTS = ['en attente', 'validee', 'rejete'];

/** GET /api/admin/annonces?statut=&page=&limit= — toutes les annonces (tous statuts), plus récentes d'abord */
exports.listerAnnonces = async (req, res) => {
  try {
    const { statut } = req.query;
    const q = {};
    if (statut && STATUTS.includes(statut)) q.statut = statut;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    const [items, total] = await Promise.all([
      Annonce.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('userId', 'nom prenom email'),
      Annonce.countDocuments(q),
    ]);
    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** PUT /api/annonces/:id/valider  et  PUT /api/admin/annonces/:id/valider */
exports.validerAnnonce = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Annonce introuvable' });
    const annonce = await Annonce.findByIdAndUpdate(req.params.id, { statut: 'validee' }, { new: true });
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ message: 'Annonce validée', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** PUT /api/admin/annonces/:id/rejeter */
exports.refuserAnnonce = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Annonce introuvable' });
    const annonce = await Annonce.findByIdAndUpdate(req.params.id, { statut: 'rejete' }, { new: true });
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ message: 'Annonce rejetée', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
