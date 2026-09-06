import 'provider.dart';

class Booking {
  final String id;
  final String serviceType;
  final String bookingDate;
  final String bookingTime;
  final String status;
  final double totalAmount;
  final String? notes;
  final ProviderProfile provider;

  Booking({
    required this.id,
    required this.serviceType,
    required this.bookingDate,
    required this.bookingTime,
    required this.status,
    required this.totalAmount,
    this.notes,
    required this.provider,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      serviceType: json['serviceType'] ?? 'SMART_REPAIR',
      bookingDate: json['bookingDate'] ?? '',
      bookingTime: json['bookingTime'] ?? '10:00',
      status: json['status'] ?? 'PENDING',
      totalAmount: (json['totalAmount'] as num).toDouble(),
      notes: json['notes'],
      provider: ProviderProfile.fromJson(json['provider']),
    );
  }
}
