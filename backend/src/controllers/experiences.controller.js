// backend/src/controllers/experiences.controller.js
import { pool } from '../config/db.js';

export async function getExperiences(req, res, next) {
  try {
    const { search, category } = req.query;
    
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
    if (category) {
      query += ` AND e.category_id = $${paramIndex}`;
      params.push(Number(category));
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