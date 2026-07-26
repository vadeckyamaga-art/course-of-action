require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./src/config/db');

async function check() {
  const email = 'vadeckyamaga@gmail.com';
  const passwordToTest = 'BX8g#8eGvCGxPRQZ';

  const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    console.log('❌ Aucun admin trouvé avec cet email. Vérifie la valeur exacte en base.');
  } else {
    const admin = result.rows[0];
    console.log('✅ Admin trouvé :', admin.email, '| actif:', admin.is_active);
    const match = await bcrypt.compare(passwordToTest, admin.password_hash);
    console.log('Mot de passe correspond ?', match);
  }

  await pool.end();
}

check();