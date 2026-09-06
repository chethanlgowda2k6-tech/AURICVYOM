import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { notificationScheduler } from '../services/notificationScheduler.service';

export const testEngagementNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await notificationScheduler.triggerTestNotification(user);
    res.json(result);
  } catch (error) {
    console.error('testEngagementNotification error:', error);
    res.status(500).json({ success: false, message: 'Failed to dispatch test engagement notification' });
  }
};

export const broadcastDailyInspiration = async (req: Request, res: Response) => {
  try {
    const { slot = 'morning' } = req.body;
    if (!['morning', 'afternoon', 'evening'].includes(slot)) {
      return res.status(400).json({ success: false, message: 'Invalid slot. Must be morning, afternoon, or evening.' });
    }

    const result = await notificationScheduler.broadcastDailyInspiration(slot);
    res.json(result);
  } catch (error) {
    console.error('broadcastDailyInspiration error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast daily inspiration' });
  }
};

export const getNotificationSchedule = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      frequency: '3 Times Daily',
      slots: [
        {
          id: 'morning',
          timeIST: '09:00 AM',
          name: 'Morning Sanctuary Inspiration',
          description: 'Awaken with royal palaces, mountain vistas, and complimentary breakfast highlights.'
        },
        {
          id: 'afternoon',
          timeIST: '02:00 PM',
          name: 'Midday Curated Stays',
          description: 'Private pool villas, backwater retreats, and wellness Ayurvedic sanctuaries.'
        },
        {
          id: 'evening',
          timeIST: '08:00 PM',
          name: 'Evening Luxury Getaways',
          description: 'Weekend escapes, stargazing suites, and instant 10-minute room lock reminders.'
        }
      ],
      channels: ['WhatsApp (+91)', 'Gmail / Email']
    }
  });
};
