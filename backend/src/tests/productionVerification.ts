import http from 'http';

async function verifyProductionReadiness() {
  console.log('🔍 Executing Comprehensive Production-Readiness Verification Suite...\n');

  const BASE_URL = 'http://localhost:5000';

  async function req(path: string, method: string = 'GET', body?: any, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
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

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
    }
  }

  try {
    // 1. Health Check
    const health = await req('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', '1. System Health API (/api/health)');

    // 2. Auth - Customer Login
    const custLogin = await req('/auth/login', 'POST', {
      email: 'customer@example.com',
      password: 'password123',
    });
    assert(custLogin.status === 200 && !!custLogin.data.data.accessToken, '2. Customer Authentication & JWT Generation');
    const custToken = custLogin.data.data.accessToken;

    // 3. Auth - Provider Login
    const provLogin = await req('/auth/login', 'POST', {
      email: 'ravi@appliances.com',
      password: 'password123',
    });
    assert(provLogin.status === 200 && provLogin.data.data.user.role === 'PROVIDER', '3. Provider Authentication & Profile Role Check');
    const provToken = provLogin.data.data.accessToken;

    // 4. User Profile GET & PUT
    const userMe = await req('/users/me', 'GET', undefined, custToken);
    assert(userMe.status === 200 && userMe.data.data.user.email === 'customer@example.com', '4. User Profile Retrieval (/users/me)');

    const userUpdate = await req('/users/me', 'PUT', { name: 'Priya Sharma (Verified)' }, custToken);
    assert(userUpdate.status === 200 && userUpdate.data.data.user.name === 'Priya Sharma (Verified)', '5. User Profile Update (/users/me)');

    // 5. Service Categories
    const services = await req('/services');
    assert(services.status === 200 && services.data.count >= 5, '6. Service Categories Retrieval (/services)');

    // 6. Provider Recommendations & Smart Ranking Engine
    const recs = await req('/providers/recommended?lat=12.9716&lon=77.5946&mode=SMART_REPAIR&appliance=Washing%20Machine');
    assert(
      recs.status === 200 && recs.data.bestMatch?.isBestMatch === true && recs.data.bestMatch?.totalScore >= 80,
      '7. Smart Ranking Engine & Best Match Provider Recommendation'
    );

    // 7. Custom Sorted Provider Listing
    const sortedDistance = await req('/providers/ranked?sortBy=distance');
    assert(sortedDistance.status === 200 && sortedDistance.data.data.providers.length > 0, '8. Custom Sorted Providers by Distance');

    // 8. AI Damage Analysis
    const aiResp = await req('/ai/analyze', 'POST', {
      mediaType: 'photo',
      description: 'Air conditioner leaking water and not cooling',
    }, custToken);
    assert(aiResp.status === 200 && aiResp.data.data.analysis.applianceType === 'AC', '9. AI Damage Detection & Problem Diagnosis (/ai/analyze)');

    // 9. Appliances & Preventive Maintenance
    const getAppliances = await req('/appliances', 'GET', undefined, custToken);
    assert(getAppliances.status === 200 && getAppliances.data.count > 0, '10. Customer Appliances Inventory (/appliances)');

    const addAppliance = await req('/appliances', 'POST', {
      name: 'Kitchen Microwave Oven',
      brand: 'IFB 30L Convection',
      maintenanceIntervalMonths: 6,
    }, custToken);
    assert(addAppliance.status === 201 && addAppliance.data.data.appliance.name === 'Kitchen Microwave Oven', '11. Add Appliance & Auto-Generate Reminder');

    // 10. AI Emergency Rescue & Radius Expansion
    const emergencyResp = await req('/emergency', 'POST', {
      vehicleType: 'MOTORCYCLE',
      problemDescription: 'Chain snap and engine stalling on highway',
      latitude: 12.9716,
      longitude: 77.5946,
    }, custToken);
    assert(
      emergencyResp.status === 201 && emergencyResp.data.data.recommendedMechanics.length > 0,
      '12. AI Emergency Rescue Dispatch & Mechanic Match (/emergency)'
    );

    // 11. Booking Creation & Status Updates
    const providerId = recs.data.bestMatch.provider.id;
    const createBooking = await req('/bookings', 'POST', {
      providerId,
      serviceType: 'SMART_REPAIR',
      bookingDate: '2026-09-10',
      bookingTime: '14:00',
      notes: 'Please bring R32 refrigerant gas and washing machine filter.',
    }, custToken);
    assert(createBooking.status === 201 && createBooking.data.data.booking.status === 'PENDING', '13. Booking Lifecycle — Create Booking');

    const bookingId = createBooking.data.data.booking.id;

    const acceptBooking = await req(`/bookings/${bookingId}/status`, 'PATCH', {
      status: 'ACCEPTED',
      note: 'Provider accepted booking request',
    }, provToken);
    assert(acceptBooking.status === 200 && acceptBooking.data.data.booking.status === 'ACCEPTED', '14. Booking Lifecycle — Provider Accept');

    const completeBooking = await req(`/bookings/${bookingId}/status`, 'PATCH', {
      status: 'COMPLETED',
      note: 'Repair completed successfully',
    }, provToken);
    assert(completeBooking.status === 200 && completeBooking.data.data.booking.status === 'COMPLETED', '15. Booking Lifecycle — Provider Complete');

    // 12. Reviews & Rating Recalculation
    const addReview = await req('/reviews', 'POST', {
      bookingId,
      rating: 5,
      comment: 'Excellent service! Solved washing machine leak within 30 minutes.',
    }, custToken);
    assert(addReview.status === 201 && addReview.data.data.updatedProviderRating > 0, '16. Customer Review Submission & Automatic Rating Recalculation');

    console.log(`\n📊 PRODUCTION VERIFICATION SUMMARY: ${passed}/${total} checks passed.\n`);

    if (passed !== total) {
      throw new Error('Production verification failed!');
    }
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exit(1);
  }
}

verifyProductionReadiness();
