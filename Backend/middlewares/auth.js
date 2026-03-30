const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
// 📌 Vérifie si le token JWT est présent et valide
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer token"

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé : token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
    req.user = decoded; // { id: "...", role: "..." }
    next();
  });
};

//  Vérifie le token si présent (optionnel, utilisé pour routes publiques)
const verifyTokenOptional = (req, _res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next(); //  ne bloque pas si pas de token
  });
};

// Vérifie si admin
const verifyAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Admin requis' });
  }
  next();
};

// Vérifie si super admin
const verifySuperAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  if (user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super Admin requis' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifySuperAdmin ,verifyTokenOptional };
