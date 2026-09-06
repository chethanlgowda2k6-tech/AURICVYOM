import { Request, Response } from 'express';
import prisma from '../utils/prisma';

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const acquireHold = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, roomId, startDate, endDate, sessionId, userId } = req.body;

    if (!propertyId || !startDate || !endDate || !sessionId) {
      res.status(400).json({
        success: false,
        error: 'propertyId, startDate, endDate, and sessionId are required.',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      res.status(400).json({
        success: false,
        error: 'Invalid date range. Check-out date must be after check-in date.',
      });
      return;
    }

    const now = new Date();

    // 1. Clean up stale/expired holds
    await prisma.roomHold.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    // 2. Check for overlapping active holds by OTHER sessions
    const conflictingHold = await prisma.roomHold.findFirst({
      where: {
        propertyId,
        ...(roomId ? { roomId } : {}),
        sessionId: { not: sessionId },
        expiresAt: { gt: now },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });

    if (conflictingHold) {
      const remainingSec = Math.max(0, Math.ceil((conflictingHold.expiresAt.getTime() - now.getTime()) / 1000));
      res.status(409).json({
        success: false,
        error: 'This property is currently being held by another traveler for these dates. Please choose different dates or try again in a few minutes.',
        conflict: true,
        remainingSec,
      });
      return;
    }

    // 3. Check for confirmed bookings with overlapping dates
    const conflictingBooking = await prisma.bookingItem.findFirst({
      where: {
        propertyId,
        booking: {
          status: 'CONFIRMED',
        },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });

    if (conflictingBooking) {
      res.status(409).json({
        success: false,
        error: 'This property is already booked and confirmed for the selected dates.',
        conflict: true,
      });
      return;
    }

    // 4. Create or renew hold for current session
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

    // Delete any previous hold for this specific session
    await prisma.roomHold.deleteMany({
      where: { sessionId },
    });

    const hold = await prisma.roomHold.create({
      data: {
        propertyId,
        roomId: roomId || null,
        userId: userId || null,
        sessionId,
        startDate: start,
        endDate: end,
        expiresAt,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Room hold secured for 10 minutes.',
      data: {
        holdId: hold.id,
        sessionId: hold.sessionId,
        propertyId: hold.propertyId,
        startDate: hold.startDate,
        endDate: hold.endDate,
        expiresAt: hold.expiresAt,
        remainingSeconds: Math.ceil(HOLD_DURATION_MS / 1000),
      },
    });
  } catch (error: any) {
    console.error('Acquire hold error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to secure room hold.',
    });
  }
};

export const releaseHold = async (req: Request, res: Response): Promise<void> => {
  try {
    const { holdId, sessionId } = req.body;

    if (!holdId && !sessionId) {
      res.status(400).json({
        success: false,
        error: 'holdId or sessionId is required to release hold.',
      });
      return;
    }

    await prisma.roomHold.deleteMany({
      where: {
        OR: [
          ...(holdId ? [{ id: holdId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
    });

    res.status(200).json({
      success: true,
      message: 'Room hold released successfully.',
    });
  } catch (error: any) {
    console.error('Release hold error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to release room hold.',
    });
  }
};

export const getHoldStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { holdId } = req.params;
    const now = new Date();

    const hold = await prisma.roomHold.findUnique({
      where: { id: holdId as string },
    });

    if (!hold || hold.expiresAt <= now) {
      res.status(200).json({
        success: true,
        data: {
          active: false,
          remainingSeconds: 0,
        },
      });
      return;
    }

    const remainingSeconds = Math.max(0, Math.ceil((hold.expiresAt.getTime() - now.getTime()) / 1000));

    res.status(200).json({
      success: true,
      data: {
        active: true,
        holdId: hold.id,
        sessionId: hold.sessionId,
        expiresAt: hold.expiresAt,
        remainingSeconds,
      },
    });
  } catch (error: any) {
    console.error('Get hold status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hold status.',
    });
  }
};
