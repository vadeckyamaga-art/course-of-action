// ============================================================
// Envoi d'email — TODO : à implémenter avec nodemailer
// (utilisé pour notifier un statut de témoignage si contact_email fourni)
//
// npm install nodemailer
//
// Exemple d'implémentation à venir :
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({ ... });
// ============================================================
async function sendEmail({ to, subject, text }) {
  console.warn('⚠️ sendEmail() n\'est pas encore implémenté. Email non envoyé:', { to, subject });
  // TODO : implémenter l'envoi réel une fois le service email choisi
}

module.exports = { sendEmail };
