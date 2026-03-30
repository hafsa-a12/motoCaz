const express = require('express');
const router = express.Router();
const User = require('../models/User');
//const  } = require('../middlewares/auth');

// 📌 Créer un compte back-office
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;
    const user = new User({ nom, prenom, email, motDePasse, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur back-office créé', user });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: e.message });
  }
});

// 📌 Liste des comptes back-office
router.get('/', async (req, res) => {
  const users = await User.find({ role: { $in: ['admin', 'superadmin'] } });
  res.json(users);
});

// 📌 Modifier un compte back-office
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// 📌 Supprimer un compte back-office
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
