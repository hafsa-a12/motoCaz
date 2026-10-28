// server.js — point d'entrée : vérifie la config, se connecte à MongoDB, puis lance l'API
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8000;

function checkEnv() {
  const missing = ['MONGO_URL', 'JWT_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Variable(s) manquante(s) dans .env : ${missing.join(', ')}`);
    console.error('   → copie .env.example vers .env puis renseigne-les.');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 16) {
    console.error('❌ JWT_SECRET trop court (16 caractères minimum).');
    process.exit(1);
  }
}

async function start() {
  checkEnv();
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 API Motocaz sur http://localhost:${PORT}`));
}

start();
