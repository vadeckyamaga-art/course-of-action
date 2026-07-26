// ============================================================
// Configuration de l'application Express
// (séparé de server.js pour faciliter les tests plus tard)
// ============================================================
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Le serveur fonctionne' });
});

// Toutes les routes de l'API sont préfixées par /api
app.use('/api', routes);

// Doivent toujours être montés en dernier
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
