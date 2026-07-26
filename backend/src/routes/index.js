// ============================================================
// Centralise toutes les routes de l'API sous /api/...
// ============================================================
const express = require('express');
const router = express.Router();

const testimonialRoutes = require('./testimonial.routes');
const contactMessageRoutes = require('./contactMessage.routes');
const programRoutes = require('./program.routes');
const emergencyResourceRoutes = require('./emergencyResource.routes');
const newsRoutes = require('./news.routes');
const partnerRoutes = require('./partner.routes');
const donationRoutes = require('./donation.routes');
const volunteerRoutes = require('./volunteer.routes');
const adminRoutes = require('./admin.routes');

router.use('/testimonials', testimonialRoutes);
router.use('/contact-messages', contactMessageRoutes);
router.use('/programs', programRoutes);
router.use('/emergency-resources', emergencyResourceRoutes);
router.use('/news', newsRoutes);
router.use('/partners', partnerRoutes);
router.use('/donations', donationRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
