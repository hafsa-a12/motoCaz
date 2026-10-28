// routes/admin.users.routes.js — comptes back-office (admin / superadmin) : SUPERADMIN uniquement
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken, verifySuperAdmin } = require('../middlewares/auth');

const router = express.Router();
router.use(verifyToken, verifySuperAdmin);

const BACKOFFICE_ROLES = ['admin', 'superadmin'];

const badId = (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) return false;
  res.status(404).json({ message: 'Utilisateur introuvable' });
  return true;
};

// Créer un compte back-office
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Nom, prénom, email et mot de passe sont obligatoires' });
    }
    if (String(motDePasse).length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    if (!BACKOFFICE_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide (admin ou superadmin)' });
    }
    if (await User.findOne({ email: String(email).toLowerCase().trim() })) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    const user = await User.create({ nom, prenom, email, motDePasse, role });
    res.status(201).json({ message: 'Compte créé', user });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister les comptes back-office
router.get('/', async (_req, res) => {
  const users = await User.find({ role: { $in: BACKOFFICE_ROLES } }).sort({ createdAt: 1 });
  res.json(users);
});

// Modifier un compte back-office (champs autorisés uniquement)
router.put('/:id', async (req, res) => {
  try {
    if (badId(req, res)) return;
    const user = await User.findById(req.params.id);
    if (!user || !BACKOFFICE_ROLES.includes(user.role)) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    const { nom, prenom, email, role, motDePasse } = req.body;

    if (role !== undefined) {
      if (!BACKOFFICE_ROLES.includes(role)) return res.status(400).json({ message: 'Rôle invalide' });
      if (String(user._id) === String(req.user.id) && role !== user.role) {
        return res.status(400).json({ message: 'Tu ne peux pas changer ton propre rôle' });
      }
      user.role = role;
    }
    if (nom !== undefined) user.nom = nom;
    if (prenom !== undefined) user.prenom = prenom;
    if (email !== undefined) user.email = email;
    if (motDePasse) {
      if (String(motDePasse).length < 8) return res.status(400).json({ message: 'Mot de passe : 8 caractères minimum' });
      user.motDePasse = motDePasse; // haché par le modèle
    }
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 500).json({ message: e.code === 11000 ? 'Email déjà utilisé' : 'Erreur serveur' });
  }
});

// Supprimer un compte back-office (jamais le sien)
router.delete('/:id', async (req, res) => {
  try {
    if (badId(req, res)) return;
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: 'Tu ne peux pas supprimer ton propre compte' });
    }
    const user = await User.findById(req.params.id);
    if (!user || !BACKOFFICE_ROLES.includes(user.role)) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
