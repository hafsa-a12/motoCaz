const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    telephone: { type: String },
    ville: { type: String },
    dateNaissance: { type: Date},
    motDePasse: { type: String, required: true },
    pieceIdentite: { type: String }, // chemin/nom de fichier

    // ✅ rôles gérés côté back-office
    role: {
      type: String,
      enum: ["client", "admin", "superadmin"],
      default: "client",
    },
    // optionnel : bloquer un compte client
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash du mot de passe si modifié
userSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

// Méthode utilitaire pour comparer
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.motDePasse);
};

// Ne jamais renvoyer le mot de passe dans les réponses JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.motDePasse;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
