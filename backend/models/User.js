//UserModel doit avoir :

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//email,paassword,borrowedbooks,role, code,full name
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Code étudiant (pour connexion QR code)
    userCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["student", "staff"],
      default: "student",
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: { type: String, required: true, minLength: 6 },
    createdAt: {
    type: Date,
    default: Date.now // This sets the date only once when document is created
  }
  },

);

// Méthode pour hasher le mot de passe avant sauvegarde
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.log(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model("User", UserSchema);
