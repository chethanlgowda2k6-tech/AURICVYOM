import prisma from '../utils/prisma';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const GEMINI_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'check_property_availability',
    description: 'Check live room availability, nightly rates, and active 10-minute holds for a specific luxury property on AuricVyom.',
    parameters: {
      type: 'object',
      properties: {
        propertyName: {
          type: 'string',
          description: 'Name of the property or sanctuary (e.g. Rambagh Palace, Taj Lake Palace, The Tamara Coorg, Taj Exotica Goa)'
        },
        checkInDate: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format (optional)'
        },
        checkOutDate: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format (optional)'
        }
      },
      required: ['propertyName']
    }
  },
  {
    name: 'get_user_booking_status',
    description: 'Look up the live status, voucher details, and itinerary items for a specific reservation belonging to the authenticated traveler.',
    parameters: {
      type: 'object',
      properties: {
        voucherCodeOrBookingId: {
          type: 'string',
          description: 'The voucher code (e.g. AV-CRG-82910) or booking ID of the reservation'
        }
      },
      required: ['voucherCodeOrBookingId']
    }
  },
  {
    name: 'get_active_promo_codes',
    description: 'Retrieve current active promotional discount codes and eligibility terms on AuricVyom.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'calculate_cancellation_refund',
    description: 'Calculate the policy-based refund percentage and amount for an authenticated user booking if cancelled today.',
    parameters: {
      type: 'object',
      properties: {
        bookingIdOrVoucher: {
          type: 'string',
          description: 'The booking ID or voucher code to calculate cancellation refund for'
        }
      },
      required: ['bookingIdOrVoucher']
    }
  }
];

export class GeminiToolsService {
  async executeTool(name: string, args: any, authenticatedUserId: string | null): Promise<any> {
    switch (name) {
      case 'check_property_availability':
        return this.checkPropertyAvailability(args.propertyName, args.checkInDate, args.checkOutDate);

      case 'get_user_booking_status':
        return this.getUserBookingStatus(args.voucherCodeOrBookingId, authenticatedUserId);

      case 'get_active_promo_codes':
        return this.getActivePromoCodes();

      case 'calculate_cancellation_refund':
        return this.calculateCancellationRefund(args.bookingIdOrVoucher, authenticatedUserId);

      default:
        return { error: `Tool ${name} not found.` };
    }
  }

  private async checkPropertyAvailability(propertyName: string, checkInDate?: string, checkOutDate?: string) {
    try {
      const property = await prisma.property.findFirst({
        where: {
          name: { contains: propertyName, mode: 'insensitive' }
        },
        include: { rooms: true, destination: true }
      });

      if (!property) {
        return {
          found: false,
          message: `Property '${propertyName}' was not found in AuricVyom's verified portfolio. Available properties include Rambagh Palace Jaipur, Taj Lake Palace Udaipur, The Tamara Coorg, and Taj Exotica Goa.`
        };
      }

      // Check active holds
      const now = new Date();
      const activeHoldsCount = await prisma.roomHold.count({
        where: {
          propertyId: property.id,
          expiresAt: { gt: now }
        }
      });

      return {
        found: true,
        property: {
          name: property.name,
          location: property.location,
          starRating: property.starRating,
          basePricePerNightINR: property.pricePerNight,
          cancellationWindowDays: property.cancellationWindowDays,
          cancellationPolicy: property.cancellationPolicyDescription,
          availableRooms: property.rooms.map(r => ({
            name: r.name,
            pricePerNightINR: r.pricePerNight,
            capacity: r.capacity
          })),
          active10MinuteHolds: activeHoldsCount,
          instantBookingAvailable: true,
          guarantee: '10-Minute Instant Room Lock & Sanctuary Cancellation Guarantee active.'
        }
      };
    } catch (error) {
      console.error('checkPropertyAvailability error:', error);
      return { error: 'Failed to query property availability database.' };
    }
  }

  private async getUserBookingStatus(voucherCodeOrBookingId: string, authenticatedUserId: string | null) {
    if (!authenticatedUserId) {
      return {
        authenticated: false,
        message: 'You must be signed in to your AuricVyom account to view personal booking vouchers and reservation status.'
      };
    }

    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { id: voucherCodeOrBookingId },
            { voucherCode: { equals: voucherCodeOrBookingId, mode: 'insensitive' } }
          ]
        },
        include: {
          items: { include: { property: true } },
          payment: true
        }
      });

      // Strict User Isolation: Prevent cross-user data leakage
      if (!booking || booking.userId !== authenticatedUserId) {
        return {
          found: false,
          message: `No reservation matching '${voucherCodeOrBookingId}' was found under your authenticated account. Please verify your voucher code.`
        };
      }

      return {
        found: true,
        authenticated: true,
        booking: {
          id: booking.id,
          voucherCode: booking.voucherCode,
          status: booking.status,
          totalAmountINR: booking.totalAmount,
          currency: booking.currency,
          createdAt: booking.createdAt,
          items: booking.items.map(item => ({
            property: item.property?.name,
            location: item.property?.location,
            startDate: item.startDate,
            endDate: item.endDate,
            guests: item.guests,
            priceINR: item.price
          }))
        }
      };
    } catch (error) {
      console.error('getUserBookingStatus error:', error);
      return { error: 'Failed to retrieve booking status.' };
    }
  }

  private getActivePromoCodes() {
    return {
      activePromos: [
        {
          code: 'AURIC10',
          discountPercentage: 10,
          description: '10% instant bespoke discount on all palatial suites, heritage villas, and luxury sanctuaries.',
          status: 'ACTIVE',
          redemptionLocation: 'Step 4 of Booking Checkout modal.'
        }
      ]
    };
  }

  private async calculateCancellationRefund(bookingIdOrVoucher: string, authenticatedUserId: string | null) {
    if (!authenticatedUserId) {
      return {
        authenticated: false,
        message: 'Please sign in to calculate the exact refund for your reservation.'
      };
    }

    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { id: bookingIdOrVoucher },
            { voucherCode: { equals: bookingIdOrVoucher, mode: 'insensitive' } }
          ],
          userId: authenticatedUserId
        },
        include: { items: { include: { property: true } } }
      });

      if (!booking) {
        return {
          found: false,
          message: `Booking '${bookingIdOrVoucher}' not found under your account.`
        };
      }

      const primaryItem = booking.items[0];
      const property = primaryItem?.property;
      const checkInDate = primaryItem?.startDate ? new Date(primaryItem.startDate) : new Date();
      const now = new Date();
      const diffDays = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const windowDays = property?.cancellationWindowDays || 7;

      let refundPercentage = 0;
      if (diffDays >= windowDays) {
        refundPercentage = 100;
      } else if (diffDays >= 1) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }

      const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

      return {
        voucherCode: booking.voucherCode,
        totalPaidINR: booking.totalAmount,
        daysUntilCheckIn: diffDays,
        cancellationPolicyWindowDays: windowDays,
        eligibleRefundPercentage: `${refundPercentage}%`,
        eligibleRefundAmountINR: refundAmount,
        terms: refundPercentage === 100
          ? 'Full 100% refund eligible as cancellation is requested >= 7 days in advance.'
          : refundPercentage === 50
          ? '50% refund eligible inside the late cancellation window.'
          : 'Non-refundable within 24 hours of scheduled arrival.'
      };
    } catch (error) {
      console.error('calculateCancellationRefund error:', error);
      return { error: 'Failed to calculate cancellation refund.' };
    }
  }
}

export const geminiToolsService = new GeminiToolsService();
