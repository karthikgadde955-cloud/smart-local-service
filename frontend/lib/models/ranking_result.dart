import 'provider.dart';

class RankedProvider {
  final int rank;
  final ProviderProfile provider;
  final int totalScore;
  final bool isBestMatch;
  final double distanceKm;
  final int etaMinutes;
  final String matchReason;

  RankedProvider({
    required this.rank,
    required this.provider,
    required this.totalScore,
    required this.isBestMatch,
    required this.distanceKm,
    required this.etaMinutes,
    required this.matchReason,
  });

  factory RankedProvider.fromJson(Map<String, dynamic> json) {
    return RankedProvider(
      rank: json['rank'] ?? 1,
      provider: ProviderProfile.fromJson(json['provider']),
      totalScore: (json['totalScore'] as num).toInt(),
      isBestMatch: json['isBestMatch'] ?? false,
      distanceKm: (json['distanceKm'] as num).toDouble(),
      etaMinutes: json['etaMinutes'] ?? 15,
      matchReason: json['matchReason'] ?? 'Strong overall service recommendation.',
    );
  }
}
