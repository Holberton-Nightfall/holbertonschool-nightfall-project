# NIGHTFALL - Tableau de suivi

Statuts : ⬜ À faire · 🟡 En cours · ✅ Fait - mis à jour à chaque merge sur `main`.

## Jour 1 - Parcours de base (P1)

| Tâche | Responsable | Branche | Statut |
|---|---|---|---|
| Docker Compose, Dockerfiles, `.env.example` | Benjamin | `feat/docker-compose` | 🟡 |
| Document de conception | Équipe | `docs/conception` | 🟡 |
| Contrat d'API (`docs/API.md`) | Jason | `docs/api-contract` | ✅ |
| Schéma SQL + seed minimal | Jason | `feat/db-schema` | ✅ |
| Initialisation Express + `GET /api/health` | Jason | `feat/backend-init` | ✅ |
| `GET /api/experiences` et `GET /api/experiences/:id` | Jason | `feat/api-experiences` | ✅ |
| Initialisation Vite + React Router + layout | Tom | `feat/frontend-init` | ✅ |
| Page catalogue branchée sur l'API | Tom | `feat/catalogue` | ✅ |
| README initial | Benjamin | `docs/readme` | ⬜ |

## Jour 2 - Compte et réservation (P1)

| Tâche | Responsable | Branche | Statut |
|---|---|---|---|
| Inscription / connexion (bcrypt, JWT) + `GET /api/auth/me` | Jason | `feat/api-auth` | ✅ |
| Middlewares `requireAuth` / `requireAdmin` | Jason | `feat/api-auth` | ✅ |
| `POST /api/bookings` avec validations | Jason | `feat/api-bookings` | ⬜ |
| `GET /api/bookings` (réservations du membre) | Jason | `feat/api-bookings` | ⬜ |
| Fiche détaillée d'une expérience | Tom | `feat/experience-detail` | ⬜ |
| Contexte d'auth, formulaires inscription / connexion, routes protégées | Tom | `feat/frontend-auth` | ⬜ |
| Formulaire de réservation + confirmation | Tom | `feat/booking-form` | ⬜ |
| Espace personnel (liste des réservations) | Tom | `feat/member-space` | ⬜ |
| Seed complet (comptes de démo, expériences, réservations) | Benjamin | `feat/seed` | ⬜ |

## Jour 3 - MVP complet (P2)

| Tâche | Responsable | Branche | Statut |
|---|---|---|---|
| Recherche par nom + filtre par catégorie (API) | Jason | `feat/api-search` | ⬜ |
| `DELETE /api/bookings/:id` (règle des 48 h + propriétaire) | Jason | `feat/api-cancel` | ⬜ |
| Routes admin (CRUD / archivage, liste des réservations) | Jason | `feat/api-admin` | ⬜ |
| Recherche + filtre catégorie (interface) | Tom | `feat/search-filters` | ⬜ |
| Déconnexion + bouton d'annulation | Tom | `feat/cancel-booking` | ⬜ |
| Responsive + charte graphique NIGHTFALL | Tom | `feat/responsive` | ⬜ |
| Espace admin : gestion des expériences | Benjamin | `feat/admin-experiences` | ⬜ |
| Espace admin : liste des réservations | Benjamin | `feat/admin-bookings` | ⬜ |
| Supprimer page test | Tom | `delete/test-page` | ⬜ |

## Jour 4 - Finalisation (gel des fonctionnalités à midi)

| Tâche | Responsable | Branche | Statut |
|---|---|---|---|
| Vérification sécurité (validations, droits, secrets) | Jason | `fix/security` | ⬜ |
| Test complet depuis un clone propre (`docker compose up`) | Benjamin | — | ⬜ |
| Recette du parcours Visiteur ➔ Réservation ➔ Annulation ➔ Admin | Benjamin | — | ⬜ |
| Corrections des bugs remontés | Équipe | `fix/...` | ⬜ |
| README final (fonctionnalités, lancement, comptes de démo) | Benjamin | `docs/readme-final` | ⬜ |
| Support de soutenance | Équipe | — | ⬜ |