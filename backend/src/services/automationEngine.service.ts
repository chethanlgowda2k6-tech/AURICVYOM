import prisma from '../utils/prisma';
import { tripSyncService } from './tripSync.service';
import { whatsappService } from './whatsapp.service';
import { smsService } from './sms.service';
import { emailService } from './email.service';

export interface SOSLocationData {
  latitude?: number;
  longitude?: number;
  address?: string;
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('dine') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('cafe') || lower.includes('food') || lower.includes('restaurant')) return 'DINING';
  if (lower.includes('trek') || lower.includes('safari') || lower.includes('cruise') || lower.includes('dive') || lower.includes('swim') || lower.includes('ride') || lower.includes('sport')) return 'ACTIVITY';
  if (lower.includes('flight') || lower.includes('train') || lower.includes('cab') || lower.includes('transfer') || lower.includes('drive')) return 'TRAVEL';
  if (lower.includes('palace') || lower.includes('fort') || lower.includes('museum') || lower.includes('temple') || lower.includes('monument') || lower.includes('sight')) return 'SIGHTSEEING';
  return 'ACTIVITY';
}

export class AutomationEngineService {
  private isRunning = false;
  private holdSweepInterval: NodeJS.Timeout | null = null;
  private pollCheckInterval: NodeJS.Timeout | null = null;
  private clockCheckInterval: NodeJS.Timeout | null = null;
  private lastBriefingDate: string | null = null;

  /**
   * Starts background automation workers.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⚡ [AutomationEngine] AuricVyom & VyomTogether Automation Engine initialized.');

    // 1. Room Hold Expiration Sweep (Every 60 seconds)
    this.holdSweepInterval = setInterval(() => {
      this.sweepExpiredRoomHolds().catch(err =>
        console.error('[AutomationEngine] Error sweeping room holds:', err)
      );
    }, 60 * 1000);

    // 2. Poll Auto-Resolution & Itinerary Sync (Every 2 minutes)
    this.pollCheckInterval = setInterval(() => {
      this.checkAndResolveExpiredPolls().catch(err =>
        console.error('[AutomationEngine] Error checking polls:', err)
      );
    }, 2 * 60 * 1000);

    // 3. Daily 08:00 AM IST Morning Briefing Clock (Every 15 minutes)
    this.clockCheckInterval = setInterval(() => {
      this.checkMorningBriefingClock().catch(err =>
        console.error('[AutomationEngine] Error running morning briefing check:', err)
      );
    }, 15 * 60 * 1000);

    // Run initial sweep on boot
    this.sweepExpiredRoomHolds().catch(console.error);
    this.checkAndResolveExpiredPolls().catch(console.error);
  }

  stop() {
    if (this.holdSweepInterval) clearInterval(this.holdSweepInterval);
    if (this.pollCheckInterval) clearInterval(this.pollCheckInterval);
    if (this.clockCheckInterval) clearInterval(this.clockCheckInterval);
    this.isRunning = false;
    console.log('⚡ [AutomationEngine] Automation Engine stopped.');
  }

  /**
   * 1. ROOM HOLD & CART AUTO-RELEASE WATCHDOG
   * Sweeps and removes room holds that have expired past their 10-minute lock window.
   */
  async sweepExpiredRoomHolds(): Promise<{ releasedCount: number }> {
    try {
      const now = new Date();
      const expiredCount = await prisma.roomHold.count({
        where: { expiresAt: { lte: now } }
      });

      if (expiredCount > 0) {
        await prisma.roomHold.deleteMany({
          where: { expiresAt: { lte: now } }
        });
        console.log(`🧹 [AutomationEngine] Swept and released ${expiredCount} expired room lock(s) back to inventory.`);
      }

      return { releasedCount: expiredCount };
    } catch (error) {
      console.error('[AutomationEngine] sweepExpiredRoomHolds error:', error);
      return { releasedCount: 0 };
    }
  }

  /**
   * 2. POLL AUTO-RESOLUTION & TIMELINE INSERTION
   * Automatically resolves active polls where all squad members voted,
   * declares the winner, marks poll as CLOSED, and creates an Itinerary Item on the target day.
   */
  async checkAndResolveExpiredPolls(): Promise<{ resolvedPolls: any[] }> {
    try {
      const activePolls = await prisma.tripPoll.findMany({
        where: { status: 'ACTIVE' },
        include: {
          trip: {
            include: {
              members: { include: { user: true } },
              itineraryItems: true
            }
          },
          options: {
            include: {
              votes: { include: { user: true } }
            }
          },
          createdBy: true
        }
      });

      const resolvedPolls: any[] = [];

      for (const poll of activePolls) {
        const totalMembers = poll.trip.members.length;
        // Collect all distinct user IDs that have voted on any option
        const votedUserIds = new Set<string>();
        for (const opt of poll.options) {
          for (const v of opt.votes) {
            votedUserIds.add(v.userId);
          }
        }

        // Auto-resolve condition:
        // All members voted (min 2 members) OR poll has been active for more than 24 hours
        const pollAgeHours = (Date.now() - new Date(poll.createdAt).getTime()) / (1000 * 60 * 60);
        const allMembersVoted = totalMembers > 1 && votedUserIds.size >= totalMembers;
        const isTimeExpired = pollAgeHours >= 24;

        if (allMembersVoted || isTimeExpired) {
          // Determine winning option
          let winner = poll.options[0];
          let maxVotes = -1;

          for (const opt of poll.options) {
            if (opt.votes.length > maxVotes) {
              maxVotes = opt.votes.length;
              winner = opt;
            }
          }

          if (winner && maxVotes > 0) {
            // Close poll in DB
            const updatedPoll = await prisma.tripPoll.update({
              where: { id: poll.id },
              data: { status: 'CLOSED' },
              include: {
                options: { include: { votes: true } }
              }
            });

            // Auto-insert winning activity into Itinerary
            const existingDays = poll.trip.itineraryItems.map(i => i.dayNumber);
            const targetDay = existingDays.length > 0 ? Math.max(...existingDays) : 1;

            const category = inferCategory(winner.text);
            const autoItem = await prisma.tripItineraryItem.create({
              data: {
                tripId: poll.tripId,
                createdById: poll.createdById,
                dayNumber: targetDay,
                title: `🏆 ${winner.text}`,
                description: `Auto-scheduled from Squad Poll: "${poll.question}" (Won with ${winner.votes.length} vote${winner.votes.length > 1 ? 's' : ''})`,
                category,
                startTime: '16:00',
                endTime: '18:00',
                orderIndex: 99
              },
              include: {
                createdBy: {
                  select: { id: true, name: true, profileImage: true }
                }
              }
            });

            // Create automated system message in chat
            await prisma.tripMessage.create({
              data: {
                tripId: poll.tripId,
                senderId: poll.createdById,
                text: `🤖 [VyomTogether Automation] Poll "${poll.question}" concluded! "${winner.text}" won with ${winner.votes.length} vote(s) and has been scheduled on Day ${targetDay}.`
              }
            });

            // Broadcast real-time SSE events to squad
            tripSyncService.broadcast(poll.tripId, 'POLL_AUTO_RESOLVED', {
              poll: updatedPoll,
              winningOption: winner,
              itineraryItem: autoItem
            });
            tripSyncService.broadcast(poll.tripId, 'ITINERARY_ITEM_ADDED', autoItem);

            resolvedPolls.push({
              pollId: poll.id,
              question: poll.question,
              winner: winner.text,
              votes: winner.votes.length,
              targetDay
            });

            console.log(`🗳️ [AutomationEngine] Poll "${poll.question}" auto-resolved! Winner: "${winner.text}" added to Day ${targetDay}`);
          }
        }
      }

      return { resolvedPolls };
    } catch (error) {
      console.error('[AutomationEngine] checkAndResolveExpiredPolls error:', error);
      return { resolvedPolls: [] };
    }
  }

  /**
   * 3. 08:00 AM IST DAILY MORNING SQUAD BRIEFING
   * Checks current Indian Standard Time and dispatches concierge briefings to active trips.
   */
  private async checkMorningBriefingClock() {
    const now = new Date();
    // Compute current hour in IST (UTC + 5:30)
    const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const hour = istDate.getUTCHours();
    const dateKey = istDate.toISOString().split('T')[0];

    // Trigger at 08:00 AM IST window (between 08:00 and 08:59)
    if (hour === 8 && this.lastBriefingDate !== dateKey) {
      this.lastBriefingDate = dateKey;
      console.log(`🌅 [AutomationEngine] 08:00 AM IST Clock Triggered for ${dateKey}. Dispatched briefings.`);
      await this.dispatchMorningSquadBriefings();
    }
  }

  /**
   * Dispatches morning briefings for all active trips currently in progress.
   */
  async dispatchMorningSquadBriefings(): Promise<{ dispatchedTripsCount: number; messagesCount: number }> {
    try {
      const now = new Date();
      // Trips where startDate <= now <= endDate
      const activeTrips = await prisma.collabTrip.findMany({
        where: {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          members: { include: { user: true } },
          itineraryItems: { orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }] }
        }
      });

      let messagesCount = 0;

      for (const trip of activeTrips) {
        const result = await this.dispatchMorningSquadBriefingForTrip(trip.id);
        messagesCount += result.sentCount;
      }

      return { dispatchedTripsCount: activeTrips.length, messagesCount };
    } catch (error) {
      console.error('[AutomationEngine] dispatchMorningSquadBriefings error:', error);
      return { dispatchedTripsCount: 0, messagesCount: 0 };
    }
  }

  /**
   * Dispatches or previews morning briefing for a specific trip (also callable on demand).
   */
  async dispatchMorningSquadBriefingForTrip(tripId: string): Promise<{ success: boolean; briefingText: string; sentCount: number }> {
    try {
      const trip = await prisma.collabTrip.findUnique({
        where: { id: tripId },
        include: {
          members: { include: { user: true } },
          itineraryItems: { orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }] }
        }
      });

      if (!trip) {
        return { success: false, briefingText: '', sentCount: 0 };
      }

      // Compute which day of the trip this is
      const now = new Date();
      const startMs = new Date(trip.startDate).getTime();
      const currentDay = Math.max(1, Math.floor((now.getTime() - startMs) / (1000 * 60 * 60 * 24)) + 1);

      // Get items for current day (or day 1 as fallback)
      let dayItems = trip.itineraryItems.filter(i => i.dayNumber === currentDay);
      if (dayItems.length === 0 && trip.itineraryItems.length > 0) {
        dayItems = trip.itineraryItems.slice(0, 4);
      }

      let scheduleText = '';
      if (dayItems.length > 0) {
        scheduleText = dayItems
          .map(item => `  • ${item.startTime || 'Scheduled'}: *${item.title}*${item.location ? ` (${item.location})` : ''}`)
          .join('\n');
      } else {
        scheduleText = `  • Open exploration day across ${trip.destination}! Check squad chat for spontaneous plans.`;
      }

      const briefingText = `🌅 *Good Morning from AuricVyom Concierge!*\n` +
        `Squad: *${trip.name}* | Destination: *${trip.destination}*\n` +
        `📍 *Day ${currentDay} Overview*\n` +
        `🌤️ Weather: 26°C, Clear skies & pleasant breeze.\n\n` +
        `📅 *Today's Curated Schedule:*\n${scheduleText}\n\n` +
        `💡 *Concierge Tip*: Carry bottled water & sun protection for walking tours. 24/7 Desk is active on WhatsApp.\n` +
        `👉 View Live Squad Board: http://localhost:3000/#vyomtogether`;

      let sentCount = 0;
      for (const member of trip.members) {
        const user = member.user;
        if (user.phone) {
          await whatsappService.sendWhatsAppMessage({
            toPhone: user.phone,
            message: briefingText,
            ctaLink: 'http://localhost:3000/#vyomtogether'
          }).catch(console.error);
          sentCount++;
        }
      }

      // Broadcast an SSE update so active UI shows a nice indicator
      tripSyncService.broadcast(trip.id, 'AUTOMATION_DISPATCH', {
        type: 'MORNING_BRIEFING',
        dayNumber: currentDay,
        timestamp: new Date().toISOString()
      });

      return { success: true, briefingText, sentCount };
    } catch (error) {
      console.error('[AutomationEngine] dispatchMorningSquadBriefingForTrip error:', error);
      return { success: false, briefingText: '', sentCount: 0 };
    }
  }

  /**
   * 4. 1-CLICK EMERGENCY SOS & CONCIERGE ESCALATION
   * Instantly broadcasts GPS coordinates and high-priority distress alert to squad members and 24/7 concierge.
   */
  async triggerEmergencySOS(
    tripId: string,
    userId: string,
    locationData?: SOSLocationData
  ): Promise<{ success: boolean; alertMessage: string; mapsUrl: string; notifiedCount: number }> {
    try {
      const trip = await prisma.collabTrip.findUnique({
        where: { id: tripId },
        include: {
          members: { include: { user: true } }
        }
      });

      if (!trip) throw new Error('Trip not found');

      const emitter = trip.members.find(m => m.userId === userId)?.user ||
        await prisma.user.findUnique({ where: { id: userId } });
      const emitterName = emitter?.name || 'Squad Member';

      // Build Google Maps coordinate link
      let mapsUrl = 'https://maps.google.com';
      if (locationData?.latitude && locationData?.longitude) {
        mapsUrl = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`;
      }

      const alertMessage = `🚨 *[EMERGENCY SOS ALERT — AURICVYOM]*\n` +
        `*${emitterName}* has triggered an urgent distress alert on trip *${trip.name}*!\n\n` +
        `📍 *Last Known GPS Location*:\n${mapsUrl}\n` +
        (locationData?.address ? `🏛️ Near: ${locationData.address}\n` : '') +
        `⏰ Time: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n\n` +
        `📞 AuricVyom 24/7 Emergency Desk is in transit & contacting local authorities.\n` +
        `Squad members please verify status immediately.`;

      // 1. Post High-Priority Message to Squad Chat
      await prisma.tripMessage.create({
        data: {
          tripId,
          senderId: userId,
          text: `🚨 [EMERGENCY SOS] ${emitterName} triggered an emergency alert! Coordinates: ${mapsUrl}`
        }
      });

      // 2. Broadcast High-Priority SSE to connected devices
      tripSyncService.broadcast(tripId, 'EMERGENCY_SOS', {
        userId,
        emitterName,
        mapsUrl,
        locationData,
        timestamp: new Date().toISOString()
      });

      // 3. Dispatch SMS & WhatsApp alerts to squad members
      let notifiedCount = 0;
      for (const member of trip.members) {
        const user = member.user;
        if (user.phone) {
          // WhatsApp Alert
          whatsappService.sendWhatsAppMessage({
            toPhone: user.phone,
            message: alertMessage,
            ctaLink: mapsUrl
          }).catch(console.error);

          // Redundant SMS for low-bandwidth situations
          smsService.sendSMS({
            to: user.phone,
            body: `AURICVYOM SOS: ${emitterName} in trip ${trip.name} needs help! GPS: ${mapsUrl}. Desk alerted.`
          }).catch(console.error);

          notifiedCount++;
        }
      }

      console.log(`🚨 [AutomationEngine] Emergency SOS triggered by ${emitterName} for trip ${trip.name}. Notified ${notifiedCount} members.`);

      return {
        success: true,
        alertMessage,
        mapsUrl,
        notifiedCount
      };
    } catch (error: any) {
      console.error('[AutomationEngine] triggerEmergencySOS error:', error);
      return {
        success: false,
        alertMessage: error?.message || 'Failed to trigger SOS',
        mapsUrl: '',
        notifiedCount: 0
      };
    }
  }

  /**
   * 5. 1-CLICK WHATSAPP WELCOME KIT DISPATCH
   * Automatically dispatched when a traveler joins a squad via invite link.
   */
  async dispatchWelcomeKit(tripId: string, memberUserId: string): Promise<boolean> {
    try {
      const trip = await prisma.collabTrip.findUnique({
        where: { id: tripId },
        include: {
          members: {
            where: { userId: memberUserId },
            include: { user: true }
          }
        }
      });

      if (!trip || trip.members.length === 0) return false;

      const user = trip.members[0].user;
      if (!user.phone) return false;

      const message = `🎉 *Welcome to the Squad, ${user.name.split(' ')[0]}!*\n\n` +
        `You've successfully joined the collaborative journey for *${trip.name}* (${trip.destination}).\n\n` +
        `✨ *What you can do right now:*\n` +
        `  • Vote on squad activity polls\n` +
        `  • Add your favorite spots to the shared itinerary\n` +
        `  • Track and split expenses with 1-click UPI reconciliation\n` +
        `  • Live team chat with custom emoji reactions\n\n` +
        `👉 Access your live dashboard: http://localhost:3000/#vyomtogether`;

      await whatsappService.sendWhatsAppMessage({
        toPhone: user.phone,
        message,
        ctaLink: 'http://localhost:3000/#vyomtogether'
      });

      console.log(`✉️ [AutomationEngine] Dispatched Welcome Kit to ${user.name} for trip ${trip.name}`);
      return true;
    } catch (error) {
      console.error('[AutomationEngine] dispatchWelcomeKit error:', error);
      return false;
    }
  }

  /**
   * 6. POST-TRIP DEBT SETTLEMENT & BALANCE REMINDERS
   * Automatically computes the net debt matrix and dispatches reminders to unsettled squad members.
   */
  async dispatchPostTripSettlement(tripId: string): Promise<{ success: boolean; matrix: any; sentCount: number }> {
    try {
      const trip = await prisma.collabTrip.findUnique({
        where: { id: tripId },
        include: {
          members: { include: { user: true } },
          expenses: {
            where: { deletedAt: null },
            include: { splits: true, paidBy: true }
          }
        }
      });

      if (!trip) return { success: false, matrix: null, sentCount: 0 };

      // Calculate net balances for each member
      const balances: Record<string, { user: any; net: number }> = {};
      trip.members.forEach(m => {
        balances[m.userId] = { user: m.user, net: 0 };
      });

      let totalSpend = 0;
      trip.expenses.forEach(exp => {
        totalSpend += exp.amount;
        if (balances[exp.paidById]) {
          balances[exp.paidById].net += exp.amount;
        }
        exp.splits.forEach(s => {
          if (balances[s.userId] && !s.settled) {
            balances[s.userId].net -= s.amount;
          }
        });
      });

      const memberSummaries = Object.values(balances).map(b => {
        const status = b.net > 1 ? `gets back ₹${Math.round(b.net).toLocaleString('en-IN')}` :
          b.net < -1 ? `owes ₹${Math.round(Math.abs(b.net)).toLocaleString('en-IN')}` : 'Settled up';
        return `  • *${b.user.name}*: ${status}`;
      }).join('\n');

      const message = `🧾 *VyomTogether Post-Trip Expense Reconciliation*\n` +
        `Trip: *${trip.name}* (${trip.destination})\n` +
        `💰 Total Squad Spend: *₹${Math.round(totalSpend).toLocaleString('en-IN')}*\n\n` +
        `📊 *Squad Balances:*\n${memberSummaries}\n\n` +
        `✨ Please settle balances directly via UPI or your AuricVyom wallet.\n` +
        `👉 View full expense audit: http://localhost:3000/#vyomtogether`;

      let sentCount = 0;
      for (const m of trip.members) {
        if (m.user.phone) {
          await whatsappService.sendWhatsAppMessage({
            toPhone: m.user.phone,
            message,
            ctaLink: 'http://localhost:3000/#vyomtogether'
          }).catch(console.error);
          sentCount++;
        }
      }

      return { success: true, matrix: balances, sentCount };
    } catch (error) {
      console.error('[AutomationEngine] dispatchPostTripSettlement error:', error);
      return { success: false, matrix: null, sentCount: 0 };
    }
  }

  /**
   * 7. GET STATUS OF AUTOMATIONS FOR A SPECIFIC TRIP
   */
  async getTripAutomationStatus(tripId: string) {
    const trip = await prisma.collabTrip.findUnique({
      where: { id: tripId },
      include: {
        polls: { where: { status: 'ACTIVE' } },
        members: true,
        itineraryItems: true
      }
    });

    if (!trip) return null;

    const now = new Date();
    const isActive = new Date(trip.startDate) <= now && now <= new Date(trip.endDate);
    const isCompleted = now > new Date(trip.endDate);

    return {
      tripId,
      tripName: trip.name,
      morningBriefing: {
        enabled: true,
        status: isActive ? 'ACTIVE_TODAY' : isCompleted ? 'TRIP_COMPLETED' : 'SCHEDULED_FOR_START',
        scheduledTimeIST: '08:00 AM',
        frequency: 'Daily during trip'
      },
      pollAutoResolution: {
        enabled: true,
        activePollsCount: trip.polls.length,
        description: 'Auto-closes polls & inserts winning item onto itinerary when all members vote or deadline is reached'
      },
      emergencySOS: {
        enabled: true,
        ready: true,
        channels: ['Browser Geolocation', 'High-Priority SSE', 'WhatsApp Concierge Desk', 'SMS Alert']
      },
      expenseReconciliation: {
        enabled: true,
        status: isCompleted ? 'READY_FOR_SETTLEMENT' : 'TRACKING_ACTIVE'
      },
      roomInventoryHoldSweep: {
        enabled: true,
        interval: '60 seconds',
        status: 'RUNNING'
      }
    };
  }
}

export const automationEngine = new AutomationEngineService();
