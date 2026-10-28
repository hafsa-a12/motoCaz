// routes/admin.clients.routes.js — gestion des clients : admin ou superadmin
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

const router = express.Router();
router.use(verifyToken, verifyAdmin);

const findClient = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: 'Client introuvable' });
    return null;
  }
  const client = await User.findOne({ _id: req.params.id, role: 'client' });
  if (!client) res.status(404).json({ message: 'Client introuvable' });
  return client;
};

// Liste des clients
router.get('/', async (_req, res) => {
  const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 });
  res.json(clients);
});

// Détail d'un client + ses annonces
router.get('/:id', async (req, res) => {
  const client = await findClient(req, res);
  if (!client) return;
  const annonces = await Annonce.find({ userId: client._id }).sort({ createdAt: -1 });
  res.json({ client, annonces });
});

// Modifier un client : seuls ces champs sont acceptés (jamais le rôle ni le mot de passe)
router.put('/:id', async (req, res) => {
  try {
    const client = await findClient(req, res);
    if (!client) return;
    ['nom', 'prenom', 'telephone', 'ville', 'blocked'].forEach((k) => {
      if (k in req.body) client[k] = req.body[k];
    });
    await client.save();
    res.json({ client });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un client et ses annonces
router.delete('/:id', async (req, res) => {
  const client = await findClient(req, res);
  if (!client) return;
  await Annonce.deleteMany({ userId: client._id });
  await client.deleteOne();
  res.json({ message: 'Client supprimé' });
});

module.exports = router;
