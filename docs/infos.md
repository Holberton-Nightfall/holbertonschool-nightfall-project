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

    - Users : id, nom, email, mot de passe (hashé), rôle (admin / membre), date de création

    - Categories : id, nom, description

    - Experiences : id, titre, description, catégorie, prix, intensité, durée, capacité, images, statut (actif / archivé)

    - Sessions (créneaux) : id, expérience, date et heure, places restantes

    - Bookings : id, utilisateur, expérience / session, nombre de places, statut (confirmée / annulée), date de réservation, date d'annulation

### d. Les interactions entre le Front-end, le Back-end et la base de données

    - Front-end (React) : envoie des requêtes HTTP (Axios / Fetch) vers l'API REST, stocke le token JWT et gère l'état de l'interface.

    - Back-end (Express) : valide les requêtes, vérifie l'authentification et les droits (middleware), applique les règles métier (dates futures, capacité, délai d'annulation de 48h), puis lit / écrit en BDD.

    - Base de données : stocke les données persistantes et renvoie les résultats au Back-end, qui les retourne au Front-end en JSON.

    - Flux type (réservation) : Membre ➔ POST /api/bookings (token JWT) ➔ contrôle des règles ➔ enregistrement en BDD ➔ réponse JSON ➔ mise à jour de l'espace personnel.



## 2. Organiser le développement

### a. Les fonctionnalités à développer en priorité ;

    - Modélisation BDD + seeding

    - Authentification (inscription, connexion, JWT, rôles)

    - Catalogue et fiche détaillée des expériences

    - Système de réservation

    - Docker compose + .env

### b. Les fonctionnalités obligatoires qui seront intégrées ensuite ;

    - Recherche et filtres (catégorie, prix, intensité)

    - Espace personnel (historique des réservations)

    - Annulation avec règle des 48h

    - Interface administrateur (CRUD / archivage des expériences, dashboard des réservations)

    - Responsive design et charte graphique NIGHTFALL

    - Tests d'intégration et README final

### c. Les éventuelles fonctionnalités supplémentaires qui ne seront abordées qu'une fois le MVP terminé.

    - Avis et notes sur les expériences

    - Favoris / liste de souhaits

    - Notifications par email (confirmation, rappel, annulation)

    - Paiement en ligne

    - Statistiques avancées côté admin

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

## Attractions 

### 1. Le Bunker 7 — Protocole "Lazare"
    title : Le Bunker 7 — Protocole Lazare

    category : Survival

    intensityLevel : 4

    durationMinutes : 45

    maxParticipants : 6

    price : 35.00

    imageUrl : /images/bunker-7.jpg

    description : Équipe d'extraction envoyée dans un bunker souterrain. Réactivez le générateur principal et récupérez les recherches du Dr. Vance tout en échappant aux anciens occupants contaminés.

### 2. La Zone Morte — Évacuation d'Urgence
    title : La Zone Morte — Évacuation d'Urgence

    category : Action

    intensityLevel : 3

    durationMinutes : 30

    maxParticipants : 10

    price : 28.00

    imageUrl : /images/dead-zone.jpg

    description : Votre véhicule blindé est en panne en pleine zone de quarantaine. Le point d'extraction est à 500 mètres : courez, traversez des ruines et débloquez des accès sous une attaque constante de Rôdeurs.

### 3. L'Abattoir — Le Festin des Mutants
    title : L'Abattoir — Le Festin des Mutants

    category : Horror

    intensityLevel : 5

    durationMinutes : 50

    maxParticipants : 4

    price : 42.00

    imageUrl : /images/slaughterhouse.jpg

    description : Enchaînés dans une chambre froide, vous êtes aux mains d'une tribu de cannibales mutants. Libérez-vous et trouvez la sortie avant leur retour. Effets gore et obscurité totale.

### 4. La Ruche — Cyber-Infection
    title : La Ruche — Cyber-Infection

    category : Sci-Fi

    intensityLevel : 3

    durationMinutes : 40

    maxParticipants : 8

    price : 32.00

    imageUrl : /images/cyber-hive.jpg

    description : Une IA tente d'infecter l'humanité avec un nano-virus. Infiltrez le complexe, hackez les terminaux et évitez les drones ainsi que les humains "Transférés" pour détruire le noyau central.

### 5. Le Convoi — Terre Brûlée
    title : Le Convoi — Terre Brûlée

    category : Action

    intensityLevel : 2

    durationMinutes : 30

    maxParticipants : 20

    price : 25.00

    imageUrl : /images/wasteland-convoy.jpg

    description : Traversez un canyon désertique à bord de camions blindés. Équipés de lanceurs, défendez le convoi contre les vagues de pillards en buggys dans une ambiance à la Mad Max.

### 6. Ground Zero — La Dernière Résistance
    title : Ground Zero — La Dernière Résistance

    category : Survival

    intensityLevel : 4

    durationMinutes : 35

    maxParticipants : 15

    price : 38.00

    imageUrl : /images/ground-zero.jpg

    description : Retranchés dans une église fortifiée, tenez votre position pendant 20 minutes avec des munitions limitées. Barricadez les accès et repoussez les hordes en attendant l'hélicoptère d'évacuation.