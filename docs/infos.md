## 1. Comprendre le besoin

### a. Les différents types d'utilisateurs

    - Administrateurs

    - Membres

    - Visiteurs

### b. Les fonctionnalités principales attendues

    - Catalogue des experiences

    - Recherche et filtres

    - Fiche détaillées des experiences

    - Système de réservations

    - Comptes utilisateurs

    - Espace personnel

    - Annulation

    - Interface administrateur

### c. Les données nécessaires au fonctionnement de l'application
### d. Les interactions entre le Front-end, le Back-end et la base de données



## 2. Organiser le développement

### a. Les fonctionnalités à développer en priorité ;
### b. Les fonctionnalités obligatoires qui seront intégrées ensuite ;
### c. Les éventuelles fonctionnalités supplémentaires qui ne seront abordées qu'une fois le MVP terminé.

## 3. Répartir les rôles

### a. Lead Back-end & BDD - Jason
#### Rôle principal : Développer l'API REST Express, concevoir la base de données et implémenter la logique métier.

#### Base de données :

    Modélisation de la BDD (Users, Experiences, Bookings, Categories).

    Rédaction des scripts SQL ou schémas NoSQL + script de seeding (données de démo et comptes par défaut).

#### API REST & Sécurité :

    Système d'authentification (hashage des mots de passe, gestion des tokens JWT / sessions).

    Mise en place des routes CRUD (/api/experiences, /api/bookings, /api/auth).

    Contrôle des droits d'accès (middleware pour restreindre les accès Admin).

#### Règles métier :

    Validation stricte des données d'entrée (dates futures, capacité d'accueil).

    Logique d'annulation des réservations (vérification stricte du délai des 48h).

### b. Lead Front-end (UX & Public) - Tom
#### Rôle principal : Réaliser l'interface utilisateur côté client (Visiteur et Membre) et gérer la logique d'état sur React.

#### Interface & Parcours Visiteur/Membre :

    Composants du catalogue, cartes d'expériences et fiche détaillée.

    Barres de recherche et système de filtrage (par catégorie, prix, intensité).

    Formulaires de connexion / inscription et espace personnel (historique des réservations).

#### Intégration & Ergonomie :

    Responsive design (mobile + desktop) et charte graphique immersive (univers NIGHTFALL).

    Interface d'annulation côté membre (gestion visuelle du délai de 48h / boutons désactivés si <48h).

#### Connexion API :

    Intégration des appels API REST (Axios ou Fetch) pour les fonctionnalités client.

### c. DevOps, Admin Front & Liaison Inter-Systèmes - Benjamin
#### Rôle principal : Assurer la conteneurisation Docker, développer l'espace Administrateur et faire la jonction entre le Front et le Back.

#### DevOps & Environnement :

    Configuration du docker-compose.yml (services React, Express et BDD).

    Supervision du dépôt GitHub (politique de branches, résolution des conflits de merge).

    Rédaction du README.md final avec la procédure de lancement (docker compose up).

#### Espace d'Administration (Front-end) :

    Interface réservée à l'équipe NIGHTFALL pour la gestion du catalogue (formulaires de création, modification, archivage d'expériences).

    Dashboard de suivi global des réservations.

#### Liaison & Tests :

    Centralisation des variables d'environnement (.env).

    Recette et tests d'intégration complets du parcours utilisateur de bout en bout (Visiteur ➔ Réservation ➔ Admin).

## 4. Créer le repository GitHub

https://github.com/tomvieilledent/holbertonschool-nightfall-project

