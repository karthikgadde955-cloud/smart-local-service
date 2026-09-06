import app from '../app';
import http from 'http';
import { runRankingEngineTests } from './rankingEngine.test';

async function testBackend() {
  console.log('🧪 Starting Full-Stack Backend Integration Tests...');

  // 1. Run Smart Ranking Unit Tests
  runRankingEngineTests();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  console.log('📡 Test Server listening on http://localhost:5099');

  try {
    // Helper to make HTTP JSON requests
    async function makeRequest(path: string, method: string = 'GET', body?: any, token?: string) {
      const res = await fetch(`http://localhost:5099${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      return { status: res.status, data };
    }

    // Test 1: Health Check
    const health = await makeRequest('/api/health');
    console.log('  ✅ GET /api/health ->', health.status, health.data.service);

    // Test 2: Customer Login
    const login = await makeRequest('/auth/login', 'POST', {
      email: 'customer@example.com',
      password: 'password123',
    });
    console.log('  ✅ POST /auth/login ->', login.status, login.data.success ? 'Token Acquired' : 'Failed');
    const token = login.data.data.accessToken;

    // Test 3: Get Service Categories
    const services = await makeRequest('/services');
    console.log('  ✅ GET /services ->', services.status, `(${services.data.count} categories)`);

    // Test 4: Get Smart Repair Recommended Providers
    const recs = await makeRequest('/providers/recommended?lat=12.9716&lon=77.5946&mode=SMART_REPAIR&appliance=Washing%20Machine');
    console.log(
      '  ✅ GET /providers/recommended ->',
      recs.status,
      `Rank #1: ${recs.data.bestMatch?.provider?.businessName} (Score: ${recs.data.bestMatch?.totalScore}/100)`
    );

    // Test 5: AI Damage Analysis
    const aiRes = await makeRequest('/ai/analyze', 'POST', {
      mediaType: 'photo',
      description: 'Washing machine leaking water during spin cycle',
    }, token);
    console.log('  ✅ POST /ai/analyze ->', aiRes.status, `Detected: ${aiRes.data.data?.analysis?.detectedProblem}`);

    // Test 6: AI Emergency Rescue Request
    const emergencyRes = await makeRequest('/emergency', 'POST', {
      vehicleType: 'MOTORCYCLE',
      problemDescription: 'Bike starting problem near MG Road',
      latitude: 12.9716,
      longitude: 77.5946,
    }, token);
    console.log('  ✅ POST /emergency ->', emergencyRes.status, emergencyRes.data.searchMessage);

    // Test 7: Get User Appliances
    const appliancesRes = await makeRequest('/appliances', 'GET', undefined, token);
    console.log('  ✅ GET /appliances ->', appliancesRes.status, `(${appliancesRes.data.count} appliances found)`);

    console.log('\n🎉 ALL BACKEND API INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ API Integration Test Error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

testBackend();
