import { pool } from '../config/db.js';

const CANCEL_WINDOW_HOURS = 48;

export async function createBooking(req, res, next) {
  try {
    const { experience_id, scheduled_at, participants } = req.body ?? {};
    const errors = [];

    const experienceId = Number(experience_id);
    if (!Number.isInteger(experienceId)) {
      errors.push('experience_id est obligatoire et doit être un entier');
    }

    const scheduledDate = new Date(scheduled_at);
    if (typeof scheduled_at !== 'string' || Number.isNaN(scheduledDate.getTime())) {
      errors.push('scheduled_at doit être une date valide (ISO 8601)');
    } else if (scheduledDate.getTime() <= Date.now()) {
      errors.push('scheduled_at doit être dans le futur');
    }

    const participantsCount = Number(participants);
    if (!Number.isInteger(participantsCount) || participantsCount <= 0) {
      errors.push('participants doit être un entier strictement positif');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Données invalides', details: errors });
    }

    // Une seule requête pour vérifier existence + non-archivage + capacité
    const { rows: experienceRows } = await pool.query(
      'SELECT max_participants FROM experiences WHERE id = $1 AND is_archived = false',
      [experienceId]
    );
    if (experienceRows.length === 0) {
      return res.status(404).json({ error: 'Expérience introuvable' });
    }

    const { max_participants: maxParticipants } = experienceRows[0];
    if (participantsCount > maxParticipants) {
      return res.status(400).json({
        error: 'Données invalides',
        details: [`participants ne peut pas dépasser ${maxParticipants} pour cette expérience`],
      });
    }

    // req.user vient de requireAuth : l'utilisateur ne peut jamais être choisi via le body
    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, experience_id, scheduled_at, participants)
       VALUES ($1, $2, $3, $4)
       RETURNING id, experience_id, scheduled_at, participants, status`,
      [req.user.id, experienceId, scheduledDate.toISOString(), participantsCount]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getBookings(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.experience_id, e.name AS experience_name, b.scheduled_at,
              b.participants, b.status,
              (b.status = 'confirmed' AND b.scheduled_at > NOW() + INTERVAL '${CANCEL_WINDOW_HOURS} hours') AS can_cancel
       FROM bookings b
       JOIN experiences e ON e.id = b.experience_id
       WHERE b.user_id = $1
       ORDER BY b.scheduled_at`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}