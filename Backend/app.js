const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// En-têtes de sécurité. Les photos sont servies à un autre site (le front) : on autorise le cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS : uniquement le(s) site(s) déclaré(s) dans CORS_ORIGIN
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: origins }));

app.use(express.json({ limit: '1mb' }));

// Photos des annonces (public/annonces) — les pièces d'identité (uploads/) ne sont JAMAIS servies
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/annonces', require('./routes/annonces.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/admin/users', require('./routes/admin.users.routes'));
app.use('/api/admin/clients', require('./routes/admin.clients.routes'));

// 404 JSON pour les routes d'API inconnues
app.use('/api', (_req, res) => res.status(404).json({ message: 'Route introuvable' }));

// Gestionnaire d'erreurs final (jamais de stack trace envoyée au client)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON invalide' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Erreur serveur' });
});

module.exports = app;
