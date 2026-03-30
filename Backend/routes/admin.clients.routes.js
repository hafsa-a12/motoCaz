const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middlewares/auth');
const User = require('../models/User');
const Annonce = require('../models/Annonce');

// Liste des clients
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  const clients = await User.find({ role: 'client' }).select('-motDePasse');
  res.json(clients);
});

// Détail d'un client + ses annonces
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const client = await User.findById(req.params.id).select('-motDePasse');
  const annonces = await Annonce.find({ userId: req.params.id });
  res.json({ client, annonces });
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const client = await User.findByIdAndUpdate(req.params.id,req.body).select('-motDePasse');
  if (!client) return res.status(404).json({ message: 'Client introuvable' }); 
  res.json({ client });
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {

  const client = await User.findById(req.params.id).select('-motDePasse');
  if (!client) return res.status(404).json({ message: 'Client introuvable' }); 

  await Annonce.deleteMany({userId:client._id})
  await client.deleteOne()
  res.json({ message:"Success"});
});

module.exports = router;
