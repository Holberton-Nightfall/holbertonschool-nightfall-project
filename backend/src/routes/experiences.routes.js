import { Router } from 'express';
import { 
  getExperiences, 
  getExperienceById, 
  searchExperiences 
} from '../controllers/experiences.controller.js';

// N'oublie pas d'importer le middleware !
import { requireAuth } from '../middlewares/auth.js'; 

const router = Router();

// 1. La route de recherche (sécurisée)
router.get('/search', requireAuth, searchExperiences);

// 2. Les autres routes (exemple)
router.get('/', getExperiences);
router.get('/:id', getExperienceById);

export default router;