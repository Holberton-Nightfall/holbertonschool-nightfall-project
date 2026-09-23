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

export async function getBookingById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }

    const { rows } = await pool.query(
      'SELECT id, user_id, status, scheduled_at FROM bookings WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const booking = rows[0];

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé à cette réservation' });
    }

    if (booking.status === 'cancelled') {
      return res.status(409).json({ error: 'Réservation déjà annulée' });
    }

    const hoursUntilExperience = (new Date(booking.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExperience <= CANCEL_WINDOW_HOURS) {
      return res.status(403).json({
        error: `Annulation impossible moins de ${CANCEL_WINDOW_HOURS}h avant l'expérience`,
      });
    }

    const { rows: updatedRows } = await pool.query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );

    res.json({ message: 'Réservation annulée', booking: updatedRows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    // Vue admin : toutes les réservations, tous membres confondus
    const { rows } = await pool.query(
      `SELECT b.id, b.user_id, u.first_name, u.last_name, b.experience_id, e.name AS experience_name,
              b.scheduled_at, b.participants, b.status, b.created_at, b.cancelled_at
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN experiences e ON e.id = b.experience_id
       ORDER BY b.scheduled_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}