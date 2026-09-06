import { Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError';

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.id!;
    const { bookingId, rating, comment } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.customerId !== customerId) {
      return next(new AppError('You can only review your own bookings', 403));
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this booking', 400));
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId,
        providerId: booking.providerId,
        rating: parseInt(rating),
        comment,
      },
    });

    // Recalculate Provider average rating
    const allReviews = await prisma.review.findMany({
      where: { providerId: booking.providerId },
    });

    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Math.round((sum / allReviews.length) * 10) / 10;

    await prisma.providerProfile.update({
      where: { id: booking.providerId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    res.status(201).json({
      success: true,
      data: { review, updatedProviderRating: avgRating },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProviderReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { providerId: id },
      include: {
        customer: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
}
