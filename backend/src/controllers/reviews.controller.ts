import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getPropertyReviews = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { propertyId: propertyId as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reviews.map(r => ({
        id: r.id,
        propertyId: r.propertyId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedStay: r.isVerifiedStay,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          avatar: r.user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        }
      }))
    });
  } catch (error) {
    console.error('getPropertyReviews error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { propertyId, rating, title, comment } = req.body;

    if (!propertyId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'propertyId, rating, and comment are required',
      });
    }

    // 🔒 GATING: Verify user has a CONFIRMED or COMPLETED booking for this property
    const verifiedBooking = await prisma.booking.findFirst({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        items: {
          some: {
            propertyId,
          }
        }
      }
    });

    if (!verifiedBooking) {
      return res.status(403).json({
        success: false,
        message: '🔒 Verified Stay Required: Only guests with a confirmed booking for this sanctuary can submit a review.',
        gated: true,
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        propertyId,
        rating: parseFloat(rating),
        title: title || 'Exceptional Sanctuary Experience',
        comment,
        isVerifiedStay: true,
        bookingId: verifiedBooking.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: '⭐ Verified luxury review published successfully.',
      data: {
        ...review,
        isVerifiedStay: true,
      }
    });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
