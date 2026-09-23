import { Router } from 'express';
import {
  getAllExperiencesAdmin,
  createExperience,
  updateExperience,
  setExperienceArchived,
} from '../controllers/experiences.controller.js';


const router = Router();

router.get('/experiences', getAllExperiencesAdmin);
router.post('/experiences', createExperience);
router.put('/experiences/:id', updateExperience);
router.patch('/experiences/:id/archive', setExperienceArchived);
export default router;