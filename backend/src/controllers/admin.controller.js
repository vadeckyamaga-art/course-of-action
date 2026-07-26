// ============================================================
// Contrôleur admin — TODO : à implémenter
// ============================================================
// const model = require('../models/admin.model');

// exports.getAll = async (req, res, next) => { };
// exports.create = async (req, res, next) => { };

module.exports = {};

// ============================================================
// Contrôleur admin — connexion et gestion de session
// ============================================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin.model');

// POST /api/admin/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const admin = await adminModel.findByEmail(email);

    // Message volontairement identique que l'email existe ou non,
    // pour ne pas révéler quels emails sont enregistrés
    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        must_change_password: admin.must_change_password,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/change-password (route protégée, admin doit être connecté)
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id; // injecté par le middleware requireAuth

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    const admin = await adminModel.findByEmail(req.admin.email);
    if (!admin) {
      return res.status(404).json({ error: 'Admin introuvable' });
    }

    const currentMatches = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!currentMatches) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await adminModel.updatePassword(adminId, newPasswordHash);

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, changePassword };