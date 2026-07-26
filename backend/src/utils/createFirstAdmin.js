// ============================================================
// Crée un compte admin avec un mot de passe temporaire généré
// automatiquement (affiché UNE SEULE FOIS dans le terminal).
// L'admin devra le changer à sa première connexion
// (must_change_password = true par défaut).
//
// Usage :
//   node src/utils/createFirstAdmin.js <email> <nom_complet> [role]
//
// Exemple :
//   node src/utils/createFirstAdmin.js admin@organisation.org "Marie Dupont" admin
//
// role est optionnel, "moderator" par défaut.
// ============================================================
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 12;

// Génère un mot de passe temporaire lisible mais fort
// (16 caractères, lettres majuscules/minuscules/chiffres/symboles)
function generateTempPassword(length = 16) {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function createFirstAdmin() {
  const [, , email, fullName, role = 'moderator'] = process.argv;

  if (!email || !fullName) {
    console.error(
      '❌ Usage : node src/utils/createFirstAdmin.js <email> <nom_complet> [role]'
    );
    process.exit(1);
  }

  if (!['admin', 'moderator'].includes(role)) {
    console.error('❌ Le rôle doit être "admin" ou "moderator"');
    process.exit(1);
  }

  try {
    // Vérifie qu'un admin avec cet email n'existe pas déjà
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error(`❌ Un compte admin existe déjà avec l'email ${email}`);
      process.exit(1);
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO admins (email, password_hash, full_name, role, must_change_password)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, fullName, role]
    );

    const admin = result.rows[0];

    console.log('\n✅ Compte admin créé avec succès !\n');
    console.log('----------------------------------------');
    console.log(`  ID          : ${admin.id}`);
    console.log(`  Email       : ${admin.email}`);
    console.log(`  Nom complet : ${admin.full_name}`);
    console.log(`  Rôle        : ${admin.role}`);
    console.log(`  Mot de passe temporaire : ${tempPassword}`);
    console.log('----------------------------------------\n');
    console.log(
      '⚠️  Ce mot de passe ne sera plus jamais affiché. Transmets-le à\n' +
      '    l\'admin par un canal sûr (pas par email en clair). Il/elle devra\n' +
      '    le changer à sa première connexion.\n'
    );
  } catch (err) {
    console.error('❌ Erreur lors de la création de l\'admin :', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createFirstAdmin();
