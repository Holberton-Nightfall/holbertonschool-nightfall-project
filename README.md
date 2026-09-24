# 🌑 NIGHTFALL

Plateforme web de réservation pour **NIGHTFALL**, un parc immersif fictif proposant des expériences inspirées des univers de survie, d'horreur, de science-fiction et de catastrophe : bunker abandonné, zone de quarantaine, laboratoire contaminé, escape game…

L'application permet de :

- découvrir les expériences du parc, les rechercher et les filtrer ;
- créer un compte et réserver une expérience sur un créneau de nuit ;
- retrouver et annuler ses réservations ;
- administrer le catalogue et suivre les réservations (espace administrateur).

> Projet réalisé en équipe de 3 dans le cadre de la formation Holberton School - MVP développé en 4 jours.

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Jason** | Lead Back-end - API REST Express, authentification, règles métier |
| **Tom** | Lead Front-end - interface Visiteur / Membre, responsive, intégration API |
| **Benjamin** | DevOps & Admin - Docker, base de données, espace administrateur, tests et recette |

## 🛠️ Technologies

| Couche | Technologies |
|---|---|
| Front-end | React, Vite, React Router, Tailwind CSS v4 |
| Back-end | Node.js 20, Express 5, API REST, JWT, bcryptjs, helmet |
| Base de données | PostgreSQL 16 |
| Environnement | Docker, Docker Compose |
| Gestion du code | Git, GitHub (branches + Pull Requests) |

## ✅ Fonctionnalités

**Visiteur**
- Découvrir le parc et consulter le catalogue des expériences
- Rechercher une expérience par nom ou par description, et filtrer par catégorie
- Consulter la fiche détaillée d'une expérience

**Membre**
- Créer un compte, se connecter, se déconnecter
- Réserver une expérience sur un créneau de nuit (à partir de 22 h), en choisissant le nombre de participants
- Retrouver ses réservations dans son espace personnel
- Annuler une réservation plus de 48 h avant l'expérience
- Modifier son profil, son email et son mot de passe, ou supprimer son compte

**Administrateur**
- Créer, modifier, archiver et restaurer des expériences
- Consulter l'ensemble des réservations, tous membres confondus

L'avancement détaillé de chaque fonctionnalité est suivi dans [`docs/suivi.md`](docs/suivi.md).

## 📋 Prérequis

- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/) avec Docker Compose (inclus dans Docker Desktop)
- Les ports **5173**, **3000** et **5432** doivent être libres

Aucune installation de Node.js ou de PostgreSQL n'est nécessaire : tout tourne dans les conteneurs.

## 🚀 Lancement

```bash
git clone https://github.com/Holberton-Nightfall/holbertonschool-nightfall-project.git
cd holbertonschool-nightfall-project
docker compose up --build
```

Au premier lancement, la base de données est créée et pré-remplie automatiquement.

| Service | URL |
|---|---|
| Application (front-end) | http://localhost:5173 |
| API | http://localhost:3000/api |
| Base de données | `localhost:5432` |

> Première utilisation : le build des images et le chargement de la base prennent environ une minute. L'API attend que PostgreSQL soit prêt avant de démarrer.

Aucun fichier `.env` n'est requis : le `docker-compose.yml` fournit des valeurs de **développement** par défaut. Pour personnaliser les identifiants de la base ou le secret JWT, copier `.env.example` en `.env`.

### Commandes utiles

```bash
docker compose up --build -d   # lancer en arrière-plan
docker compose logs -f api     # suivre les logs de l'API
docker compose down            # arrêter les conteneurs
docker compose down -v         # arrêter ET réinitialiser la base (le seed est rejoué au prochain lancement)
docker compose up --build -V   # après l'ajout d'une dépendance npm (recrée les node_modules des conteneurs)
```

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@nightfall.dev` | `Admin123!` |
| Membre (Alex Martin) | `membre@nightfall.dev` | `Membre123!` |
| Membre 2 (Sam Durand) | `membre2@nightfall.dev` | `Membre123!` |

> ⚠️ Comptes et mots de passe de démonstration uniquement, sans aucune valeur en dehors de l'environnement local.

Le jeu de données contient aussi 5 catégories, 8 expériences (dont une archivée) et plusieurs réservations couvrant les cas de test : réservation annulable, réservation à moins de 48 h, réservation annulée, réservation d'un autre membre.

## 🏗️ Architecture

```
Navigateur ──► React (Vite, :5173) ──HTTP/JSON──► API Express (:3000) ──SQL──► PostgreSQL (:5432)
```

- Le front appelle l'API via `VITE_API_URL` (`http://localhost:3000/api`), défini dans `docker-compose.yml`.
- L'API applique les règles métier (dates futures, capacité, annulation à plus de 48 h), l'authentification (JWT) et les droits d'accès. Les routes d'administration sont regroupées sous `/api/admin`.
- La base est créée et pré-remplie au premier lancement par `db/01_schema.sql` puis `db/02_seed.sql`.
- Aucune suppression physique : une réservation annulée garde son historique (`cancelled_at`), une expérience retirée du catalogue est archivée, un compte supprimé est désactivé (soft delete).

## 🧪 Tests

### Tests automatisés de l'API

Le script `scripts/test-api.sh` vérifie les **20 routes** de l'API en **81 vérifications** : cas nominaux, validations, droits d'accès, isolation entre membres, règle des 48 h et administration.

```bash
docker compose down -v && docker compose up --build -d
bash scripts/test-api.sh
```

- À lancer sur une **base fraîche** : certains tests s'appuient sur les données du seed.
- Le script est relançable : les données qu'il crée sont annulées ou archivées en fin de section.
- L'URL de l'API et les identifiants admin peuvent être surchargés : `API=... ADMIN_PASSWORD=... bash scripts/test-api.sh`.

### Recette

Le parcours complet (visiteur, membre, administrateur, responsive) a été vérifié depuis un clone propre du dépôt, sans `.env`. La checklist, les anomalies trouvées et leurs corrections sont dans [`docs/recette.md`](docs/recette.md).

## 🗂️ Structure du projet

```
.
├── backend/              # API Express
├── frontend/             # Application React (Vite)
├── db/
│   ├── 01_schema.sql     # Création des tables
│   └── 02_seed.sql       # Données de démonstration
├── docs/
│   ├── infos.md          # Analyse du besoin, modèle de données, rôles
│   ├── routesAPI.md      # Contrat d'API (routes, formats, erreurs)
│   ├── recette.md        # Recette du parcours complet
│   └── suivi.md          # Tableau de suivi des tâches
├── scripts/
│   └── test-api.sh       # Tests automatisés de l'API
├── docker-compose.yml
└── .env.example
```

## 📚 Documentation

- [Conception du projet](docs/infos.md) : utilisateurs, fonctionnalités, modèle de données, priorités, rôles
- [Contrat d'API](docs/routesAPI.md) : toutes les routes, leurs paramètres, réponses et codes d'erreur
- [Recette](docs/recette.md) : parcours testé, anomalies et limites connues
- [Tableau de suivi](docs/suivi.md) : répartition et avancement des tâches

## 🚧 Limites connues et évolutions possibles

- Les filtres par prix et par intensité sont gérés par l'API, mais pas encore proposés dans l'interface.
- Les créneaux sont générés côté front et ne sont pas stockés en base : la capacité cumulée par créneau n'est pas gérée, et l'API accepte toute date future.
- Le dernier créneau de la nuit peut se terminer après 6 h.
- L'administrateur ne peut pas annuler une réservation : cela supposerait un système de notification et de remboursement.
- Le paiement est simulé : une réservation est confirmée immédiatement.

Pistes après le MVP : notifications par email, filtres dans l'espace admin (date, expérience, statut), avis et favoris, statistiques.

## 🤝 Organisation Git

- Aucun push direct sur `main` : chaque fonctionnalité est développée sur sa branche (`feat/...`, `fix/...`, `docs/...`, `chore/...`) puis fusionnée par Pull Request relue par un autre membre.
- Messages de commit au format [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).