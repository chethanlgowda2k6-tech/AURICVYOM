import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../utils/prisma';
import { TripRole } from '@prisma/client';

export interface CollabTripRequest extends AuthRequest {
  trip?: any;
  tripMember?: any;
}

/**
 * Middleware that verifies the authenticated user belongs to the requested trip.
 * Attaches `trip` and `tripMember` to the Request object.
 */
export const requireTripMember = async (
  req: CollabTripRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }

    const tripId = req.params.tripId || req.body.tripId || req.query.tripId;
    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({ success: false, message: 'Trip ID parameter is required' });
    }

    const trip = await prisma.collabTrip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
              }
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Collaborative trip not found' });
    }

    const member = trip.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this collaborative trip.'
      });
    }

    req.trip = trip;
    req.tripMember = member;
    next();
  } catch (error) {
    console.error('[TripAuth] requireTripMember error:', error);
    res.status(500).json({ success: false, message: 'Internal authorization error' });
  }
};

/**
 * Middleware that gates endpoints based on the trip-specific role (OWNER or MEMBER).
 */
export const requireTripRole = (allowedRoles: TripRole[]) => {
  return async (req: CollabTripRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tripMember) {
        // If requireTripMember hasn't run yet, run it
        await requireTripMember(req, res, () => {});
        if (!req.tripMember) return; // response was already sent
      }

      if (!allowedRoles.includes(req.tripMember.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is ${req.tripMember.role}.`
        });
      }

      next();
    } catch (error) {
      console.error('[TripAuth] requireTripRole error:', error);
      res.status(500).json({ success: false, message: 'Internal role authorization error' });
    }
  };
};
