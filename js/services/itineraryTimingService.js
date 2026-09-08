// AURICVYOM Advanced Itinerary Timing & Location Service
// Comprehensive Indian landmark operating hours, duration calculators, and smart scheduling logic

export const TIME_PERIOD_PRESETS = [
  { id: "sunrise", label: "🌅 Sunrise / Dawn", start: "06:00", end: "08:30", desc: "Crisp air, golden light, minimal crowds" },
  { id: "morning", label: "☕ Morning Exploration", start: "09:00", end: "12:00", desc: "Ideal for palace museums, monuments & heritage walks" },
  { id: "lunch", label: "🍽️ Lunch & Leisure", start: "12:30", end: "14:30", desc: "Fine dining, royal thalis & indoor pavilions" },
  { id: "afternoon", label: "🏛️ Afternoon Heritage", start: "15:00", end: "17:00", desc: "Bazaars, stepwells & artisan workshops" },
  { id: "sunset", label: "🌇 Golden Hour / Sunset", start: "17:30", end: "19:30", desc: "Hilltop forts, lake boat cruises & rooftop vistas" },
  { id: "evening", label: "✨ Evening & Dinner", start: "20:00", end: "22:30", desc: "Ganga aarti, illuminated monuments & candlelit courtyards" },
  { id: "night", label: "🌌 Night & Stargazing", start: "23:00", end: "00:30", desc: "Observatory dark skies, live sitar & nightcaps" }
];

export const DURATION_PRESETS = [
  { label: "+30m", minutes: 30 },
  { label: "+1h", minutes: 60 },
  { label: "+1.5h", minutes: 90 },
  { label: "+2h", minutes: 120 },
  { label: "+3h", minutes: 180 },
  { label: "Half Day (4h)", minutes: 240 },
  { label: "Full Day (6h)", minutes: 360 }
];

export const LANDMARK_TIMINGS = [
  // Jaipur / Rajasthan
  {
    name: "Amer Fort & Maota Lake",
    city: "Jaipur",
    state: "Rajasthan",
    category: "SIGHTSEEING",
    openHours: "08:00 AM – 05:30 PM | 06:30 PM – 09:15 PM (Night Tour)",
    recommendedDurationMinutes: 150,
    idealTimeOfDay: "Early Morning (08:00 – 10:30) or Sunset Night View",
    crowdPeak: "11:30 AM – 03:30 PM (High crowd)",
    transitBufferMins: 30,
    costEstimate: 500,
    tips: "Elephant/Jeep ride available up ramparts; Sheesh Mahal glass reflects best in morning light.",
    defaultStartTime: "08:30",
    defaultEndTime: "11:00",
    inclusions: ["Guide Recommended", "Photography Allowed", "Comfortable Footwear Needed"]
  },
  {
    name: "City Palace & Jantar Mantar",
    city: "Jaipur",
    state: "Rajasthan",
    category: "SIGHTSEEING",
    openHours: "09:30 AM – 05:00 PM | 07:00 PM – 10:00 PM (Light Show)",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Morning (09:30 – 11:30)",
    crowdPeak: "12:00 PM – 03:00 PM",
    transitBufferMins: 15,
    costEstimate: 700,
    tips: "Chandra Mahal royal private chambers require special access royal pass.",
    defaultStartTime: "09:30",
    defaultEndTime: "11:30",
    inclusions: ["Royal Quarters Access", "Guide Available"]
  },
  {
    name: "Hawa Mahal (Palace of Winds)",
    city: "Jaipur",
    state: "Rajasthan",
    category: "SIGHTSEEING",
    openHours: "09:00 AM – 04:30 PM",
    recommendedDurationMinutes: 60,
    idealTimeOfDay: "Sunrise / Early Morning (07:00 – 09:00)",
    crowdPeak: "11:00 AM – 02:00 PM",
    transitBufferMins: 15,
    costEstimate: 200,
    tips: "Best facade photography from opposite rooftop Wind View Cafe at dawn.",
    defaultStartTime: "09:00",
    defaultEndTime: "10:00",
    inclusions: ["Heritage Facade View", "Walking Tour"]
  },
  {
    name: "Nahargarh Fort Sunset Viewpoint",
    city: "Jaipur",
    state: "Rajasthan",
    category: "SIGHTSEEING",
    openHours: "10:00 AM – 05:30 PM | Sunset Deck Open till 10:00 PM",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Sunset & Twilight (17:30 – 19:30)",
    crowdPeak: "17:00 PM – 18:30 PM",
    transitBufferMins: 35,
    costEstimate: 300,
    tips: "Spectacular 360° panoramas over the Pink City as city streetlights flicker on.",
    defaultStartTime: "17:30",
    defaultEndTime: "19:30",
    inclusions: ["Sunset Vista", "Rooftop Cafe Access"]
  },
  {
    name: "Baradari Fine Dining at City Palace",
    city: "Jaipur",
    state: "Rajasthan",
    category: "DINING",
    openHours: "11:00 AM – 11:00 PM",
    recommendedDurationMinutes: 90,
    idealTimeOfDay: "Lunch (12:30 – 14:00) or Candlelit Dinner (20:00 – 22:00)",
    crowdPeak: "01:30 PM & 08:30 PM",
    transitBufferMins: 10,
    costEstimate: 2800,
    tips: "Contemporary Mewari & Continental dining set inside marble courtyard arches.",
    defaultStartTime: "20:00",
    defaultEndTime: "21:30",
    inclusions: ["Fine Dining", "Table Reservation Recommended"]
  },

  // Udaipur / Rajasthan
  {
    name: "City Palace Complex & Zenana Mahal",
    city: "Udaipur",
    state: "Rajasthan",
    category: "SIGHTSEEING",
    openHours: "09:00 AM – 05:30 PM",
    recommendedDurationMinutes: 150,
    idealTimeOfDay: "Morning (09:00 – 11:30)",
    crowdPeak: "12:00 PM – 03:00 PM",
    transitBufferMins: 20,
    costEstimate: 450,
    tips: "Extensive marble halls and crystal gallery overlooking Lake Pichola.",
    defaultStartTime: "09:30",
    defaultEndTime: "12:00",
    inclusions: ["Museum Entry", "Crystal Gallery Option"]
  },
  {
    name: "Private Lake Pichola Sunset Solar Cruise",
    city: "Udaipur",
    state: "Rajasthan",
    category: "ACTIVITY",
    openHours: "10:00 AM – 06:30 PM",
    recommendedDurationMinutes: 90,
    idealTimeOfDay: "Golden Hour (17:00 – 18:30)",
    crowdPeak: "17:00 PM (Sunset batch)",
    transitBufferMins: 15,
    costEstimate: 1200,
    tips: "Glides right alongside Taj Lake Palace and docks at Jag Mandir island palace.",
    defaultStartTime: "17:00",
    defaultEndTime: "18:30",
    inclusions: ["Private Boat Charter", "Jag Mandir Island Stopover"]
  },
  {
    name: "Bagore Ki Haveli Dharohar Folk Dance",
    city: "Udaipur",
    state: "Rajasthan",
    category: "ACTIVITY",
    openHours: "Show starts promptly at 07:00 PM & 08:00 PM",
    recommendedDurationMinutes: 75,
    idealTimeOfDay: "Evening (18:45 – 20:15)",
    crowdPeak: "19:00 PM",
    transitBufferMins: 15,
    costEstimate: 250,
    tips: "Arrive 20 mins early at Gangaur Ghat for front-row courtyard cushions.",
    defaultStartTime: "18:45",
    defaultEndTime: "20:15",
    inclusions: ["Dharohar Cultural Show", "Photography Pass Extra"]
  },
  {
    name: "Ambrai Waterfront Candlelit Dining",
    city: "Udaipur",
    state: "Rajasthan",
    category: "DINING",
    openHours: "12:00 PM – 03:30 PM | 07:00 PM – 11:00 PM",
    recommendedDurationMinutes: 100,
    idealTimeOfDay: "Dinner (20:00 – 22:00)",
    crowdPeak: "20:30 PM",
    transitBufferMins: 15,
    costEstimate: 3200,
    tips: "Unobstructed water-level view of glowing illuminated City Palace.",
    defaultStartTime: "20:00",
    defaultEndTime: "21:45",
    inclusions: ["Lakeside Table", "Advance Reservation Required"]
  },

  // Agra & Delhi
  {
    name: "Taj Mahal Monument of Love",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "SIGHTSEEING",
    openHours: "30 mins before sunrise to 30 mins before sunset (Closed Fridays)",
    recommendedDurationMinutes: 150,
    idealTimeOfDay: "Sunrise Gate Opening (05:45 – 08:30)",
    crowdPeak: "10:00 AM – 04:00 PM",
    transitBufferMins: 25,
    costEstimate: 1100,
    tips: "Closed Fridays for prayers. East Gate offers fastest security clearance at sunrise.",
    defaultStartTime: "06:00",
    defaultEndTime: "08:30",
    inclusions: ["Sunrise Pass", "Mausoleum Shoe Covers", "Guide Optional"]
  },
  {
    name: "Humayun's Tomb & Sunder Nursery",
    city: "New Delhi",
    state: "Delhi",
    category: "SIGHTSEEING",
    openHours: "06:00 AM – 06:00 PM",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Morning (08:30 – 11:00) or Late Afternoon (16:00 – 18:00)",
    crowdPeak: "01:00 PM – 04:00 PM",
    transitBufferMins: 20,
    costEstimate: 600,
    tips: "UNESCO precursor to Taj Mahal with sprawling Mughal water garden canals.",
    defaultStartTime: "09:00",
    defaultEndTime: "11:00",
    inclusions: ["Garden Heritage Walk", "Photography Friendly"]
  },
  {
    name: "Indian Accent Gourmet Dining",
    city: "New Delhi",
    state: "Delhi",
    category: "DINING",
    openHours: "12:00 PM – 02:30 PM | 07:00 PM – 10:30 PM",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Dinner (19:30 – 21:30)",
    crowdPeak: "20:00 PM",
    transitBufferMins: 25,
    costEstimate: 5000,
    tips: "Ranked among Asia's 50 Best Restaurants. Chef's 6-course tasting menu is legendary.",
    defaultStartTime: "19:30",
    defaultEndTime: "21:30",
    inclusions: ["Chef Tasting Menu", "Smart Casual Dress Code"]
  },

  // Hampi / Karnataka
  {
    name: "Vijaya Vittala Temple & Stone Chariot",
    city: "Hampi",
    state: "Karnataka",
    category: "SIGHTSEEING",
    openHours: "08:30 AM – 05:30 PM",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Dawn / Early Morning (08:30 – 10:30)",
    crowdPeak: "12:00 PM – 03:00 PM",
    transitBufferMins: 25,
    costEstimate: 500,
    tips: "Battery buggies run from parking; 56 musical acoustic pillars resonate with musical notes.",
    defaultStartTime: "08:30",
    defaultEndTime: "10:30",
    inclusions: ["Electric Buggy Ride", "Archaeological Guide"]
  },
  {
    name: "Tungabhadra Coracle Navigation",
    city: "Hampi",
    state: "Karnataka",
    category: "ACTIVITY",
    openHours: "06:30 AM – 06:00 PM",
    recommendedDurationMinutes: 75,
    idealTimeOfDay: "Sunset (17:00 – 18:30)",
    crowdPeak: "16:30 PM",
    transitBufferMins: 15,
    costEstimate: 800,
    tips: "Circular wicker boat gliding through granite river rapids past ancient carved shrines.",
    defaultStartTime: "17:00",
    defaultEndTime: "18:15",
    inclusions: ["Life Jackets", "Boatman Guide"]
  },

  // Varanasi / UP
  {
    name: "Dashashwamedh Ghat Maha Ganga Aarti",
    city: "Varanasi",
    state: "Uttar Pradesh",
    category: "ACTIVITY",
    openHours: "Aarti starts at 06:30 PM (Winter) / 07:00 PM (Summer)",
    recommendedDurationMinutes: 90,
    idealTimeOfDay: "Evening Dusk (18:00 – 19:30)",
    crowdPeak: "18:30 PM",
    transitBufferMins: 30,
    costEstimate: 400,
    tips: "Best witnessed from private wooden bajra boat anchored right in front of the priests.",
    defaultStartTime: "18:00",
    defaultEndTime: "19:30",
    inclusions: ["Private River Boat Seat", "Diyas Floating Offering"]
  },
  {
    name: "Sunrise Ghats Boat Cruise",
    city: "Varanasi",
    state: "Uttar Pradesh",
    category: "ACTIVITY",
    openHours: "05:30 AM – 08:30 AM",
    recommendedDurationMinutes: 100,
    idealTimeOfDay: "Dawn Sunrise (05:45 – 07:30)",
    crowdPeak: "06:30 AM",
    transitBufferMins: 15,
    costEstimate: 1200,
    tips: "Watch thousands bathing and morning prayers across Assi to Manikarnika Ghat.",
    defaultStartTime: "05:45",
    defaultEndTime: "07:30",
    inclusions: ["Hand-rowed Wooden Boat", "Tea on the Ganges"]
  },

  // Goa
  {
    name: "Fort Aguada & Lighthouse View",
    city: "Goa",
    state: "Goa",
    category: "SIGHTSEEING",
    openHours: "09:00 AM – 05:30 PM",
    recommendedDurationMinutes: 90,
    idealTimeOfDay: "Morning (09:00 – 10:30) or Sunset (16:30 – 18:00)",
    crowdPeak: "11:00 AM – 03:00 PM",
    transitBufferMins: 20,
    costEstimate: 100,
    tips: "17th-century Portuguese fortress overlooking the vast Arabian Sea and Mandovi estuary.",
    defaultStartTime: "16:30",
    defaultEndTime: "18:00",
    inclusions: ["Sea View Ramparts", "Lighthouse Access"]
  },
  {
    name: "Thalassa Greek Sunset Dining",
    city: "Siolim / Vagator",
    state: "Goa",
    category: "DINING",
    openHours: "09:00 AM – 01:00 AM",
    recommendedDurationMinutes: 120,
    idealTimeOfDay: "Sunset & Dinner (17:30 – 20:00)",
    crowdPeak: "18:00 PM (Sunset Rush)",
    transitBufferMins: 30,
    costEstimate: 3500,
    tips: "Iconic clifftop open-air cabanas with Greek fire dancers and Mediterranean seafood.",
    defaultStartTime: "17:30",
    defaultEndTime: "19:45",
    inclusions: ["Sunset Clifftop Table", "Live Entertainment"]
  },

  // Bengaluru / Karnataka
  {
    name: "Bangalore Palace & Royal Courtyard",
    city: "Bengaluru",
    state: "Karnataka",
    category: "SIGHTSEEING",
    openHours: "10:00 AM – 05:30 PM",
    recommendedDurationMinutes: 100,
    idealTimeOfDay: "Morning (10:00 – 12:00)",
    crowdPeak: "01:00 PM – 03:30 PM",
    transitBufferMins: 25,
    costEstimate: 450,
    tips: "Tudor-style castle built by Chamaraja Wadiyar with authentic audio headset tour.",
    defaultStartTime: "10:00",
    defaultEndTime: "11:45",
    inclusions: ["Audio Headset Tour", "Ballroom & Durbar Hall Access"]
  },
  {
    name: "Karavalli Coastal Fine Dining",
    city: "Bengaluru",
    state: "Karnataka",
    category: "DINING",
    openHours: "12:30 PM – 03:00 PM | 07:00 PM – 11:30 PM",
    recommendedDurationMinutes: 100,
    idealTimeOfDay: "Dinner (20:00 – 21:45)",
    crowdPeak: "20:30 PM",
    transitBufferMins: 20,
    costEstimate: 3600,
    tips: "Legendary coastal restaurant at Gateway Hotel with tiger prawns and appams.",
    defaultStartTime: "20:00",
    defaultEndTime: "21:45",
    inclusions: ["Heritage Courtyard Seating", "Wine Pairing"]
  }
];

/**
 * Calculates end time based on start time and duration in minutes
 * @param {string} startTime - HH:MM in 24h
 * @param {number} durationMinutes
 * @returns {string} HH:MM
 */
export function calculateEndTime(startTime, durationMinutes) {
  if (!startTime) return "12:00";
  const [h, m] = startTime.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "12:00";

  const totalMinutes = h * 60 + m + Number(durationMinutes || 60);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const newH = Math.floor(normalizedMinutes / 60);
  const newM = normalizedMinutes % 60;

  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Calculates formatted duration between start time and end time
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 * @returns {{ minutes: number, text: string, isValid: boolean, crossesMidnight: boolean }}
 */
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return { minutes: 0, text: "--", isValid: false, crossesMidnight: false };
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) {
    return { minutes: 0, text: "--", isValid: false, crossesMidnight: false };
  }

  const startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  let crossesMidnight = false;

  if (endMins < startMins) {
    endMins += 1440; // Next day
    crossesMidnight = true;
  }

  const diffMins = endMins - startMins;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  let text = "";
  if (hours > 0 && mins > 0) text = `${hours} hr${hours > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  else if (hours > 0) text = `${hours} hr${hours > 1 ? "s" : ""}`;
  else text = `${mins} mins`;

  if (crossesMidnight) text += " (next day)";

  return {
    minutes: diffMins,
    text,
    isValid: diffMins > 0,
    crossesMidnight
  };
}

/**
 * Formats a 24-hour time "14:30" to 12-hour "2:30 PM"
 * @param {string} time24
 * @returns {string}
 */
export function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time24;

  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Detects schedule overlap between proposed timing and existing activities for that day
 * @param {Array} itineraryItems
 * @param {number} dayNumber
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 * @param {string|null} ignoreItemId
 * @returns {{ hasConflict: boolean, conflictingItem: object|null, suggestedSlot: string|null }}
 */
export function checkTimelineConflict(itineraryItems = [], dayNumber = 1, startTime, endTime, ignoreItemId = null) {
  if (!startTime || !endTime || !Array.isArray(itineraryItems)) {
    return { hasConflict: false, conflictingItem: null, suggestedSlot: null };
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins < startMins) endMins += 1440;

  const dayItems = itineraryItems.filter(item => {
    if (item.id === ignoreItemId) return false;
    return Number(item.dayNumber) === Number(dayNumber) && item.startTime && item.endTime;
  });

  for (const item of dayItems) {
    const [ish, ism] = item.startTime.split(":").map(Number);
    const [ieh, iem] = item.endTime.split(":").map(Number);
    let itemStart = ish * 60 + ism;
    let itemEnd = ieh * 60 + iem;
    if (itemEnd < itemStart) itemEnd += 1440;

    // Overlap condition: startA < endB && endA > startB
    if (startMins < itemEnd && endMins > itemStart) {
      const suggestedStartMins = itemEnd + 15; // 15 min buffer
      const durationMins = endMins - startMins;
      const suggestedEndMins = suggestedStartMins + durationMins;

      const normStart = suggestedStartMins % 1440;
      const normEnd = suggestedEndMins % 1440;
      const sugSh = String(Math.floor(normStart / 60)).padStart(2, "0");
      const sugSm = String(normStart % 60).padStart(2, "0");
      const sugEh = String(Math.floor(normEnd / 60)).padStart(2, "0");
      const sugEm = String(normEnd % 60).padStart(2, "0");

      return {
        hasConflict: true,
        conflictingItem: item,
        suggestedSlot: `${sugSh}:${sugSm}`,
        suggestedEnd: `${sugEh}:${sugEm}`
      };
    }
  }

  return { hasConflict: false, conflictingItem: null, suggestedSlot: null };
}

/**
 * Searches landmarks matching a search query or destination filter
 * @param {string} query
 * @param {string|null} destinationFilter
 * @returns {Array}
 */
export function findMatchingLandmarks(query = "", destinationFilter = "") {
  const q = (query || "").toLowerCase().trim();
  const d = (destinationFilter || "").toLowerCase().trim();

  return LANDMARK_TIMINGS.filter(lm => {
    const matchQuery = !q || lm.name.toLowerCase().includes(q) || lm.city.toLowerCase().includes(q) || lm.state.toLowerCase().includes(q);
    const matchDest = !d || lm.city.toLowerCase().includes(d) || lm.state.toLowerCase().includes(d);
    return matchQuery && (q.length >= 1 || matchDest);
  }).slice(0, 8);
}
