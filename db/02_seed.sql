-- =============================================================
-- NIGHTFALL — Données de démonstration
-- Valeurs de DÉVELOPPEMENT uniquement (voir README pour les identifiants)
-- =============================================================

-- ---------- Catégories ----------
INSERT INTO categories (name) VALUES
    ('Survie'),
    ('Horreur'),
    ('Escape Game'),
    ('Science-fiction'),
    ('Action');

-- ---------- Comptes de démo (mots de passe hashés en bcrypt) ----------
-- admin@nightfall.dev   / Admin123!
-- membre@nightfall.dev  / Membre123!
-- membre2@nightfall.dev / Membre123!   (sert à tester qu'un membre ne voit pas les réservations d'un autre)
INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
    ('Admin',  'Nightfall', 'admin@nightfall.dev',   '$2b$10$7hHUWXnSSB3XXaWAy64sEOlbF5y8F1y3qzojMsS818W4RFxrGnMsG', 'admin'),
    ('Alex',   'Martin',    'membre@nightfall.dev',  '$2b$10$T4PV6UuKJBV8cJjSLexZD.03ECNCbC7DH6i3pg6mzZcGrwoMaOkdy', 'member'),
    ('Sam',    'Durand',    'membre2@nightfall.dev', '$2b$10$It7YjKKAO8JbdoxCI7e3yeSMmEv7hjHq3TmShllHjUCzKEgHqtjdy', 'member');

-- ---------- Expériences ----------
-- category_id retrouvé par nom : le seed ne dépend pas de l'ordre des id
INSERT INTO experiences (name, description, image_url, category_id, duration_min, intensity, max_participants, price) VALUES
    ('Le Bunker 7 — Protocole Lazare',
     'Équipe d''extraction envoyée dans un bunker souterrain. Réactivez le générateur principal et récupérez les recherches du Dr. Vance tout en échappant aux anciens occupants contaminés.',
     '/images/experiences/bunker-7.jpeg', (SELECT id FROM categories WHERE name = 'Survie'), 45, 4, 6, 35.00),

    ('La Zone Morte — Évacuation d''Urgence',
     'Votre véhicule blindé est en panne en pleine zone de quarantaine. Le point d''extraction est à 500 mètres : courez, traversez des ruines et débloquez des accès sous une attaque constante de Rôdeurs.',
     '/images/experiences/dead-zone.jpeg', (SELECT id FROM categories WHERE name = 'Action'), 30, 3, 10, 28.00),

    ('L''Abattoir — Le Festin des Mutants',
     'Enchaînés dans une chambre froide, vous êtes aux mains d''une tribu de cannibales mutants. Libérez-vous et trouvez la sortie avant leur retour. Effets gore et obscurité totale.',
     '/images/experiences/slaughterhouse.jpeg', (SELECT id FROM categories WHERE name = 'Horreur'), 50, 5, 4, 42.00),

    ('La Ruche — Cyber-Infection',
     'Une IA tente d''infecter l''humanité avec un nano-virus. Infiltrez le complexe, hackez les terminaux et évitez les drones ainsi que les humains « Transférés » pour détruire le noyau central.',
     '/images/experiences/cyber-hive.jpeg', (SELECT id FROM categories WHERE name = 'Science-fiction'), 40, 3, 8, 32.00),

    ('Le Convoi — Terre Brûlée',
     'Traversez un canyon désertique à bord de camions blindés. Équipés de lanceurs, défendez le convoi contre les vagues de pillards en buggys.',
     '/images/experiences/wasteland-convoy.jpeg', (SELECT id FROM categories WHERE name = 'Action'), 30, 2, 20, 25.00),

    ('Ground Zero — La Dernière Résistance',
     'Retranchés dans une église fortifiée, tenez votre position pendant 20 minutes avec des munitions limitées. Barricadez les accès et repoussez les hordes en attendant l''hélicoptère d''évacuation.',
     '/images/experiences/ground-zero.jpeg', (SELECT id FROM categories WHERE name = 'Survie'), 35, 4, 15, 38.00),

    ('Le Laboratoire Omega — Code Rouge',
     'Une fuite a déclenché le confinement du laboratoire Omega. Vous avez 60 minutes pour résoudre les énigmes du système de sécurité, reconstituer l''antidote et ouvrir le sas avant la stérilisation totale du bâtiment.',
     '/images/experiences/laboratoire-omega.jpeg', (SELECT id FROM categories WHERE name = 'Escape Game'), 60, 2, 6, 30.00);

-- Expérience archivée : n'apparaît plus au catalogue, mais sa réservation passée reste valide
INSERT INTO experiences (name, description, image_url, category_id, duration_min, intensity, max_participants, price, is_archived) VALUES
    ('Station Kepler — Dernier Signal',
     'Ancienne expérience : l''équipage d''une station orbitale ne répond plus. Rétablissez le contact avant la chute de l''orbite.',
     '/images/experiences/kepler-station.jpeg', (SELECT id FROM categories WHERE name = 'Science-fiction'), 40, 3, 6, 30.00, TRUE);

-- ---------- Réservations ----------
-- Dates relatives au premier démarrage, à heure fixe de nuit (22 h-23 h, heure de Paris) :
-- les écarts restent valides quel que soit le jour de la démo, et les créneaux restent
-- cohérents avec les horaires du parc (22 h-6 h), quelle que soit l'heure du démarrage.
-- Le double AT TIME ZONE 'Europe/Paris' est nécessaire : le conteneur tourne en UTC,
-- donc date_trunc('day', NOW()) donnerait minuit UTC, soit 2 h du matin à Paris.
INSERT INTO bookings (user_id, experience_id, scheduled_at, participants, status, cancelled_at) VALUES
    -- Annulable (plus de 48 h avant)
    ((SELECT id FROM users WHERE email = 'membre@nightfall.dev'),
     (SELECT id FROM experiences WHERE name LIKE 'Le Bunker 7%'),
     ((date_trunc('day', NOW() AT TIME ZONE 'Europe/Paris') + INTERVAL '10 days 23 hours') AT TIME ZONE 'Europe/Paris'), 4, 'confirmed', NULL),

    -- NON annulable (moins de 48 h avant)
    ((SELECT id FROM users WHERE email = 'membre@nightfall.dev'),
     (SELECT id FROM experiences WHERE name LIKE 'La Ruche%'),
          ((date_trunc('day', NOW() AT TIME ZONE 'Europe/Paris') + INTERVAL '1 day 23 hours') AT TIME ZONE 'Europe/Paris'), 2, 'confirmed', NULL),

    -- Déjà annulée
    ((SELECT id FROM users WHERE email = 'membre@nightfall.dev'),
     (SELECT id FROM experiences WHERE name LIKE 'Le Convoi%'),
          ((date_trunc('day', NOW() AT TIME ZONE 'Europe/Paris') + INTERVAL '15 days 22 hours 30 minutes') AT TIME ZONE 'Europe/Paris'), 6, 'cancelled', NOW()),

    -- Passée, sur l'expérience archivée
    ((SELECT id FROM users WHERE email = 'membre@nightfall.dev'),
     (SELECT id FROM experiences WHERE name LIKE 'Station Kepler%'),
          ((date_trunc('day', NOW() AT TIME ZONE 'Europe/Paris') - INTERVAL '5 days' + INTERVAL '23 hours') AT TIME ZONE 'Europe/Paris'), 3, 'confirmed', NULL),

    -- Appartient au 2e membre : le 1er ne doit ni la voir ni l'annuler
    ((SELECT id FROM users WHERE email = 'membre2@nightfall.dev'),
     (SELECT id FROM experiences WHERE name LIKE 'Ground Zero%'),
          ((date_trunc('day', NOW() AT TIME ZONE 'Europe/Paris') + INTERVAL '7 days 23 hours') AT TIME ZONE 'Europe/Paris'), 5, 'confirmed', NULL);