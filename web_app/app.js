// Smart Local Service Web App Logic & Backend Connection

const API_BASE = 'http://localhost:5000';
let currentVehicle = 'MOTORCYCLE';

document.addEventListener('DOMContentLoaded', () => {
  loadRankedProviders('best_match');
  loadAppliances();
});

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
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaType: 'photo',
        description: description
      })
    });
    const data = await res.json();
    const result = data.data.analysis;

    document.getElementById('ai-appliance').innerText = result.applianceType || 'Home Appliance';
    document.getElementById('ai-problem').innerText = result.detectedProblem;
    document.getElementById('ai-category').innerText = result.problemCategory;
    document.getElementById('ai-pro').innerText = result.professionalRequired;
    document.getElementById('ai-severity').innerText = result.severity;
    document.getElementById('ai-cost').innerText = `₹${result.estimatedCostMin} – ₹${result.estimatedCostMax}`;
    document.getElementById('ai-confidence').innerText = `${Math.round(result.confidence * 100)}% Confidence Score`;

    // Trigger Smart Provider Ranking update
    loadRankedProviders('best_match', result.applianceType, result.detectedProblem);
  } catch (err) {
    console.error('AI Error:', err);
  }
}

async function loadRankedProviders(sortBy = 'best_match', appliance = 'Washing Machine', problem = '') {
  const listContainer = document.getElementById('providers-list');
  listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">Calculating Smart Provider Scores...</div>';

  try {
    const url = `${API_BASE}/providers/recommended?lat=12.9716&lon=77.5946&mode=SMART_REPAIR&appliance=${encodeURIComponent(appliance)}&problem=${encodeURIComponent(problem)}`;
    const res = await fetch(url);
    const data = await res.json();

    let items = data.data.recommendations;

    if (sortBy === 'distance') {
      items.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'price') {
      items.sort((a, b) => a.provider.basePrice - b.provider.basePrice);
    }

    listContainer.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `provider-card ${item.isBestMatch ? 'best-match' : ''}`;
      card.innerHTML = `
        ${item.isBestMatch ? '<div class="best-match-tag">🥇 BEST MATCH</div>' : ''}
        <div class="provider-header">
          <div>
            <div class="provider-name">${item.provider.businessName} <span style="color: var(--success); font-size: 12px;">✓ Verified</span></div>
            <div style="font-size: 12px; color: var(--text-muted);">${item.provider.experienceYears} Years Experience • ${item.provider.jobsCompleted} Completed Jobs</div>
          </div>
          <div class="provider-score">${item.totalScore}<span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">/100</span></div>
        </div>
        <div class="provider-meta">
          <span>⭐ ${item.provider.rating} Rating</span>
          <span>📍 ${item.distanceKm} km away</span>
          <span>💰 ₹${item.provider.basePrice} Base Visit Fee</span>
          <span>⏱️ ${item.etaMinutes} min ETA</span>
        </div>
        <div class="reason-box">
          💡 ${item.matchReason}
        </div>
        <button class="btn" style="width: 100%; margin-top: 8px; justify-content: center;" onclick="bookProvider('${item.provider.id}', '${item.provider.businessName}')">
          Book Service Now
        </button>
      `;
      listContainer.appendChild(card);
    });
  } catch (err) {
    listContainer.innerHTML = '<div style="color: var(--danger); text-align:center; padding: 20px;">Failed to load recommended providers.</div>';
  }
}

async function loadAppliances() {
  const container = document.getElementById('appliances-list');
  try {
    const res = await fetch(`${API_BASE}/services`);
    container.innerHTML = `
      <div class="provider-card">
        <div style="font-weight: 700; font-size: 16px;">Living Room Split AC</div>
        <div style="font-size: 13px; color: var(--text-muted);">LG Dual Inverter 1.5 Ton • Installed Mar 2024</div>
        <div style="margin-top: 8px; color: var(--danger); font-size: 12px; font-weight: 700;">⚠️ Maintenance Due (Overdue by 3 days)</div>
        <button class="btn btn-secondary" style="width:100%; margin-top:12px; justify-content:center;" onclick="switchModule('repair')">
          Find Top AC Expert (AC Expert Services - Score 95/100)
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
    console.error(err);
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
    const res = await fetch(`${API_BASE}/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleType: currentVehicle,
        problemDescription: 'Breakdown roadside starting issue near MG Road',
        latitude: 12.9716,
        longitude: 77.5946
      })
    });
    const data = await res.json();
    msgBox.innerText = `🚨 ${data.searchMessage}`;

    mechanicsList.innerHTML = '';
    data.data.recommendedMechanics.forEach(item => {
      const div = document.createElement('div');
      div.className = 'provider-card';
      div.style.borderColor = 'var(--danger)';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:800; color:var(--danger); font-size:16px;">${item.provider.businessName}</div>
          <div style="font-weight:800; color:var(--danger); font-size:16px;">${item.etaMinutes} MIN ETA</div>
        </div>
        <div class="provider-meta">
          <span>📍 ${item.distanceKm} km away</span>
          <span>⭐ ${item.provider.rating} Rating</span>
          <span>💰 ₹${item.provider.basePrice} Emergency Charge</span>
        </div>
        <button class="btn btn-danger" style="width:100%; justify-content:center; margin-top:8px;" onclick="alert('Emergency Mechanic Dispatched! Track location on map.')">
          CONFIRM RESCUE DISPATCH
        </button>
      `;
      mechanicsList.appendChild(div);
    });
  } catch (err) {
    msgBox.innerText = 'Failed to fetch emergency mechanics.';
  }
}

function bookProvider(providerId, name) {
  alert(`✅ Booking Confirmed for ${name}! Provider has accepted your request and is preparing to visit.`);
}
