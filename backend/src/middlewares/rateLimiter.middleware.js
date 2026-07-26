// ============================================================
// Limitation de débit — protège les formulaires publics du spam/abus
// (témoignages, contact, bénévolat)
// ============================================================
const rateLimit = require('express-rate-limit');

// Limite générique pour les formulaires publics : 5 soumissions / 15 min / IP
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de soumissions. Merci de réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite plus stricte pour les tentatives de connexion admin : 10 / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion. Merci de réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { publicFormLimiter, loginLimiter };
