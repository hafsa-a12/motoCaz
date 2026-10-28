// routes/annonces.routes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { verifyToken, verifyTokenOptional, verifyAdmin } = require('../middlewares/auth');
const {
  creerAnnonce, getAnnonces, getAnnonceById, getMesAnnonces,
  updateAnnonce, deleteAnnonce, rejeterAnnonce,
} = require('../controllers/annonces.controller');
const { validerAnnonce } = require('../controllers/admin.controller');

const router = express.Router();

// --- Upload des photos (public/annonces) : 6 photos max, 5 Mo chacune, images uniquement ---
const uploadDir = path.join(__dirname, '..', 'public', 'annonces');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname) && /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error('Seules les images JPEG, PNG, GIF ou WebP sont autorisées'), ok);
  },
});

const uploadPhotos = (req, res, next) => {
  upload.array('photos', 6)(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Erreur upload : ' + err.message });
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// ⚠️ Les routes fixes (/miennes, /byAdmin/:id) doivent rester AVANT /:id
router.get('/', getAnnonces);
router.get('/miennes', verifyToken, getMesAnnonces);
router.get('/:id', verifyTokenOptional, getAnnonceById);

router.post('/', verifyToken, uploadPhotos, creerAnnonce);

router.put('/:id/valider', verifyToken, verifyAdmin, validerAnnonce);
router.put('/:id/rejeter', verifyToken, verifyAdmin, rejeterAnnonce);
router.put('/:id', verifyToken, updateAnnonce);

router.delete('/byAdmin/:id', verifyToken, verifyAdmin, deleteAnnonce);
router.delete('/:id', verifyToken, deleteAnnonce); // auteur ou admin (vérifié dans le controller)

module.exports = router;
