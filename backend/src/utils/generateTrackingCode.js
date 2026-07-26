// ============================================================
// Génère un code de suivi anonyme pour les témoignages
// Format : TEM-XXXXX (5 caractères alphanumériques majuscules)
// Ex : TEM-8X3K9
// ============================================================
function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TEM-${code}`;
}

module.exports = { generateTrackingCode };
