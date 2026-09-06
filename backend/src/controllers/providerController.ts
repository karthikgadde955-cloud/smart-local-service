import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AppError } from '../utils/appError';
import { SmartRankingService, RankingMode, RawProviderData } from '../matching/smartRankingService';

export async function getAllProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
        availabilities: true,
      },
    });

    res.status(200).json({
      success: true,
      count: providers.length,
      data: { providers },
    });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const customerLat = parseFloat(req.query.lat as string) || 12.9716;
    const customerLon = parseFloat(req.query.lon as string) || 77.5946;
    const radiusKm = parseFloat(req.query.radius as string) || 15.0;

    const rawProviders = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
      },
    });

    const ranked = SmartRankingService.rankProviders(
      rawProviders as unknown as RawProviderData[],
      customerLat,
      customerLon,
      { maxRadiusKm: radiusKm }
    );

    res.status(200).json({
      success: true,
      count: ranked.length,
      data: { providers: ranked },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecommendedProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const customerLat = parseFloat(req.query.lat as string) || 12.9716;
    const customerLon = parseFloat(req.query.lon as string) || 77.5946;
    const mode = (req.query.mode as RankingMode) || 'SMART_REPAIR';
    const categoryId = req.query.categoryId as string | undefined;
    const appliance = req.query.appliance as string | undefined;
    const problem = req.query.problem as string | undefined;

    const rawProviders = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
      },
    });

    const ranked = SmartRankingService.rankProviders(
      rawProviders as unknown as RawProviderData[],
      customerLat,
      customerLon,
      {
        mode,
        requiredServiceCategory: categoryId,
        requiredAppliance: appliance,
        problemKeyword: problem,
      }
    );

    res.status(200).json({
      success: true,
      count: ranked.length,
      mode,
      bestMatch: ranked[0] || null,
      data: { recommendations: ranked },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRankedProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const customerLat = parseFloat(req.query.lat as string) || 12.9716;
    const customerLon = parseFloat(req.query.lon as string) || 77.5946;
    const sortBy = (req.query.sortBy as string) || 'best_match'; // best_match, distance, price, rating, availability
    const mode = (req.query.mode as RankingMode) || 'SMART_REPAIR';

    const rawProviders = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
      },
    });

    let ranked = SmartRankingService.rankProviders(
      rawProviders as unknown as RawProviderData[],
      customerLat,
      customerLon,
      { mode }
    );

    if (sortBy === 'distance') {
      ranked.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'price') {
      ranked.sort((a, b) => a.provider.basePrice - b.provider.basePrice);
    } else if (sortBy === 'rating') {
      ranked.sort((a, b) => b.provider.rating - a.provider.rating);
    } else if (sortBy === 'availability') {
      ranked.sort((a, b) => a.etaMinutes - b.etaMinutes);
    }

    res.status(200).json({
      success: true,
      sortBy,
      count: ranked.length,
      data: { providers: ranked },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProviderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
        availabilities: true,
        reviewsReceived: {
          include: { customer: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!provider) {
      return next(new AppError('Provider profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { provider },
    });
  } catch (error) {
    next(error);
  }
}
