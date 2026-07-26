// ============================================================
// Gestion centralisée des erreurs — doit être le dernier middleware
// monté dans app.js (après toutes les routes)
// ============================================================
function errorHandler(err, req, res, next) {
  console.error('❌ Erreur:', err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur est survenue.'
    : err.message;

  res.status(statusCode).json({ error: message });
}

// Middleware pour les routes non trouvées (404)
function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route non trouvée : ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
