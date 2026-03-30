// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const Annonce = require('../models/Annonce');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');
const isSuperAdmin = require("../middlewares/isSuperAdmin");
const adminController = require("../controllers/admin.controller")

router.post("/create-admin", isSuperAdmin, adminController.createAdmin);
router.put("/update-role/:id",  isSuperAdmin, adminController.updateUserRole);
router.delete("/delete-user/:id",  isSuperAdmin, adminController.deleteUser);

//  Lister annonces en attente
router.get('/annonces-en-attente', verifyToken, verifyAdmin, async (req, res) => {
  const annonces = await Annonce.find({ statut: 'en attente' });
  res.json(annonces);
});

//  Valider annonce
router.put('/annonces/:id/valider', verifyToken, verifyAdmin, async (req, res) => {
  const annonce = await Annonce.findByIdAndUpdate(req.params.id, { statut: 'validee' }, { new: true });
  res.json(annonce);
});

//  Rejeter annonce
router.put('/annonces/:id/rejeter', verifyToken, verifyAdmin, async (req, res) => {
  const annonce = await Annonce.findByIdAndUpdate(req.params.id, { statut: 'rejete' }, { new: true });
  res.json(annonce);
});

module.exports = router;
