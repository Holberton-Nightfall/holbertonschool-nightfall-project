# 🌑 NIGHTFALL

Plateforme web de réservation pour **NIGHTFALL**, un parc immersif fictif proposant des expériences inspirées des univers de survie, d'horreur, de science-fiction et de catastrophe : bunker abandonné, zone de quarantaine, laboratoire contaminé, escape game…

L'application permet de :

- découvrir les expériences du parc et les filtrer ;
- créer un compte et réserver une expérience ;
- retrouver et annuler ses réservations ;
- administrer le catalogue et suivre les réservations (espace administrateur).

> Projet réalisé en équipe de 3 dans le cadre de la formation Holberton School - MVP développé en 4 jours.

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Jason** | Lead Back-end - API REST Express, authentification, règles métier |
| **Tom** | Lead Front-end - interface Visiteur / Membre, responsive, intégration API |
| **Benjamin** | DevOps & Admin - Docker, base de données, espace administrateur, coordination |

## 🛠️ Technologies

| Couche | Technologies |
|---|---|
| Front-end | React, Vite, React Router, HTML, CSS, JavaScript |
| Back-end | Node.js 20, Express 5, API REST, JWT, bcrypt |
| Base de données | PostgreSQL 16 |
| Environnement | Docker, Docker Compose |
| Gestion du code | Git, GitHub (branches + Pull Requests) |

## ✅ Fonctionnalités

**Visiteur**
- Découvrir le parc et consulter le catalogue des expériences
- Rechercher une expérience par nom et filtrer par catégorie
- Consulter la fiche détaillée d'une expérience

**Membre**
- Créer un compte, se connecter, se déconnecter
- Réserver une expérience (date, heure, nombre de participants)
- Retrouver ses réservations dans son espace personnel
- Annuler une réservation plus de 48 h avant l'expérience

**Administrateur**
- Ajouter, modifier et archiver des expériences
- Consulter l'ensemble des réservations

L'avancement détaillé de chaque fonctionnalité est suivi dans [`docs/suivi.md`](docs/suivi.md).

## 📋 Prérequis

- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/) avec Docker Compose (inclus dans Docker Desktop)

Aucune installation de Node.js ou de PostgreSQL n'est nécessaire : tout tourne dans les conteneurs.

## 🚀 Lancement

```bash
git clone https://github.com/Holberton-Nightfall/holbertonschool-nightfall-project.git
cd holbertonschool-nightfall-project
docker compose up
```

Au premier lancement, la base de données est créée et pré-remplie automatiquement.

| Service | URL |
|---|---|
| Application (front-end) | http://localhost:5173 |
| API | http://localhost:3000/api |
| Base de données | `localhost:5432` |

> Première utilisation : le build des images et le chargement de la base prennent environ une minute. L'API attend que PostgreSQL soit prêt avant de démarrer.

Aucun fichier `.env` n'est requis : le `docker-compose.yml` fournit des valeurs de **développement** par défaut. Pour les personnaliser, copier `.env.example` en `.env`.

### Commandes utiles

```bash
docker compose up --build    # relancer après une modification des dépendances ou des Dockerfiles
docker compose down          # arrêter les conteneurs
docker compose down -v       # arrêter ET réinitialiser la base (le seed est rejoué au prochain lancement)
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

- Le front appelle l'API via la variable `VITE_API_URL` (`http://localhost:3000/api`).
- L'API applique les règles métier, l'authentification (JWT) et les droits d'accès.
- La base est créée et pré-remplie au premier lancement par `db/01_schema.sql` puis `db/02_seed.sql`.

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
│   └── suivi.md          # Tableau de suivi des tâches
├── docker-compose.yml
└── .env.example
```

## 📚 Documentation

- [Conception du projet](docs/infos.md) : utilisateurs, fonctionnalités, modèle de données, priorités, rôles
- [Contrat d'API](docs/routesAPI.md) : toutes les routes, leurs paramètres, réponses et codes d'erreur
- [Tableau de suivi](docs/suivi.md) : répartition et avancement des tâches

## 🤝 Organisation Git

- Aucun push direct sur `main` : chaque fonctionnalité est développée sur sa branche (`feat/...`, `fix/...`, `docs/...`) puis fusionnée par Pull Request relue par un autre membre.
- Messages de commit au format [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`, `chore:`).