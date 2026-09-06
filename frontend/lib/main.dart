import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'features/splash_screen.dart';
import 'features/home_screen.dart';
import 'features/login_screen.dart';
import 'features/smart_repair_screen.dart';
import 'features/preventive_maintenance_screen.dart';
import 'features/emergency_rescue_screen.dart';
import 'features/provider_dashboard_screen.dart';
import 'features/admin_dashboard_screen.dart';

void main() {
  runApp(const SmartLocalServiceApp());
}

class SmartLocalServiceApp extends StatelessWidget {
  const SmartLocalServiceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Local Service',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/smart-repair': (context) => const SmartRepairScreen(),
        '/preventive-maintenance': (context) => const PreventiveMaintenanceScreen(),
        '/emergency-rescue': (context) => const EmergencyRescueScreen(),
        '/provider-dashboard': (context) => const ProviderDashboardScreen(),
        '/admin-dashboard': (context) => const AdminDashboardScreen(),
      },
    );
  }
}
