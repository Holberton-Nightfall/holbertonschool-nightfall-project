-- =============================================================
-- NIGHTFALL — Schéma de la base de données (PostgreSQL)
-- Exécuté automatiquement au premier démarrage du conteneur db
-- =============================================================

CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    -- Unicité gérée par l'index idx_users_email_lower (insensible à la casse)
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    -- 'member' par défaut : le rôle admin n'est jamais attribué par l'inscription
    role           VARCHAR(20)  NOT NULL DEFAULT 'member'
                   CHECK (role IN ('member', 'admin')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE TABLE categories (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE experiences (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    description       TEXT         NOT NULL,
    image_url         VARCHAR(255) NOT NULL,
    -- RESTRICT : impossible de supprimer une catégorie encore utilisée
    category_id       INTEGER      NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    duration_min      INTEGER      NOT NULL CHECK (duration_min > 0),
    intensity         SMALLINT     NOT NULL CHECK (intensity BETWEEN 1 AND 5),
    max_participants  INTEGER      NOT NULL CHECK (max_participants > 0),
    price             NUMERIC(8,2) NOT NULL CHECK (price >= 0),
    -- Archivage plutôt que suppression : l'historique des réservations reste valide
    is_archived       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
);

CREATE TABLE bookings (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- RESTRICT : une expérience réservée ne peut pas être supprimée, seulement archivée
    experience_id  INTEGER     NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
    scheduled_at   TIMESTAMPTZ NOT NULL,
    participants   INTEGER     NOT NULL CHECK (participants > 0),
    -- Une annulation change le statut, la ligne n'est jamais supprimée
    status         VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed', 'cancelled')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at   TIMESTAMPTZ,
    -- Statut et date d'annulation toujours cohérents
    CONSTRAINT chk_bookings_cancelled
        CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL))
);

-- Règles vérifiées côté Back-end (pas en base, car dépendantes du moment ou d'une autre table) :
--   * scheduled_at dans le futur à la création
--   * participants <= experiences.max_participants
--   * annulation uniquement à plus de 48 h de scheduled_at

-- Alice@x.com et alice@x.com sont le même compte
CREATE UNIQUE INDEX idx_users_email_lower ON users (lower(email));
CREATE INDEX idx_experiences_category ON experiences(category_id);
CREATE INDEX idx_bookings_user        ON bookings(user_id);
CREATE INDEX idx_bookings_experience  ON bookings(experience_id);