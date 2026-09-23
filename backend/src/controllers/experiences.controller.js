// backend/src/controllers/experiences.controller.js
import { pool } from '../config/db.js';

export async function getExperiences(req, res, next) {
  try {
    const { search, category, min_price, max_price, intensity } = req.query;
    const errors = [];

    // category : identifiant entier de catégorie
    let categoryId;
    if (category !== undefined && category !== '') {
      categoryId = Number(category);
      if (!Number.isInteger(categoryId)) {
        errors.push('category doit être un identifiant valide');
      }
    }

    // min_price / max_price : bornes de prix, combinables
    let minPrice;
    if (min_price !== undefined && min_price !== '') {
      minPrice = Number(min_price);
      if (Number.isNaN(minPrice) || minPrice < 0) {
        errors.push('min_price doit être un nombre positif ou nul');
      }
    }

    let maxPrice;
    if (max_price !== undefined && max_price !== '') {
      maxPrice = Number(max_price);
      if (Number.isNaN(maxPrice) || maxPrice < 0) {
        errors.push('max_price doit être un nombre positif ou nul');
      }
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      !Number.isNaN(minPrice) &&
      !Number.isNaN(maxPrice) &&
      minPrice > maxPrice
    ) {
      errors.push('min_price ne peut pas être supérieur à max_price');
    }

    // intensity : correspond exactement à la colonne experiences.intensity (1 à 5)
    let intensityValue;
    if (intensity !== undefined && intensity !== '') {
      intensityValue = Number(intensity);
      if (!Number.isInteger(intensityValue) || intensityValue < 1 || intensityValue > 5) {
        errors.push('intensity doit être un entier entre 1 et 5');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Paramètres invalides', details: errors });
    }

    let query = `
      SELECT e.id, e.name, e.description, e.image_url, e.duration_min,
              e.intensity, e.max_participants, e.price,
              c.id AS category_id, c.name AS category_name
       FROM experiences e
       JOIN categories c ON c.id = e.category_id
       WHERE e.is_archived = false
    `;

    const params = [];
    let paramIndex = 1;

    // Filtre de recherche partielle sur le nom ou la description (insensible à la casse avec ILIKE)
    if (search) {
      query += ` AND (e.name ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtre par identifiant de catégorie
    if (categoryId !== undefined) {
      query += ` AND e.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    // Filtre par borne basse de prix
    if (minPrice !== undefined) {
      query += ` AND e.price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    // Filtre par borne haute de prix
    if (maxPrice !== undefined) {
      query += ` AND e.price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    // Filtre par intensité exacte
    if (intensityValue !== undefined) {
      query += ` AND e.intensity = $${paramIndex}`;
      params.push(intensityValue);
      paramIndex++;
    }

    query += ` ORDER BY e.name`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getExperienceById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    const { rows } = await pool.query(
      `SELECT e.*, c.name AS category_name
       FROM experiences e
       JOIN categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.is_archived = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expérience introuvable' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// --- Admin ---------------------------------------------------------------
// Contrairement à getExperiences (public), renvoie TOUTES les expériences,
// y compris archivées, avec le champ is_archived. Route protégée par
// requireAuth + requireAdmin dans admin.routes.js.
export async function getAllExperiencesAdmin(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.name, e.description, e.image_url, e.duration_min,
              e.intensity, e.max_participants, e.price, e.is_archived,
              c.id AS category_id, c.name AS category_name
       FROM experiences e
       JOIN categories c ON c.id = e.category_id
       ORDER BY e.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createExperience(req, res, next) {
  try {
    const { name, description, image_url, category_id, duration_min, intensity, max_participants, price } = req.body ?? {};
    const errors = [];

    if (typeof name !== 'string' || name.trim() === '') errors.push('name est obligatoire');
    if (typeof description !== 'string' || description.trim() === '') errors.push('description est obligatoire');
    if (typeof image_url !== 'string' || image_url.trim() === '') errors.push('image_url est obligatoire');

    const categoryId = Number(category_id);
    if (!Number.isInteger(categoryId)) errors.push('category_id doit être un identifiant valide');

    const durationMin = Number(duration_min);
    if (!Number.isInteger(durationMin) || durationMin <= 0) errors.push('duration_min doit être un entier positif');

    const intensityValue = Number(intensity);
    if (!Number.isInteger(intensityValue) || intensityValue < 1 || intensityValue > 5) errors.push('intensity doit être un entier entre 1 et 5');

    const maxParticipants = Number(max_participants);
    if (!Number.isInteger(maxParticipants) || maxParticipants <= 0) errors.push('max_participants doit être un entier positif');

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue < 0) errors.push('price doit être un nombre positif ou nul');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Données invalides', details: errors });
    }

    // Vérifie que category_id référence une catégorie existante (message clair plutôt qu'une erreur FK)
    const { rows: categoryRows } = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (categoryRows.length === 0) {
      return res.status(400).json({ error: 'Données invalides', details: ['category_id ne correspond à aucune catégorie'] });
    }

    const { rows } = await pool.query(
      `INSERT INTO experiences (name, description, image_url, category_id, duration_min, intensity, max_participants, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, description, image_url, category_id, duration_min, intensity, max_participants, price, is_archived`,
      [name.trim(), description.trim(), image_url.trim(), categoryId, durationMin, intensityValue, maxParticipants, priceValue]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateExperience(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    const { name, description, image_url, category_id, duration_min, intensity, max_participants, price } = req.body ?? {};
    const errors = [];
    const fields = [];
    const params = [];
    let paramIndex = 1;
    let categoryId; // conservé hors de la boucle pour être vérifié en base ci-dessous

    // Mise à jour partielle : seuls les champs fournis sont validés et modifiés
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') errors.push('name doit être une chaîne non vide');
      else { fields.push(`name = $${paramIndex++}`); params.push(name.trim()); }
    }
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') errors.push('description doit être une chaîne non vide');
      else { fields.push(`description = $${paramIndex++}`); params.push(description.trim()); }
    }
    if (image_url !== undefined) {
      if (typeof image_url !== 'string' || image_url.trim() === '') errors.push('image_url doit être une chaîne non vide');
      else { fields.push(`image_url = $${paramIndex++}`); params.push(image_url.trim()); }
    }
    if (category_id !== undefined) {
      categoryId = Number(category_id);
      if (!Number.isInteger(categoryId)) errors.push('category_id doit être un identifiant valide');
      else { fields.push(`category_id = $${paramIndex++}`); params.push(categoryId); }
    }
    if (duration_min !== undefined) {
      const durationMin = Number(duration_min);
      if (!Number.isInteger(durationMin) || durationMin <= 0) errors.push('duration_min doit être un entier positif');
      else { fields.push(`duration_min = $${paramIndex++}`); params.push(durationMin); }
    }
    if (intensity !== undefined) {
      const intensityValue = Number(intensity);
      if (!Number.isInteger(intensityValue) || intensityValue < 1 || intensityValue > 5) errors.push('intensity doit être un entier entre 1 et 5');
      else { fields.push(`intensity = $${paramIndex++}`); params.push(intensityValue); }
    }
    if (max_participants !== undefined) {
      const maxParticipants = Number(max_participants);
      if (!Number.isInteger(maxParticipants) || maxParticipants <= 0) errors.push('max_participants doit être un entier positif');
      else { fields.push(`max_participants = $${paramIndex++}`); params.push(maxParticipants); }
    }
    if (price !== undefined) {
      const priceValue = Number(price);
      if (Number.isNaN(priceValue) || priceValue < 0) errors.push('price doit être un nombre positif ou nul');
      else { fields.push(`price = $${paramIndex++}`); params.push(priceValue); }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Données invalides', details: errors });
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    // Comme dans createExperience : on vérifie que la catégorie existe avant
    // d'écrire, plutôt que de laisser Postgres renvoyer une violation de FK
    // (23503) qui remonterait comme une 500 générique via errorHandler.
    if (categoryId !== undefined) {
      const { rows: categoryRows } = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
      if (categoryRows.length === 0) {
        return res.status(400).json({ error: 'Données invalides', details: ['category_id ne correspond à aucune catégorie'] });
      }
    }

    params.push(id);
    const { rows } = await pool.query(
      `UPDATE experiences SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, description, image_url, category_id, duration_min, intensity, max_participants, price, is_archived`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expérience introuvable' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Archive OU désarchive selon le body ({ is_archived: boolean }, true par défaut).
// Nom aligné avec l'import attendu par admin.routes.js (setExperienceArchived).
export async function setExperienceArchived(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    const { is_archived } = req.body ?? {};
    const archived = is_archived === undefined ? true : is_archived;
    if (typeof archived !== 'boolean') {
      return res.status(400).json({ error: 'Données invalides', details: ['is_archived doit être un booléen'] });
    }

    // Archivage plutôt que suppression : l'historique des réservations reste valide
    const { rows } = await pool.query(
      `UPDATE experiences SET is_archived = $1 WHERE id = $2
       RETURNING id, name, is_archived`,
      [archived, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expérience introuvable' });
    }
    res.json({
      message: archived ? 'Expérience archivée' : 'Expérience désarchivée',
      experience: rows[0],
    });
  } catch (err) {
    next(err);
  }
}