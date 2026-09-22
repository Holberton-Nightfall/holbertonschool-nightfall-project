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

    // Filtre de recherche partielle sur le nom (insensible à la casse avec ILIKE)
    if (search) {
      query += ` AND e.name ILIKE $${paramIndex}`;
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