import { runRankingEngineTests } from './rankingEngine.test';

async function main() {
  console.log('🚀 Running Complete Test Suite for Smart Local Service Backend...\n');

  try {
    // 1. Run Smart Ranking Engine Unit Tests
    console.log('--- 1. SMART RANKING ENGINE TESTS ---');
    runRankingEngineTests();

    // 2. Run API Integration Tests
    console.log('--- 2. END-TO-END API INTEGRATION TESTS ---');
    // Import and execute apiIntegration test runner
    require('./apiIntegration.test');

  } catch (error) {
    console.error('❌ Test Suite Failed:', error);
    process.exit(1);
  }
}

main();
