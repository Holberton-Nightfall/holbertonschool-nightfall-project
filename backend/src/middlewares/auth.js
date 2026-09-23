import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// Exige un token valide et place l'utilisateur dans req.user
export async function requireAuth(req, res, next) {
  try {
    // Format attendu : "Authorization: Bearer <token>"
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    let payload;
    try {
      // Algorithme imposé : refuse les tokens signés autrement (ex. "none")
      payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    // Le rôle vient de la base, pas du token : il est toujours à jour
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [Number(payload.sub)]
    );
    if (rows.length === 0) {
      // Compte supprimé depuis l'émission du token
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

// À placer après requireAuth : connecté mais pas admin => 403
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}