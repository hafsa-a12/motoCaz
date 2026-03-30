// routes/annonces.routes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { verifyToken, verifyTokenOptional, verifyAdmin } = require('../middlewares/auth');
const {
  creerAnnonce,
  getAnnonces,
  getAnnonceById,
  getMesAnnonces,
  updateAnnonce,
  deleteAnnonce,
  rejeterAnnonce
} = require('../controllers/annonces.controller');
const { validerAnnonce } = require('../controllers/admin.controller');

// --- Dossier uploads/annonces ---
const uploadDir = path.join(__dirname, '..', 'public', 'annonces');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  cb(ok ? null : new Error('Seules les images JPEG, PNG ou GIF sont autorisées'), ok);
};
const upload = multer({ storage, fileFilter });

// --- Routes ---
router.get('/', getAnnonces);                         // liste + filtres + tri
router.get('/miennes', verifyToken, getMesAnnonces);  // ⚠️ AVANT /:id
router.get('/:id', verifyTokenOptional, getAnnonceById);

// Publier (upload multi-photos)
router.post(
  '/',
  verifyToken,
  (req, res, next) => {
    upload.array('photos', 6)(req, res, function (err) {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Erreur upload : ' + err.message });
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  creerAnnonce
);

router.put('/:id/valider',verifyAdmin, validerAnnonce);
router.put('/:id/rejeter',verifyAdmin, rejeterAnnonce);
router.put('/:id', verifyToken, updateAnnonce);
router.delete('/byAdmin/:id',verifyToken, verifyAdmin, deleteAnnonce);
router.delete('/:id', verifyToken, deleteAnnonce);

module.exports = router;
