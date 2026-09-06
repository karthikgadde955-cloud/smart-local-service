import { Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError';

export async function getAppliances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.id;
    const appliances = await prisma.appliance.findMany({
      where: { customerId },
      include: {
        maintenanceRecords: { orderBy: { serviceDate: 'desc' } },
        maintenanceReminders: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: appliances.length,
      data: { appliances },
    });
  } catch (error) {
    next(error);
  }
}

export async function addAppliance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.id!;
    const { name, brand, model, purchaseDate, installationDate, lastServiceDate, maintenanceIntervalMonths, warrantyInfo, notes } = req.body;

    const appliance = await prisma.appliance.create({
      data: {
        customerId,
        name,
        brand,
        model,
        purchaseDate,
        installationDate,
        lastServiceDate,
        maintenanceIntervalMonths: parseInt(maintenanceIntervalMonths) || 6,
        warrantyInfo,
        notes,
      },
    });

    // Auto-generate initial maintenance reminder if service date provided
    if (lastServiceDate) {
      const lastDate = new Date(lastServiceDate);
      lastDate.setMonth(lastDate.getMonth() + (parseInt(maintenanceIntervalMonths) || 6));
      const dueDate = lastDate.toISOString().split('T')[0];

      await prisma.maintenanceReminder.create({
        data: {
          applianceId: appliance.id,
          dueDate,
          title: `${name} Maintenance Due`,
          description: `Regular preventive maintenance recommended for ${brand} ${name}.`,
          status: 'PENDING',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: { appliance },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAppliance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customerId = req.user?.id;
    const { name, brand, model, purchaseDate, installationDate, lastServiceDate, maintenanceIntervalMonths, warrantyInfo, notes } = req.body;

    const existing = await prisma.appliance.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      return next(new AppError('Appliance not found or unauthorized', 404));
    }

    const updated = await prisma.appliance.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(model && { model }),
        ...(purchaseDate && { purchaseDate }),
        ...(installationDate && { installationDate }),
        ...(lastServiceDate && { lastServiceDate }),
        ...(maintenanceIntervalMonths && { maintenanceIntervalMonths: parseInt(maintenanceIntervalMonths) }),
        ...(warrantyInfo && { warrantyInfo }),
        ...(notes && { notes }),
      },
    });

    res.status(200).json({
      success: true,
      data: { appliance: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppliance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customerId = req.user?.id;

    const existing = await prisma.appliance.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      return next(new AppError('Appliance not found or unauthorized', 404));
    }

    await prisma.appliance.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Appliance removed successfully',
    });
  } catch (error) {
    next(error);
  }
}
