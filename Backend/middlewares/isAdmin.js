// middlewares/isAdmin.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token manquant" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé : admin requis" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
