const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Connexion MongoDB impossible :', err.message);
    console.error('   Vérifie que MongoDB tourne et que MONGO_URL est correct dans .env');
    process.exit(1);
  }
};

module.exports = connectDB;
