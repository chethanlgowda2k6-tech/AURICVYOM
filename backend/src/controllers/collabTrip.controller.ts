import { Response } from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { CollabTripRequest } from '../middleware/tripAuth';
import { tripSyncService } from '../services/tripSync.service';
import { TripRole } from '@prisma/client';

/**
 * Helper to calculate trip status and metrics derived from dates
 */
export function computeTripMetrics(startDate: Date, endDate: Date) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const nowTime = now.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  if (nowTime < startTime) {
    status = 'UPCOMING';
  } else if (nowTime <= endTime + 24 * 60 * 60 * 1000) {
    status = 'ONGOING';
  } else {
    status = 'COMPLETED';
  }

  const durationDays = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1);
  const daysUntilTrip = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));

  return { status, durationDays, daysUntilTrip };
}

// =============================================================================
// 1. TRIP CRUD & DISCOVERY
// =============================================================================

export const createTrip = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      name,
      destination,
      startDate,
      endDate,
      travelersCount,
      targetBudget,
      currency = 'INR',
      coOwnerEmail,
      coOwnerId,
      coverImage
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Trip Name is required' });
    }
    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ success: false, message: 'Destination is required' });
    }
    if (!startDate) {
      return res.status(400).json({ success: false, message: 'Start date is required' });
    }
    if (!endDate) {
      return res.status(400).json({ success: false, message: 'End date is required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format' });
    }

    if (start.getTime() > end.getTime()) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    const inviteCode = `VYOM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const coOwnerInviteCode = `CO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    let designatedCoOwnerUser = null;
    if (coOwnerEmail && typeof coOwnerEmail === 'string' && coOwnerEmail.trim()) {
      designatedCoOwnerUser = await prisma.user.findUnique({
        where: { email: coOwnerEmail.trim().toLowerCase() }
      });
    } else if (coOwnerId && typeof coOwnerId === 'string' && coOwnerId !== userId) {
      designatedCoOwnerUser = await prisma.user.findUnique({
        where: { id: coOwnerId }
      });
    }

    const membersCreate: any[] = [
      {
        userId,
        role: TripRole.OWNER
      }
    ];

    if (designatedCoOwnerUser && designatedCoOwnerUser.id !== userId) {
      membersCreate.push({
        userId: designatedCoOwnerUser.id,
        role: TripRole.OWNER
      });
    }

    const trip = await prisma.collabTrip.create({
      data: {
        name,
        destination,
        startDate: start,
        endDate: end,
        travelersCount: Number(travelersCount),
        targetBudget: targetBudget ? Number(targetBudget) : null,
        currency,
        inviteCode,
        coOwnerInviteCode: designatedCoOwnerUser ? null : coOwnerInviteCode,
        coverImage: coverImage || null,
        members: {
          create: membersCreate
        }
      },
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

    const metrics = computeTripMetrics(trip.startDate, trip.endDate);

    res.status(201).json({
      success: true,
      data: {
        ...trip,
        ...metrics,
        hasSecondOwner: trip.members.filter(m => m.role === TripRole.OWNER).length === 2
      }
    });
  } catch (error) {
    console.error('[CollabTrip] createTrip error:', error);
    res.status(500).json({ success: false, message: 'Failed to create collaborative trip' });
  }
};

export const getUserTrips = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const trips = await prisma.collabTrip.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
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
        },
        _count: {
          select: {
            itineraryItems: true,
            expenses: { where: { deletedAt: null } },
            polls: true,
            savedPlaces: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    const formattedTrips = trips.map(trip => {
      const metrics = computeTripMetrics(trip.startDate, trip.endDate);
      const userMembership = trip.members.find(m => m.userId === userId);
      const owners = trip.members.filter(m => m.role === TripRole.OWNER);

      return {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelersCount: trip.travelersCount,
        targetBudget: trip.targetBudget,
        currency: trip.currency,
        inviteCode: trip.inviteCode,
        coOwnerInviteCode: userMembership?.role === TripRole.OWNER ? trip.coOwnerInviteCode : null,
        coverImage: trip.coverImage,
        createdAt: trip.createdAt,
        userRole: userMembership?.role,
        memberCount: trip.members.length,
        members: trip.members,
        owners,
        counts: trip._count,
        ...metrics
      };
    });

    res.json({ success: true, data: formattedTrips });
  } catch (error) {
    console.error('[CollabTrip] getUserTrips error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve trips' });
  }
};

export const getTripDetails = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tripId = req.params.tripId as string;

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
        },
        itineraryItems: {
          include: {
            createdBy: {
              select: { id: true, name: true, profileImage: true }
            }
          },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'asc' }]
        },
        savedPlaces: {
          include: {
            addedBy: {
              select: { id: true, name: true, profileImage: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        polls: {
          include: {
            createdBy: {
              select: { id: true, name: true, profileImage: true }
            },
            options: {
              include: {
                votes: {
                  include: {
                    user: {
                      select: { id: true, name: true, profileImage: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        expenses: {
          include: {
            paidBy: {
              select: { id: true, name: true, profileImage: true }
            },
            splits: {
              include: {
                user: {
                  select: { id: true, name: true, profileImage: true }
                }
              }
            }
          },
          orderBy: { date: 'desc' }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, profileImage: true }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 100
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const userMembership = trip.members.find(m => m.userId === userId);
    if (!userMembership) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a member of this trip' });
    }

    const metrics = computeTripMetrics(trip.startDate, trip.endDate);
    const owners = trip.members.filter(m => m.role === TripRole.OWNER);

    const activeExpenses = trip.expenses.filter(e => !e.deletedAt);
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      data: {
        ...trip,
        ...metrics,
        userRole: userMembership.role,
        owners,
        ownersCount: owners.length,
        totalExpenses,
        activeExpensesCount: activeExpenses.length,
        hasTwoOwners: owners.length === 2,
        coOwnerInviteCode: userMembership.role === TripRole.OWNER ? trip.coOwnerInviteCode : null
      }
    });
  } catch (error) {
    console.error('[CollabTrip] getTripDetails error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve trip details' });
  }
};

export const updateTrip = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const { name, destination, startDate, endDate, travelersCount, targetBudget, coverImage } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (destination) dataToUpdate.destination = destination;
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);
    if (travelersCount !== undefined) dataToUpdate.travelersCount = Number(travelersCount);
    if (targetBudget !== undefined) dataToUpdate.targetBudget = Number(targetBudget);
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;

    const updated = await prisma.collabTrip.update({
      where: { id: tripId },
      data: dataToUpdate
    });

    tripSyncService.broadcast(tripId, 'TRIP_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[CollabTrip] updateTrip error:', error);
    res.status(500).json({ success: false, message: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    await prisma.collabTrip.delete({ where: { id: tripId } });
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('[CollabTrip] deleteTrip error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
};

// =============================================================================
// 2. INVITE CODE & MEMBERSHIP FLOWS (2 CO-OWNERS INVARIANT)
// =============================================================================

export const previewInviteCode = async (req: CollabTripRequest, res: Response) => {
  try {
    const code = req.params.code as string;
    const cleanCode = code.trim().toUpperCase();

    const trip = await prisma.collabTrip.findFirst({
      where: {
        OR: [
          { inviteCode: cleanCode },
          { coOwnerInviteCode: cleanCode }
        ]
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invite code' });
    }

    const isCoOwnerCode = trip.coOwnerInviteCode === cleanCode;
    const owners = trip.members.filter(m => m.role === TripRole.OWNER);
    const metrics = computeTripMetrics(trip.startDate, trip.endDate);

    res.json({
      success: true,
      data: {
        tripId: trip.id,
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverImage: trip.coverImage,
        memberCount: trip.members.length,
        isCoOwnerCode,
        ownersCount: owners.length,
        ...metrics
      }
    });
  } catch (error) {
    console.error('[CollabTrip] previewInviteCode error:', error);
    res.status(500).json({ success: false, message: 'Failed to preview invite code' });
  }
};

export const joinTrip = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized: Log in to join' });

    const { inviteCode } = req.body;
    if (!inviteCode || typeof inviteCode !== 'string') {
      return res.status(400).json({ success: false, message: 'Invite code is required' });
    }

    const cleanCode = inviteCode.trim().toUpperCase();

    const trip = await prisma.collabTrip.findFirst({
      where: {
        OR: [
          { inviteCode: cleanCode },
          { coOwnerInviteCode: cleanCode }
        ]
      },
      include: {
        members: true
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Invalid or unrecognized invite code' });
    }

    const existing = trip.members.find(m => m.userId === userId);
    if (existing) {
      return res.json({
        success: true,
        message: 'You are already a member of this trip.',
        data: { tripId: trip.id, role: existing.role }
      });
    }

    const isCoOwnerCode = trip.coOwnerInviteCode === cleanCode;
    const currentOwners = trip.members.filter(m => m.role === TripRole.OWNER);

    let assignedRole: TripRole = TripRole.MEMBER;
    let clearCoOwnerCode = false;

    if (isCoOwnerCode) {
      if (currentOwners.length < 2) {
        assignedRole = TripRole.OWNER;
        clearCoOwnerCode = true;
      } else {
        assignedRole = TripRole.MEMBER;
      }
    }

    const newMember = await prisma.$transaction(async (tx) => {
      const created = await tx.tripMember.create({
        data: {
          tripId: trip.id,
          userId,
          role: assignedRole
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, profileImage: true }
          }
        }
      });

      if (clearCoOwnerCode) {
        await tx.collabTrip.update({
          where: { id: trip.id },
          data: { coOwnerInviteCode: null }
        });
      }

      return created;
    });

    tripSyncService.broadcast(trip.id, 'MEMBER_JOINED', newMember);

    res.status(201).json({
      success: true,
      message: `Joined trip successfully as ${assignedRole}`,
      data: {
        tripId: trip.id,
        member: newMember
      }
    });
  } catch (error) {
    console.error('[CollabTrip] joinTrip error:', error);
    res.status(500).json({ success: false, message: 'Failed to join trip' });
  }
};

/**
 * ATOMIC OWNERSHIP TRANSFER & DEMOTION
 * Enforces the invariant: Exactly two co-owners at all times!
 */
export const transferOwnership = async (req: CollabTripRequest, res: Response) => {
  try {
    const callerId = req.user?.userId;
    const tripId = req.params.tripId as string;
    const { toUserId } = req.body;

    if (!toUserId || typeof toUserId !== 'string') {
      return res.status(400).json({ success: false, message: 'Target user ID (toUserId) is required' });
    }

    if (callerId === toUserId) {
      return res.status(400).json({ success: false, message: 'Cannot transfer ownership to yourself' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const members = await tx.tripMember.findMany({
        where: { tripId }
      });

      const callerMember = members.find(m => m.userId === callerId);
      if (!callerMember || callerMember.role !== TripRole.OWNER) {
        throw new Error('Only a current co-owner can transfer their ownership');
      }

      const targetMember = members.find(m => m.userId === toUserId);
      if (!targetMember) {
        throw new Error('Target user is not a member of this trip');
      }

      if (targetMember.role === TripRole.OWNER) {
        throw new Error('Target user is already a co-owner');
      }

      await tx.tripMember.update({
        where: { id: targetMember.id },
        data: { role: TripRole.OWNER }
      });

      await tx.tripMember.update({
        where: { id: callerMember.id },
        data: { role: TripRole.MEMBER }
      });

      const ownersAfter = await tx.tripMember.findMany({
        where: { tripId, role: TripRole.OWNER }
      });

      if (ownersAfter.length !== 2) {
        throw new Error(`Ownership invariant violated: Trip must have exactly 2 co-owners. Current count: ${ownersAfter.length}`);
      }

      return {
        transferredBy: callerId,
        newOwnerId: toUserId,
        owners: ownersAfter
      };
    });

    tripSyncService.broadcast(tripId, 'OWNERSHIP_TRANSFERRED', result);

    res.json({
      success: true,
      message: 'Ownership transferred successfully. Invariant preserved: 2 co-owners.',
      data: result
    });
  } catch (error: any) {
    console.error('[CollabTrip] transferOwnership error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to transfer ownership' });
  }
};

export const removeMember = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const memberUserId = req.params.memberUserId as string;

    const targetMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: memberUserId }
      }
    });

    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Member not found in this trip' });
    }

    if (targetMember.role === TripRole.OWNER) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove a co-owner. Every trip must maintain two co-owners. Transfer co-ownership to another member before removing.'
      });
    }

    await prisma.tripMember.delete({
      where: { id: targetMember.id }
    });

    tripSyncService.broadcast(tripId, 'MEMBER_REMOVED', { userId: memberUserId });
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('[CollabTrip] removeMember error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
};

export const leaveTrip = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;

    const member = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId }
      }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'You are not a member of this trip' });
    }

    if (member.role === TripRole.OWNER) {
      return res.status(400).json({
        success: false,
        message: 'Co-owners cannot leave directly. Please transfer ownership to another team member first so the trip maintains two co-owners.'
      });
    }

    await prisma.tripMember.delete({
      where: { id: member.id }
    });

    tripSyncService.broadcast(tripId, 'MEMBER_LEFT', { userId });
    res.json({ success: true, message: 'You have left the trip.' });
  } catch (error) {
    console.error('[CollabTrip] leaveTrip error:', error);
    res.status(500).json({ success: false, message: 'Failed to leave trip' });
  }
};

// =============================================================================
// 3. SHARED ITINERARY ITEMS
// =============================================================================

export const addItineraryItem = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const { dayNumber, title, description, location, startTime, endTime, category, cost, notes } = req.body;

    if (!title || dayNumber === undefined) {
      return res.status(400).json({ success: false, message: 'Title and dayNumber are required' });
    }

    const item = await prisma.tripItineraryItem.create({
      data: {
        tripId,
        createdById: userId,
        dayNumber: Number(dayNumber),
        title,
        description,
        location,
        startTime,
        endTime,
        category: category || 'ACTIVITY',
        cost: cost ? Number(cost) : null,
        notes
      },
      include: {
        createdBy: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'ITINERARY_ITEM_ADDED', item);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('[CollabTrip] addItineraryItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to add itinerary item' });
  }
};

export const updateItineraryItem = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const itemId = req.params.itemId as string;
    const { dayNumber, title, description, location, startTime, endTime, category, cost, notes } = req.body;

    const dataToUpdate: any = {};
    if (dayNumber !== undefined) dataToUpdate.dayNumber = Number(dayNumber);
    if (title) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (location !== undefined) dataToUpdate.location = location;
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    if (category !== undefined) dataToUpdate.category = category;
    if (cost !== undefined) dataToUpdate.cost = Number(cost);
    if (notes !== undefined) dataToUpdate.notes = notes;

    const item = await prisma.tripItineraryItem.update({
      where: { id: itemId },
      data: dataToUpdate,
      include: {
        createdBy: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'ITINERARY_ITEM_UPDATED', item);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[CollabTrip] updateItineraryItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update itinerary item' });
  }
};

export const deleteItineraryItem = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const itemId = req.params.itemId as string;
    await prisma.tripItineraryItem.delete({ where: { id: itemId } });

    tripSyncService.broadcast(tripId, 'ITINERARY_ITEM_DELETED', { itemId });
    res.json({ success: true, message: 'Itinerary item removed' });
  } catch (error) {
    console.error('[CollabTrip] deleteItineraryItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete itinerary item' });
  }
};

// =============================================================================
// 4. SHARED SAVED PLACES
// =============================================================================

export const addSavedPlace = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const { name, category = 'Heritage', address, image, rating, notes } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Place name is required' });

    const place = await prisma.tripSavedPlace.create({
      data: {
        tripId,
        addedById: userId,
        name,
        category,
        address,
        image,
        rating: rating ? Number(rating) : null,
        notes
      },
      include: {
        addedBy: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'PLACE_ADDED', place);
    res.status(201).json({ success: true, data: place });
  } catch (error) {
    console.error('[CollabTrip] addSavedPlace error:', error);
    res.status(500).json({ success: false, message: 'Failed to save place' });
  }
};

export const deleteSavedPlace = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const placeId = req.params.placeId as string;
    await prisma.tripSavedPlace.delete({ where: { id: placeId } });

    tripSyncService.broadcast(tripId, 'PLACE_DELETED', { placeId });
    res.json({ success: true, message: 'Saved place removed' });
  } catch (error) {
    console.error('[CollabTrip] deleteSavedPlace error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete place' });
  }
};

// =============================================================================
// 5. VOTING & POLLS (OWNERS CREATE, ALL VOTE)
// =============================================================================

export const createPoll = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const { question, options, allowMultiple = false } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A question and at least 2 options are required'
      });
    }

    const poll = await prisma.tripPoll.create({
      data: {
        tripId,
        createdById: userId,
        question,
        allowMultiple,
        options: {
          create: options.map((opt: string) => ({ text: opt.trim() }))
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true, profileImage: true }
        },
        options: {
          include: {
            votes: {
              include: {
                user: { select: { id: true, name: true, profileImage: true } }
              }
            }
          }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'POLL_CREATED', poll);
    res.status(201).json({ success: true, data: poll });
  } catch (error) {
    console.error('[CollabTrip] createPoll error:', error);
    res.status(500).json({ success: false, message: 'Failed to create poll' });
  }
};

export const votePoll = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const pollId = req.params.pollId as string;
    const { optionId } = req.body;

    if (!optionId || typeof optionId !== 'string') {
      return res.status(400).json({ success: false, message: 'Option ID is required' });
    }

    const poll = await prisma.tripPoll.findUnique({
      where: { id: pollId },
      include: { options: { include: { votes: true } } }
    });

    if (!poll || poll.tripId !== tripId) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (poll.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'This poll is closed' });
    }

    const existingVoteForOption = await prisma.tripPollVote.findUnique({
      where: {
        pollOptionId_userId: { pollOptionId: optionId, userId }
      }
    });

    if (existingVoteForOption) {
      await prisma.tripPollVote.delete({
        where: { id: existingVoteForOption.id }
      });
    } else {
      if (!poll.allowMultiple) {
        const optionIds = poll.options.map((o: any) => o.id);
        await prisma.tripPollVote.deleteMany({
          where: {
            pollOptionId: { in: optionIds },
            userId
          }
        });
      }

      await prisma.tripPollVote.create({
        data: {
          pollOptionId: optionId,
          userId
        }
      });
    }

    const updatedPoll = await prisma.tripPoll.findUnique({
      where: { id: pollId },
      include: {
        createdBy: { select: { id: true, name: true, profileImage: true } },
        options: {
          include: {
            votes: {
              include: { user: { select: { id: true, name: true, profileImage: true } } }
            }
          }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'POLL_VOTED', updatedPoll);
    res.json({ success: true, data: updatedPoll });
  } catch (error) {
    console.error('[CollabTrip] votePoll error:', error);
    res.status(500).json({ success: false, message: 'Failed to cast vote' });
  }
};

export const closePoll = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const pollId = req.params.pollId as string;

    const poll = await prisma.tripPoll.update({
      where: { id: pollId },
      data: { status: 'CLOSED' },
      include: {
        options: {
          include: {
            votes: {
              include: { user: { select: { id: true, name: true, profileImage: true } } }
            }
          }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'POLL_CLOSED', poll);
    res.json({ success: true, data: poll });
  } catch (error) {
    console.error('[CollabTrip] closePoll error:', error);
    res.status(500).json({ success: false, message: 'Failed to close poll' });
  }
};

// =============================================================================
// 6. GROUP EXPENSES & SPLITTER (FULL CRUD WITH SOFT DELETE AUDIT)
// =============================================================================

export const createExpense = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const {
      amount,
      currency = 'INR',
      description,
      category = 'General',
      date,
      splitType = 'EQUAL',
      splitBetweenMemberIds
    } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ success: false, message: 'Amount and description are required' });
    }

    const trip = req.trip || await prisma.collabTrip.findUnique({
      where: { id: tripId },
      include: { members: true }
    });

    const targetMemberUserIds: string[] = (splitBetweenMemberIds && splitBetweenMemberIds.length > 0)
      ? splitBetweenMemberIds
      : trip.members.map((m: any) => m.userId);

    const splitAmount = Math.round((Number(amount) / targetMemberUserIds.length) * 100) / 100;

    const expense = await prisma.tripExpense.create({
      data: {
        tripId,
        paidById: userId,
        amount: Number(amount),
        currency,
        description,
        category,
        date: date ? new Date(date) : new Date(),
        splitType,
        splits: {
          create: targetMemberUserIds.map((uid: string) => ({
            userId: uid,
            amount: splitAmount,
            settled: uid === userId
          }))
        }
      },
      include: {
        paidBy: { select: { id: true, name: true, profileImage: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } }
          }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'EXPENSE_ADDED', expense);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('[CollabTrip] createExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const expenseId = req.params.expenseId as string;
    const { amount, description, category, date, splitBetweenMemberIds } = req.body;

    const currentExpense = await prisma.tripExpense.findUnique({
      where: { id: expenseId },
      include: { splits: true }
    });

    if (!currentExpense || currentExpense.tripId !== tripId) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const updatedAmount = amount !== undefined ? Number(amount) : currentExpense.amount;
    const targetUserIds: string[] = splitBetweenMemberIds || currentExpense.splits.map((s: any) => s.userId);
    const splitAmount = Math.round((updatedAmount / targetUserIds.length) * 100) / 100;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.tripExpenseSplit.deleteMany({ where: { expenseId } });

      return tx.tripExpense.update({
        where: { id: expenseId },
        data: {
          amount: updatedAmount,
          description: description || currentExpense.description,
          category: category || currentExpense.category,
          date: date ? new Date(date) : currentExpense.date,
          splits: {
            create: targetUserIds.map((uid: string) => ({
              userId: uid,
              amount: splitAmount,
              settled: uid === currentExpense.paidById
            }))
          }
        },
        include: {
          paidBy: { select: { id: true, name: true, profileImage: true } },
          splits: {
            include: { user: { select: { id: true, name: true, profileImage: true } } }
          }
        }
      });
    });

    tripSyncService.broadcast(tripId, 'EXPENSE_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[CollabTrip] updateExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
};

/**
 * SOFT DELETE EXPENSE: Preserves audit trail for money-related disputes!
 */
export const deleteExpense = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const expenseId = req.params.expenseId as string;

    const expense = await prisma.tripExpense.findUnique({
      where: { id: expenseId }
    });

    if (!expense || expense.tripId !== tripId) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const softDeleted = await prisma.tripExpense.update({
      where: { id: expenseId },
      data: {
        deletedAt: new Date(),
        deletedById: userId
      }
    });

    tripSyncService.broadcast(tripId, 'EXPENSE_DELETED', {
      expenseId,
      deletedAt: softDeleted.deletedAt,
      deletedById: userId
    });

    res.json({
      success: true,
      message: 'Expense soft-deleted and logged in financial audit history.',
      data: softDeleted
    });
  } catch (error) {
    console.error('[CollabTrip] deleteExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to soft delete expense' });
  }
};

/**
 * DEBT SETTLEMENT MATRIX (WHO OWES WHOM)
 */
export const getSettlementMatrix = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;

    const trip = await prisma.collabTrip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        expenses: {
          where: { deletedAt: null },
          include: { splits: true }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const netBalances: { [userId: string]: { user: any; balance: number } } = {};
    trip.members.forEach((m: any) => {
      netBalances[m.userId] = { user: m.user, balance: 0 };
    });

    trip.expenses.forEach((exp: any) => {
      if (netBalances[exp.paidById]) {
        netBalances[exp.paidById].balance += exp.amount;
      }
      exp.splits.forEach((split: any) => {
        if (netBalances[split.userId]) {
          netBalances[split.userId].balance -= split.amount;
        }
      });
    });

    const debtors: { userId: string; user: any; amount: number }[] = [];
    const creditors: { userId: string; user: any; amount: number }[] = [];

    Object.entries(netBalances).forEach(([uid, data]) => {
      const rounded = Math.round(data.balance * 100) / 100;
      if (rounded < -0.01) {
        debtors.push({ userId: uid, user: data.user, amount: Math.abs(rounded) });
      } else if (rounded > 0.01) {
        creditors.push({ userId: uid, user: data.user, amount: rounded });
      }
    });

    const settlements: Array<{ from: any; to: any; amount: number }> = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const settleAmount = Math.min(debtor.amount, creditor.amount);
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(settleAmount * 100) / 100
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) dIdx++;
      if (creditor.amount < 0.01) cIdx++;
    }

    res.json({
      success: true,
      data: {
        currency: trip.currency,
        netBalances: Object.values(netBalances),
        settlements
      }
    });
  } catch (error) {
    console.error('[CollabTrip] getSettlementMatrix error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute settlement matrix' });
  }
};

// =============================================================================
// 7. REAL-TIME CHAT
// =============================================================================

export const getMessages = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const messages = await prisma.tripMessage.findMany({
      where: { tripId },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('[CollabTrip] getMessages error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

export const sendMessage = async (req: CollabTripRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tripId = req.params.tripId as string;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const message = await prisma.tripMessage.create({
      data: {
        tripId,
        senderId: userId,
        text: text.trim()
      },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    tripSyncService.broadcast(tripId, 'NEW_CHAT_MESSAGE', message);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('[CollabTrip] sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// =============================================================================
// 8. REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// =============================================================================

export const subscribeTripEvents = async (req: CollabTripRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const userId = req.user?.userId;

    tripSyncService.addClient(tripId, res, userId);
  } catch (error) {
    console.error('[CollabTrip] subscribeTripEvents error:', error);
    res.status(500).end();
  }
};
