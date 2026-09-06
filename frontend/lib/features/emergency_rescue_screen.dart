import 'package:flutter/material.dart';

class EmergencyRescueScreen extends StatefulWidget {
  const EmergencyRescueScreen({super.key});

  @override
  State<EmergencyRescueScreen> createState() => _EmergencyRescueScreenState();
}

class _EmergencyRescueScreenState extends State<EmergencyRescueScreen> {
  String _selectedVehicle = 'Motorcycle';
  bool _isSearching = false;
  bool _hasResults = false;

  void _triggerEmergency() {
    setState(() => _isSearching = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isSearching = false;
          _hasResults = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🚨 AI Emergency Rescue', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFFEF4444),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Safety Disclaimer Alert
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
              child: const Row(
                children: [
                  Icon(Icons.info, color: Colors.red),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'For life-threatening accidents, injuries, or fire, please call Emergency Services (911 / 112) immediately.',
                      style: TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (!_hasResults) ...[
              const Text('SELECT YOUR VEHICLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['Motorcycle', 'Scooter', 'Car', 'Other'].map((v) {
                  final isSel = _selectedVehicle == v;
                  return ChoiceChip(
                    label: Text(v),
                    selected: isSel,
                    selectedColor: const Color(0xFFEF4444),
                    labelStyle: TextStyle(color: isSel ? Colors.white : Colors.black),
                    onSelected: (_) => setState(() => _selectedVehicle = v),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.my_location, color: Color(0xFFEF4444)),
                  title: Text('Live Location Shared'),
                  subtitle: Text('12.9716, 77.5946 (Indiranagar, Bangalore)'),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _isSearching ? null : _triggerEmergency,
                icon: const Icon(Icons.flash_on),
                label: Text(_isSearching ? 'Searching Nearby Mechanics...' : 'Request Instant AI Rescue'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
              ),
            ] else ...[
              // Expansion Notification Message
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
                child: const Text(
                  '🔍 Found 4 available emergency mechanics within 5.0 km.',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E56A0)),
                ),
              ),
              const SizedBox(height: 16),

              // Emergency Ranked Provider Card
              _buildEmergencyMechanicCard(
                rank: 1,
                name: 'Rapid Bike Rescue & Mechanics',
                eta: '5 min ETA',
                distance: '1.5 km',
                price: '₹350 - ₹800',
                rating: 4.8,
                score: 98,
              ),
              const SizedBox(height: 12),
              _buildEmergencyMechanicCard(
                rank: 2,
                name: 'City Auto Mechanic',
                eta: '20 min ETA',
                distance: '6.5 km',
                price: '₹600 - ₹3,000',
                rating: 4.9,
                score: 85,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyMechanicCard({
    required int rank,
    required String name,
    required String eta,
    required String distance,
    required String price,
    required double rating,
    required int score,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(6)),
                  child: Text('#$rank FASTEST RESCUE', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                ),
                const Spacer(),
                Text(eta, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFEF4444))),
              ],
            ),
            const SizedBox(height: 8),
            Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('⭐ $rating • 📍 $distance • 💰 $price'),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
              child: const Text('Dispatch Mechanic Now'),
            ),
          ],
        ),
      ),
    );
  }
}
