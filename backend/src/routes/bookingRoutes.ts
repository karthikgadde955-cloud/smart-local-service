import { Router } from 'express';
import { createBooking, getBookings, getBookingById, updateBookingStatus } from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);

export default router;
