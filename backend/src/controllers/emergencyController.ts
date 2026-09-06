import { Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { AuthRequest } from '../middleware/auth';
import { getAIService } from '../ai/aiService';
import { SmartRankingService, RawProviderData } from '../matching/smartRankingService';
import { AppError } from '../utils/appError';

export async function createEmergencyRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.id!;
    const { vehicleType, problemDescription, latitude, longitude, mediaUrl } = req.body;

    const userLat = parseFloat(latitude) || 12.9716;
    const userLon = parseFloat(longitude) || 77.5946;

    // 1. Run AI Emergency Analysis
    const aiService = getAIService();
    const aiResult = await aiService.analyzeEmergencyVehicle(vehicleType || 'MOTORCYCLE', problemDescription, mediaUrl);

    const savedAi = await prisma.aIAnalysis.create({
      data: {
        userId: customerId,
        vehicleType: vehicleType || 'MOTORCYCLE',
        detectedProblem: aiResult.detectedProblem,
        problemCategory: aiResult.problemCategory,
        severity: aiResult.severity,
        confidence: aiResult.confidence,
        recommendedService: aiResult.recommendedService,
        estimatedCostMin: aiResult.estimatedCostMin,
        estimatedCostMax: aiResult.estimatedCostMax,
        professionalRequired: aiResult.professionalRequired,
        suggestedNextSteps: aiResult.suggestedNextSteps,
      },
    });

    // 2. Fetch Providers and Perform Emergency Smart Ranking
    const rawProviders = await prisma.providerProfile.findMany({
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
        skills: true,
        providerServices: { include: { serviceCategory: true } },
      },
    });

    let currentRadius = 5.0;
    let ranked = SmartRankingService.rankProviders(
      rawProviders as unknown as RawProviderData[],
      userLat,
      userLon,
      {
        mode: 'AI_EMERGENCY',
        requiredAppliance: vehicleType,
        maxRadiusKm: currentRadius,
      }
    );

    let searchMessage = `Found ${ranked.length} available mechanics within ${currentRadius} km.`;

    // 3. Search Expansion Step: 5km -> 10km -> 20km if no mechanic found
    if (ranked.length === 0) {
      currentRadius = 10.0;
      ranked = SmartRankingService.rankProviders(
        rawProviders as unknown as RawProviderData[],
        userLat,
        userLon,
        {
          mode: 'AI_EMERGENCY',
          requiredAppliance: vehicleType,
          maxRadiusKm: currentRadius,
        }
      );

      if (ranked.length === 0) {
        currentRadius = 20.0;
        ranked = SmartRankingService.rankProviders(
          rawProviders as unknown as RawProviderData[],
          userLat,
          userLon,
          {
            mode: 'AI_EMERGENCY',
            requiredAppliance: vehicleType,
            maxRadiusKm: currentRadius,
          }
        );
        searchMessage = 'No mechanic found within 10 km. Expanded search radius to 20 km.';
      } else {
        searchMessage = 'No mechanic found within 5 km. Expanded search radius to 10 km.';
      }
    }

    const emergency = await prisma.emergencyRequest.create({
      data: {
        customerId,
        vehicleType: vehicleType || 'MOTORCYCLE',
        problemDescription,
        latitude: userLat,
        longitude: userLon,
        mediaUrl,
        aiAnalysisId: savedAi.id,
        searchRadiusKm: currentRadius,
        status: ranked.length > 0 ? 'MATCHED' : 'SEARCHING',
      },
    });

    res.status(201).json({
      success: true,
      searchMessage,
      safetyDisclaimer: 'For life-threatening accidents, injuries, or fire, please call emergency services (911/112) immediately.',
      data: {
        emergencyRequest: emergency,
        aiAnalysis: savedAi,
        recommendedMechanics: ranked,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmergencyById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const emergency = await prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        aiAnalysis: true,
        bookings: { include: { provider: { include: { user: true } } } },
      },
    });

    if (!emergency) {
      return next(new AppError('Emergency request not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { emergencyRequest: emergency },
    });
  } catch (error) {
    next(error);
  }
}
