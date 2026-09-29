//ce middleware recupere les erreur de expressvalidator et renvoie une reponse 400 si necessaireconst { validationResult } = require('express-validator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;