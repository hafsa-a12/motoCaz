 // controllers/admin.controller.js
const Annonce = require('../models/Annonce');
const User = require("../models/User");

// Lister les annonces en attente de validation
exports.getAnnoncesEnAttente = async (req, res) => {
  try {
    const annonces = await Annonce.find({ statut: 'en_attente' }).populate('userId', 'nom prenom email');
    res.json(annonces);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Valider une annonce
exports.validerAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    annonce.statut = 'validée';
    await annonce.save();

    res.json({ message: 'Annonce validée avec succès', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Refuser une annonce
exports.refuserAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    annonce.statut = 'refusée';
    await annonce.save();

    res.json({ message: 'Annonce refusée avec succès', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// Créer un admin
exports.createAdmin = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;
    const newAdmin = new User({ nom, email, motDePasse, role: "admin" });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier le rôle
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lister tous les clients
exports.getAllClients = async (req, res) => {
  const clients = await User.find({ role: "client" });
  res.json(clients);
};

// Voir un client + ses annonces
exports.getClientDetails = async (req, res) => {
  const { id } = req.params;
  const client = await User.findById(id);
  const annonces = await Annonce.find({ userId: id });
  res.json({ client, annonces });
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Client supprimé" });
};