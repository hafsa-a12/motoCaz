const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth');

// --- Upload dossier pièces d'identité ---
const uploadDir = path.join(__dirname, '..', 'uploads', 'piecesIdentite');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/**
 * 📌 INSCRIPTION
 */
router.post('/register', upload.single('pieceIdentite'), async (req, res) => {
  try {
    const { nom, prenom, email, telephone, ville, dateNaissance, motDePasse } = req.body;

    // Vérification champs obligatoires
    if (!nom || !prenom || !email || !telephone || !ville || !dateNaissance || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si email déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    // Vérifier pièce d'identité (obligatoire)
    if (!req.file) return res.status(400).json({ message: "Pièce d'identité manquante" });

    // Conversion date
    const dateFormatted = new Date(dateNaissance);
    if (isNaN(dateFormatted.getTime())) {
      return res.status(400).json({ message: "Date de naissance invalide" });
    }

    // Hash mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Création utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      telephone,
      ville,
      dateNaissance: dateFormatted,
      motDePasse: hashedPassword,
      pieceIdentiteUrl: `/uploads/piecesIdentite/${req.file.filename}`
    });

    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });

  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
});

/**
 * 📌 CONNEXION
 */
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérif si utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    // Vérif mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    // Génération JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      userId: user._id,
      nom: user.nom,
      prenom:user.prenom,
      role: user.role
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 📌 INFOS UTILISATEUR CONNECTÉ
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
