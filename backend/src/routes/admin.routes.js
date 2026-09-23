import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import {
  getAllExperiencesAdmin,
  createExperience,
  updateExperience,
  setExperienceArchived,
} from '../controllers/experiences.controller.js';
import { getAllBookings } from '../controllers/bookings.controller.js';

const router = Router();

// Toutes les routes admin exigent d'être connecté ET admin
router.use(requireAuth, requireAdmin);

router.get('/experiences', getAllExperiencesAdmin);
router.post('/experiences', createExperience);
router.put('/experiences/:id', updateExperience);
router.patch('/experiences/:id/archive', setExperienceArchived);

router.get('/bookings', getAllBookings);

export default router;