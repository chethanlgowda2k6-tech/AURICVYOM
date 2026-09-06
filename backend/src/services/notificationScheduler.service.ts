import prisma from '../utils/prisma';
import { whatsappService } from './whatsapp.service';
import { emailService } from './email.service';

export class NotificationSchedulerService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastTriggeredSlots = new Set<string>();

  startScheduler() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⏰ [NotificationScheduler] 3x Daily Automated WhatsApp & Gmail scheduler initialized.');

    // Check every 15 minutes for 09:00, 14:00, 20:00 IST triggers
    this.intervalId = setInterval(() => {
      this.checkAndDispatchScheduledNotifications();
    }, 15 * 60 * 1000);

    // Initial check on startup
    this.checkAndDispatchScheduledNotifications();
  }

  stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async checkAndDispatchScheduledNotifications() {
    const now = new Date();
    // Compute current hour in Indian Standard Time (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const hour = istDate.getUTCHours();
    const dateKey = istDate.toISOString().split('T')[0];

    let currentSlot: 'morning' | 'afternoon' | 'evening' | null = null;

    if (hour >= 9 && hour < 12) {
      currentSlot = 'morning';
    } else if (hour >= 14 && hour < 17) {
      currentSlot = 'afternoon';
    } else if (hour >= 20 && hour < 23) {
      currentSlot = 'evening';
    }

    if (!currentSlot) return;

    const triggerKey = `${dateKey}_${currentSlot}`;
    if (this.lastTriggeredSlots.has(triggerKey)) return;

    this.lastTriggeredSlots.add(triggerKey);
    console.log(`🚀 [NotificationScheduler] Triggering 3x daily broadcast for slot: [${currentSlot.toUpperCase()}]`);
    await this.broadcastDailyInspiration(currentSlot);
  }

  async broadcastDailyInspiration(slot: 'morning' | 'afternoon' | 'evening') {
    try {
      // 1. Fetch all registered users
      const users = await prisma.user.findMany();
      if (users.length === 0) return { success: true, dispatchedCount: 0 };

      // 2. Fetch curated luxury properties
      const properties = await prisma.property.findMany();
      const defaultProperty = properties.length > 0 ? properties[Math.floor(Math.random() * properties.length)] : {
        name: 'Rambagh Palace — The Jewel of Jaipur',
        location: 'Jaipur, Rajasthan',
        pricePerNight: 55000,
        description: 'Former residence of the Maharaja of Jaipur, featuring 47 acres of manicured gardens.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      };

      let dispatchedCount = 0;

      for (const user of users) {
        // WhatsApp Dispatch
        if (user.phone) {
          whatsappService.sendDailyStayInspiration(user.phone, user, defaultProperty, slot).catch(console.error);
        }

        // Gmail Dispatch
        if (user.email) {
          emailService.sendDailyInspirationEmail(user, defaultProperty, slot).catch(console.error);
        }

        dispatchedCount++;
      }

      console.log(`✅ [NotificationScheduler] 3x daily broadcast completed. Dispatched to ${dispatchedCount} travelers.`);
      return { success: true, slot, dispatchedCount };
    } catch (error) {
      console.error('[NotificationScheduler] Broadcast error:', error);
      return { success: false, error: 'Failed to broadcast daily inspiration.' };
    }
  }

  async triggerTestNotification(user: any) {
    try {
      const properties = await prisma.property.findMany();
      const property = properties[0] || {
        name: 'Rambagh Palace — The Jewel of Jaipur',
        location: 'Jaipur, Rajasthan',
        pricePerNight: 55000,
        description: 'Former residence of the Maharaja of Jaipur with royal gardens and butler service.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      };

      const results: any = { user: user.email };

      if (user.phone) {
        results.whatsapp = await whatsappService.sendDailyStayInspiration(user.phone, user, property, 'morning');
      }

      if (user.email) {
        results.email = await emailService.sendDailyInspirationEmail(user, property, 'morning');
      }

      return {
        success: true,
        message: 'Instant WhatsApp & Gmail inspiration notification dispatched.',
        data: results,
      };
    } catch (error) {
      console.error('triggerTestNotification error:', error);
      return { success: false, error: 'Failed to trigger test notification.' };
    }
  }
}

export const notificationScheduler = new NotificationSchedulerService();
