// backend/src/routes/bookings.routes.js
import { Router } from 'express';
import { createBooking, getBookings, cancelBooking } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Toutes les routes de réservation exigent d'être connecté
router.use(requireAuth);

router.post('/', createBooking);
router.get('/', getBookings);
router.delete('/:id', cancelBooking);

export default router;