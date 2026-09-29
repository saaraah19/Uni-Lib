// validators/userValidators.js
const { body } = require('express-validator');

// Validation pour l'inscription
const registerValidator = [
  body('email')
    .isEmail().withMessage('Veuillez fournir un email valide.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  body('name')
    .notEmpty().withMessage('Le nom est requis.')
    .trim()
    .escape(),
];

// Validation pour la connexion classique
const loginValidator = [
  body('email')
    .isEmail().withMessage('Email invalide.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.'),
];

// Validation pour la mise à jour du mot de passe
// FIX: noms de champs alignés avec UserController.updatePassword (oldPassword/newPassword),
// qui sont aussi ceux envoyés par le frontend (SettingsTab.js). Le précédent
// validateur exigeait "currentPassword", jamais envoyé -> 400 systématique.
const updatePasswordValidator = [
  body('oldPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis.'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
};
