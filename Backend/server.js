// server.js

 const app = require('./app'); // ✅ Ton app Express est dans app.js
const connectDB = require('./config/db'); // ✅ Connexion MongoDB centralisée
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connexion à la base, puis lancer le serveur
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
