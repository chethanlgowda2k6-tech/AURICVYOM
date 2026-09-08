// AURICVYOM — PROACTIVE DISRUPTION MONITORING & REBUILD MY TRIP SERVICE
import { emailService } from './email.service';
import { smsService } from './sms.service';

export interface DisruptionAlert {
  type: 'WEATHER_WARNING' | 'FLIGHT_DELAY' | 'FLIGHT_CANCELLED' | 'ROAD_CLOSURE';
  severity: 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  affectedDayIndex: number;
  destination: string;
  recommendedAction: string;
}

export interface ItineraryRevision {
  revisionId: string;
  tripId: string;
  trigger: string;
  disruptionSummary: string;
  createdAt: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  beforePlan: {
    daysCount: number;
    destination: string;
    estimatedTotal: number;
    days: Array<{
      dayIndex: number;
      title: string;
      activities: Array<{ time: string; title: string; type: string; price: number }>;
    }>;
  };
  revisedPlan: {
    daysCount: number;
    destination: string;
    estimatedTotal: number;
    substitutionsCount: number;
    days: Array<{
      dayIndex: number;
      title: string;
      activities: Array<{ time: string; title: string; type: string; price: number; isSubstituted?: boolean }>;
    }>;
  };
}

// In-memory revision history store (keyed by tripId)
const revisionStore = new Map<string, ItineraryRevision[]>();

class DisruptionRebuildService {
  // Check for disruptions for a given trip/destination
  public detectDisruptions(destination: string, tripDates?: { start: string; end: string }): DisruptionAlert[] {
    const dest = destination.toLowerCase();
    const alerts: DisruptionAlert[] = [];

    if (dest.includes('udaipur') || dest.includes('rajasthan')) {
      alerts.push({
        type: 'WEATHER_WARNING',
        severity: 'HIGH',
        title: 'Severe Monsoon & Lake Pichola High Tide Warning',
        description: 'Heavy precipitation and gusty winds predicted on Day 2 in Udaipur. Outdoor lake boat excursions are temporarily suspended.',
        affectedDayIndex: 2,
        destination: 'Udaipur',
        recommendedAction: 'Re-sequence outdoor lake cruise with indoor City Palace Museum curator walk, royal crystal gallery, and private palace candlelight dining.',
      });
    } else if (dest.includes('shimla') || dest.includes('manali') || dest.includes('himachal')) {
      alerts.push({
        type: 'ROAD_CLOSURE',
        severity: 'HIGH',
        title: 'Hill Pass Maintenance & Heavy Fog Advisory',
        description: 'Morning ridge highway transit delayed due to dense mountain mist on Day 1.',
        affectedDayIndex: 1,
        destination: 'Shimla',
        recommendedAction: 'Shift scenic ridge drive to afternoon; enjoy morning cedar forest heritage spa session and estate tea tasting.',
      });
    } else if (dest.includes('goa')) {
      alerts.push({
        type: 'FLIGHT_DELAY',
        severity: 'MEDIUM',
        title: 'Goa Dabolim Airport Inbound Flight Delay (+3h)',
        description: 'Scheduled arrival delayed by 3 hours due to air traffic holding.',
        affectedDayIndex: 1,
        destination: 'Goa',
        recommendedAction: 'Reschedule private yacht charter to Day 2 sunset; arrange expedited VIP lounge check-in and private plunge pool relaxation upon arrival.',
      });
    } else {
      // General weather alert for testing / fallback
      alerts.push({
        type: 'WEATHER_WARNING',
        severity: 'MEDIUM',
        title: `Heavy Rain Alert for ${destination}`,
        description: `Unseasonal rain forecast on Day 2 in ${destination}. Outdoor activities may be disrupted.`,
        affectedDayIndex: 2,
        destination,
        recommendedAction: 'Swap open-air excursions for indoor heritage museums and royal gastronomy.',
      });
    }

    return alerts;
  }

  // Generate a proactive revised itinerary with before/after comparison
  public async generateRebuildPlan(tripData: any, customTrigger?: string): Promise<ItineraryRevision> {
    const tripId = tripData.id || `trip_${Date.now()}`;
    const destination = tripData.destination || 'Udaipur';
    const alerts = this.detectDisruptions(destination);
    const primaryAlert = alerts[0];
    const trigger = customTrigger || primaryAlert?.title || 'User Requested Proactive Rebuild';

    const beforeDays = tripData.days || [
      {
        dayIndex: 1,
        title: 'Royal Arrival & Heritage Welcome',
        activities: [
          { time: '10:00 AM', title: `Private Chauffeur Airport Escort to ${destination} Sanctuary`, type: 'transport', price: 4500 },
          { time: '01:00 PM', title: 'Curated Palatial Check-in & High Tea', type: 'stay', price: 28500 },
          { time: '05:30 PM', title: 'Sunset Private Guided Heritage Walk', type: 'activity', price: 3500 },
        ]
      },
      {
        dayIndex: 2,
        title: 'Outdoor Lake Excursions & Open-Air Markets',
        activities: [
          { time: '09:00 AM', title: 'Open-Air Boat Cruise across Lake Waters', type: 'activity', price: 5000 },
          { time: '01:30 PM', title: 'Street Gastronomy & Rooftop Dining', type: 'dining', price: 3500 },
          { time: '05:00 PM', title: 'Outdoor Sunset Hill Hike & Photography', type: 'activity', price: 4000 },
        ]
      },
      {
        dayIndex: 3,
        title: 'Palace Splendor & Farewell Gala',
        activities: [
          { time: '10:00 AM', title: 'Private Royal Palace & Crystal Gallery Tour', type: 'activity', price: 6000 },
          { time: '07:00 PM', title: 'Candlelight Royal Courtyard Farewell Banquet', type: 'dining', price: 8500 },
        ]
      }
    ];

    // Build revised plan by substituting outdoor activities on affected day with curated indoor luxury alternatives
    let substitutionsCount = 0;
    const revisedDays = beforeDays.map((day: any) => {
      if (day.dayIndex === (primaryAlert?.affectedDayIndex || 2)) {
        substitutionsCount += 3;
        return {
          dayIndex: day.dayIndex,
          title: 'Indoor Palatial Sanctuaries & Curated Culinary Immersion',
          activities: [
            { time: '09:30 AM', title: 'Private Curator Tour of Royal City Palace Museum & Crystal Gallery', type: 'activity', price: 5500, isSubstituted: true },
            { time: '01:30 PM', title: 'Michelin-Curated 7-Course Royal Rajput Thali & Wine Pairing', type: 'dining', price: 6000, isSubstituted: true },
            { time: '04:30 PM', title: 'Jiva Grande Spa 90-Min Ayurvedic Rejuvenation & Aromatherapy', type: 'activity', price: 8500, isSubstituted: true },
          ]
        };
      }
      return { ...day };
    });

    const revision: ItineraryRevision = {
      revisionId: `rev_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      tripId,
      trigger,
      disruptionSummary: primaryAlert ? `${primaryAlert.title}: ${primaryAlert.description}` : 'AI optimized itinerary for maximum comfort and weather safety.',
      createdAt: new Date().toISOString(),
      status: 'PROPOSED',
      beforePlan: {
        daysCount: tripData.daysCount || 3,
        destination,
        estimatedTotal: tripData.estimatedTotal || 65000,
        days: beforeDays,
      },
      revisedPlan: {
        daysCount: tripData.daysCount || 3,
        destination,
        estimatedTotal: 68500,
        substitutionsCount,
        days: revisedDays,
      }
    };

    // Save to revision history store
    const existing = revisionStore.get(tripId) || [];
    existing.unshift(revision);
    revisionStore.set(tripId, existing);

    return revision;
  }

  // Confirm and execute the revision upon explicit user approval
  public confirmRevision(tripId: string, revisionId: string): { success: boolean; revision: ItineraryRevision | null; message: string } {
    const history = revisionStore.get(tripId);
    if (!history) {
      return { success: false, revision: null, message: 'No revision history found for this trip.' };
    }

    const revision = history.find(r => r.revisionId === revisionId);
    if (!revision) {
      return { success: false, revision: null, message: 'Revision ID not found.' };
    }

    revision.status = 'ACCEPTED';

    return {
      success: true,
      revision,
      message: 'Revised itinerary has been successfully approved and applied to your booking.'
    };
  }

  // Retrieve full revision history
  public getHistory(tripId: string): ItineraryRevision[] {
    return revisionStore.get(tripId) || [];
  }

  // Notify user via Email and SMS with before/after revision summary
  public async notifyUserOfDisruption(user: { email: string; phone?: string; name: string }, revision: ItineraryRevision) {
    const subject = `⚠️ Important Travel Advisory & Revised Plan for Your ${revision.revisedPlan.destination} Escape`;
    const summary = `Your ${revision.revisedPlan.destination} trip had an advisory (${revision.disruptionSummary}). Nadia & AuricVyom AI have prepared a revised, weather-protected plan with ${revision.revisedPlan.substitutionsCount} seamless indoor luxury substitutions.`;

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a0e17; color: #f8fafc; padding: 32px; border: 1.5px solid #d4af37; border-radius: 12px;">
        <h2 style="color: #d4af37; margin-bottom: 8px;">👑 Proactive Trip Rebuild Advisory</h2>
        <p style="color: #cbd5e1; font-size: 15px;">Namaste ${user.name},</p>
        <p style="color: #f1f5f9; background: rgba(212,175,55,0.1); border-left: 3px solid #d4af37; padding: 12px; font-size: 14px;">
          <strong>Disruption Detected:</strong> ${revision.disruptionSummary}
        </p>
        <p style="color: #cbd5e1; font-size: 14px;">We've crafted a revised itinerary for you with <strong>${revision.revisedPlan.substitutionsCount} curated indoor substitutions</strong> to keep your experience extraordinary.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="http://localhost:3000/#planner?tripId=${revision.tripId}&revId=${revision.revisionId}" style="background: linear-gradient(135deg, #d4af37, #aa8010); color: #07090e; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 15px; display: inline-block;">
            ⚡ Review & Accept Revised Plan
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">No bookings or cancellations will occur without your explicit confirmation.</p>
      </div>
    `;

    // 1. Send simulated/real email
    await emailService.sendEmail({
      to: user.email,
      subject,
      text: summary,
      html: htmlBody,
    });

    // 2. Send simulated/real SMS
    if (user.phone) {
      const smsText = `AuricVyom: Travel advisory detected for your ${revision.revisedPlan.destination} stay. Nadia has prepared a revised plan. Review and accept: http://localhost:3000/#planner?tripId=${revision.tripId}`;
      await smsService.sendSMS({ to: user.phone, body: smsText });
    }
  }
}

export const disruptionRebuildService = new DisruptionRebuildService();

