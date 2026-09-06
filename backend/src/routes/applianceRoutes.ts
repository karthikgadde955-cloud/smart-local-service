import { Router } from 'express';
import { getAppliances, addAppliance, updateAppliance, deleteAppliance } from '../controllers/applianceController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getAppliances);
router.post('/', protect, addAppliance);
router.put('/:id', protect, updateAppliance);
router.delete('/:id', protect, deleteAppliance);

export default router;
