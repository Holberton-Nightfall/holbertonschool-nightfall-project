import { Router } from 'express';
import {
  register,
  login,
  me,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
router.put('/email', requireAuth, updateEmail);
router.put('/password', requireAuth, updatePassword);
router.delete('/me', requireAuth, deleteAccount);

export default router;