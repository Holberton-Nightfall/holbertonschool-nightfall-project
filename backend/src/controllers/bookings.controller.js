// backend/src/controllers/bookings.controller.js
import { pool } from '../config/db.js';

const CANCEL_WINDOW_HOURS = 48;

// Plus grand entier accepté par une colonne PostgreSQL INTEGER
const MAX_INT = 2147483647;

function parsePositiveInt(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 && n <= MAX_INT ? n : null;
}

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

export async function getBookingById(req, res, next) {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    const { rows } = await pool.query(
      `SELECT b.id, b.user_id, b.experience_id, e.name AS experience_name, b.scheduled_at,
              b.participants, b.status,
              (b.status = 'confirmed' AND b.scheduled_at > NOW() + INTERVAL '${CANCEL_WINDOW_HOURS} hours') AS can_cancel
       FROM bookings b
       JOIN experiences e ON e.id = b.experience_id
       WHERE b.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const { user_id: ownerId, ...booking } = rows[0];
    if (ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé à cette réservation' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    // Mutation atomique : la fenêtre des 48h est vérifiée dans la même requête
    // que l'écriture, donc pas de race condition entre deux annulations.
    const { rows } = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status = 'confirmed'
         AND scheduled_at > NOW() + INTERVAL '${CANCEL_WINDOW_HOURS} hours'
       RETURNING id, status`,
      [id, req.user.id]
    );

    if (rows.length === 1) {
      return res.json({ message: 'Réservation annulée', booking: rows[0] });
    }

    // L'UPDATE n'a touché aucune ligne : on interroge sans filtre pour
    // savoir laquelle des raisons s'applique, et renvoyer le bon code.
    const { rows: diagRows } = await pool.query(
      'SELECT user_id, status, scheduled_at FROM bookings WHERE id = $1',
      [id]
    );

    if (diagRows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const booking = diagRows[0];
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé à cette réservation' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(409).json({ error: 'Réservation déjà annulée' });
    }
    return res.status(403).json({
      error: `Annulation impossible moins de ${CANCEL_WINDOW_HOURS}h avant l'expérience`,
    });
  } catch (err) {
    next(err);
  }
}