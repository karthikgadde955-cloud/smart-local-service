class ProviderProfile {
  final String id;
  final String businessName;
  final String? bio;
  final int experienceYears;
  final String verificationStatus;
  final double basePrice;
  final double rating;
  final int reviewCount;
  final int jobsCompleted;
  final int responseTimeMinutes;
  final double latitude;
  final double longitude;
  final bool availableNow;
  final String? userName;
  final String? userPhone;

  ProviderProfile({
    required this.id,
    required this.businessName,
    this.bio,
    required this.experienceYears,
    required this.verificationStatus,
    required this.basePrice,
    required this.rating,
    required this.reviewCount,
    required this.jobsCompleted,
    required this.responseTimeMinutes,
    required this.latitude,
    required this.longitude,
    required this.availableNow,
    this.userName,
    this.userPhone,
  });

  factory ProviderProfile.fromJson(Map<String, dynamic> json) {
    return ProviderProfile(
      id: json['id'],
      businessName: json['businessName'] ?? 'Service Provider',
      bio: json['bio'],
      experienceYears: json['experienceYears'] ?? 1,
      verificationStatus: json['verificationStatus'] ?? 'VERIFIED',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 300.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['reviewCount'] ?? 0,
      jobsCompleted: json['jobsCompleted'] ?? 0,
      responseTimeMinutes: json['responseTimeMinutes'] ?? 15,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 12.9716,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 77.5946,
      availableNow: json['availableNow'] ?? true,
      userName: json['user']?['name'],
      userPhone: json['user']?['phone'],
    );
  }
}
