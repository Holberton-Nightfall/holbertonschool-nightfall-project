import { pool } from '../config/db.js';

export async function getExperiences(req, res, next) {
  try {
    const { search, category } = req.query;
    const conditions = ['e.is_archived = false'];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`e.name ILIKE $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`e.category_id = $${values.length}`);
    }

    const { rows } = await pool.query(
      `SELECT e.id, e.name, e.description, e.image_url, e.duration_minutes,
              e.intensity_level, e.max_participants, e.price,
              c.id AS category_id, c.name AS category_name
       FROM experiences e
       JOIN categories c ON c.id = e.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.name`,
      values
    );
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