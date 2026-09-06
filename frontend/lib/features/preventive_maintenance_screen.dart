import 'package:flutter/material.dart';

class PreventiveMaintenanceScreen extends StatelessWidget {
  const PreventiveMaintenanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Preventive Maintenance')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('MY APPLIANCES', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add Appliance'),
                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildApplianceItem(
              name: 'Living Room Split AC',
              brand: 'LG Dual Inverter 1.5T',
              lastService: '2025-09-10',
              status: 'Maintenance Due (6 Months)',
              isOverdue: true,
              recommendedProvider: 'AC Expert Services (Score: 95/100, 1.4 km)',
            ),
            const SizedBox(height: 12),
            _buildApplianceItem(
              name: 'Main Washing Machine',
              brand: 'Whirlpool Royal 7.5kg',
              lastService: '2026-03-01',
              status: 'Healthy (Next service in 4 months)',
              isOverdue: false,
              recommendedProvider: 'Ravi Appliance Services',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApplianceItem({
    required String name,
    required String brand,
    required String lastService,
    required String status,
    required bool isOverdue,
    required String recommendedProvider,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.kitchen, color: isOverdue ? Colors.orange : Colors.blue),
                const SizedBox(width: 8),
                Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Spacer(),
                Chip(
                  label: Text(status, style: TextStyle(color: isOverdue ? Colors.red : Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                  backgroundColor: isOverdue ? Colors.red.shade50 : Colors.green.shade50,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(brand, style: const TextStyle(color: Colors.grey)),
            Text('Last Service: $lastService'),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
              child: Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 16),
                  const SizedBox(width: 4),
                  Expanded(child: Text('Recommended: $recommendedProvider', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
