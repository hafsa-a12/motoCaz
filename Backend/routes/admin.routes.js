// routes/admin.routes.js — back-office : modération des annonces
const express = require('express');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');
const { listerAnnonces, validerAnnonce, refuserAnnonce } = require('../controllers/admin.controller');

const router = express.Router();

// Toutes les routes ci-dessous exigent un admin (ou superadmin)
router.use(verifyToken, verifyAdmin);

router.get('/annonces', listerAnnonces);
router.put('/annonces/:id/valider', validerAnnonce);
router.put('/annonces/:id/rejeter', refuserAnnonce);

module.exports = router;
