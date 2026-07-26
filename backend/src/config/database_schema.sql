-- ============================================================
-- Script de création de la base de données PostgreSQL
-- Site de l'organisation de lutte contre les agressions
-- Version améliorée : sécurité renforcée, cohérence, tables ajoutées
-- ============================================================

-- ============================================================
-- ÉTAPE 1 — Création de la base de données
-- À exécuter en te connectant d'abord à la base par défaut "postgres" :
--   psql -U postgres
-- Puis lance la ligne ci-dessous (une CREATE DATABASE ne peut pas être
-- suivie d'autre chose dans la même transaction/connexion) :
-- ============================================================
CREATE DATABASE organisation_db
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'fr_FR.UTF-8'
  LC_CTYPE = 'fr_FR.UTF-8'
  TEMPLATE = template0;

-- ============================================================
-- ÉTAPE 2 — Connexion à la nouvelle base
-- Reconnecte-toi ensuite à "organisation_db" avant d'exécuter la suite :
--   psql -U postgres -d organisation_db
-- (ou, dans psql, tape : \c organisation_db)
-- ============================================================

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- pour le chiffrement des emails sensibles

-- ============================================================
-- 1. ADMINS — équipe de l'organisation (seule authentification du site)
-- ============================================================
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'moderator', -- 'admin' ou 'moderator'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_admin_role CHECK (role IN ('admin', 'moderator'))
);

-- ============================================================
-- 1bis. ADMIN_REFRESH_TOKENS — gestion des sessions JWT (révocation possible)
-- ============================================================
CREATE TABLE admin_refresh_tokens (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL, -- jamais le token en clair, uniquement son hash
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  user_agent VARCHAR(255)
);

CREATE INDEX idx_admin_refresh_tokens_admin_id ON admin_refresh_tokens(admin_id);

-- ============================================================
-- 2. TESTIMONIALS — témoignages anonymes avec modération
-- ============================================================
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  tracking_code VARCHAR(20) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'agression_physique', 'agression_sexuelle', 'soutien', 'autre'
  status VARCHAR(20) DEFAULT 'en_attente', -- 'en_attente', 'valide', 'rejete'
  contact_email_encrypted BYTEA, -- chiffré via pgcrypto, optionnel, jamais exposé publiquement
  submission_hash VARCHAR(255), -- hash(IP + user-agent) pour anti-abus, jamais l'IP en clair
  moderated_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  moderation_note TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  moderated_at TIMESTAMP,
  CONSTRAINT chk_status CHECK (status IN ('en_attente', 'valide', 'rejete')),
  CONSTRAINT chk_category CHECK (category IN ('agression_physique', 'agression_sexuelle', 'soutien', 'autre')),
  CONSTRAINT chk_content_length CHECK (char_length(content) <= 5000)
);

-- Index pour accélérer les recherches fréquentes
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_tracking_code ON testimonials(tracking_code);
CREATE INDEX idx_testimonials_category ON testimonials(category);
CREATE INDEX idx_testimonials_moderated_by ON testimonials(moderated_by);
CREATE INDEX idx_testimonials_submission_hash ON testimonials(submission_hash);

-- ============================================================
-- 3. CONTACT_MESSAGES — formulaire de contact
-- ============================================================
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'non_lu', -- 'non_lu', 'lu', 'traite'
  submission_hash VARCHAR(255), -- hash(IP + user-agent) pour anti-abus
  handled_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  handled_at TIMESTAMP,
  CONSTRAINT chk_contact_status CHECK (status IN ('non_lu', 'lu', 'traite')),
  CONSTRAINT chk_message_length CHECK (char_length(message) <= 5000)
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_handled_by ON contact_messages(handled_by);
CREATE INDEX idx_contact_messages_submission_hash ON contact_messages(submission_hash);

-- ============================================================
-- 4. PROGRAMS — actions / programmes de l'organisation
-- ============================================================
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. EMERGENCY_RESOURCES — numéros et ressources d'urgence
-- ============================================================
CREATE TABLE emergency_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  phone_number VARCHAR(50),
  link VARCHAR(500),
  category VARCHAR(100), -- 'urgence', 'juridique', 'psychologique'
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_emergency_resources_category ON emergency_resources(category);

-- ============================================================
-- 6. NEWS — actualités / blog
-- ============================================================
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  cover_image VARCHAR(500),
  author_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published ON news(is_published);
CREATE INDEX idx_news_author_id ON news(author_id);

-- ============================================================
-- 7. PARTNERS — ONG et partenaires
-- ============================================================
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. DONATIONS — suivi des dons (optionnelle selon solution de paiement)
-- ============================================================
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  donor_name VARCHAR(255), -- peut être "Anonyme"
  donor_email_encrypted BYTEA, -- chiffré via pgcrypto
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'XAF',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'en_attente',
  transaction_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('en_attente', 'reussi', 'echoue')),
  CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_donations_status ON donations(payment_status);

-- ============================================================
-- 9. VOLUNTEERS — candidatures de bénévolat
-- ============================================================
CREATE TABLE volunteers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  motivation TEXT,
  availability VARCHAR(255), -- ex: "week-ends", "temps plein", etc.
  status VARCHAR(20) DEFAULT 'en_attente', -- 'en_attente', 'accepte', 'refuse'
  handled_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  handled_at TIMESTAMP,
  CONSTRAINT chk_volunteer_status CHECK (status IN ('en_attente', 'accepte', 'refuse')),
  CONSTRAINT chk_motivation_length CHECK (char_length(motivation) <= 3000)
);

CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_volunteers_handled_by ON volunteers(handled_by);

-- ============================================================
-- Fonctions utilitaires de chiffrement (pgcrypto)
-- Utilisation cote applicatif :
--   INSERT: pgp_sym_encrypt('email@example.com', 'CLE_SECRETE')
--   SELECT: pgp_sym_decrypt(contact_email_encrypted, 'CLE_SECRETE')
-- La clé secrète doit être stockée dans les variables d'environnement
-- du backend (jamais en dur dans le code ni dans la base).
-- ============================================================

-- ============================================================
-- Trigger générique : mise à jour automatique de moderated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_moderated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('valide', 'rejete') THEN
    NEW.moderated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_testimonials_moderated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION set_moderated_at();

-- ============================================================
-- Trigger générique : mise à jour automatique de handled_at (contact_messages)
-- ============================================================
CREATE OR REPLACE FUNCTION set_contact_handled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'traite' THEN
    NEW.handled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contact_messages_handled_at
BEFORE UPDATE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION set_contact_handled_at();

-- ============================================================
-- Trigger générique : mise à jour automatique de handled_at (volunteers)
-- ============================================================
CREATE OR REPLACE FUNCTION set_volunteer_handled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('accepte', 'refuse') THEN
    NEW.handled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_volunteers_handled_at
BEFORE UPDATE ON volunteers
FOR EACH ROW
EXECUTE FUNCTION set_volunteer_handled_at();

-- ============================================================
-- Trigger générique : mise à jour automatique de updated_at
-- (programs, emergency_resources, news, partners)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_emergency_resources_updated_at
BEFORE UPDATE ON emergency_resources
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Données de test / seed minimal (optionnel, à adapter ou supprimer)
-- ============================================================

-- Un admin par défaut (mot de passe à hasher avec bcrypt côté Node.js avant insertion réelle)
-- INSERT INTO admins (email, password_hash, full_name, role)
-- VALUES ('admin@organisation.org', '<hash_bcrypt_ici>', 'Nom de l''admin', 'admin');

-- Quelques ressources d'urgence à titre d'exemple
INSERT INTO emergency_resources (title, description, phone_number, category, display_order) VALUES
('Ligne d''écoute nationale', 'Assistance téléphonique gratuite et confidentielle 24h/24', '119', 'urgence', 1),
('Aide juridique gratuite', 'Consultation juridique gratuite pour les victimes', NULL, 'juridique', 2),
('Soutien psychologique', 'Prise de rendez-vous pour un accompagnement psychologique', NULL, 'psychologique', 3);
