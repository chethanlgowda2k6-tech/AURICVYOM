// AURICVYOM — BUDGET-TO-ITINERARY REVERSE TRIP PLANNING ENGINE
// Optimizes destinations, stays, and experiences within a target budget with component locking.

export interface LockedComponent {
  componentType: 'stay' | 'transport' | 'experience';
  id?: string;
  name: string;
  cost: number;
}

export interface BudgetPlannerInput {
  totalBudget: number; // in INR
  daysCount?: number;
  travelersCount?: number;
  travelStyle?: string;
  lockedComponents?: LockedComponent[];
  destination?: string;
}

export interface BudgetItineraryResult {
  title: string;
  planningMode: 'budget';
  destination: string;
  daysCount: number;
  travelersCount: number;
  travelStyle: string;
  targetBudget: number;
  estimatedTotal: number;
  remainingBudget: number;
  isWithinBudget: boolean;
  costBreakdown: {
    accommodation: number;
    transport: number;
    dining: number;
    experiences: number;
    taxesAndFees: number;
  };
  tradeDownHighlights: string[];
  lockedComponents: LockedComponent[];
  days: Array<{
    dayIndex: number;
    title: string;
    activities: Array<{ time: string; title: string; type: string; price: number; cost?: number; isLocked?: boolean }>;
  }>;
}

const FAMOUS_STAYS: Record<string, { stay: string; cost: number; canonicalName: string }> = {
  jaipur: { stay: 'Rambagh Palace — Heritage Deluxe Suite', cost: 48000, canonicalName: 'Jaipur' },
  udaipur: { stay: 'Taj Lake Palace — Floating Island Luxury Suite', cost: 68000, canonicalName: 'Udaipur' },
  goa: { stay: 'Taj Exotica Resort & Spa — Sea Facing Villa', cost: 42000, canonicalName: 'Goa' },
  coorg: { stay: 'The Tamara Coorg — Rainforest Estate Villa', cost: 26000, canonicalName: 'Coorg' },
  hampi: { stay: 'Evolve Back Kamalapura Palace — Nilaya Suite', cost: 32000, canonicalName: 'Hampi' },
  kashmir: { stay: 'The Khyber Himalayan Resort & Cedar Sanctuary', cost: 85000, canonicalName: 'Kashmir' },
  kerala: { stay: 'Kumarakom Lake Resort — Heritage Pool Villa', cost: 38000, canonicalName: 'Kerala' },
  agra: { stay: 'The Oberoi Amarvilas — Premier Taj View Suite', cost: 72000, canonicalName: 'Agra' },
  varanasi: { stay: 'BrijRama Palace — Heritage Riverview Chamber', cost: 34000, canonicalName: 'Varanasi' },
  ladakh: { stay: 'The Grand Dragon Ladakh — Himalayan Luxury Room', cost: 35000, canonicalName: 'Ladakh' },
  mysore: { stay: 'Lalitha Mahal Palace Hotel — Viceroy Suite', cost: 24000, canonicalName: 'Mysuru' },
  amritsar: { stay: 'Hyatt Regency Amritsar — Luxury Suite', cost: 18000, canonicalName: 'Amritsar' },
  jaisalmer: { stay: 'Suryagarh Jaisalmer — Thar Desert Fortress', cost: 36000, canonicalName: 'Jaisalmer' },
  rishikesh: { stay: 'Ananda in the Himalayas — Palace Wellness Estate', cost: 58000, canonicalName: 'Rishikesh' },
  andaman: { stay: 'Taj Exotica Resort & Spa Andamans', cost: 46000, canonicalName: 'Andaman' },
  munnar: { stay: 'Blanket Hotel & Spa — Valley View Luxury', cost: 22000, canonicalName: 'Munnar' },
  kabini: { stay: 'Evolve Back Kuruba Safari Lodge — Jacuzzi Hut', cost: 42000, canonicalName: 'Kabini' },
  pondicherry: { stay: 'Palais de Mahe — French Quarter Heritage', cost: 24000, canonicalName: 'Pondicherry' },
  bengaluru: { stay: 'The Leela Palace Bengaluru — Royal Premiere', cost: 32000, canonicalName: 'Bengaluru' },
  mumbai: { stay: 'The Taj Mahal Palace Mumbai — Luxury Grande', cost: 45000, canonicalName: 'Mumbai' },
};

class BudgetPlannerService {
  public planItineraryByBudget(input: BudgetPlannerInput): BudgetItineraryResult {
    const budget = Math.max(10000, input.totalBudget || 60000);
    
    // Auto-scale duration dynamically if daysCount is not explicitly specified
    let days = input.daysCount;
    if (!days) {
      if (budget < 40000) days = 2;
      else if (budget < 100000) days = 3;
      else if (budget < 180000) days = 4;
      else days = 5;
    }
    days = Math.max(1, Math.min(14, days));
    const travelers = Math.max(1, input.travelersCount || 2);
    const style = input.travelStyle || 'Royal Heritage & Palaces';
    const locked = input.lockedComponents || [];

    // Calculate fixed costs from locked components
    const lockedStay = locked.find(c => c.componentType === 'stay');
    const lockedTransport = locked.find(c => c.componentType === 'transport');
    const totalLockedCost = locked.reduce((sum, c) => sum + (c.cost || 0), 0);

    // Pick destination and stay
    let destination = 'Jaipur';
    let stayName = 'Rambagh Palace — The Jewel of Jaipur';
    let defaultNightlyStay = 45000;

    const reqDestKey = (input.destination || '').toLowerCase().trim();
    if (reqDestKey && reqDestKey !== 'auto') {
      const matchKey = Object.keys(FAMOUS_STAYS).find(k => reqDestKey.includes(k) || k.includes(reqDestKey));
      if (matchKey) {
        destination = FAMOUS_STAYS[matchKey].canonicalName;
        stayName = FAMOUS_STAYS[matchKey].stay;
        defaultNightlyStay = FAMOUS_STAYS[matchKey].cost;
      } else {
        destination = input.destination!;
        stayName = `${input.destination} Royal Sanctuary & Stays`;
      }
    } else {
      if (budget < 35000) {
        destination = 'Hampi';
        stayName = 'Heritage Boulder Sanctuary & Cottages';
        defaultNightlyStay = 14000;
      } else if (budget < 65000) {
        destination = 'Coorg';
        stayName = 'The Tamara Coorg — Rainforest Estate Villa';
        defaultNightlyStay = 26000;
      } else if (budget < 120000) {
        destination = 'Jaipur';
        stayName = 'Rambagh Palace — Heritage Deluxe Suite';
        defaultNightlyStay = 48000;
      } else if (budget < 220000) {
        destination = 'Udaipur';
        stayName = 'Taj Lake Palace — Floating Island Luxury Suite';
        defaultNightlyStay = 68000;
      } else {
        destination = 'Kashmir';
        stayName = 'The Khyber Himalayan Resort & Cedar Sanctuary';
        defaultNightlyStay = 85000;
      }
    }

    const tradeDownHighlights: string[] = [];

    // Budget allocation logic
    let remainingForDynamic = Math.max(0, budget - totalLockedCost);

    // Allocation ratios
    let accommodationBudget = lockedStay ? lockedStay.cost : Math.round(remainingForDynamic * 0.50);
    let transportBudget = lockedTransport ? lockedTransport.cost : Math.round(remainingForDynamic * 0.18);
    let diningBudget = Math.round(remainingForDynamic * 0.15);
    let experiencesBudget = Math.round(remainingForDynamic * 0.10);
    let taxesAndFees = Math.round(remainingForDynamic * 0.07);

    // Trade-down detection
    if (budget < (defaultNightlyStay * (days - 1) + 15000) && !lockedStay) {
      tradeDownHighlights.push(`Selected Heritage Deluxe Palatial Room instead of Grand Presidential Suite to maintain a luxurious ${days}-day duration within ₹${budget.toLocaleString('en-IN')}.`);
    }

    if (transportBudget < 8000 && !lockedTransport) {
      tradeDownHighlights.push(`Optimized chauffeur vehicle to an Executive Premium Sedan rather than Ultra-Luxury SUV to preserve dining & spa budget.`);
    }

    const calculatedTotal = accommodationBudget + transportBudget + diningBudget + experiencesBudget + taxesAndFees;
    const remainingBalance = budget - calculatedTotal;

    // Build day-by-day itinerary
    const itineraryDays = [];
    for (let d = 1; d <= days; d++) {
      if (d === 1) {
        itineraryDays.push({
          dayIndex: 1,
          title: `Royal Arrival in ${destination} & Palatial Welcome`,
          activities: [
            { time: '10:00 AM', title: `Chauffeur Airport Transfer to ${lockedStay ? lockedStay.name : stayName}`, type: 'transport', price: Math.round(transportBudget * 0.4), cost: Math.round(transportBudget * 0.4), isLocked: !!lockedTransport },
            { time: '01:00 PM', title: `Sanctuary Check-in & Royal High Tea`, type: 'stay', price: Math.round(accommodationBudget / days), cost: Math.round(accommodationBudget / days), isLocked: !!lockedStay },
            { time: '05:30 PM', title: `Private Sunset Heritage Historian Walk`, type: 'activity', price: Math.round(experiencesBudget * 0.3), cost: Math.round(experiencesBudget * 0.3) },
          ]
        });
      } else if (d === days) {
        itineraryDays.push({
          dayIndex: d,
          title: `Farewell Sanctuary Rejuvenation & Departure`,
          activities: [
            { time: '09:30 AM', title: `Ayurvedic Spa Morning Rejuvenation & Breakfast`, type: 'activity', price: Math.round(experiencesBudget * 0.4), cost: Math.round(experiencesBudget * 0.4) },
            { time: '01:00 PM', title: `Curated Farewell Banquet Lunch`, type: 'dining', price: Math.round(diningBudget * 0.4), cost: Math.round(diningBudget * 0.4) },
            { time: '04:00 PM', title: `Chauffeur Airport Escort with Souvenir Box`, type: 'transport', price: Math.round(transportBudget * 0.3), cost: Math.round(transportBudget * 0.3), isLocked: !!lockedTransport },
          ]
        });
      } else {
        itineraryDays.push({
          dayIndex: d,
          title: `Immersive Heritage Discovery & Royal Gastronomy`,
          activities: [
            { time: '09:30 AM', title: `Curated Landmark Excursion & Palace Curator Walk`, type: 'activity', price: Math.round(experiencesBudget * 0.3), cost: Math.round(experiencesBudget * 0.3) },
            { time: '01:30 PM', title: `Chef's Table Signature Regional Feast`, type: 'dining', price: Math.round(diningBudget * 0.3), cost: Math.round(diningBudget * 0.3) },
            { time: '06:00 PM', title: `Sunset Classical Sitar & Cocktail Lounge in Palace Courtyard`, type: 'activity', price: Math.round(experiencesBudget * 0.3), cost: Math.round(experiencesBudget * 0.3) },
          ]
        });
      }
    }

    return {
      title: `${days}-Day ${style} in ${destination} (Budget-Optimized)`,
      planningMode: 'budget',
      destination,
      daysCount: days,
      travelersCount: travelers,
      travelStyle: style,
      targetBudget: budget,
      estimatedTotal: calculatedTotal,
      remainingBudget: remainingBalance,
      isWithinBudget: calculatedTotal <= budget,
      costBreakdown: {
        accommodation: accommodationBudget,
        transport: transportBudget,
        dining: diningBudget,
        experiences: experiencesBudget,
        taxesAndFees: taxesAndFees,
      },
      tradeDownHighlights: tradeDownHighlights.length > 0 ? tradeDownHighlights : ['Balanced luxury package operating strictly within your defined spending limits.'],
      lockedComponents: locked,
      days: itineraryDays,
    };
  }
}

export const budgetPlannerService = new BudgetPlannerService();
