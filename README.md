# Motocaz — marketplace moto & scooter

Achat / vente de motos et scooters, neufs ou d'occasion, avec espace vendeur, modération des annonces et back-office.

| Partie | Technos |
|---|---|
| `Backend/` | Node.js, Express 5, MongoDB (Mongoose), JWT, Multer, bcrypt, Helmet, rate-limit |
| `Front/` | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 |

## Fonctionnalités

- **Visiteur** : parcourir les annonces, filtrer (type, énergie, état neuve/occasion, marque, modèle, ville, prix), trier, paginer, voir le détail avec galerie photos, gérer des favoris.
- **Client** : inscription (avec pièce d'identité), connexion, publier une annonce avec photos, modifier / supprimer ses annonces. Une annonce publiée est **« en attente »** jusqu'à validation.
- **Admin** : valider / rejeter / supprimer les annonces, gérer les clients (modifier, bloquer, supprimer).
- **Superadmin** : en plus, créer et gérer les comptes administrateurs.
- Coordonnées du vendeur (email, téléphone) visibles uniquement pour un utilisateur connecté.

## Démarrage rapide

**Pré-requis :** Node.js 18+ et une base MongoDB (voir l'étape 1).

### 1. MongoDB

Au choix :
- **Docker** (le plus simple) : `docker compose up -d` à la racine du projet ;
- MongoDB installé localement (`mongodb://localhost:27017/motocaz`) ;
- ou un cluster gratuit MongoDB Atlas (colle son URL dans `MONGO_URL`).

### 2. Backend

```bash
cd Backend
cp .env.example .env     # Windows : copy .env.example .env
# ouvre .env : renseigne JWT_SECRET (voir la commande indiquée dans le fichier) et vérifie MONGO_URL
npm install
npm run seed             # crée 23 annonces de démo + 3 comptes de démo
npm start                # http://localhost:8000
```

### 3. Frontend

```bash
cd Front
cp .env.example .env     # Windows : copy .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Sous Windows, `start.bat` lance backend + frontend d'un coup (une fois les `npm install` faits).

## Comptes de démonstration (créés par `npm run seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Client / vendeur | `demo.vendeur@motocaz.ma` | `Demo1234!` |
| Admin | `admin@motocaz.ma` | `Admin1234!` |
| Superadmin | `superadmin@motocaz.ma` | `Super1234!` |

> ⚠️ Comptes de démonstration uniquement : ne jamais les créer sur un serveur public.

Commandes utiles : `npm run seed:reset` (recrée les annonces de démo), `npm run photos` (retélécharge les photos manquantes).

## Tests

```bash
# Backend : 32 tests d'intégration (inscription, connexion, droits, annonces, back-office)
cd Backend
MONGO_URL=mongodb://localhost:27017/motocaz_test npm test     # Windows PowerShell : $env:MONGO_URL="..."; npm test

# Frontend : lint + vérification TypeScript + build
cd Front
npm run lint && npm run build
```

⚠️ Les tests **vident** la base indiquée dans `MONGO_URL` : utilise une base dédiée (`motocaz_test`). La CI GitHub Actions (`.github/workflows/ci.yml`) lance les deux à chaque push.

## API

Base : `http://localhost:8000` — authentification par `Authorization: Bearer <token>`.

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| POST | `/api/auth/register` | public | Inscription (multipart, pièce d'identité) |
| POST | `/api/auth/login` | public | Connexion → token JWT (7 jours) |
| GET | `/api/auth/me` | connecté | Profil |
| GET | `/api/annonces` | public | Annonces **validées**. Filtres : `type, energie, etat, marque, modele, ville, prixMin, prixMax` · tri `sort` · `page, limit` |
| GET | `/api/annonces/:id` | public | Détail (contact vendeur masqué si non connecté) |
| GET | `/api/annonces/miennes` | connecté | Mes annonces |
| POST | `/api/annonces` | connecté | Publier (multipart, jusqu'à 6 photos) |
| PUT / DELETE | `/api/annonces/:id` | auteur (DELETE : auteur ou admin) | Modifier / supprimer |
| GET | `/api/admin/annonces?statut=` | admin | Toutes les annonces, tous statuts |
| PUT | `/api/admin/annonces/:id/valider` · `/rejeter` | admin | Modération |
| DELETE | `/api/annonces/byAdmin/:id` | admin | Suppression par un admin |
| GET / PUT / DELETE | `/api/admin/clients[/:id]` | admin | Gestion des clients |
| GET / POST / PUT / DELETE | `/api/admin/users[/:id]` | superadmin | Comptes administrateurs |
| GET | `/api/health` | public | Santé de l'API |

## Sécurité

- Mots de passe hachés avec **bcrypt** (une seule fois, dans le modèle) ; jamais renvoyés par l'API.
- **JWT** signé avec un secret obligatoire (le serveur refuse de démarrer sans) ; le **rôle est revérifié en base** à chaque action d'administration, un compte bloqué perd ses droits immédiatement.
- Routes d'administration protégées côté serveur ; champs modifiables **filtrés** (pas d'élévation de rôle).
- Connexion : message identique pour « email inconnu » et « mauvais mot de passe », limitation de tentatives, comptes bloquables.
- Uploads : types et tailles contrôlés ; pièces d'identité stockées hors du dossier public (jamais servies).
- Helmet, CORS limité à `CORS_ORIGIN`, paramètres de recherche échappés / convertis (pas d'injection NoSQL).
- Les fichiers `.env` et `Backend/uploads/` sont exclus de Git.

## Structure

```
Backend/
├── config/        connexion MongoDB
├── controllers/   annonces, admin
├── middlewares/   auth (verifyToken, verifyAdmin, verifySuperAdmin)
├── models/        Annonce, User
├── routes/        auth, annonces, admin, admin.users, admin.clients
├── data/          annonces.data.js (jeu de données de démo)
├── scripts/       seed.js, download-photos.js
├── tests/         api.test.js
├── public/annonces/   photos (servies sur /annonces/...)
└── uploads/       pièces d'identité (privé, non versionné)
Front/             voir Front/README.md
```

## Crédits photos

Photos de démonstration : [Wikimedia Commons](https://commons.wikimedia.org) (licences libres, auteurs respectifs).
