// ============================================================
// Point d'entrée du serveur — démarre l'app une fois la BD vérifiée
// ============================================================
require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection(); // arrête le serveur si la BD n'est pas accessible
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
