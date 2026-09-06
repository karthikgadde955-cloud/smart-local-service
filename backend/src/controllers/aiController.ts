import { Response, NextFunction } from 'express';
import { getAIService } from '../ai/aiService';
import { prisma } from '../database/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError';

export async function analyzeDamage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { mediaUrl, mediaType, description, vehicleType } = req.body;

    const aiService = getAIService();

    let result;
    if (vehicleType) {
      result = await aiService.analyzeEmergencyVehicle(vehicleType, description, mediaUrl);
    } else if (mediaType === 'video') {
      result = await aiService.analyzeVideo(mediaUrl || '', description);
    } else {
      result = await aiService.analyzeImage(mediaUrl || '', description);
    }

    const savedAnalysis = await prisma.aIAnalysis.create({
      data: {
        userId: userId || 'anonymous',
        mediaType: mediaType || 'photo',
        applianceType: result.applianceType,
        vehicleType: result.vehicleType,
        detectedProblem: result.detectedProblem,
        problemCategory: result.problemCategory,
        severity: result.severity,
        confidence: result.confidence,
        recommendedService: result.recommendedService,
        estimatedCostMin: result.estimatedCostMin,
        estimatedCostMax: result.estimatedCostMax,
        professionalRequired: result.professionalRequired,
        suggestedNextSteps: result.suggestedNextSteps,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        analysis: savedAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return next(new AppError('AI Analysis record not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}
