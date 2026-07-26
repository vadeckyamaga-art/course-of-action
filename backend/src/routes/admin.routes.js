// ============================================================
// Routes admin
// ============================================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { loginLimiter } = require('../middlewares/rateLimiter.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

// POST /api/admin/login — connexion, retourne un token JWT
router.post('/login', loginLimiter, adminController.login);

// PUT /api/admin/change-password — nécessite d'être connecté (token JWT valide)
router.put('/change-password', requireAuth, adminController.changePassword);

module.exports = router;