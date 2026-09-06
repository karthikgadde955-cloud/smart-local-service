import { Router } from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);
router.get('/providers/:id/reviews', getProviderReviews);

export default router;
