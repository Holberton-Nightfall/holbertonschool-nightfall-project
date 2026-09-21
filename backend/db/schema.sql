-- NIGHTFALL - Schéma PostgreSQL (tables uniquement, aucune donnée)
-- Exécuté avant seed.sql (ordre alphabétique dans /docker-entrypoint-initdb.d/)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  intensity_level INTEGER NOT NULL CHECK (intensity_level BETWEEN 1 AND 5),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  price NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  experience_id INTEGER NOT NULL REFERENCES experiences(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  participants_count INTEGER NOT NULL CHECK (participants_count > 0),
  status VARCHAR(10) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);
