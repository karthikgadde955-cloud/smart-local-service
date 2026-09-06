import { Router } from 'express';
import {
  getAllProviders,
  getNearbyProviders,
  getRecommendedProviders,
  getRankedProviders,
  getProviderById,
} from '../controllers/providerController';

const router = Router();

router.get('/', getAllProviders);
router.get('/nearby', getNearbyProviders);
router.get('/recommended', getRecommendedProviders);
router.get('/ranked', getRankedProviders);
router.get('/:id', getProviderById);

export default router;
