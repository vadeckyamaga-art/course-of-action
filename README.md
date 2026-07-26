# Site web — Organisation de lutte contre les agressions

Site pour une organisation qui lutte contre les agressions sexuelles et physiques
faites aux femmes et aux jeunes filles : témoignages anonymes, ressources d'urgence,
dons, bénévolat, actualités.

## Stack technique

- **Frontend** : React (Vite) + React Router + Tailwind CSS + React Hook Form
- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL
- **Authentification admin** : JWT

## Structure du projet

```
mon-projet/
├── .env / .env.example / .gitignore / README.md
├── backend/
│   └── src/
│       ├── config/       (connexion PostgreSQL)
│       ├── models/       (requêtes SQL par ressource)
│       ├── controllers/  (logique métier)
│       ├── routes/       (endpoints Express)
│       ├── middlewares/  (auth, rateLimiter, errorHandler)
│       └── utils/        (generateTrackingCode, sendEmail)
└── frontend/
    └── src/
        ├── components/   (common, testimonials, admin)
        ├── pages/        (Home, About, Programs, ...)
        ├── services/     (api.js, testimonialsService.js, ...)
        ├── context/, hooks/, utils/
```

## Démarrage rapide

### Backend
```bash
cd backend
npm install
copy .env.example .env   # puis renseigner les vraies valeurs
npm run dev
```

### Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## État d'avancement

- [x] Schéma PostgreSQL (`backend/src/config/database_schema.sql`)
- [x] Connexion PostgreSQL (`backend/src/config/db.js`)
- [x] Squelette Express (`backend/src/app.js`, `server.js`)
- [x] Squelette des routes/contrôleurs/modèles (à remplir au fur et à mesure)
- [x] Squelette React (pages, routing, services)
- [ ] Création du premier compte admin
- [ ] Implémentation des routes témoignages
- [ ] Implémentation des routes contact / dons / bénévolat
- [ ] Système de modération admin
