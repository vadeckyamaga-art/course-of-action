// ============================================================
// Connexion PostgreSQL — pool de connexions réutilisables
// ============================================================
require('dotenv').config();
const { Pool } = require('pg');

// Un "pool" garde plusieurs connexions ouvertes et les réutilise,
// plutôt que d'ouvrir/fermer une connexion à chaque requête
// (bien plus performant pour un serveur qui reçoit beaucoup de requêtes).
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10, // nombre maximum de connexions simultanées dans le pool
  idleTimeoutMillis: 30000, // ferme une connexion inactive après 30s
  connectionTimeoutMillis: 5000, // abandonne si la connexion prend plus de 5s
});

// Log utile pour vérifier que la connexion fonctionne au démarrage
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue sur le pool PostgreSQL:', err.message);
  process.exit(1);
});

// Fonction utilitaire pour exécuter une requête SQL
// Usage : const { rows } = await query('SELECT * FROM admins WHERE id = $1', [id]);
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Requête exécutée', { text, duration: `${duration}ms`, rows: result.rowCount });
  }
  return result;
}

// Fonction pour tester la connexion au démarrage du serveur
async function testConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Test de connexion PostgreSQL réussi');
  } catch (err) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, query, testConnection };
