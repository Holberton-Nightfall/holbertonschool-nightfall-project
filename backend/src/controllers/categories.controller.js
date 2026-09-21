import { pool } from '../config/db.js';

export async function getCategories(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}