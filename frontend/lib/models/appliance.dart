class Appliance {
  final String id;
  final String name;
  final String brand;
  final String? model;
  final String? purchaseDate;
  final String? lastServiceDate;
  final int maintenanceIntervalMonths;
  final String? warrantyInfo;
  final String? notes;

  Appliance({
    required this.id,
    required this.name,
    required this.brand,
    this.model,
    this.purchaseDate,
    this.lastServiceDate,
    required this.maintenanceIntervalMonths,
    this.warrantyInfo,
    this.notes,
  });

  factory Appliance.fromJson(Map<String, dynamic> json) {
    return Appliance(
      id: json['id'],
      name: json['name'],
      brand: json['brand'],
      model: json['model'],
      purchaseDate: json['purchaseDate'],
      lastServiceDate: json['lastServiceDate'],
      maintenanceIntervalMonths: json['maintenanceIntervalMonths'] ?? 6,
      warrantyInfo: json['warrantyInfo'],
      notes: json['notes'],
    );
  }
}
