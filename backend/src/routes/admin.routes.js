import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { createExperience, updateExperience, archiveExperience } from '../controllers/experiences.controller.js';
import { getAllBookings } from '../controllers/bookings.controller.js';

const router = Router();

// Toutes les routes admin exigent d'être connecté ET admin
router.use(requireAuth, requireAdmin);
router.post('/experiences', createExperience);
router.put('/experiences/:id', updateExperience);
router.patch('/experiences/:id/archive', archiveExperience);

router.get('/bookings', getAllBookings);

export default router;