import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { emailService } from '../services/email.service';
import { smsService } from '../services/sms.service';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { items, totalAmount, currency = 'INR', status = 'CONFIRMED' } = req.body;

    const voucherCode = `AV-${Math.floor(10000 + Math.random() * 90000)}`;

    const booking = await prisma.booking.create({
      data: {
        userId,
        totalAmount,
        currency,
        status: status as any,
        voucherCode,
        items: {
          create: items.map((item: any) => ({
            itemType: item.itemType || 'STAY',
            propertyId: item.propertyId || null,
            startDate: item.startDate ? new Date(item.startDate) : undefined,
            endDate: item.endDate ? new Date(item.endDate) : undefined,
            guests: item.guests || 2,
            price: item.price || totalAmount,
          }))
        }
      },
      include: {
        items: { include: { property: true } },
        user: true,
      }
    });

    // Automatically trigger Email and SMS notifications for confirmed bookings
    if (booking.status === 'CONFIRMED' && booking.user) {
      const primaryProperty = booking.items[0]?.property;
      emailService.sendBookingConfirmation(booking, booking.user, primaryProperty).catch(console.error);
      if (booking.user.phone) {
        smsService.sendBookingConfirmationSMS(booking.user.phone, booking, primaryProperty).catch(console.error);
      }
    }

    // Track AI Conversion if origin is AI Planner
    if (req.body.aiOrigin || req.body.sourceItineraryId) {
      prisma.analyticsEvent.create({
        data: {
          userId,
          eventType: 'AI_BOOKING_CONVERSION',
          payload: {
            bookingId: booking.id,
            sourceItineraryId: req.body.sourceItineraryId || 'itn_ai_studio',
            totalAmount: booking.totalAmount,
            propertyName: booking.items[0]?.property?.name || 'Luxury Sanctuary',
          }
        }
      }).catch(console.error);
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { items: { include: { property: true } }, payment: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reason = 'Guest requested cancellation' } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: {
        items: { include: { property: true } },
        user: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this booking' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled' });
    }

    // Cancellation Policy Engine Calculation
    const primaryItem = booking.items[0];
    const property = primaryItem?.property;
    const checkInDate = primaryItem?.startDate ? new Date(primaryItem.startDate) : new Date();
    const now = new Date();

    const diffDays = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const windowDays = property?.cancellationWindowDays || 7;

    let refundPercentage = 0;
    if (diffDays >= windowDays) {
      refundPercentage = 100; // Free cancellation inside policy window
    } else if (diffDays >= 1) {
      refundPercentage = 50; // 50% refund after window until 24h prior
    } else {
      refundPercentage = 0; // Non-refundable within 24 hours of check-in
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

    // Update Booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' }
    });

    // Record Cancellation details
    const cancellation = await prisma.cancellation.upsert({
      where: { bookingId: booking.id },
      update: {
        reason,
        refundAmount,
        status: 'PROCESSED',
      },
      create: {
        bookingId: booking.id,
        reason,
        refundAmount,
        status: 'PROCESSED',
      }
    });

    // Send Cancellation Email
    if (booking.user) {
      emailService.sendBookingCancellation(booking, booking.user, {
        refundAmount,
        refundPercentage,
        reason,
      }).catch(console.error);
    }

    res.json({
      success: true,
      message: `Booking cancelled. Eligible refund: ₹${refundAmount.toLocaleString('en-IN')} (${refundPercentage}%).`,
      data: {
        booking: updatedBooking,
        cancellation: {
          ...cancellation,
          refundPercentage,
          diffDaysRemaining: diffDays,
          policyApplied: property?.cancellationPolicyDescription || `Free cancellation until ${windowDays} days prior`,
        }
      }
    });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;
    const mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    res.json({ 
      success: true, 
      data: { 
        transactionId: mockTransactionId,
        provider: process.env.PAYMENT_PROVIDER || 'demo',
        status: 'requires_payment_method'
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
