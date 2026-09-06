import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AppError } from '../utils/appError';

export async function getAllServices(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        _count: { select: { providerServices: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        providerServices: {
          include: {
            provider: {
              include: {
                user: { select: { name: true, avatarUrl: true, phone: true } },
                skills: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return next(new AppError('Service category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}
