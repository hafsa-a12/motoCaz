// models/Annonce.js
const mongoose = require('mongoose');

const AnnonceSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true },            // "Moto" | "Scooter"
    energie: { type: String, required: true },         // "Essence" | "Electrique"
    modele: { type: String, default: '' },
    ville: { type: String, required: true, trim: true },
    prix: { type: Number, required: true, min: 0 },
    photos: { type: [String], default: [] },
    statut: { type: String, default: 'en attente', enum: ['en attente', 'validee', 'rejete'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    datePublication: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Annonce', AnnonceSchema);
