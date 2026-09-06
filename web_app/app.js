// Smart Local Service Web App Logic & Live Vercel Backend Connection

const API_BASE = 'https://backend-amber-nine-25.vercel.app/api';

// Configurable Location Settings (Default demo location)
const DEFAULT_LOCATION = {
  lat: 12.9716,
  lon: 77.5946,
  name: 'Indiranagar, Bangalore'
};

let currentVehicle = 'MOTORCYCLE';
let authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;

document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  loadRankedProviders('best_match');
  loadAppliances();
});

// Reusable API Request Helper with Standardized Error Handling
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errMsg = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message || error);
    throw error;
  }
}

// Verify live API health
async function checkHealth() {
  try {
    const health = await apiRequest('/health');
    console.log('✅ Live Vercel API Health Check:', health);
  } catch (err) {
    console.warn('⚠️ API Health Check failed:', err.message);
  }
}

function switchModule(moduleName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${moduleName}`).classList.add('active');

  document.getElementById('module-repair-content').style.display = moduleName === 'repair' ? 'block' : 'none';
  document.getElementById('module-maint-content').style.display = moduleName === 'maint' ? 'block' : 'none';
  document.getElementById('module-emergency-content').style.display = moduleName === 'emergency' ? 'block' : 'none';
}

async function runAiAnalysis(description) {
  const outputBox = document.getElementById('ai-output');
  outputBox.style.display = 'block';

  try {
    const data = await apiRequest('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        mediaType: 'photo',
        description: description
      })
    });
    const result = data.data.analysis;

    document.getElementById('ai-appliance').innerText = result.applianceType || 'Home Appliance';
    document.getElementById('ai-problem').innerText = result.detectedProblem;
    document.getElementById('ai-category').innerText = result.problemCategory;
    document.getElementById('ai-pro').innerText = result.professionalRequired;
    document.getElementById('ai-severity').innerText = result.severity;
    document.getElementById('ai-cost').innerText = `₹${result.estimatedCostMin} – ₹${result.estimatedCostMax}`;
    document.getElementById('ai-confidence').innerText = `${Math.round(result.confidence * 100)}% Confidence Score`;

    // Trigger Smart Provider Ranking update with detected appliance
    loadRankedProviders('best_match', result.applianceType, result.detectedProblem);
  } catch (err) {
    console.error('AI Error:', err);
    alert(err.message.includes('logged in') || err.message.includes('401')
      ? 'Authentication required. Please log in to perform AI damage analysis.'
      : `AI Analysis Error: ${err.message}`);
  }
}

// Fetch Recommended Providers from Live Vercel Backend
async function getRecommendedProviders(sortBy = 'best_match', appliance = 'Washing Machine', problem = '') {
  const params = new URLSearchParams({
    lat: DEFAULT_LOCATION.lat,
    lon: DEFAULT_LOCATION.lon,
    mode: 'SMART_REPAIR',
    appliance: appliance,
    ...(problem && { problem })
  });

  const response = await apiRequest(`/providers/recommended?${params.toString()}`);
  let items = response?.data?.recommendations || [];

  if (sortBy === 'distance') {
    items.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'price') {
    items.sort((a, b) => (a.provider?.basePrice || 0) - (b.provider?.basePrice || 0));
  }

  return items;
}

// Render Provider Cards in UI
function renderProviders(items, listContainer) {
  listContainer.innerHTML = '';

  if (!items || items.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">No matching providers found in your area.</div>';
    return;
  }

  items.forEach(item => {
    const provider = item.provider || {};
    const isBest = item.isBestMatch || item.rank === 1;

    // Render Skill Chips
    const skillsList = (provider.skills || []).map(s => s.skillName).filter(Boolean);
    const skillsChips = skillsList.length > 0
      ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${skillsList.slice(0, 3).map(sk => `<span style="background:#E0F2FE; color:#0369A1; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:600;">${sk}</span>`).join('')}
        </div>`
      : '';

    // Calculate Price Text
    let priceText = `₹${provider.basePrice || 0} Base Visit Fee`;
    if (provider.providerServices && provider.providerServices.length > 0) {
      const ps = provider.providerServices[0];
      if (ps.estimatedPriceMin && ps.estimatedPriceMax) {
        priceText = `₹${ps.estimatedPriceMin} – ₹${ps.estimatedPriceMax} Est. Service Fee`;
      }
    }

    const card = document.createElement('div');
    card.className = `provider-card ${isBest ? 'best-match' : ''}`;
    card.innerHTML = `
      ${isBest ? '<div class="best-match-tag">🥇 RECOMMENDED / BEST MATCH</div>' : `<div style="position: absolute; top: 12px; right: 16px; font-size: 12px; font-weight: 700; color: var(--text-muted);">Rank #${item.rank || ''}</div>`}
      <div class="provider-header">
        <div>
          <div class="provider-name">${provider.businessName || 'Service Provider'} ${provider.verificationStatus === 'VERIFIED' ? '<span style="color: var(--success); font-size: 12px;">✓ Verified</span>' : ''} ${provider.availableNow ? '<span style="background: #D1FAE5; color: #065F46; font-size: 11px; padding: 2px 6px; border-radius: 8px; font-weight: 700; margin-left: 6px;">Available Now</span>' : ''}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${provider.experienceYears || 0} Years Experience • ${provider.jobsCompleted || 0} Completed Jobs</div>
          ${skillsChips}
        </div>
        <div class="provider-score">${item.totalScore || 0}<span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">/100</span></div>
      </div>
      <div class="provider-meta">
        <span>⭐ ${provider.rating || 0} Rating (${provider.reviewCount || 0} reviews)</span>
        <span>📍 ${item.distanceKm || 0} km away</span>
        <span>💰 ${priceText}</span>
        <span>⏱️ ${item.etaMinutes || 0} min ETA</span>
      </div>
      <div class="reason-box">
        💡 ${item.matchReason || 'Strong match based on expertise, rating, and proximity.'}
      </div>
      <button class="btn" style="width: 100%; margin-top: 8px; justify-content: center;" onclick="bookProvider('${provider.id || ''}', '${provider.businessName || 'Service Provider'}', 'SMART_REPAIR')">
        Book Service Now
      </button>
    `;
    listContainer.appendChild(card);
  });
}

// Controller function for Ranked Providers UI
async function loadRankedProviders(sortBy = 'best_match', appliance = 'Washing Machine', problem = '') {
  const listContainer = document.getElementById('providers-list');
  listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">Finding the best service providers...</div>';

  try {
    const items = await getRecommendedProviders(sortBy, appliance, problem);
    renderProviders(items, listContainer);
  } catch (err) {
    console.error('Failed to load recommended providers:', err);
    listContainer.innerHTML = '<div style="color: var(--danger); text-align:center; padding: 20px; font-weight: 600;">Unable to load service providers. Please try again.</div>';
  }
}

async function loadAppliances() {
  const container = document.getElementById('appliances-list');
  try {
    await apiRequest('/services');
    container.innerHTML = `
      <div class="provider-card">
        <div style="font-weight: 700; font-size: 16px;">Living Room Split AC</div>
        <div style="font-size: 13px; color: var(--text-muted);">LG Dual Inverter 1.5 Ton • Installed Mar 2024</div>
        <div style="margin-top: 8px; color: var(--danger); font-size: 12px; font-weight: 700;">⚠️ Maintenance Due (Overdue by 3 days)</div>
        <button class="btn btn-secondary" style="width:100%; margin-top:12px; justify-content:center;" onclick="switchModule('repair'); loadRankedProviders('best_match', 'AC');">
          Find Top AC Expert (Live AC Technicians Available)
        </button>
      </div>
      <div class="provider-card">
        <div style="font-weight: 700; font-size: 16px;">Main Washing Machine</div>
        <div style="font-size: 13px; color: var(--text-muted);">Whirlpool Royal 7.5kg • Installed Nov 2023</div>
        <div style="margin-top: 8px; color: var(--success); font-size: 12px; font-weight: 700;">✓ Healthy (Next service in 4 months)</div>
        <button class="btn btn-outline" style="width:100%; margin-top:12px; justify-content:center;">View Maintenance Records</button>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load services:', err);
  }
}

function selectVehicle(vehicle) {
  currentVehicle = vehicle;
  document.querySelectorAll('#module-emergency-content .btn-outline').forEach(b => b.style.borderColor = 'var(--border)');
}

async function triggerEmergencyRescue() {
  const statusBox = document.getElementById('emergency-status-box');
  const msgBox = document.getElementById('expansion-msg');
  const mechanicsList = document.getElementById('emergency-mechanics-list');

  statusBox.style.display = 'block';
  msgBox.innerText = '🔍 Locating fast-response emergency mechanics...';
  mechanicsList.innerHTML = '';

  try {
    const data = await apiRequest('/emergency', {
      method: 'POST',
      body: JSON.stringify({
        vehicleType: currentVehicle,
        problemDescription: 'Breakdown roadside starting issue near MG Road',
        latitude: DEFAULT_LOCATION.lat,
        longitude: DEFAULT_LOCATION.lon
      })
    });
    msgBox.innerText = `🚨 ${data.searchMessage}`;

    mechanicsList.innerHTML = '';
    const mechanics = data.data?.recommendedMechanics || [];
    mechanics.forEach(item => {
      const provider = item.provider || {};
      const div = document.createElement('div');
      div.className = 'provider-card';
      div.style.borderColor = 'var(--danger)';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:800; color:var(--danger); font-size:16px;">${provider.businessName || 'Emergency Mechanic'}</div>
          <div style="font-weight:800; color:var(--danger); font-size:16px;">${item.etaMinutes || 0} MIN ETA</div>
        </div>
        <div class="provider-meta">
          <span>📍 ${item.distanceKm || 0} km away</span>
          <span>⭐ ${provider.rating || 0} Rating</span>
          <span>💰 ₹${provider.basePrice || 0} Emergency Charge</span>
        </div>
        <button class="btn btn-danger" style="width:100%; justify-content:center; margin-top:8px;" onclick="bookProvider('${provider.id || ''}', '${provider.businessName || 'Emergency Mechanic'}', 'EMERGENCY_RESCUE')">
          CONFIRM RESCUE DISPATCH
        </button>
      `;
      mechanicsList.appendChild(div);
    });
  } catch (err) {
    msgBox.innerText = err.message.includes('logged in') || err.message.includes('401')
      ? 'Authentication required. Please log in to request emergency roadside assistance.'
      : 'Failed to fetch emergency mechanics. Please try again.';
  }
}

// Real backend booking via POST /api/bookings
async function bookProvider(providerId, name, serviceType = 'SMART_REPAIR') {
  if (!authToken) {
    alert('Please log in to book a service.');
    return;
  }

  if (!providerId) {
    alert('Unable to identify the provider. Please try again.');
    return;
  }

  try {
    const body = {
      providerId,
      serviceType,
      notes: serviceType === 'EMERGENCY_RESCUE'
        ? 'Emergency rescue request via web app'
        : 'Service booking request via web app'
    };

    const data = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const booking = data?.data?.booking;
    if (!booking) throw new Error('Unexpected response from booking service.');

    const bookingId = booking.id;
    const status = booking.status; // Backend sets PENDING on creation
    const providerName = booking.provider?.businessName || name;
    const displayDate = booking.bookingDate;
    const displayTime = booking.bookingTime;

    alert(
      `Booking request submitted successfully!\n\n` +
      `Provider: ${providerName}\n` +
      `Status: ${status}\n` +
      `Date: ${displayDate} at ${displayTime}\n` +
      `Booking ID: ${bookingId}\n\n` +
      `The provider will confirm your booking shortly.`
    );
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('log in') || msg.includes('401') || msg.includes('not logged in')) {
      alert('Session expired. Please log in again to book a service.');
    } else if (msg.includes('not found') || msg.includes('404')) {
      alert('The selected provider could not be found. Please refresh and try again.');
    } else if (msg.includes('400')) {
      alert(`Booking validation error: ${msg}`);
    } else {
      alert(`Booking failed. Please try again.\nDetails: ${msg}`);
    }
    console.error('[Booking Error]', err);
  }
}
