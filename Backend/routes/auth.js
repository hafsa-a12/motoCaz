const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// --- Pièces d'identité : dossier privé (jamais servi publiquement), 5 Mo max, images ou PDF ---
const uploadDir = path.join(__dirname, '..', 'uploads', 'piecesIdentite');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpe?g|png|pdf)$/i.test(file.originalname) && /^(image\/(jpeg|png)|application\/pdf)$/.test(file.mimetype);
    cb(ok ? null : new Error("Pièce d'identité : JPEG, PNG ou PDF uniquement"), ok);
  },
});

// Anti force-brute : 20 tentatives / 15 min / IP sur connexion et inscription
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessaie dans quelques minutes' },
});

const cleanupFile = (file) => file && fs.unlink(file.path, () => {});

/** INSCRIPTION (multipart : champs + fichier "pieceIdentite") */
router.post('/register', authLimiter, (req, res, next) => {
  upload.single('pieceIdentite')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, ville, dateNaissance, motDePasse } = req.body;

    if (!nom || !prenom || !email || !telephone || !ville || !dateNaissance || !motDePasse) {
      cleanupFile(req.file);
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      cleanupFile(req.file);
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (String(motDePasse).length < 8) {
      cleanupFile(req.file);
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    if (!req.file) return res.status(400).json({ message: "Pièce d'identité manquante" });

    const naissance = new Date(dateNaissance);
    if (Number.isNaN(naissance.getTime())) {
      cleanupFile(req.file);
      return res.status(400).json({ message: 'Date de naissance invalide' });
    }

    if (await User.findOne({ email: String(email).toLowerCase().trim() })) {
      cleanupFile(req.file);
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    // Le hachage du mot de passe est fait par le modèle User (pre-save) : on passe le mot de passe en clair ici
    await User.create({
      nom, prenom, email, telephone, ville,
      dateNaissance: naissance,
      motDePasse,
      pieceIdentite: req.file.filename,
    });

    res.status(201).json({ message: 'Compte créé, tu peux te connecter' });
  } catch (error) {
    cleanupFile(req.file);
    console.error('Erreur inscription :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/** CONNEXION */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, motDePasse } = req.body || {};
    if (!email || !motDePasse) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    // Même message dans les deux cas : on ne révèle pas si l'email existe
    if (!user || !(await user.comparePassword(String(motDePasse)))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    if (user.blocked) return res.status(403).json({ message: 'Ce compte est bloqué' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Connexion réussie',
      token,
      userId: user._id,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    });
  } catch (error) {
    console.error('Erreur connexion :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/** UTILISATEUR CONNECTÉ */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
