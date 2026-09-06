import 'package:flutter/material.dart';

class SmartRepairScreen extends StatefulWidget {
  const SmartRepairScreen({super.key});

  @override
  State<SmartRepairScreen> createState() => _SmartRepairScreenState();
}

class _SmartRepairScreenState extends State<SmartRepairScreen> {
  bool _isAnalyzing = false;
  bool _hasAnalyzed = false;

  void _runAnalysis() {
    setState(() => _isAnalyzing = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _hasAnalyzed = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Repair (AI Damage Detection)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (!_hasAnalyzed) ...[
              Container(
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.blue.shade200, style: BorderStyle.solid),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.cloud_upload_outlined, size: 48, color: Color(0xFF1E56A0)),
                    SizedBox(height: 8),
                    Text('Upload Photo / Video of Appliance Problem', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('AI will automatically diagnose the problem & recommend best providers', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _isAnalyzing ? null : _runAnalysis,
                icon: const Icon(Icons.psychology),
                label: Text(_isAnalyzing ? 'Analyzing with AI...' : 'Analyze Damage with AI'),
              ),
            ] else ...[
              // AI Result Card
              Card(
                color: const Color(0xFFEFF6FF),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.auto_awesome, color: Color(0xFF1E56A0)),
                          SizedBox(width: 8),
                          Text('AI Diagnosis Result', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E56A0))),
                          Spacer(),
                          Chip(label: Text('94% Confidence'), backgroundColor: Colors.white),
                        ],
                      ),
                      const Divider(),
                      const Text('Appliance: Washing Machine', style: TextStyle(fontWeight: FontWeight.bold)),
                      const Text('Detected Problem: Drainage Pump Blockage & Filter Issue'),
                      const Text('Required Service: Washing Machine Technician'),
                      const Text('Estimated Cost: ₹500 - ₹1,200', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text('SMART RANKED PROVIDERS', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 12),

              // Best Match Ranked Provider Card
              _buildRankedCard(
                rank: 1,
                name: 'Ravi Appliance Services',
                isBestMatch: true,
                rating: 4.9,
                distance: '1.2 km',
                price: '₹500 - ₹1,200',
                score: 97,
                reason: 'Recommended because of strong skill match, close distance, high rating and immediate availability.',
              ),
              const SizedBox(height: 12),
              _buildRankedCard(
                rank: 2,
                name: 'Kumar Repairs',
                isBestMatch: false,
                rating: 4.7,
                distance: '2.4 km',
                price: '₹400 - ₹900',
                score: 89,
                reason: 'Good price match and verified background.',
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRankedCard({
    required int rank,
    required String name,
    required bool isBestMatch,
    required double rating,
    required String distance,
    required String price,
    required int score,
    required String reason,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (isBestMatch)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(8)),
                    child: const Text('🥇 BEST MATCH', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  )
                else
                  Text('#$rank', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Spacer(),
                Text('Score: $score/100', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E56A0))),
              ],
            ),
            const SizedBox(height: 8),
            Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Row(
              children: [
                Text('⭐ $rating'),
                const SizedBox(width: 12),
                Text('📍 $distance'),
                const SizedBox(width: 12),
                Text('💰 $price'),
              ],
            ),
            const SizedBox(height: 8),
            Text(reason, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Book Service Now'),
            ),
          ],
        ),
      ),
    );
  }
}
