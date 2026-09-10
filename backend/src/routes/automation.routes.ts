import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTripMember, CollabTripRequest } from '../middleware/tripAuth';
import { automationEngine } from '../services/automationEngine.service';

const router = Router();

// =============================================================================
// TRIP-SCOPED AUTOMATIONS
// =============================================================================

/**
 * GET /api/v1/automations/trips/:tripId/status
 * Returns active status and health of all automations for a given trip.
 */
router.get(
  '/trips/:tripId/status',
  authenticate as any,
  requireTripMember as any,
  async (req: CollabTripRequest, res: Response) => {
    try {
      const tripId = req.params.tripId as string;
      const status = await automationEngine.getTripAutomationStatus(tripId);
      if (!status) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
      res.json({ success: true, data: status });
    } catch (error) {
      console.error('[AutomationRoutes] getTripAutomationStatus error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch automation status' });
    }
  }
);

/**
 * POST /api/v1/automations/trips/:tripId/sos
 * Triggers 1-Click Emergency SOS broadcast with live GPS coordinates.
 */
router.post(
  '/trips/:tripId/sos',
  authenticate as any,
  requireTripMember as any,
  async (req: CollabTripRequest, res: Response) => {
    try {
      const tripId = req.params.tripId as string;
      const userId = req.user?.userId!;
      const { latitude, longitude, address } = req.body;

      const result = await automationEngine.triggerEmergencySOS(tripId, userId, {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        address
      });

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.alertMessage });
      }

      res.json({
        success: true,
        message: 'Emergency SOS dispatched to squad members and 24/7 concierge desk',
        data: result
      });
    } catch (error) {
      console.error('[AutomationRoutes] triggerEmergencySOS error:', error);
      res.status(500).json({ success: false, message: 'Failed to dispatch SOS alert' });
    }
  }
);

/**
 * POST /api/v1/automations/trips/:tripId/morning-briefing
 * Previews or triggers on-demand morning concierge squad briefing.
 */
router.post(
  '/trips/:tripId/morning-briefing',
  authenticate as any,
  requireTripMember as any,
  async (req: CollabTripRequest, res: Response) => {
    try {
      const tripId = req.params.tripId as string;
      const result = await automationEngine.dispatchMorningSquadBriefingForTrip(tripId);
      res.json({
        success: result.success,
        message: result.success
          ? `Morning briefing generated and dispatched to ${result.sentCount} member(s)`
          : 'Failed to generate briefing',
        data: result
      });
    } catch (error) {
      console.error('[AutomationRoutes] morningBriefing error:', error);
      res.status(500).json({ success: false, message: 'Failed to process morning briefing' });
    }
  }
);

/**
 * POST /api/v1/automations/trips/:tripId/settlement-reminders
 * Dispatches post-trip expense reconciliation summary to squad members.
 */
router.post(
  '/trips/:tripId/settlement-reminders',
  authenticate as any,
  requireTripMember as any,
  async (req: CollabTripRequest, res: Response) => {
    try {
      const tripId = req.params.tripId as string;
      const result = await automationEngine.dispatchPostTripSettlement(tripId);
      res.json({
        success: result.success,
        message: result.success
          ? `Debt settlement summary dispatched to ${result.sentCount} squad member(s)`
          : 'Failed to compute settlement matrix',
        data: result
      });
    } catch (error) {
      console.error('[AutomationRoutes] settlementReminders error:', error);
      res.status(500).json({ success: false, message: 'Failed to dispatch settlement reminders' });
    }
  }
);

// =============================================================================
// SYSTEM / WORKER TRIGGER ROUTES
// =============================================================================

/**
 * POST /api/v1/automations/check-polls
 * Triggers poll auto-resolution evaluation across all trips.
 */
router.post('/check-polls', authenticate as any, async (req, res) => {
  try {
    const result = await automationEngine.checkAndResolveExpiredPolls();
    res.json({
      success: true,
      message: `Poll check complete. Auto-resolved ${result.resolvedPolls.length} poll(s)`,
      data: result
    });
  } catch (error) {
    console.error('[AutomationRoutes] check-polls error:', error);
    res.status(500).json({ success: false, message: 'Failed to check polls' });
  }
});

/**
 * POST /api/v1/automations/sweep-holds
 * Triggers room hold expiration sweep.
 */
router.post('/sweep-holds', authenticate as any, async (req, res) => {
  try {
    const result = await automationEngine.sweepExpiredRoomHolds();
    res.json({
      success: true,
      message: `Room hold sweep complete. Released ${result.releasedCount} expired hold(s)`,
      data: result
    });
  } catch (error) {
    console.error('[AutomationRoutes] sweep-holds error:', error);
    res.status(500).json({ success: false, message: 'Failed to sweep holds' });
  }
});

export default router;
