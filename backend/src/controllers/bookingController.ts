import { Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError';

export async function createBooking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.id!;
    const { providerId, serviceType, bookingDate, bookingTime, totalAmount, notes, serviceRequestId, emergencyRequestId } = req.body;

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return next(new AppError('Service provider not found', 404));
    }

    const booking = await prisma.booking.create({
      data: {
        customerId,
        providerId,
        serviceType: serviceType || 'SMART_REPAIR',
        bookingDate: bookingDate || new Date().toISOString().split('T')[0],
        bookingTime: bookingTime || '10:00',
        status: 'PENDING',
        totalAmount: parseFloat(totalAmount) || provider.basePrice,
        notes,
        serviceRequestId,
        emergencyRequestId,
        statusHistory: {
          create: {
            status: 'PENDING',
            changedByUserId: customerId,
            note: 'Booking requested by customer',
          },
        },
      },
      include: {
        provider: { include: { user: true } },
        customer: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role;

    let whereClause: any = {};
    if (userRole === 'CUSTOMER') {
      whereClause = { customerId: userId };
    } else if (userRole === 'PROVIDER') {
      const providerProfile = await prisma.providerProfile.findUnique({ where: { userId } });
      if (providerProfile) {
        whereClause = { providerId: providerProfile.id };
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        provider: { include: { user: { select: { name: true, phone: true, avatarUrl: true } } } },
        customer: { select: { name: true, email: true, phone: true } },
        reviews: true,
        statusHistory: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true, skills: true } },
        customer: true,
        reviews: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
      },
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user?.id!;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return next(new AppError('Booking not found', 404));
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            changedByUserId: userId,
            note: note || `Status updated to ${status}`,
          },
        },
      },
      include: {
        provider: { include: { user: true } },
        customer: true,
      },
    });

    // If completed, update provider jobsCompleted counter
    if (status === 'COMPLETED') {
      await prisma.providerProfile.update({
        where: { id: existing.providerId },
        data: { jobsCompleted: { increment: 1 } },
      });
    }

    res.status(200).json({
      success: true,
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
}
