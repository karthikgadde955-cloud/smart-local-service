import { Router } from 'express';
import { createEmergencyRequest, getEmergencyById } from '../controllers/emergencyController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createEmergencyRequest);
router.get('/:id', protect, getEmergencyById);

export default router;
