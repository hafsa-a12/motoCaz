// scripts/seed.js
// Remplit la base avec un vendeur de démo et 23 annonces motos/scooters (avec photos).
//
//   npm run seed          -> télécharge les photos puis ajoute / met à jour les annonces
//   npm run seed:reset    -> supprime d'abord les annonces du vendeur de démo
//   node scripts/seed.js --no-photos   -> ne tente pas de télécharger les photos

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const annoncesData = require('../data/annonces.data');
const { downloadAll, localName, remoteUrl, OUT_DIR } = require('./download-photos');

const VENDEUR_DEMO = {
  nom: 'Demo',
  prenom: 'Motocaz',
  email: 'demo.vendeur@motocaz.ma',
  telephone: '0600000000',
  ville: 'Meknès',
  dateNaissance: new Date('1990-01-01'),
  motDePasse: 'Demo1234!', // hashé automatiquement par le modèle User
  role: 'client',
};

// Comptes de DÉMO pour tester le back-office. À ne jamais utiliser en production.
const COMPTES_DEMO = [
  { nom: 'Admin', prenom: 'Motocaz', email: 'admin@motocaz.ma', motDePasse: 'Admin1234!', role: 'admin' },
  { nom: 'Super', prenom: 'Admin', email: 'superadmin@motocaz.ma', motDePasse: 'Super1234!', role: 'superadmin' },
];

/** Photo locale si elle existe, sinon URL distante (le frontend gère les deux). */
function photoFor(annonce) {
  const file = localName(annonce);
  const exists = fs.existsSync(path.join(OUT_DIR, file));
  return exists ? `/annonces/${file}` : remoteUrl(annonce);
}

async function run() {
  const reset = process.argv.includes('--reset');
  const withPhotos = !process.argv.includes('--no-photos');

  if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL manquant : copie .env.example vers .env et renseigne-le.');
    process.exit(1);
  }

  if (withPhotos) {
    console.log('📷 Téléchargement des photos...');
    await downloadAll();
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connecté à MongoDB');

  let vendeur = await User.findOne({ email: VENDEUR_DEMO.email });
  if (!vendeur) {
    vendeur = await User.create(VENDEUR_DEMO);
    console.log(`✅ Vendeur de démo créé : ${vendeur.email}`);
  }

  for (const compte of COMPTES_DEMO) {
    if (!(await User.findOne({ email: compte.email }))) {
      await User.create(compte);
      console.log(`✅ Compte ${compte.role} de démo créé : ${compte.email}`);
    }
  }

  if (reset) {
    const { deletedCount } = await Annonce.deleteMany({ userId: vendeur._id });
    console.log(`🗑️  ${deletedCount} annonce(s) de démo supprimée(s)`);
  }

  let count = 0;
  for (const { photoFile, ...annonce } of annoncesData) {
    await Annonce.findOneAndUpdate(
      { titre: annonce.titre, userId: vendeur._id },
      { $set: { ...annonce, photos: [photoFor({ ...annonce, photoFile })], statut: 'validee', userId: vendeur._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    count++;
  }

  console.log(`✅ ${count} annonce(s) prêtes (statut « validée »)`);
  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Erreur lors du seed :', err);
  process.exit(1);
});
