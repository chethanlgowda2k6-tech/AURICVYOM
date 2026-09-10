import 'dotenv/config';
import prisma from '../src/utils/prisma';
import { automationEngine } from '../src/services/automationEngine.service';
import crypto from 'crypto';

async function runAutomationTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 AURICVYOM & VYOMTOGETHER AUTOMATION SUITE TEST RUNNER');
  console.log('🧪 ========================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Room Hold Inventory Sweep Watchdog
    // -------------------------------------------------------------------------
    console.log('▶ TEST 1: Sweeping Expired Room Holds...');
    const dummySessionId = 'test_hold_' + crypto.randomBytes(4).toString('hex');
    const pastDate = new Date(Date.now() - 15 * 60 * 1000); // 15 mins in the past

    // Insert an expired hold
    await prisma.roomHold.create({
      data: {
        propertyId: 'prop_test_automation',
        sessionId: dummySessionId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        expiresAt: pastDate
      }
    });

    const sweepResult = await automationEngine.sweepExpiredRoomHolds();
    const remainingHold = await prisma.roomHold.findFirst({
      where: { sessionId: dummySessionId }
    });

    if (sweepResult.releasedCount >= 1 && !remainingHold) {
      console.log(`  ✅ TEST 1 PASSED: Expired room hold successfully swept and released back to inventory!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 1 FAILED: Hold was not deleted.`);
      failedTests++;
    }

    // -------------------------------------------------------------------------
    // SETUP FOR TESTS 2 - 5: Test Trip & Squad Members
    // -------------------------------------------------------------------------
    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const user1 = await prisma.user.create({
      data: {
        name: `Traveler Alfa ${uniqueSuffix}`,
        email: `alfa_${uniqueSuffix}@auricvyom.com`,
        phone: `+91987654${Math.floor(1000 + Math.random() * 9000)}`,
        passwordHash: 'dummy_hash_for_test'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        name: `Traveler Bravo ${uniqueSuffix}`,
        email: `bravo_${uniqueSuffix}@auricvyom.com`,
        phone: `+91987655${Math.floor(1000 + Math.random() * 9000)}`,
        passwordHash: 'dummy_hash_for_test'
      }
    });

    const trip = await prisma.collabTrip.create({
      data: {
        name: `Royal Rajasthan Expedition ${uniqueSuffix}`,
        destination: 'Jaipur & Udaipur',
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        travelersCount: 2,
        inviteCode: `TEST${uniqueSuffix.toUpperCase()}`,
        members: {
          create: [
            { userId: user1.id, role: 'OWNER' },
            { userId: user2.id, role: 'MEMBER' }
          ]
        }
      }
    });

    // -------------------------------------------------------------------------
    // TEST 2: Poll Auto-Resolution & Itinerary Insertion
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 2: Poll Auto-Resolution & Timeline Sync...');
    const poll = await prisma.tripPoll.create({
      data: {
        tripId: trip.id,
        createdById: user1.id,
        question: 'Which sunset activity should our squad experience tonight?',
        options: {
          create: [
            { text: 'Hot Air Balloon Safari over Amber Fort' },
            { text: 'Chokhi Dhani Heritage Cultural Dinner' }
          ]
        }
      },
      include: { options: true }
    });

    // Cast votes so 100% of squad members have voted
    const balloonOption = poll.options[0];
    await prisma.tripPollVote.create({
      data: { pollOptionId: balloonOption.id, userId: user1.id }
    });
    await prisma.tripPollVote.create({
      data: { pollOptionId: balloonOption.id, userId: user2.id }
    });

    // Trigger auto-resolution
    const resolutionResult = await automationEngine.checkAndResolveExpiredPolls();
    const closedPoll = await prisma.tripPoll.findUnique({
      where: { id: poll.id }
    });

    // Check if winning itinerary item was created
    const createdItinerary = await prisma.tripItineraryItem.findFirst({
      where: {
        tripId: trip.id,
        title: { contains: 'Hot Air Balloon Safari' }
      }
    });

    if (closedPoll?.status === 'CLOSED' && createdItinerary) {
      console.log(`  ✅ TEST 2 PASSED: Poll auto-closed and winning activity "${createdItinerary.title}" was inserted into the itinerary timeline!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 2 FAILED: Poll not closed or item not inserted. Closed: ${closedPoll?.status}, Item: ${!!createdItinerary}`);
      failedTests++;
    }

    // -------------------------------------------------------------------------
    // TEST 3: 1-Click Emergency SOS & Concierge Escalation
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 3: 1-Click Emergency SOS Trigger...');
    const sosResult = await automationEngine.triggerEmergencySOS(trip.id, user2.id, {
      latitude: 26.9124,
      longitude: 75.7873,
      address: 'City Palace Complex, Jaipur'
    });

    const sosMessage = await prisma.tripMessage.findFirst({
      where: {
        tripId: trip.id,
        text: { contains: '[EMERGENCY SOS]' }
      }
    });

    if (sosResult.success && sosResult.mapsUrl.includes('26.9124') && sosMessage) {
      console.log(`  ✅ TEST 3 PASSED: Emergency SOS successfully broadcast with live GPS coords & desk notification!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 3 FAILED: SOS result or chat message missing.`);
      failedTests++;
    }

    // -------------------------------------------------------------------------
    // TEST 4: Daily 08:00 AM IST Morning Concierge Briefing
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 4: Morning Concierge Briefing Generation...');
    const briefingResult = await automationEngine.dispatchMorningSquadBriefingForTrip(trip.id);

    if (briefingResult.success && briefingResult.briefingText.includes('Day 1 Overview') && briefingResult.sentCount >= 2) {
      console.log(`  ✅ TEST 4 PASSED: Concierge briefing generated and dispatched to ${briefingResult.sentCount} squad members!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 4 FAILED: Briefing text failed or sent count mismatch.`);
      failedTests++;
    }

    // -------------------------------------------------------------------------
    // TEST 5: Post-Trip Debt Settlement & Balances
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 5: Post-Trip Debt Settlement Reconciliation...');
    const expense = await prisma.tripExpense.create({
      data: {
        tripId: trip.id,
        paidById: user1.id,
        amount: 5000,
        description: 'Squad Gala Dinner',
        category: 'Dining',
        splits: {
          create: [
            { userId: user1.id, amount: 2500, settled: false },
            { userId: user2.id, amount: 2500, settled: false }
          ]
        }
      }
    });

    const settlementResult = await automationEngine.dispatchPostTripSettlement(trip.id);
    const user2Balance = settlementResult.matrix?.[user2.id]?.net;

    if (settlementResult.success && user2Balance === -2500) {
      console.log(`  ✅ TEST 5 PASSED: Squad expense matrix accurately resolved net balance (User owes ₹2,500)!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 5 FAILED: Expected user2 to owe -2500, got ${user2Balance}`);
      failedTests++;
    }

    // -------------------------------------------------------------------------
    // TEST 6: Trip Automation Status API Helper
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 6: Trip Automation Status Retrieval...');
    const statusResult = await automationEngine.getTripAutomationStatus(trip.id);

    if (statusResult && statusResult.morningBriefing.enabled && statusResult.emergencySOS.ready) {
      console.log(`  ✅ TEST 6 PASSED: Automation status report verified for trip "${trip.name}"!`);
      passedTests++;
    } else {
      console.error(`  ❌ TEST 6 FAILED: Status object invalid.`);
      failedTests++;
    }

    // Cleanup test artifacts
    await prisma.collabTrip.delete({ where: { id: trip.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user1.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user2.id } }).catch(() => {});

  } catch (err) {
    console.error('💥 UNEXPECTED ERROR IN TEST RUNNER:', err);
    failedTests++;
  }

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAutomationTests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
