import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTripMember, requireTripRole } from '../middleware/tripAuth';
import { TripRole } from '@prisma/client';
import {
  createTrip,
  getUserTrips,
  getTripDetails,
  updateTrip,
  deleteTrip,
  previewInviteCode,
  joinTrip,
  transferOwnership,
  removeMember,
  leaveTrip,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  addSavedPlace,
  deleteSavedPlace,
  createPoll,
  votePoll,
  closePoll,
  createExpense,
  updateExpense,
  deleteExpense,
  getSettlementMatrix,
  getMessages,
  sendMessage,
  subscribeTripEvents
} from '../controllers/collabTrip.controller';

const router = Router();

// =============================================================================
// PUBLIC / PREVIEW ROUTES
// =============================================================================
router.get('/preview/:code', previewInviteCode as any);

// =============================================================================
// AUTHENTICATED TRIP ROOT ROUTES
// =============================================================================
router.post('/', authenticate as any, createTrip as any);
router.get('/', authenticate as any, getUserTrips as any);
router.post('/join', authenticate as any, joinTrip as any);

// =============================================================================
// TRIP-SCOPED ROUTES (Requires Membership)
// =============================================================================

// Details & Settings
router.get('/:tripId', authenticate as any, requireTripMember as any, getTripDetails as any);
router.put('/:tripId', authenticate as any, requireTripRole([TripRole.OWNER]) as any, updateTrip as any);
router.delete('/:tripId', authenticate as any, requireTripRole([TripRole.OWNER]) as any, deleteTrip as any);

// Membership Management & Invariant Transfer
router.post('/:tripId/transfer-ownership', authenticate as any, requireTripRole([TripRole.OWNER]) as any, transferOwnership as any);
router.delete('/:tripId/members/:memberUserId', authenticate as any, requireTripRole([TripRole.OWNER]) as any, removeMember as any);
router.post('/:tripId/leave', authenticate as any, requireTripMember as any, leaveTrip as any);

// Shared Itinerary
router.post('/:tripId/itinerary', authenticate as any, requireTripMember as any, addItineraryItem as any);
router.put('/:tripId/itinerary/:itemId', authenticate as any, requireTripMember as any, updateItineraryItem as any);
router.delete('/:tripId/itinerary/:itemId', authenticate as any, requireTripMember as any, deleteItineraryItem as any);

// Shared Saved Places
router.post('/:tripId/places', authenticate as any, requireTripMember as any, addSavedPlace as any);
router.delete('/:tripId/places/:placeId', authenticate as any, requireTripMember as any, deleteSavedPlace as any);

// Voting & Polls (Owners create, all vote)
router.post('/:tripId/polls', authenticate as any, requireTripRole([TripRole.OWNER]) as any, createPoll as any);
router.post('/:tripId/polls/:pollId/vote', authenticate as any, requireTripMember as any, votePoll as any);
router.put('/:tripId/polls/:pollId/close', authenticate as any, requireTripRole([TripRole.OWNER]) as any, closePoll as any);

// Group Expenses & Splitter (Full CRUD with Soft-Delete Audit)
router.post('/:tripId/expenses', authenticate as any, requireTripMember as any, createExpense as any);
router.put('/:tripId/expenses/:expenseId', authenticate as any, requireTripMember as any, updateExpense as any);
router.delete('/:tripId/expenses/:expenseId', authenticate as any, requireTripMember as any, deleteExpense as any);
router.get('/:tripId/expenses/settlement', authenticate as any, requireTripMember as any, getSettlementMatrix as any);

// Chat
router.get('/:tripId/messages', authenticate as any, requireTripMember as any, getMessages as any);
router.post('/:tripId/messages', authenticate as any, requireTripMember as any, sendMessage as any);

// Real-Time Server-Sent Events (SSE) Stream
// Allows token via query parameter ?token=... or header for EventSource compatibility
router.get('/:tripId/events', (req, res, next) => {
  if (!req.headers.authorization && req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, authenticate as any, requireTripMember as any, subscribeTripEvents as any);

export default router;
