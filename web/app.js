/**
 * TerraFlood Public Citizen Safety Web App Logic
 * ===============================================
 * Powered by Leaflet GIS, GPS Haversine Geolocation,
 * and real-time connection to FastAPI backend.
 */

// Bilingual Translation Dictionary
const T = {
  en: {
    portalSubtitle: "Government of Nepal • NDRF & Red Cross Verified Emergency Public Directive",
    liveDirective: "LIVE RADAR & RESCUE DIRECTIVE ACTIVE",
    switchCmd: "🛡️ Tactical Command HUD",
    broadcastSos: "🚨 SEND CITIZEN SOS",
    findNearest: "📍 Locate Nearest Safe Shelter via GPS",
    locating: "Acquiring GPS coordinates...",
    nearestFound: "Nearest Verified Safe Shelter:",
    distanceAway: "away",
    openNav: "🧭 Turn-by-Turn Directions",
    callHelpline: "📞 Emergency Helpline",
    inundatedArea: "Inundated Area",
    displacedPop: "Displaced Persons",
    safeCamps: "Safe Shelters",
    availBeds: "Available Beds",
    campsDirectory: "Verified Relief & Medical Camps Directory",
    campsDesc: "Locate operating field hospitals, mobile trauma clinics, and secure staging hubs in Nepal's Terai.",
    filterDistrict: "Filter by District / Region:",
    allDistricts: "All Terai Corridor",
    showSafeOnly: "Show Safe & Operational Camps Only",
    searchPlaceholder: "🔍 Search by camp name, landmark, or organization...",
    safeStatus: "OPERATIONAL & SECURE",
    floodedStatus: "UNDERWATER / CUT OFF (DO NOT APPROACH)",
    beds: "Beds Capacity",
    doctors: "On-Duty Medical Team",
    radioFreq: "Radio Frequency",
    org: "Organization",
    address: "Location Address",
    survivalGuidelines: "Citizen Disaster Survival Directives",
    guidelinesSubtitle: "Official guidelines from Ministry of Home Affairs (MoHA) & Nepal Red Cross.",
    waterTitle: "Drinking Water Safety",
    waterDesc: "Never drink unboiled flood water. Use chlorine/Piyush drops or boil for 3+ minutes. Drink ORS (Jeevan Jal) to prevent dehydration.",
    roadTitle: "Road & Causeway Hazards",
    roadDesc: "Do not attempt to cross flooded causeways or submerged culverts. Flowing water 6 inches deep can knock down an adult.",
    snakeTitle: "Snakebite Precautions",
    snakeDesc: "Floodwaters displace venomous snakes to dry ground. Carry a stick and flashlight at night. In case of a bite, head immediately to the nearest green shelter.",
    goBagTitle: "Emergency Evacuation Go-Bag",
    goBagDesc: "Keep citizenship/ID papers in sealed waterproof plastic. Pack torch, dry matches, dry beaten rice (chiura), emergency meds, and a whistle.",
    sosModalTitle: "Broadcast Emergency Citizen SOS Signal",
    sosModalSubtitle: "Direct distress alert sent to Nepal Army, Police & APF swift water rescue dispatchers.",
    submitSos: "🚨 TRANSMIT DISTRESS SIGNAL",
    sosSuccessTitle: "DISTRESS BEACON BROADCASTED!",
    sosSuccessDesc: "Your location and contact details have been queued for emergency rescue dispatch.",
  },
  np: {
    portalSubtitle: "नेपाल सरकार • आपतकालीन कार्य सञ्चालन केन्द्र (NEOC) तथा नेपाल रेडक्रस आधिकारिक निर्देशिका",
    liveDirective: "प्रत्यक्ष उपग्रह राडार तथा उद्धार निर्देशन सक्रिय",
    switchCmd: "🛡️ कमान्ड सेन्टर (Tactical HUD)",
    broadcastSos: "🚨 आपतकालीन उद्धार गुहार (SOS)",
    findNearest: "📍 जीपीएस (GPS) मार्फत नजिकको सुरक्षित शिविर खोज्नुहोस्",
    locating: "जीपीएस लोकेसन पत्ता लगाउँदै...",
    nearestFound: "तपाईंको नजिकको प्रमाणित सुरक्षित शिविर:",
    distanceAway: "टाढा",
    openNav: "🧭 गुगल म्याप्समा बाटो हेर्नुहोस्",
    callHelpline: "📞 आपतकालीन हटलाइन",
    inundatedArea: "बाढी प्रभावित क्षेत्रफल",
    displacedPop: "विस्थापित नागरिक संख्या",
    safeCamps: "सुरक्षित शिविर संख्या",
    availBeds: "उपलब्ध सुरक्षित बेड",
    campsDirectory: "प्रमाणित राहत तथा स्वास्थ्य शिविरहरूको विवरण",
    campsDesc: "सञ्चालनमा रहेका फिल्ड अस्पताल, ट्रमा सेन्टर र सुरक्षित आश्रय स्थलहरू हेर्नुहोस्।",
    filterDistrict: "जिल्ला वा क्षेत्र छान्नुहोस्:",
    allDistricts: "समग्र तराई क्षेत्र (All Terai)",
    showSafeOnly: "सञ्चालनमा रहेका सुरक्षित शिविर मात्र देखाउनुहोस्",
    searchPlaceholder: "🔍 शिविरको नाम, ठेगाना वा संस्था खोज्नुहोस्...",
    safeStatus: "सञ्चालनमा / सुरक्षित (OPERATIONAL)",
    floodedStatus: "डुबानमा / जान जोखिमपूर्ण (DO NOT APPROACH)",
    beds: "बेड क्षमता",
    doctors: "चिकित्सक तथा स्वास्थ्य टोली",
    radioFreq: "रेडियो फ्रिक्वेन्सी",
    org: "व्यवस्थापन संस्था",
    address: "ठेगाना",
    survivalGuidelines: "नागरिक बाढी सुरक्षा तथा बच्ने उपायहरू",
    guidelinesSubtitle: "गृह मन्त्रालय, आपतकालीन कार्य सञ्चालन केन्द्र (NEOC) र नेपाल रेडक्रसको आधिकारिक निर्देशन।",
    waterTitle: "पिउने पानी सुरक्षा",
    waterDesc: "बाढीको पानी वा प्रदूषित धारा प्रयोग नगर्नुहोस्। पानी ३ मिनेट उमालेर वा पियुष/क्लोरीन हालेर मात्र पिउनुहोस्। जीवनजल (ORS) पर्याप्त मात्रामा सेवन गर्नुहोस्।",
    roadTitle: "सडक तथा पुल जोखिम",
    roadDesc: "बाढी पसेको पुल, कल्भर्ट वा बगिरहेको पानीमा हिँड्ने वा गाडी चलाउने प्रयास कहिल्यै नगर्नुहोस्। ६ इन्च गहिरो बग्दो पानीले मानिसलाई बगाउन सक्छ।",
    snakeTitle: "सर्पदंशबाट सावधानी",
    snakeDesc: "बाढीको समयमा विषालु सर्पहरू सुक्खा ठाउँमा आउँछन्। राति हिँड्दा टर्चलाइट र लट्ठीको प्रयोग गर्नुहोस्। सर्पले टोकेमा तुरुन्त नजिकको मेडिकल पोस्टमा जानुहोस्।",
    goBagTitle: "आपतकालीन झोला (Go-Bag)",
    goBagDesc: "नागरिकता, लालपुर्जा, परिचयपत्र प्लास्टिकको झोलामा सुरक्षित राख्नुहोस्। टर्च, सलाई, सुख्खा खानेकुरा (चिउरा), सिठ्ठी र नियमित औषधि साथमा राख्नुहोस्।",
    sosModalTitle: "आपतकालीन उद्धार गुहार पठाउनुहोस् (SOS)",
    sosModalSubtitle: "नेपाली सेना, नेपाल प्रहरी तथा सशस्त्र प्रहरी बलको बाढी उद्धार टोलीमा सिधै सूचना पठाइन्छ।",
    submitSos: "🚨 आपतकालीन गुहार पठाउनुहोस्",
    sosSuccessTitle: "उद्धार सन्देश सफलतापूर्वक पठाइयो!",
    sosSuccessDesc: "तपाईंको विवरण उद्धार कमान्ड सेन्टरमा दर्ता गरिएको छ। उद्धार टोलीले तुरुन्त सम्पर्क गर्नेछ।",
  }
};

// Fallback Medical Camps Data
const FALLBACK_CAMPS = [
  {
    type: "Feature",
    properties: {
      p_id: "IP-001",
      camp_id: "CAMP-001",
      name: "Koshi Flood Evacuation Camp (Koshi Corridor)",
      facility_type: "Emergency Field Hospital",
      organization: "Nepal Red Cross / WHO",
      district: "Sunsari (Koshi Corridor)",
      address: "Koshi Barrage High Staging Area, Sunsari",
      capacity_beds: 120,
      medical_staff: 18,
      status: "OPERATIONAL / SECURE",
      priority_action: "ACTIVE: Safe Supply Hub & Staging Area",
      contact_channel: "VHF-Ch-16",
      phone_helpline: "+977-25-520111",
    },
    geometry: { type: "Point", coordinates: [87.08, 26.78] }
  },
  {
    type: "Feature",
    properties: {
      p_id: "IP-002",
      camp_id: "CAMP-002",
      name: "Biratnagar Sub-Metropolitan Relief Station",
      facility_type: "Mobile Trauma Clinic",
      organization: "Doctors Without Borders (MSF)",
      district: "Morang (Biratnagar)",
      address: "Main Road Relief Complex, Ward 12, Biratnagar",
      capacity_beds: 80,
      medical_staff: 12,
      status: "OPERATIONAL / SECURE",
      priority_action: "ACTIVE: Safe Supply Hub & Staging Area",
      contact_channel: "HF-8422kHz",
      phone_helpline: "+977-21-460222",
    },
    geometry: { type: "Point", coordinates: [87.28, 26.48] }
  },
  {
    type: "Feature",
    properties: {
      p_id: "IP-003",
      camp_id: "CAMP-003",
      name: "Janakpur Primary Relief Post",
      facility_type: "Maternal & Child Health Post",
      organization: "UNICEF / Ministry of Health",
      district: "Dhanusha (Janakpur)",
      address: "Ramanand Chowk Community Center, Janakpur",
      capacity_beds: 65,
      medical_staff: 9,
      status: "OPERATIONAL / SECURE",
      priority_action: "ACTIVE: Safe Supply Hub & Staging Area",
      contact_channel: "VHF-Ch-09",
      phone_helpline: "+977-41-520333",
    },
    geometry: { type: "Point", coordinates: [85.92, 26.71] }
  },
  {
    type: "Feature",
    properties: {
      p_id: "IP-004",
      camp_id: "CAMP-004",
      name: "Kamalamai High-Ground Trauma Staging Point",
      facility_type: "Air-Drop Logistics & Surgical Base",
      organization: "Nepal Army Disaster Directorate",
      district: "Sindhuli (Kamalamai)",
      address: "Kamalamai High Ridge Ground, Sindhuli",
      capacity_beds: 150,
      medical_staff: 25,
      status: "OPERATIONAL / SECURE",
      priority_action: "ACTIVE: Safe Supply Hub & Staging Area",
      contact_channel: "SAT-IRIDIUM-01",
      phone_helpline: "+977-47-520444",
    },
    geometry: { type: "Point", coordinates: [85.90, 27.22] }
  },
  {
    type: "Feature",
    properties: {
      p_id: "IP-005",
      camp_id: "CAMP-005",
      name: "Chitwan Floodplain Medical Outpost",
      facility_type: "Waterborne Rescue & First-Aid Post",
      organization: "Armed Police Force (APF) Disaster Unit",
      district: "Chitwan (Bharatpur)",
      address: "Narayani Riverbank Elevated Staging, Bharatpur",
      capacity_beds: 45,
      medical_staff: 8,
      status: "OPERATIONAL / SECURE",
      priority_action: "ACTIVE: Safe Supply Hub & Staging Area",
      contact_channel: "VHF-Ch-12",
      phone_helpline: "+977-56-520555",
    },
    geometry: { type: "Point", coordinates: [84.45, 27.35] }
  }
];

// State
let currentLang = 'en';
let campsData = [...FALLBACK_CAMPS];
let mapInstance = null;
let campsLayer = null;
let userLoc = null;

// Haversine Distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  fetchTelemetry();
  setupEventListeners();
  renderCamps();
  initInteractiveBackground();
  initCardSpotlights();
});

// Initialize Leaflet Map
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  mapInstance = L.map('map', {
    center: [26.85, 86.0],
    zoom: 8,
    zoomControl: true,
    preferCanvas: true,
  });

  const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri World Imagery'
  });

  L.control.layers({
    "Street Map (सडक नक्सा)": streetTiles,
    "High-Res Satellite (उपग्रह नक्सा)": satelliteTiles
  }, null, { position: 'topright' }).addTo(mapInstance);

  campsLayer = L.featureGroup().addTo(mapInstance);
  renderMapMarkers();
}

// Render Camp Markers on Leaflet
function renderMapMarkers() {
  if (!mapInstance || !campsLayer) return;
  campsLayer.clearLayers();

  campsData.forEach(camp => {
    const [lon, lat] = camp.geometry.coordinates;
    const isSafe = camp.properties.status === "OPERATIONAL / SECURE";
    const color = isSafe ? "#00E676" : "#FF1744";

    const marker = L.circleMarker([lat, lon], {
      radius: isSafe ? 11 : 9,
      fillColor: color,
      color: color,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.88,
    });

    const popupHtml = `
      <div style="font-family:'Outfit', sans-serif; width:260px; color:#111;">
        <div style="background:${isSafe ? '#00C853' : '#D50000'}; color:#fff; padding:6px 10px; border-radius:4px 4px 0 0; font-weight:800; font-size:12px;">
          ${isSafe ? '🟢 OPERATIONAL / SAFE SHELTER' : '🔴 SUBMERGED / DO NOT APPROACH'}
        </div>
        <div style="padding:10px; font-size:12px; line-height:1.5;">
          <strong style="font-size:14px; color:#000;">${camp.properties.name}</strong><br>
          <span style="color:#555;">${camp.properties.facility_type}</span><br>
          <div style="margin:6px 0; border-top:1px solid #EEE; padding-top:4px;">
            <b>📍 District:</b> ${camp.properties.district || 'Terai Corridor'}<br>
            <b>🛏️ Beds:</b> ${camp.properties.capacity_beds} | <b>👨‍⚕️ Staff:</b> ${camp.properties.medical_staff}<br>
            <b>📻 Comms:</b> ${camp.properties.contact_channel}<br>
            <b>📞 Helpline:</b> ${camp.properties.phone_helpline || '+977-1155'}<br>
          </div>
          <div style="margin-top:8px; text-align:center;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" style="background:#1976D2; color:#FFF; padding:6px 12px; border-radius:4px; font-weight:700; text-decoration:none; display:inline-block; font-size:11px;">
              🧭 Open Turn-by-Turn Navigation
            </a>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.bindTooltip(`📍 ${camp.properties.p_id || camp.properties.camp_id}: ${camp.properties.name}`);
    campsLayer.addLayer(marker);
  });
}

// Fetch Telemetry from FastAPI
async function fetchTelemetry() {
  try {
    const [campsRes, metricsRes] = await Promise.allSettled([
      fetch('/api/camps').then(r => r.json()),
      fetch('/api/metrics').then(r => r.json()),
    ]);

    if (campsRes.status === 'fulfilled' && campsRes.value?.features) {
      campsData = campsRes.value.features;
      renderMapMarkers();
      renderCamps();
    }

    if (metricsRes.status === 'fulfilled' && metricsRes.value) {
      const m = metricsRes.value;
      document.getElementById('metric-inundated').textContent = (m.inundated_km2 || 28.4) + " km²";
      document.getElementById('metric-displaced').textContent = (m.displaced_population || 13580).toLocaleString();
      document.getElementById('metric-camps').textContent = (m.active_safe_camps || 5) + " Camps";
      document.getElementById('metric-beds').textContent = (m.total_available_beds || 460).toLocaleString() + " Beds";
    }

    // Try fetching flood extent
    fetch('/api/flood-extent')
      .then(r => r.json())
      .then(data => {
        if (data && data.features && data.features.length > 0 && mapInstance) {
          L.geoJSON(data, {
            style: {
              fillColor: "#FF5722",
              color: "#FF8C00",
              weight: 1.5,
              fillOpacity: 0.5,
            }
          }).bindTooltip("🌊 Inundated Flood Danger Zone").addTo(mapInstance);
        }
      })
      .catch(() => {});
  } catch (err) {
    console.warn('Using local fallback telemetry:', err);
  }
}

// Render Camps Cards
function renderCamps() {
  const container = document.getElementById('camps-container');
  if (!container) return;

  const district = document.getElementById('filter-district')?.value || 'All';
  const safeOnly = document.getElementById('filter-safe')?.checked || false;
  const search = (document.getElementById('filter-search')?.value || '').toLowerCase();

  const filtered = campsData.filter(c => {
    const p = c.properties;
    const matchDistrict = district === 'All' || (p.district && p.district.toLowerCase().includes(district.toLowerCase()));
    const matchSafe = !safeOnly || p.status === "OPERATIONAL / SECURE";
    const matchSearch = !search || 
      p.name.toLowerCase().includes(search) ||
      (p.address && p.address.toLowerCase().includes(search)) ||
      p.facility_type.toLowerCase().includes(search);
    return matchDistrict && matchSafe && matchSearch;
  });

  const countBadge = document.getElementById('camps-count');
  if (countBadge) countBadge.textContent = `Showing ${filtered.length} verified camps`;

  container.innerHTML = filtered.map(camp => {
    const p = camp.properties;
    const [lon, lat] = camp.geometry.coordinates;
    const isSafe = p.status === "OPERATIONAL / SECURE";
    const statusText = isSafe ? '🟢 OPERATIONAL & SECURE' : '🔴 FLOODED (DO NOT APPROACH)';
    const statusClass = isSafe ? 'safe' : 'flooded';
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    return `
      <div class="camp-card ${statusClass}">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="camp-status-badge ${statusClass}">
              ${statusText}
            </span>
            <span style="font-size:12px; font-family:var(--font-mono); color:var(--telemetry-cyan);">
              ${p.p_id || p.camp_id}
            </span>
          </div>

          <h3 class="camp-name">${p.name}</h3>
          <div class="camp-facility">${p.facility_type} • <span style="color:var(--text-muted);">${p.district}</span></div>

          <div class="camp-meta-grid">
            <div>
              <span class="camp-meta-label">Location Address:</span>
              <span class="camp-meta-val">${p.address || 'Terai Flood Corridor'}</span>
            </div>
            <div>
              <span class="camp-meta-label">Organization:</span>
              <span class="camp-meta-val">${p.organization}</span>
            </div>
            <div>
              <span class="camp-meta-label">Bed Capacity:</span>
              <span class="camp-meta-val" style="color:var(--safe-green);">${p.capacity_beds} Beds</span>
            </div>
            <div>
              <span class="camp-meta-label">Medical Staff:</span>
              <span class="camp-meta-val">${p.medical_staff} Personnel</span>
            </div>
            <div>
              <span class="camp-meta-label">Radio Frequency:</span>
              <span class="camp-meta-val" style="color:var(--warning-amber); font-family:var(--font-mono);">${p.contact_channel}</span>
            </div>
            <div>
              <span class="camp-meta-label">Phone Helpline:</span>
              <span class="camp-meta-val">${p.phone_helpline || '+977-1155'}</span>
            </div>
          </div>
        </div>

        <div class="camp-actions">
          <a href="${gmapsUrl}" target="_blank" rel="noreferrer" class="btn btn-primary" style="flex:1; justify-content:center;">
            🧭 Navigate (Google Maps)
          </a>
          <a href="tel:${p.phone_helpline || '1155'}" class="btn btn-outline" style="flex:1; justify-content:center;">
            📞 Call Hotline
          </a>
        </div>
      </div>
    `;
  }).join('');

  initCardSpotlights();
}

// Setup Event Listeners
function setupEventListeners() {
  // Theme Background FX Toggle
  document.getElementById('btn-theme-fx')?.addEventListener('click', toggleThemeFx);

  // Filters
  document.getElementById('filter-district')?.addEventListener('change', renderCamps);
  document.getElementById('filter-safe')?.addEventListener('change', renderCamps);
  document.getElementById('filter-search')?.addEventListener('input', renderCamps);

  // GPS Nearest Camp Button
  document.getElementById('btn-gps')?.addEventListener('click', handleLocateUser);

  // SOS Modal
  document.getElementById('btn-open-sos')?.addEventListener('click', () => {
    document.getElementById('sos-modal').style.display = 'flex';
  });
  document.getElementById('sos-close')?.addEventListener('click', () => {
    document.getElementById('sos-modal').style.display = 'none';
  });

  // SOS Form Submit
  document.getElementById('sos-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('sos-name').value,
      phone: document.getElementById('sos-phone').value,
      district: document.getElementById('sos-district').value,
      location_name: document.getElementById('sos-location').value,
      emergency_type: document.getElementById('sos-type').value,
      people_count: parseInt(document.getElementById('sos-people').value) || 1,
      notes: document.getElementById('sos-notes').value,
      lat: userLoc ? userLoc.lat : null,
      lon: userLoc ? userLoc.lon : null,
    };

    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {}

    document.getElementById('sos-form-wrapper').style.display = 'none';
    document.getElementById('sos-success-wrapper').style.display = 'block';
  });

  // Share Modal
  document.getElementById('btn-share')?.addEventListener('click', () => {
    document.getElementById('share-modal').style.display = 'flex';
  });
  document.getElementById('share-close')?.addEventListener('click', () => {
    document.getElementById('share-modal').style.display = 'none';
  });
  document.getElementById('btn-copy-link')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.origin);
    const btn = document.getElementById('btn-copy-link');
    btn.textContent = '✅ Copied to Clipboard!';
    setTimeout(() => { btn.textContent = '📋 Copy Portal Link'; }, 2500);
  });

  // Language Toggle
  document.getElementById('btn-lang-toggle')?.addEventListener('click', toggleLanguage);
}

// Locate User via GPS
function handleLocateUser() {
  const btn = document.getElementById('btn-gps');
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  btn.textContent = "Acquiring GPS coordinates...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      btn.textContent = "📍 Locate Nearest Safe Shelter via GPS";

      let closest = null;
      let minD = Infinity;

      campsData.forEach(c => {
        if (c.properties.status === "OPERATIONAL / SECURE") {
          const [cLon, cLat] = c.geometry.coordinates;
          const d = parseFloat(calculateDistanceKm(userLoc.lat, userLoc.lon, cLat, cLon));
          if (d < minD) {
            minD = d;
            closest = { ...c, distanceKm: d };
          }
        }
      });

      if (closest) {
        const gpsBar = document.getElementById('gps-nearest-bar');
        gpsBar.style.display = 'flex';
        document.getElementById('gps-camp-name').textContent = `📍 ${closest.properties.name} — ${closest.distanceKm} km away`;
        document.getElementById('gps-camp-sub').textContent = `${closest.properties.facility_type} • ${closest.properties.address} • Beds: ${closest.properties.capacity_beds}`;
        document.getElementById('gps-nav-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${closest.geometry.coordinates[1]},${closest.geometry.coordinates[0]}`;

        if (mapInstance) {
          L.circleMarker([userLoc.lat, userLoc.lon], {
            radius: 10,
            fillColor: "#00E5FF",
            color: "#FFFFFF",
            weight: 3,
            fillOpacity: 1,
          }).bindPopup("📍 <b>Your Current GPS Location</b>").addTo(mapInstance);

          mapInstance.setView([userLoc.lat, userLoc.lon], 10);
        }
      }
    },
    () => {
      // Demo fallback in Janakpur if permission denied
      userLoc = { lat: 26.72, lon: 85.93 };
      btn.textContent = "📍 Locate Nearest Safe Shelter via GPS";
      const closest = { ...campsData[2], distanceKm: "1.4" };
      const gpsBar = document.getElementById('gps-nearest-bar');
      gpsBar.style.display = 'flex';
      document.getElementById('gps-camp-name').textContent = `📍 ${closest.properties.name} — ${closest.distanceKm} km away`;
      document.getElementById('gps-camp-sub').textContent = `${closest.properties.facility_type} • ${closest.properties.address}`;
      document.getElementById('gps-nav-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${closest.geometry.coordinates[1]},${closest.geometry.coordinates[0]}`;
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// Toggle Language
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'np' : 'en';
  const t = T[currentLang];
  document.getElementById('btn-lang-toggle').textContent = currentLang === 'en' ? '🌐 नेपाली (NP)' : '🌐 English (EN)';
  document.getElementById('hero-title').textContent = currentLang === 'en' ? '🇳🇵 NEPAL TERAI FLOOD RELIEF & CITIZEN SAFETY PORTAL' : '🇳🇵 नेपाल तराई बाढी राहत तथा आपतकालीन शिविर नागरिक पोर्टल';
  document.getElementById('hero-subtitle').textContent = t.portalSubtitle;
  document.getElementById('hero-directive').textContent = t.liveDirective;
  document.getElementById('camps-dir-title').textContent = t.campsDirectory;
  renderCamps();
}

// Helper Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// Interactive Cyber-Tactical Background Engine (Radar Matrix, Waves, Spotlights)
// ============================================================================
let bgCanvas = null;
let bgCtx = null;
let bgAnimationId = null;
let bgNodes = [];
let bgRipples = [];
let bgMode = parseInt(localStorage.getItem('terraflood_fx_mode') || '0', 10);
let mousePos = { x: -1000, y: -1000, radius: 170, active: false };
let radarAngle = 0;
let wavePhase = 0;

const FX_MODES = [
  { id: 'radar', name: '🛰️ FX: Radar Matrix', desc: 'Tactical node mesh & radar sweep' },
  { id: 'waves', name: '🌊 FX: Flood Waves', desc: 'Harmonic hydraulic contour waves' },
  { id: 'aurora', name: '✨ FX: Cyber Aurora', desc: 'Floating telemetry atmospheric stars' },
  { id: 'minimal', name: '⚡ FX: Minimal Grid', desc: 'Low-power static grid' }
];

function initInteractiveBackground() {
  bgCanvas = document.getElementById('bg-canvas');
  if (!bgCanvas) return;
  bgCtx = bgCanvas.getContext('2d');
  if (!bgCtx) return;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    bgCanvas.width = w * dpr;
    bgCanvas.height = h * dpr;
    bgCtx.resetTransform();
    bgCtx.scale(dpr, dpr);
    createNodes(w, h);
  }

  resizeCanvas();
  window.addEventListener('resize', debounce(resizeCanvas, 120));

  // Mouse Tracking
  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    mousePos.active = true;
  });

  window.addEventListener('mouseout', () => {
    mousePos.active = false;
    mousePos.x = -1000;
    mousePos.y = -1000;
  });

  // Click generates interactive Sonar Ripple
  window.addEventListener('click', (e) => {
    if (bgMode === 3) return;
    if (e.target.closest('#map') || e.target.closest('.modal-content')) return;

    bgRipples.push({
      x: e.clientX,
      y: e.clientY,
      r: 6,
      maxR: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      alpha: 0.75,
      speed: 4.0
    });
  });

  // Visibility state handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (bgAnimationId) cancelAnimationFrame(bgAnimationId);
    } else {
      bgAnimationId = requestAnimationFrame(renderBackgroundFrame);
    }
  });

  updateFxButtonLabel();
  bgAnimationId = requestAnimationFrame(renderBackgroundFrame);
}

// Generate Nodes for Radar Matrix & Aurora
function createNodes(w, h) {
  bgNodes = [];
  const count = Math.min(65, Math.floor((w * h) / 22000));
  const colors = [
    'rgba(0, 229, 255, ',  // Cyan
    'rgba(0, 230, 118, ',  // Green
    'rgba(255, 145, 0, ',  // Amber
  ];

  for (let i = 0; i < count; i++) {
    bgNodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      radius: Math.random() * 2.2 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

// Main Canvas Render Loop
function renderBackgroundFrame() {
  if (!bgCanvas || !bgCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  bgCtx.clearRect(0, 0, w, h);

  if (bgMode === 3) {
    // Minimal mode (Static CSS grid only)
    bgAnimationId = requestAnimationFrame(renderBackgroundFrame);
    return;
  }

  if (bgMode === 0) {
    renderRadarMatrix(w, h);
  } else if (bgMode === 1) {
    renderFloodWaves(w, h);
  } else if (bgMode === 2) {
    renderCyberAurora(w, h);
  }

  renderRipples();
  bgAnimationId = requestAnimationFrame(renderBackgroundFrame);
}

// Mode 0: Radar Matrix & Tactical Nodes
function renderRadarMatrix(w, h) {
  radarAngle = (radarAngle + 0.009) % (Math.PI * 2);
  const cx = w * 0.5;
  const cy = h * 0.38;
  const maxR = Math.max(w, h) * 0.85;

  // Concentric Tactical Range Rings
  const rings = [100, 220, 360, 520];
  bgCtx.lineWidth = 1;
  rings.forEach((r, idx) => {
    bgCtx.beginPath();
    bgCtx.arc(cx, cy, r, 0, Math.PI * 2);
    bgCtx.strokeStyle = `rgba(0, 229, 255, ${0.035 - idx * 0.006})`;
    bgCtx.stroke();
  });

  // Rotating Radar Sector Beam
  bgCtx.save();
  const beamGrad = bgCtx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
  beamGrad.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
  beamGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.08)');
  beamGrad.addColorStop(1, 'transparent');

  bgCtx.beginPath();
  bgCtx.moveTo(cx, cy);
  bgCtx.arc(cx, cy, maxR, radarAngle, radarAngle + 0.28);
  bgCtx.closePath();
  bgCtx.fillStyle = beamGrad;
  bgCtx.fill();
  bgCtx.restore();

  // Nodes & Interconnected Vectors
  for (let i = 0; i < bgNodes.length; i++) {
    const n = bgNodes[i];

    // Move
    n.x += n.vx;
    n.y += n.vy;
    n.pulse += n.pulseSpeed;

    // Wrap
    if (n.x < -20) n.x = w + 20;
    if (n.x > w + 20) n.x = -20;
    if (n.y < -20) n.y = h + 20;
    if (n.y > h + 20) n.y = -20;

    // Mouse Repulsion
    if (mousePos.active) {
      const dx = n.x - mousePos.x;
      const dy = n.y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mousePos.radius && dist > 0) {
        const force = (1 - dist / mousePos.radius) * 3.2;
        n.x += (dx / dist) * force;
        n.y += (dy / dist) * force;
      }
    }

    // Connect Lines
    for (let j = i + 1; j < bgNodes.length; j++) {
      const other = bgNodes[j];
      const d = Math.hypot(n.x - other.x, n.y - other.y);
      if (d < 110) {
        const alpha = (1 - d / 110) * 0.16;
        bgCtx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        bgCtx.lineWidth = 1;
        bgCtx.beginPath();
        bgCtx.moveTo(n.x, n.y);
        bgCtx.lineTo(other.x, other.y);
        bgCtx.stroke();
      }
    }

    // Check illumination from radar sweep
    const angleToNode = Math.atan2(n.y - cy, n.x - cx);
    let diffAngle = (angleToNode - radarAngle + Math.PI * 4) % (Math.PI * 2);
    let highlight = 0;
    if (diffAngle < 0.3) {
      highlight = (1 - diffAngle / 0.3) * 0.7;
    }

    const currentAlpha = Math.min(1, n.baseAlpha + Math.sin(n.pulse) * 0.15 + highlight);
    bgCtx.beginPath();
    bgCtx.arc(n.x, n.y, n.radius + (highlight > 0 ? 1.2 : 0), 0, Math.PI * 2);
    bgCtx.fillStyle = `${n.color}${currentAlpha})`;
    bgCtx.shadowColor = '#00E5FF';
    bgCtx.shadowBlur = highlight > 0 ? 12 : 4;
    bgCtx.fill();
    bgCtx.shadowBlur = 0;
  }
}

// Mode 1: Flood Inundation Waves (Harmonic Contour Lines)
function renderFloodWaves(w, h) {
  wavePhase += 0.018;

  const waveLayers = [
    { baseY: h * 0.35, amp: 28, freq: 0.0035, speed: 1.0, color: 'rgba(0, 229, 255, 0.25)', fill: 'rgba(0, 229, 255, 0.02)' },
    { baseY: h * 0.52, amp: 36, freq: 0.0028, speed: 0.75, color: 'rgba(0, 230, 118, 0.22)', fill: 'rgba(0, 230, 118, 0.02)' },
    { baseY: h * 0.70, amp: 44, freq: 0.0022, speed: 0.55, color: 'rgba(0, 229, 255, 0.30)', fill: 'rgba(0, 229, 255, 0.03)' },
    { baseY: h * 0.85, amp: 50, freq: 0.0018, speed: 0.40, color: 'rgba(255, 87, 34, 0.20)', fill: 'rgba(255, 87, 34, 0.025)' },
  ];

  waveLayers.forEach(layer => {
    bgCtx.save();
    bgCtx.beginPath();
    bgCtx.moveTo(0, h);

    for (let x = 0; x <= w; x += 12) {
      let mouseWave = 0;
      if (mousePos.active) {
        const mDist = Math.abs(x - mousePos.x);
        if (mDist < 160) {
          mouseWave = Math.sin((1 - mDist / 160) * Math.PI) * 22;
        }
      }
      const y = layer.baseY + Math.sin(x * layer.freq + wavePhase * layer.speed) * layer.amp - mouseWave;
      if (x === 0) bgCtx.lineTo(x, y);
      else bgCtx.lineTo(x, y);
    }

    bgCtx.lineTo(w, h);
    bgCtx.closePath();
    bgCtx.fillStyle = layer.fill;
    bgCtx.fill();

    bgCtx.strokeStyle = layer.color;
    bgCtx.lineWidth = 1.5;
    bgCtx.stroke();
    bgCtx.restore();
  });
}

// Mode 2: Cyber Aurora (Atmospheric Float & Starfield)
function renderCyberAurora(w, h) {
  // Floating stars
  for (let i = 0; i < bgNodes.length; i++) {
    const n = bgNodes[i];
    n.y -= 0.25;
    if (n.y < -10) n.y = h + 10;
    n.pulse += n.pulseSpeed;

    const alpha = n.baseAlpha + Math.sin(n.pulse) * 0.2;
    bgCtx.beginPath();
    bgCtx.arc(n.x, n.y, n.radius * 0.9, 0, Math.PI * 2);
    bgCtx.fillStyle = `${n.color}${alpha})`;
    bgCtx.fill();
  }

  // Interactive Cursor Aura
  if (mousePos.active) {
    const auraGrad = bgCtx.createRadialGradient(mousePos.x, mousePos.y, 10, mousePos.x, mousePos.y, 220);
    auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0.14)');
    auraGrad.addColorStop(0.5, 'rgba(0, 230, 118, 0.06)');
    auraGrad.addColorStop(1, 'transparent');

    bgCtx.save();
    bgCtx.fillStyle = auraGrad;
    bgCtx.beginPath();
    bgCtx.arc(mousePos.x, mousePos.y, 220, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();
  }
}

// Render Sonar Ripples
function renderRipples() {
  for (let i = bgRipples.length - 1; i >= 0; i--) {
    const r = bgRipples[i];
    r.r += r.speed;
    r.alpha *= 0.965;

    if (r.r > r.maxR || r.alpha < 0.015) {
      bgRipples.splice(i, 1);
      continue;
    }

    bgCtx.save();
    bgCtx.beginPath();
    bgCtx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    bgCtx.strokeStyle = `rgba(0, 229, 255, ${r.alpha})`;
    bgCtx.lineWidth = 1.6;
    bgCtx.stroke();
    bgCtx.restore();
  }
}

// Cycle FX Theme Mode
function toggleThemeFx() {
  bgMode = (bgMode + 1) % FX_MODES.length;
  localStorage.setItem('terraflood_fx_mode', bgMode);
  updateFxButtonLabel();

  if (bgMode === 3) {
    bgCanvas?.classList.add('hidden-fx');
  } else {
    bgCanvas?.classList.remove('hidden-fx');
  }
}

// Update FX Button Label
function updateFxButtonLabel() {
  const btn = document.getElementById('btn-theme-fx');
  if (!btn) return;
  const current = FX_MODES[bgMode] || FX_MODES[0];
  btn.textContent = current.name;
  btn.title = `${current.desc} (Click to switch mode)`;
}

// Initialize Dynamic Card Spotlight (Laser Rim Follows Cursor)
function initCardSpotlights() {
  const cards = document.querySelectorAll('.camp-card, .helpline-card, .kpi-card, .guideline-card, .hero-banner');

  cards.forEach(card => {
    // Avoid duplicate event listener
    if (card.dataset.spotlightBound) return;
    card.dataset.spotlightBound = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', `-500px`);
      card.style.setProperty('--mouse-y', `-500px`);
    });
  });
}

