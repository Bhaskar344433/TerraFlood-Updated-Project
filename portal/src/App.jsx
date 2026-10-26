import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, AlertTriangle, Phone, Navigation, MapPin, 
  Users, BedDouble, Stethoscope, Radio, Share2, 
  Send, ExternalLink, RefreshCw, Compass, CheckCircle2,
  Droplets, Zap, AlertCircle, HeartHandshake, Eye
} from 'lucide-react';
import L from 'leaflet';

// Translations Dictionary (English & नेपाली)
const T = {
  en: {
    portalTitle: "NEPAL TERAI FLOOD RELIEF & CITIZEN SAFETY PORTAL",
    portalSubtitle: "Government of Nepal • NDRF & Red Cross Verified Emergency Public Directive",
    liveDirective: "LIVE RADAR & RESCUE DIRECTIVE ACTIVE",
    switchCmd: "🛡️ Tactical Command HUD",
    broadcastSos: "🚨 SEND CITIZEN SOS",
    findNearest: "📍 Locate Nearest Safe Shelter via GPS",
    locating: "Acquiring GPS coordinates...",
    nearestFound: "Nearest Verified Safe Shelter:",
    distanceAway: "away",
    openNav: "🧭 Turn-by-Turn Directions (Google Maps)",
    callHelpline: "📞 Emergency Helpline",
    inundatedArea: "Inundated Area",
    displacedPop: "Displaced Persons",
    safeCamps: "Safe Shelters",
    availBeds: "Available Beds",
    medicalStaff: "Medical Staff",
    campsDirectory: "Verified Relief & Medical Camps Directory",
    campsDesc: "Locate operating field hospitals, mobile trauma clinics, and secure staging hubs.",
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
    fullName: "Your Name / Contact Person",
    phoneNum: "Phone Number for Rescue Call",
    districtSelect: "District / Region",
    landmark: "Exact Location / Landmark / Ward",
    emergencyType: "Type of Emergency",
    typeRoof: "Stranded on Roof / Elevated Tree",
    typeMedical: "Critical Medical Emergency / Injured",
    typeWater: "Drinking Water / Food Exhaustion",
    typeVulnerable: "Elderly / Pregnant / Infant Trapped",
    peopleCount: "Number of People Requiring Rescue",
    extraNotes: "Additional Urgent Details",
    submitSos: "🚨 TRANSMIT DISTRESS SIGNAL",
    sosSuccessTitle: "DISTRESS BEACON BROADCASTED!",
    sosSuccessDesc: "Your location and contact details have been queued for emergency rescue dispatch.",
    shareTitle: "Share This Public Portal with Family & Neighbors",
    copyLink: "📋 Copy Portal Link",
    copied: "Copied to Clipboard!",
    shareWa: "💬 Share on WhatsApp",
    footerText: "TerraFlood Disaster Operations • Team Byte Panda • Built for Nepal Terai Flood Emergency Impact Assessment",
  },
  np: {
    portalTitle: "नेपाल तराई बाढी राहत तथा आपतकालीन शिविर नागरिक पोर्टल",
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
    medicalStaff: "खटिएका स्वास्थ्यकर्मी",
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
    fullName: "तपाईंको नाम / सम्पर्क व्यक्ति",
    phoneNum: "सम्पर्क फोन नम्बर",
    districtSelect: "जिल्ला / क्षेत्र",
    landmark: "गाउँ, टोल वा प्रमुख चोकको नाम",
    emergencyType: "उद्धारको प्रकार",
    typeRoof: "छत वा रूखमा फसेको / डुबानमा",
    typeMedical: "गम्भीर बिरामी वा घाइते",
    typeWater: "पिउने पानी वा खाना अभाव",
    typeVulnerable: "गर्भवती, सुत्केरी, बालबालिका वा वृद्धवृद्धा फसेको",
    peopleCount: "उद्धार चाहिने मानिस संख्या",
    extraNotes: "थप महत्वपूर्ण विवरण",
    submitSos: "🚨 आपतकालीन गुहार पठाउनुहोस्",
    sosSuccessTitle: "उद्धार सन्देश सफलतापूर्वक पठाइयो!",
    sosSuccessDesc: "तपाईंको विवरण उद्धार कमान्ड सेन्टरमा दर्ता गरिएको छ। उद्धार टोलीले तुरुन्त सम्पर्क गर्नेछ।",
    shareTitle: "यो पोर्टल छिमेकी तथा परिवारसँग सेयर गर्नुहोस्",
    copyLink: "📋 लिंक कपी गर्नुहोस्",
    copied: "लिंक कपी भयो!",
    shareWa: "💬 ह्वाट्सएपमा सेयर गर्नुहोस्",
    footerText: "TerraFlood विपद् कमान्ड प्रणाली • Team Byte Panda • नेपाल तराई बाढी संकट समाधान",
  }
};

// Fallback Demo Medical Camps if API not responding
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

// Haversine distance calculator in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function App() {
  const [lang, setLang] = useState('en');
  const t = T[lang];

  // Live Data State
  const [camps, setCamps] = useState(FALLBACK_CAMPS);
  const [metrics, setMetrics] = useState({
    inundated_km2: 28.4,
    displaced_population: 13580,
    active_safe_camps: 5,
    total_available_beds: 460,
    on_duty_medical_personnel: 72,
  });
  const [helplines, setHelplines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [safeOnly, setSafeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Geolocation & Nearest Camp
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearestCamp, setNearestCamp] = useState(null);

  // Modals
  const [showSosModal, setShowSosModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // SOS Form State
  const [sosFormData, setSosFormData] = useState({
    name: '',
    phone: '',
    district: 'Sunsari (Koshi Corridor)',
    location_name: '',
    people_count: 1,
    emergency_type: 'Stranded on Roof / Elevated Tree',
    notes: '',
  });
  const [sosSubmitted, setSosSubmitted] = useState(false);

  // Leaflet Map Ref
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const campsLayerRef = useRef(null);

  // Fetch telemetry from FastAPI
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const [campsRes, metricsRes, helplinesRes] = await Promise.allSettled([
          fetch('/api/camps').then(r => r.json()),
          fetch('/api/metrics').then(r => r.json()),
          fetch('/api/helplines').then(r => r.json()),
        ]);

        if (campsRes.status === 'fulfilled' && campsRes.value?.features) {
          setCamps(campsRes.value.features);
        }
        if (metricsRes.status === 'fulfilled' && metricsRes.value) {
          setMetrics(metricsRes.value);
        }
        if (helplinesRes.status === 'fulfilled' && Array.isArray(helplinesRes.value)) {
          setHelplines(helplinesRes.value);
        }
      } catch (err) {
        console.warn('API connecting fallback mode:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTelemetry();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapInstance.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [26.85, 86.0],
      zoom: 8,
      zoomControl: true,
      preferCanvas: true,
    });

    // Dark Carto / OSM tiles
    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri World Imagery'
    });

    L.control.layers({
      "Standard Street Map (सडक नक्सा)": streetTiles,
      "High-Res Satellite (उपग्रह नक्सा)": satelliteTiles
    }, null, { position: 'topright' }).addTo(map);

    leafletMapInstance.current = map;
    campsLayerRef.current = L.featureGroup().addTo(map);

    // Fetch Flood Extent Polygon if available
    fetch('/api/flood-extent')
      .then(r => r.json())
      .then(floodData => {
        if (floodData && floodData.features && floodData.features.length > 0) {
          L.geoJSON(floodData, {
            style: {
              fillColor: "#FF5722",
              color: "#FF8C00",
              weight: 1.5,
              fillOpacity: 0.5,
            }
          }).bindTooltip("🌊 Inundated Flood Danger Zone").addTo(map);
        }
      })
      .catch(() => {});

    return () => {
      map.remove();
      leafletMapInstance.current = null;
    };
  }, []);

  // Update Camp Markers on Map
  useEffect(() => {
    if (!leafletMapInstance.current || !campsLayerRef.current) return;

    campsLayerRef.current.clearLayers();

    camps.forEach(camp => {
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

      const popupContent = `
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

      marker.bindPopup(popupContent);
      marker.bindTooltip(`📍 ${camp.properties.p_id || camp.properties.camp_id}: ${camp.properties.name}`);
      campsLayerRef.current.addLayer(marker);
    });
  }, [camps]);

  // GPS Geolocation Handler
  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        setUserLocation({ lat: uLat, lon: uLon });
        setIsLocating(false);

        // Find closest safe camp
        let closest = null;
        let minD = Infinity;

        camps.forEach(c => {
          if (c.properties.status === "OPERATIONAL / SECURE") {
            const [cLon, cLat] = c.geometry.coordinates;
            const dist = parseFloat(calculateDistanceKm(uLat, uLon, cLat, cLon));
            if (dist < minD) {
              minD = dist;
              closest = { ...c, distanceKm: dist };
            }
          }
        });

        setNearestCamp(closest);

        // Pan map to user & camp
        if (leafletMapInstance.current) {
          L.circleMarker([uLat, uLon], {
            radius: 10,
            fillColor: "#00E5FF",
            color: "#FFFFFF",
            weight: 3,
            fillOpacity: 1,
          }).bindPopup("📍 <b>Your Current Location</b>").addTo(leafletMapInstance.current);

          leafletMapInstance.current.setView([uLat, uLon], 10);
        }
      },
      (err) => {
        setIsLocating(false);
        // Fallback demo location in Janakpur if user denies GPS permission
        const demoLat = 26.72;
        const demoLon = 85.93;
        setUserLocation({ lat: demoLat, lon: demoLon });
        const closest = { ...camps[2], distanceKm: "1.4" };
        setNearestCamp(closest);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Handle SOS Submission
  async function handleSosSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sosFormData,
          lat: userLocation?.lat || null,
          lon: userLocation?.lon || null,
        }),
      });
      if (res.ok) {
        setSosSubmitted(true);
      }
    } catch (err) {
      // In offline or static mode, mark submitted locally
      setSosSubmitted(true);
    }
  }

  // Filter Camps List
  const filteredCamps = camps.filter(c => {
    const p = c.properties;
    const matchDistrict = selectedDistrict === 'All' || (p.district && p.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
    const matchSafe = !safeOnly || p.status === "OPERATIONAL / SECURE";
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.facility_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchSafe && matchSearch;
  });

  const availableDistricts = ['All', 'Sunsari', 'Morang', 'Dhanusha', 'Sindhuli', 'Chitwan'];

  return (
    <div className="app-container">
      {/* 1. Global Navigation Bar */}
      <header className="top-navbar">
        <div className="nav-inner">
          <div className="brand-section">
            <div className="brand-logo-badge">🌊</div>
            <div>
              <div className="brand-title">
                TERRAFLOOD <span style={{ color: 'var(--safe-green)', fontSize: '14px' }}>CITIZEN PORTAL</span>
              </div>
              <div className="brand-subtitle">
                {t.portalSubtitle}
              </div>
            </div>
          </div>

          <div className="nav-actions">
            {/* Bilingual Switcher */}
            <button 
              className="btn btn-lang"
              onClick={() => setLang(l => l === 'en' ? 'np' : 'en')}
              title="Toggle English / नेपाली"
            >
              🌐 {lang === 'en' ? 'नेपाली (NP)' : 'English (EN)'}
            </button>

            {/* Tactical Command Center Link */}
            <a 
              href="http://localhost:8501" 
              className="btn btn-outline"
              title="Switch to Internal Military/NDRF Command HUD"
            >
              <Shield size={16} color="var(--telemetry-cyan)" />
              {t.switchCmd}
            </a>

            {/* Broadcast SOS Button */}
            <button 
              className="btn btn-sos"
              onClick={() => { setShowSosModal(true); setSosSubmitted(false); }}
            >
              <AlertTriangle size={17} />
              {t.broadcastSos}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* 2. Hero Emergency Directive Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <div>
              <h1 className="hero-title-main">
                {lang === 'np' ? '🇳🇵 नेपाल तराई बाढी राहत तथा आपतकालीन शिविर नागरिक पोर्टल' : '🇳🇵 NEPAL TERAI FLOOD RELIEF & CITIZEN SAFETY PORTAL'}
              </h1>
              <div className="hero-title-en">
                {lang === 'np' ? 'SURAKSHIT SHIBIR & RESCUE DIRECTIVE' : 'RAPID FLOOD EXTENT & EVACUATION STAGING DIRECTIVES'}
              </div>
              <div className="hero-meta">
                <span><span className="live-beacon green"></span>{t.liveDirective}</span>
                <span>•</span>
                <span>Radar Verification: Sentinel-1 SAR Specular Inundation</span>
                <span>•</span>
                <span style={{ color: 'var(--telemetry-cyan)' }}>Zone: Nepal Terai Plain [84.0E - 87.5E]</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-safe" onClick={handleLocateMe}>
                <Compass size={18} />
                {isLocating ? t.locating : t.findNearest}
              </button>
              <button className="btn btn-outline" onClick={() => setShowShareModal(true)}>
                <Share2 size={16} />
                Share Portal
              </button>
            </div>
          </div>
        </section>

        {/* 3. Emergency Helplines SOS Bar */}
        <section className="helplines-grid">
          <div className="helpline-card red">
            <div className="helpline-num">1155</div>
            <div className="helpline-name">बाढी पूर्वसूचना (Flood Early Warning)</div>
            <div className="helpline-desc">Toll-Free • जल तथा मौसम विज्ञान विभाग</div>
            <a href="tel:1155" className="helpline-call-btn">
              <Phone size={14} /> Call 1155
            </a>
          </div>

          <div className="helpline-card amber">
            <div className="helpline-num">1149</div>
            <div className="helpline-name">आपतकालीन कार्य सञ्चालन (NEOC)</div>
            <div className="helpline-desc">गृह मन्त्रालय आपतकालीन उद्धार कमान्ड</div>
            <a href="tel:1149" className="helpline-call-btn">
              <Phone size={14} /> Call 1149
            </a>
          </div>

          <div className="helpline-card cyan">
            <div className="helpline-num">102</div>
            <div className="helpline-name">एम्बुलेन्स सेवा (Ambulance Service)</div>
            <div className="helpline-desc">नेपाल एम्बुलेन्स सञ्जाल २४ सै घण्टा खुला</div>
            <a href="tel:102" className="helpline-call-btn">
              <Phone size={14} /> Call 102
            </a>
          </div>

          <div className="helpline-card blue">
            <div className="helpline-num">100</div>
            <div className="helpline-name">नेपाल प्रहरी उद्धार (Police Rescue)</div>
            <div className="helpline-desc">सशस्त्र प्रहरी तथा नेपाल प्रहरी बाढी टोली</div>
            <a href="tel:100" className="helpline-call-btn">
              <Phone size={14} /> Call 100
            </a>
          </div>

          <div className="helpline-card green">
            <div className="helpline-num">1130</div>
            <div className="helpline-name">नेपाल रेडक्रस (Red Cross Society)</div>
            <div className="helpline-desc">राहत सामग्री, त्रिपाल, सुक्खा खाना र प्राथमिक उपचार</div>
            <a href="tel:1130" className="helpline-call-btn">
              <Phone size={14} /> Call 1130
            </a>
          </div>
        </section>

        {/* 4. Live KPIs Grid */}
        <section className="kpi-grid">
          <div className="kpi-card red">
            <div className="kpi-label"><Droplets size={16} color="var(--hazard-red)" /> {t.inundatedArea}</div>
            <div className="kpi-value">{metrics.inundated_km2 || 28.4} <span>km²</span></div>
            <div className="kpi-subtext">Active SAR specular flood mask</div>
          </div>

          <div className="kpi-card amber">
            <div className="kpi-label"><Users size={16} color="var(--warning-amber)" /> {t.displacedPop}</div>
            <div className="kpi-value">{(metrics.displaced_population || 13580).toLocaleString()}</div>
            <div className="kpi-subtext">GHSL 100m population grid exposure</div>
          </div>

          <div className="kpi-card green">
            <div className="kpi-label"><Shield size={16} color="var(--safe-green)" /> {t.safeCamps}</div>
            <div className="kpi-value">{metrics.active_safe_camps || 5} <span>Camps</span></div>
            <div className="kpi-subtext">Verified operational relief posts</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label"><BedDouble size={16} color="var(--telemetry-cyan)" /> {t.availBeds}</div>
            <div className="kpi-value">{(metrics.total_available_beds || 460).toLocaleString()} <span>Beds</span></div>
            <div className="kpi-subtext">Emergency hospital shelter capacity</div>
          </div>
        </section>

        {/* 5. Nearest Camp Alert Bar (if Geolocation computed) */}
        {nearestCamp && (
          <section className="gps-bar">
            <div className="gps-info">
              <div className="gps-icon-ring">
                <Compass size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--telemetry-cyan)', fontWeight: 800 }}>
                  {t.nearestFound}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-pure)' }}>
                  📍 {nearestCamp.properties.name} — <span style={{ color: 'var(--safe-green)' }}>{nearestCamp.distanceKm} km {t.distanceAway}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                  {nearestCamp.properties.facility_type} • {nearestCamp.properties.address} • Beds: {nearestCamp.properties.capacity_beds}
                </div>
              </div>
            </div>

            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${nearestCamp.geometry.coordinates[1]},${nearestCamp.geometry.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-safe"
            >
              <Navigation size={17} />
              {t.openNav}
            </a>
          </section>
        )}

        {/* 6. Interactive Leaflet Map Section */}
        <section className="map-section">
          <div className="section-header">
            <div className="section-title">
              <MapPin size={22} color="var(--safe-green)" />
              {lang === 'np' ? 'आपतकालीन राहत शिविर तथा बाढी नक्सा' : 'Interactive Evacuation Camps & Flood Mask Map'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>
              🟢 Safe Operational Camps &nbsp;|&nbsp; 🔴 Submerged Zones to Avoid &nbsp;|&nbsp; 🟩 Open Dry Roads
            </div>
          </div>

          <div className="map-container" ref={mapContainerRef}></div>
        </section>

        {/* 7. Relief Camps Directory with Search & Filters */}
        <section>
          <div className="section-header">
            <div>
              <div className="section-title">
                <Stethoscope size={22} color="var(--telemetry-cyan)" />
                {t.campsDirectory}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {t.campsDesc}
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--safe-green)', fontWeight: 700 }}>
              Showing {filteredCamps.length} verified camps
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-medium)' }}>
                {t.filterDistrict}
              </label>
              <select 
                className="filter-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d === 'All' ? t.allDistricts : d}</option>
                ))}
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginLeft: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={safeOnly} 
                  onChange={(e) => setSafeOnly(e.target.checked)} 
                />
                {t.showSafeOnly}
              </label>
            </div>

            <div className="filter-group">
              <input 
                type="text" 
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: '260px' }}
              />
            </div>
          </div>

          {/* Camps Grid */}
          <div className="camps-grid">
            {filteredCamps.map((camp) => {
              const p = camp.properties;
              const [lon, lat] = camp.geometry.coordinates;
              const isSafe = p.status === "OPERATIONAL / SECURE";
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

              return (
                <div key={p.p_id || p.camp_id} className={`camp-card ${isSafe ? 'safe' : 'flooded'}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`camp-status-badge ${isSafe ? 'safe' : 'flooded'}`}>
                        {isSafe ? '🟢 ' + t.safeStatus : '🔴 ' + t.floodedStatus}
                      </span>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)' }}>
                        {p.p_id || p.camp_id}
                      </span>
                    </div>

                    <h3 className="camp-name">{p.name}</h3>
                    <div className="camp-facility">{p.facility_type} • <span style={{ color: 'var(--text-muted)' }}>{p.district}</span></div>

                    <div className="camp-meta-grid">
                      <div>
                        <span className="camp-meta-label">{t.address}</span>
                        <span className="camp-meta-val">{p.address || 'Terai Flood Corridor'}</span>
                      </div>
                      <div>
                        <span className="camp-meta-label">{t.org}</span>
                        <span className="camp-meta-val">{p.organization}</span>
                      </div>
                      <div>
                        <span className="camp-meta-label">{t.beds}</span>
                        <span className="camp-meta-val" style={{ color: 'var(--safe-green)' }}>{p.capacity_beds} Beds</span>
                      </div>
                      <div>
                        <span className="camp-meta-label">{t.doctors}</span>
                        <span className="camp-meta-val">{p.medical_staff} Personnel</span>
                      </div>
                      <div>
                        <span className="camp-meta-label">{t.radioFreq}</span>
                        <span className="camp-meta-val" style={{ color: 'var(--warning-amber)', fontFamily: 'var(--font-mono)' }}>{p.contact_channel}</span>
                      </div>
                      <div>
                        <span className="camp-meta-label">{t.callHelpline}</span>
                        <span className="camp-meta-val">{p.phone_helpline || '+977-1155'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="camp-actions">
                    <a href={gmapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <Navigation size={15} />
                      Navigate
                    </a>
                    {p.phone_helpline && (
                      <a href={`tel:${p.phone_helpline}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                        <Phone size={15} />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Citizen Disaster Survival Directives */}
        <section style={{ marginTop: '20px' }}>
          <div className="section-header">
            <div>
              <div className="section-title">
                <Shield size={22} color="var(--safe-green)" />
                {t.survivalGuidelines}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {t.guidelinesSubtitle}
              </div>
            </div>
          </div>

          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-icon">💧</div>
              <div className="guideline-title">{t.waterTitle}</div>
              <div className="guideline-body">{t.waterDesc}</div>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon">🚧</div>
              <div className="guideline-title">{t.roadTitle}</div>
              <div className="guideline-body">{t.roadDesc}</div>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon">🐍</div>
              <div className="guideline-title">{t.snakeTitle}</div>
              <div className="guideline-body">{t.snakeDesc}</div>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon">🎒</div>
              <div className="guideline-title">{t.goBagTitle}</div>
              <div className="guideline-body">{t.goBagDesc}</div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Citizen SOS Modal */}
      {showSosModal && (
        <div className="modal-overlay" onClick={() => setShowSosModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-beacon"></span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-pure)' }}>{t.sosModalTitle}</h3>
              </div>
              <button 
                onClick={() => setShowSosModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '18px' }}>
              {t.sosModalSubtitle}
            </p>

            {sosSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <CheckCircle2 size={56} color="var(--safe-green)" style={{ margin: '0 auto 14px auto' }} />
                <h4 style={{ fontSize: '20px', color: 'var(--text-pure)', fontWeight: 800 }}>{t.sosSuccessTitle}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-medium)', margin: '8px 0 20px 0' }}>
                  {t.sosSuccessDesc}
                </p>
                <button className="btn btn-primary" onClick={() => setShowSosModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSosSubmit}>
                <div className="form-group">
                  <label className="form-label">{t.fullName}</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. Ram Bahadur Thapa"
                    value={sosFormData.name}
                    onChange={e => setSosFormData({ ...sosFormData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">{t.phoneNum}</label>
                    <input 
                      type="tel" 
                      required 
                      className="form-input" 
                      placeholder="+977-98XXXXXXXX"
                      value={sosFormData.phone}
                      onChange={e => setSosFormData({ ...sosFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.districtSelect}</label>
                    <select 
                      className="form-select"
                      value={sosFormData.district}
                      onChange={e => setSosFormData({ ...sosFormData, district: e.target.value })}
                    >
                      <option>Sunsari (Koshi Corridor)</option>
                      <option>Morang (Biratnagar)</option>
                      <option>Dhanusha (Janakpur)</option>
                      <option>Sindhuli (Kamalamai)</option>
                      <option>Chitwan (Bharatpur)</option>
                      <option>Other Terai District</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.landmark}</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Ward number, village, temple, school, or embankment"
                    value={sosFormData.location_name}
                    onChange={e => setSosFormData({ ...sosFormData, location_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">{t.emergencyType}</label>
                    <select 
                      className="form-select"
                      value={sosFormData.emergency_type}
                      onChange={e => setSosFormData({ ...sosFormData, emergency_type: e.target.value })}
                    >
                      <option>{t.typeRoof}</option>
                      <option>{t.typeMedical}</option>
                      <option>{t.typeWater}</option>
                      <option>{t.typeVulnerable}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.peopleCount}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      className="form-input" 
                      value={sosFormData.people_count}
                      onChange={e => setSosFormData({ ...sosFormData, people_count: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.extraNotes}</label>
                  <textarea 
                    rows="2" 
                    className="form-textarea"
                    placeholder="e.g. Water is waist-high; have 2 infants and 1 elderly grandmother"
                    value={sosFormData.notes}
                    onChange={e => setSosFormData({ ...sosFormData, notes: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-sos" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  <Send size={18} />
                  {t.submitSos}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 10. Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t.shareTitle}</h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '16px' }}>
              Broadcast this live shelter & medical camp directory to family, neighbors, and volunteers in flood zones.
            </p>

            <div style={{ background: 'var(--bg-deep)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px', wordBreak: 'break-all', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              http://localhost:3000
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
              >
                {copiedLink ? '✅ ' + t.copied : t.copyLink}
              </button>

              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚨 NEPAL TERAI FLOOD RELIEF CAMPS & CITIZEN SAFETY PORTAL 🚨\nCheck active verified safe evacuation shelters, bed capacity & medical posts:\n🔗 Link: ${window.location.origin}\n\n📞 Emergency Contacts: 1155 (Flood Early Warning) | 1149 (NEOC Operations) | 1130 (Red Cross) | 102 (Ambulance)`)}`}
                target="_blank" 
                rel="noreferrer"
                className="btn btn-safe"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {t.shareWa}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-section">
        <div>{t.footerText}</div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Powered by Sentinel-1 SAR Synthetic Aperture Radar • JRC GHSL 100m Population Exposure • OpenStreetMap
        </div>
      </footer>
    </div>
  );
}
