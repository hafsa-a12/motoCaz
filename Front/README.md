# Motocaz — Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4.

```bash
npm install
cp .env.example .env   # (Windows : copy .env.example .env) — adresse de l'API
npm run dev            # http://localhost:5173
npm run lint           # ESLint
npm run build          # vérification TypeScript + build de production dans dist/
```

## Structure

```
src/
├── components/   Header, Footer, Hero, FilterBar, ListingCard, Pagination, Logo
├── pages/        Home, Favoris, AnnonceDetail, Login, Register, Publish, MesAnnonces
│                 + back-office : Admin (layout), DashboardAdmin, AdminAnnonces,
│                   AdminClients, AdminClientsDetails, AdminUsers
├── hooks/        useFavorites (favoris stockés dans le navigateur)
├── lib/          config (URL de l'API), media (URL des photos), format, types
└── styles/       base.css, components.css, shared.css, home.css   (+ tokens dans index.css)
```

## Design

Thème clair : bleu nuit `#101b3a`, bleu encre `#2f5fe3`, ambre `#e9a23b`.
Toutes les couleurs, polices et arrondis sont définis **une seule fois** dans `src/index.css`
(bloc `@theme` et `:root`) : pour changer de thème, modifie uniquement ce fichier.

## Routes

| Route | Accès |
|---|---|
| `/`, `/annonce/:id`, `/favoris`, `/login`, `/register` | public |
| `/publish`, `/mes-annonces` | connecté (client) |
| `/admin`, `/admin/annonces`, `/admin/clients`, `/admin/clients/:id` | admin et superadmin |
| `/superadmin`, `/superadmin/users` (+ le reste du back-office) | superadmin uniquement |

> Les protections de routes côté front servent à l'affichage : la vraie sécurité est dans l'API
> (JWT + rôle vérifié en base à chaque requête sensible).
