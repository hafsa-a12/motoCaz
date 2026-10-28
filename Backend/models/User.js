const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    telephone: { type: String, trim: true },
    ville: { type: String, trim: true },
    dateNaissance: { type: Date },
    motDePasse: { type: String, required: true },
    pieceIdentite: { type: String }, // nom du fichier dans uploads/piecesIdentite (privé)
    role: { type: String, enum: ['client', 'admin', 'superadmin'], default: 'client' },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Le mot de passe est haché ICI, et seulement ici (jamais dans les routes)
userSchema.pre('save', async function () {
  if (this.isModified('motDePasse')) {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.motDePasse);
};

// Ne jamais renvoyer le mot de passe ni le chemin de la pièce d'identité dans les réponses JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.motDePasse;
  delete obj.pieceIdentite;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
