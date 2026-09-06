import { Router } from 'express';
import { getMe, updateMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
