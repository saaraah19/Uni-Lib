const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes maximum
  message: {
    success: false,
    message: "Trop de tentatives, veuillez réessayer après 15 minutes.",
  },
  standardHeaders: true, // Retourne les headers standard RateLimit
  legacyHeaders: false, // Désactive les anciens headers
});
module.exports = { authLimiter };
