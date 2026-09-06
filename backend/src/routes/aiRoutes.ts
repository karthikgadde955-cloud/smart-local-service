import { Router } from 'express';
import { analyzeDamage, getAnalysisById } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/analyze', protect, analyzeDamage);
router.get('/analysis/:id', protect, getAnalysisById);

export default router;
