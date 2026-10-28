const jwt = require('jsonwebtoken');
const User = require('../models/User');

const extractToken = (req) => {
  const header = req.headers['authorization'];
  return header && header.startsWith('Bearer ') ? header.slice(7) : null;
};

// Exige un token JWT valide -> req.user = { id, role }
const verifyToken = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Connexion requise' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Session expirée, reconnecte-toi' });
    req.user = decoded;
    next();
  });
};

// Token facultatif (routes publiques qui affichent plus de détails si on est connecté)
const verifyTokenOptional = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};

// Vérifie le rôle EN BASE (pas seulement dans le token) : un compte rétrogradé ou bloqué perd ses droits
const requireRole = (...roles) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Connexion requise' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Compte introuvable' });
    if (user.blocked) return res.status(403).json({ message: 'Compte bloqué' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Accès refusé' });
    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

// À utiliser APRÈS verifyToken
const verifyAdmin = requireRole('admin', 'superadmin');
const verifySuperAdmin = requireRole('superadmin');

module.exports = { verifyToken, verifyTokenOptional, verifyAdmin, verifySuperAdmin };
