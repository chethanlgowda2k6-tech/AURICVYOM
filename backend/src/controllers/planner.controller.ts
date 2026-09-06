import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const { destination = 'Jaipur', travelStyle = 'Royal Heritage', daysCount = 3, travelersCount = 2, budgetRange } = req.body;
    const userId = req.user?.userId || null;
    const itineraryId = 'itn_' + Date.now();

    // Log AI Itinerary Generation for Conversion Tracking
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId,
          eventType: 'AI_ITINERARY_GENERATION',
          payload: {
            itineraryId,
            destination,
            travelStyle,
            daysCount: parseInt(daysCount) || 3,
            travelersCount: parseInt(travelersCount) || 2,
            estimatedTotal: 65000,
          }
        }
      });
    } catch (e) {
      console.warn('Analytics event log notice:', e);
    }

    const mockTrip = {
      id: itineraryId,
      title: `${travelStyle} Masterpiece in ${destination}`,
      destination,
      daysCount: parseInt(daysCount) || 3,
      travelersCount: parseInt(travelersCount) || 2,
      travelStyle,
      estimatedTotal: 65000,
      days: [
        {
          dayIndex: 1,
          title: 'Royal Arrival & Heritage Welcome',
          activities: [
            { time: '10:00 AM', title: `Private Chauffeur Airport Escort to ${destination} Sanctuary`, type: 'transport', price: 4500 },
            { time: '01:00 PM', title: 'Curated Palatial Check-in & High Tea', type: 'stay', price: 28500 },
            { time: '05:30 PM', title: 'Sunset Private Guided Heritage Walk', type: 'activity', price: 3500 },
          ]
        },
        {
          dayIndex: 2,
          title: 'Artisanal Immersion & Gastronomy',
          activities: [
            { time: '09:00 AM', title: 'Private Royal Palace Tour & Artisan Workshop', type: 'activity', price: 6000 },
            { time: '01:30 PM', title: 'Michelin-Curated Vedic Lunch', type: 'activity', price: 5000 },
            { time: '06:00 PM', title: 'Jiva Spa Ayurvedic Rejuvenation Treatment', type: 'activity', price: 8500 },
          ]
        }
      ]
    };
    
    res.json({ success: true, data: mockTrip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const saveTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { tripData } = req.body;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Store in database
    const trip = await prisma.trip.create({
      data: {
        title: tripData.title,
        destination: tripData.destination,
        daysCount: tripData.daysCount,
        travelersCount: tripData.travelersCount,
        travelStyle: tripData.travelStyle,
        estimatedTotal: tripData.estimatedTotal,
        savedBy: {
          create: {
            userId
          }
        },
        days: {
          create: tripData.days.map((d: any) => ({
            dayIndex: d.dayIndex,
            title: d.title,
            description: d.description,
            activities: {
              create: d.activities.map((a: any) => ({
                time: a.time,
                title: a.title,
                type: a.type,
                price: a.price
              }))
            }
          }))
        }
      }
    });
    
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSavedTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const savedTrips = await prisma.savedTrip.findMany({
      where: { userId },
      include: { trip: { include: { days: { include: { activities: true } } } } },
      orderBy: { savedAt: 'desc' }
    });
    
    res.json({ success: true, data: savedTrips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// 1. REBUILD MY TRIP — PROACTIVE DISRUPTION RE-PLANNING
// -----------------------------------------------------------------------------
import { disruptionRebuildService } from '../services/disruptionRebuild.service';
import { photoTripService } from '../services/photoTrip.service';
import { budgetPlannerService } from '../services/budgetPlanner.service';

export const checkTripDisruptions = async (req: Request, res: Response) => {
  try {
    const { destination, tripDates } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required to check disruptions.' });
    }

    const disruptions = disruptionRebuildService.detectDisruptions(destination, tripDates);
    res.json({ success: true, data: { destination, disruptions, hasDisruption: disruptions.length > 0 } });
  } catch (error: any) {
    console.error('checkTripDisruptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to check disruptions.' });
  }
};

export const generateRebuildPlan = async (req: Request, res: Response) => {
  try {
    const { tripData, trigger, userEmail, userPhone, userName } = req.body;
    if (!tripData || !tripData.destination) {
      return res.status(400).json({ success: false, message: 'Valid tripData with destination is required.' });
    }

    const revision = await disruptionRebuildService.generateRebuildPlan(tripData, trigger);

    // If traveler contact is provided, dispatch proactive Email/SMS notification
    if (userEmail) {
      await disruptionRebuildService.notifyUserOfDisruption(
        { email: userEmail, phone: userPhone, name: userName || 'Valued Traveler' },
        revision
      );
    }

    res.json({ success: true, data: revision });
  } catch (error: any) {
    console.error('generateRebuildPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate rebuild plan.' });
  }
};

export const confirmRebuildPlan = async (req: Request, res: Response) => {
  try {
    const { tripId, revisionId } = req.body;
    if (!tripId || !revisionId) {
      return res.status(400).json({ success: false, message: 'tripId and revisionId are required to confirm revision.' });
    }

    const result = disruptionRebuildService.confirmRevision(tripId, revisionId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    res.json({ success: true, data: result.revision, message: result.message });
  } catch (error: any) {
    console.error('confirmRebuildPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm rebuild plan.' });
  }
};

export const getRevisionHistory = async (req: Request, res: Response) => {
  try {
    const tripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
    if (!tripId) {
      return res.status(400).json({ success: false, message: 'tripId parameter is required.' });
    }

    const history = disruptionRebuildService.getHistory(tripId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error('getRevisionHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve revision history.' });
  }
};

// -----------------------------------------------------------------------------
// 2. PHOTO-TO-TRIP (GEMINI VISION LANDMARK IDENTIFICATION)
// -----------------------------------------------------------------------------
export const photoToTrip = async (req: Request, res: Response) => {
  try {
    const { base64Image, imageUrl, hintText } = req.body;
    if (!base64Image && !imageUrl && !hintText) {
      return res.status(400).json({ success: false, message: 'Please provide an image or landmark query to start your trip.' });
    }

    const result = await photoTripService.analyzePhotoAndBuildTrip({
      base64Image,
      imageUrl,
      hintText,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('photoToTrip error:', error);
    res.status(500).json({ success: false, message: 'Vision processing error occurred.' });
  }
};

// -----------------------------------------------------------------------------
// 3. BUDGET-TO-ITINERARY (REVERSE TRIP PLANNING ENGINE)
// -----------------------------------------------------------------------------
export const budgetToItinerary = async (req: Request, res: Response) => {
  try {
    const { totalBudget, daysCount, travelersCount, travelStyle, lockedComponents, destination } = req.body;

    if (!totalBudget || isNaN(Number(totalBudget))) {
      return res.status(400).json({ success: false, message: 'Valid totalBudget in INR is required.' });
    }

    const result = budgetPlannerService.planItineraryByBudget({
      totalBudget: Number(totalBudget),
      daysCount: Number(daysCount) || 3,
      travelersCount: Number(travelersCount) || 2,
      travelStyle,
      lockedComponents,
      destination,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('budgetToItinerary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate budget itinerary.' });
  }
};

