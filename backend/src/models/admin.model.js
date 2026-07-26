// ============================================================
// Modèle admin — TODO : à implémenter
// Requêtes SQL vers la table correspondante (voir database_schema.sql)
// ============================================================
// const { query } = require('../config/db');

module.exports = {};

// ============================================================
// Modèle admin — requêtes SQL vers la table admins
// ============================================================
const { query } = require('../config/db');

// Récupère un admin par son email (utilisé pour le login)
async function findByEmail(email) {
  const result = await query(
    `SELECT id, email, password_hash, full_name, role, is_active, must_change_password
     FROM admins
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

// Marque le mot de passe comme changé (must_change_password = false)
// et met à jour le hash avec le nouveau mot de passe choisi
async function updatePassword(adminId, newPasswordHash) {
  await query(
    `UPDATE admins
     SET password_hash = $1, must_change_password = false
     WHERE id = $2`,
    [newPasswordHash, adminId]
  );
}

module.exports = { findByEmail, updatePassword };