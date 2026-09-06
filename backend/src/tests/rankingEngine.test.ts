import { SmartRankingService, RawProviderData } from '../matching/smartRankingService';

// Mock Provider Data for Test Scenarios
const mockProviders: RawProviderData[] = [
  {
    id: 'prov-a',
    businessName: 'Provider A (Cheap & Nearby, Low Skill)',
    user: { name: 'Worker A' },
    experienceYears: 2,
    verificationStatus: 'VERIFIED',
    basePrice: 300,
    rating: 4.0,
    reviewCount: 10,
    jobsCompleted: 15,
    responseTimeMinutes: 30,
    latitude: 12.9800, // ~1.0 km
    longitude: 77.5950,
    availableNow: true,
    skills: [],
    providerServices: [{ serviceCategoryId: 'cat-general', estimatedPriceMin: 300, estimatedPriceMax: 500 }],
  },
  {
    id: 'prov-b',
    businessName: 'Provider B (Highly Qualified Master Expert)',
    user: { name: 'Master Worker B' },
    experienceYears: 10,
    verificationStatus: 'VERIFIED',
    basePrice: 500,
    rating: 4.9,
    reviewCount: 150,
    jobsCompleted: 350,
    responseTimeMinutes: 10,
    latitude: 12.9880, // ~2.0 km
    longitude: 77.6000,
    availableNow: true,
    skills: [{ skillName: 'Washing Machine Drainage Repair', expertiseLevel: 'Expert', applianceType: 'Washing Machine' }],
    providerServices: [{ serviceCategoryId: 'cat-wm', estimatedPriceMin: 500, estimatedPriceMax: 1000 }],
  },
  {
    id: 'prov-c',
    businessName: 'Provider C (Emergency Mechanic Fast ETA)',
    user: { name: 'Emergency Bike Mechanic' },
    experienceYears: 8,
    verificationStatus: 'VERIFIED',
    basePrice: 400,
    rating: 4.8,
    reviewCount: 90,
    jobsCompleted: 200,
    responseTimeMinutes: 5,
    latitude: 12.9720, // ~0.5 km
    longitude: 77.5950,
    availableNow: true,
    skills: [{ skillName: 'Battery Jumpstart', expertiseLevel: 'Expert', applianceType: 'Motorcycle' }],
    providerServices: [{ serviceCategoryId: 'cat-bike', estimatedPriceMin: 400, estimatedPriceMax: 800 }],
  },
];

export function runRankingEngineTests() {
  console.log('🧪 Starting Smart Ranking Engine Unit Tests...');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  const customerLat = 12.9716;
  const customerLon = 77.5946;

  // Test 1: Higher skill match outranks closer/cheaper unqualified provider
  const repairResults = SmartRankingService.rankProviders(mockProviders, customerLat, customerLon, {
    mode: 'SMART_REPAIR',
    requiredAppliance: 'Washing Machine',
    problemKeyword: 'Drainage Repair',
  });

  assert(
    repairResults[0].provider.id === 'prov-b',
    'Test 1: Qualified expert (Provider B) outranks closer/cheaper unqualified worker (Provider A)'
  );

  // Test 2: Emergency mode prioritizes fast ETA and proximity
  const emergencyResults = SmartRankingService.rankProviders(mockProviders, customerLat, customerLon, {
    mode: 'AI_EMERGENCY',
    requiredAppliance: 'Motorcycle',
  });

  assert(
    emergencyResults[0].provider.id === 'prov-c',
    'Test 2: Fast ETA Emergency Mechanic (Provider C) ranks #1 in AI Emergency Rescue mode'
  );

  // Test 3: Total score is normalized between 0 and 100
  assert(
    repairResults.every((r) => r.totalScore >= 0 && r.totalScore <= 100),
    'Test 3: Provider total scores are within [0, 100]'
  );

  // Test 4: #1 ranked provider is marked as isBestMatch = true
  assert(
    repairResults[0].isBestMatch === true && repairResults[1].isBestMatch === false,
    'Test 4: #1 ranked provider has isBestMatch = true and others false'
  );

  console.log(`\n📊 Ranking Engine Test Summary: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    throw new Error('Ranking Engine unit tests failed!');
  }
}

if (require.main === module) {
  runRankingEngineTests();
}
