import { calculateHaversineDistance, calculateEtaMinutes } from '../utils/distance';

export type RankingMode = 'SMART_REPAIR' | 'PREVENTIVE_MAINTENANCE' | 'AI_EMERGENCY';

export interface RankingWeights {
  skillMatch: number;
  distance: number;
  rating: number;
  availability: number;
  price: number;
  experience: number;
  eta: number;
}

export const DEFAULT_WEIGHTS: Record<RankingMode, RankingWeights> = {
  SMART_REPAIR: {
    skillMatch: 0.30,
    distance: 0.20,
    rating: 0.15,
    availability: 0.15,
    price: 0.10,
    experience: 0.10,
    eta: 0.0,
  },
  PREVENTIVE_MAINTENANCE: {
    skillMatch: 0.30, // Service Expertise with specific appliance
    distance: 0.20,
    rating: 0.15,
    availability: 0.15,
    price: 0.10,
    experience: 0.10,
    eta: 0.0,
  },
  AI_EMERGENCY: {
    availability: 0.25,
    distance: 0.25,
    eta: 0.20,
    skillMatch: 0.15,
    rating: 0.10,
    price: 0.05,
    experience: 0.0,
  },
};

export interface RawProviderData {
  id: string;
  businessName: string;
  user: { name: string; phone?: string | null; avatarUrl?: string | null };
  bio?: string | null;
  experienceYears: number;
  verificationStatus: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  responseTimeMinutes: number;
  latitude: number;
  longitude: number;
  availableNow: boolean;
  skills: Array<{ skillName: string; expertiseLevel: string; applianceType?: string | null }>;
  providerServices: Array<{ serviceCategoryId: string; estimatedPriceMin: number; estimatedPriceMax: number; serviceCategory?: { name: string; slug: string } }>;
}

export interface RankedProviderResult {
  rank: number;
  provider: RawProviderData;
  totalScore: number;
  isBestMatch: boolean;
  distanceKm: number;
  etaMinutes: number;
  matchReason: string;
  scoreBreakdown: {
    skillMatchScore: number;
    distanceScore: number;
    ratingScore: number;
    availabilityScore: number;
    priceScore: number;
    experienceScore: number;
    etaScore: number;
  };
}

export class SmartRankingService {
  /**
   * Rank a list of service providers based on user location, problem details, and selected mode
   */
  public static rankProviders(
    providers: RawProviderData[],
    customerLat: number,
    customerLon: number,
    options: {
      mode?: RankingMode;
      requiredServiceCategory?: string;
      requiredAppliance?: string;
      problemKeyword?: string;
      customWeights?: Partial<RankingWeights>;
      maxRadiusKm?: number;
    } = {}
  ): RankedProviderResult[] {
    const mode = options.mode || 'SMART_REPAIR';
    const weights = { ...DEFAULT_WEIGHTS[mode], ...(options.customWeights || {}) };
    const maxRadius = options.maxRadiusKm || 50.0;

    const scoredList = providers
      .map((provider) => {
        // 1. Distance Calculation
        const distanceKm = calculateHaversineDistance(
          customerLat,
          customerLon,
          provider.latitude,
          provider.longitude
        );

        if (distanceKm > maxRadius) {
          return null;
        }

        // 2. ETA Calculation
        const etaMinutes = calculateEtaMinutes(distanceKm, provider.responseTimeMinutes);

        // 3. Sub-Scores (0 to 100)

        // Skill Match Score
        let skillMatchScore = 50; // Default baseline score
        if (options.requiredAppliance || options.requiredServiceCategory || options.problemKeyword) {
          const matchAppliance = options.requiredAppliance?.toLowerCase() || '';
          const matchCategory = options.requiredServiceCategory?.toLowerCase() || '';
          const matchKeyword = options.problemKeyword?.toLowerCase() || '';

          const hasExactSkill = provider.skills.some(
            (s) =>
              (s.applianceType && s.applianceType.toLowerCase().includes(matchAppliance)) ||
              s.skillName.toLowerCase().includes(matchKeyword) ||
              s.skillName.toLowerCase().includes(matchAppliance)
          );

          const hasCategoryMatch = provider.providerServices.some(
            (ps) =>
              ps.serviceCategoryId === options.requiredServiceCategory ||
              (ps.serviceCategory && ps.serviceCategory.slug.toLowerCase().includes(matchCategory)) ||
              (ps.serviceCategory && ps.serviceCategory.name.toLowerCase().includes(matchCategory))
          );

          if (hasExactSkill) {
            skillMatchScore = 100;
          } else if (hasCategoryMatch) {
            skillMatchScore = 80;
          } else {
            skillMatchScore = 30; // Unqualified / low match penalty
          }
        } else {
          skillMatchScore = 75;
        }

        // Distance Score (Non-linear proximity decay)
        const distanceScore = Math.max(0, Math.min(100, 100 - distanceKm * 8));

        // Rating Score
        const ratingScore = Math.min(100, (provider.rating / 5.0) * 100);

        // Availability Score
        const availabilityScore = provider.availableNow ? 100 : 40;

        // Price Score (Competitive pricing benchmark ~ 500 base)
        const priceDiff = provider.basePrice - 400;
        const priceScore = Math.max(20, Math.min(100, 100 - priceDiff * 0.1));

        // Experience Score
        const experienceScore = Math.min(100, provider.experienceYears * 10);

        // ETA Score (Emergency focus)
        const etaScore = Math.max(0, Math.min(100, 100 - etaMinutes * 2.5));

        // Total Weighted Score Calculation
        const totalScoreRaw =
          skillMatchScore * weights.skillMatch +
          distanceScore * weights.distance +
          ratingScore * weights.rating +
          availabilityScore * weights.availability +
          priceScore * weights.price +
          experienceScore * weights.experience +
          etaScore * weights.eta;

        const totalScore = Math.round(Math.min(100, Math.max(0, totalScoreRaw)));

        // Match Reason Generation
        let matchReason = '';
        if (mode === 'AI_EMERGENCY') {
          matchReason = `Available immediately (${etaMinutes} min ETA, ${distanceKm} km away) with strong roadside emergency experience.`;
        } else if (mode === 'PREVENTIVE_MAINTENANCE') {
          matchReason = `Recommended for ${options.requiredAppliance || 'your appliance'} with ${provider.rating}⭐ rating and ${distanceKm} km distance.`;
        } else {
          matchReason = `Recommended because of strong skill match, close distance (${distanceKm} km), high rating (${provider.rating}⭐) and availability.`;
        }

        return {
          rank: 0,
          provider,
          totalScore,
          isBestMatch: false,
          distanceKm,
          etaMinutes,
          matchReason,
          scoreBreakdown: {
            skillMatchScore: Math.round(skillMatchScore),
            distanceScore: Math.round(distanceScore),
            ratingScore: Math.round(ratingScore),
            availabilityScore: Math.round(availabilityScore),
            priceScore: Math.round(priceScore),
            experienceScore: Math.round(experienceScore),
            etaScore: Math.round(etaScore),
          },
        };
      })
      .filter((item): item is RankedProviderResult => item !== null);

    // Sort descending by totalScore
    scoredList.sort((a, b) => b.totalScore - a.totalScore);

    // Assign rank numbers and mark #1 as best match
    scoredList.forEach((item, index) => {
      item.rank = index + 1;
      if (index === 0) {
        item.isBestMatch = true;
      }
    });

    return scoredList;
  }
}
