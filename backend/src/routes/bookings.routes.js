import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Toutes les routes de réservation exigent d'être connecté
router.use(requireAuth);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

export default router;