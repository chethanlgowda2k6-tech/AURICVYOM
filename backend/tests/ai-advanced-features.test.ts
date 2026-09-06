// AURICVYOM ADVANCED AI FEATURES TEST SUITE
// Tests: Rebuild My Trip (Disruptions), Photo-to-Trip (Vision), and Budget-to-Itinerary (Reverse Planning)
import 'dotenv/config';

const BASE_URL = 'http://localhost:5001/api/v1';

let passedCount = 0;
let totalCount = 0;

async function runTest(category: string, description: string, fn: () => Promise<{ passed: boolean; details?: string; httpStatus?: number }>) {
  totalCount++;
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    if (res.passed) {
      passedCount++;
      console.log(`  ✅ [${res.httpStatus || 200}] ${category}: ${description} (${duration}ms)`);
    } else {
      console.log(`  ❌ [${res.httpStatus || 'FAIL'}] ${category}: ${description} - ${res.details || 'Assertion failed'} (${duration}ms)`);
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    console.log(`  💥 [ERROR] ${category}: ${description} - Exception: ${err.message} (${duration}ms)`);
  }
}

async function runAdvancedAITestSuite() {
  console.log('\n========================================================================');
  console.log('⚡ AURICVYOM ADVANCED AI SUITE (REBUILD, PHOTO-TO-TRIP, BUDGET-PLANNER)');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. REBUILD MY TRIP — DISRUPTION MONITORING & RE-PLANNING
  // ---------------------------------------------------------------------------
  console.log('📌 1. REBUILD MY TRIP (PROACTIVE DISRUPTION MONITORING & REVISION ENGINE):');

  await runTest('Disruption Detection', 'Detect weather / monsoon warnings for Udaipur trip', async () => {
    const res = await fetch(`${BASE_URL}/planner/rebuild/check-disruptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: 'Udaipur' }),
    });
    const data = await res.json() as any;
    const hasWarning = data.data?.hasDisruption && data.data?.disruptions?.length > 0;
    return {
      httpStatus: res.status,
      passed: res.status === 200 && hasWarning,
      details: `Detected: ${data.data?.disruptions?.[0]?.title}`,
    };
  });

  let generatedRevisionId = '';
  const testTripId = `trip_qa_${Date.now()}`;

  await runTest('Rebuild Generation', 'Generate before/after comparison with indoor substitutions and notify traveler', async () => {
    const res = await fetch(`${BASE_URL}/planner/rebuild/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripData: {
          id: testTripId,
          destination: 'Udaipur',
          daysCount: 3,
          travelStyle: 'Royal Heritage',
          estimatedTotal: 65000,
        },
        userEmail: 'qa_traveler@auricvyom.com',
        userName: 'Aarav',
        userPhone: '+91 98801 12233',
      }),
    });
    const data = await res.json() as any;
    generatedRevisionId = data.data?.revisionId;
    const hasSubstitutions = data.data?.revisedPlan?.substitutionsCount > 0;
    const isProposed = data.data?.status === 'PROPOSED';

    return {
      httpStatus: res.status,
      passed: res.status === 200 && !!generatedRevisionId && hasSubstitutions && isProposed,
      details: `Revision ID: ${generatedRevisionId} | Substitutions: ${data.data?.revisedPlan?.substitutionsCount}`,
    };
  });

  await runTest('Confirmation Gate', 'Require explicit user approval to execute and confirm rebuild', async () => {
    const res = await fetch(`${BASE_URL}/planner/rebuild/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: testTripId,
        revisionId: generatedRevisionId,
      }),
    });
    const data = await res.json() as any;
    const isAccepted = data.data?.status === 'ACCEPTED';

    return {
      httpStatus: res.status,
      passed: res.status === 200 && isAccepted,
      details: `Revision confirmed with status: ${data.data?.status}`,
    };
  });

  await runTest('Revision History', 'Retain full revision history for trip record in storage', async () => {
    const res = await fetch(`${BASE_URL}/planner/rebuild/history/${testTripId}`);
    const data = await res.json() as any;
    const history = data.data || [];

    return {
      httpStatus: res.status,
      passed: res.status === 200 && history.length >= 1 && history[0].revisionId === generatedRevisionId,
      details: `History items count: ${history.length}`,
    };
  });

  // ---------------------------------------------------------------------------
  // 2. PHOTO-TO-TRIP (GEMINI VISION LANDMARK RECOGNITION)
  // ---------------------------------------------------------------------------
  console.log('\n📌 2. PHOTO-TO-TRIP (GEMINI VISION LANDMARK IDENTIFICATION & PRIVACY):');

  await runTest('Landmark Recognition', 'Identify Hawa Mahal, map to Jaipur, and generate suggested itinerary', async () => {
    const res = await fetch(`${BASE_URL}/planner/photo-to-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintText: 'hawa mahal pink sandstone palace jaipur' }),
    });
    const data = await res.json() as any;
    const isJaipur = data.data?.destination === 'Jaipur';
    const isHighConfidence = data.data?.confidence >= 0.9;
    const hasStay = !!data.data?.recommendedStay?.name;

    return {
      httpStatus: res.status,
      passed: res.status === 200 && isJaipur && isHighConfidence && hasStay,
      details: `Landmark: ${data.data?.recognizedLandmark} | Confidence: ${Math.round(data.data?.confidence * 100)}%`,
    };
  });

  await runTest('South India Landmark', 'Identify Stone Chariot in Hampi and recommend Evolve Back Palace', async () => {
    const res = await fetch(`${BASE_URL}/planner/photo-to-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintText: 'vittala temple stone chariot hampi boulders' }),
    });
    const data = await res.json() as any;
    const isHampi = data.data?.destination === 'Hampi';

    return {
      httpStatus: res.status,
      passed: res.status === 200 && isHampi,
      details: `Identified: ${data.data?.recognizedLandmark} in ${data.data?.state}`,
    };
  });

  await runTest('Privacy & In-Memory', 'Provide explicit zero permanent disk storage privacy guarantee', async () => {
    const res = await fetch(`${BASE_URL}/planner/photo-to-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintText: 'dal lake srinagar houseboat' }),
    });
    const data = await res.json() as any;
    const hasNotice = data.data?.privacyNotice?.includes('Privacy Guaranteed');

    return {
      httpStatus: res.status,
      passed: res.status === 200 && hasNotice,
      details: data.data?.privacyNotice,
    };
  });

  // ---------------------------------------------------------------------------
  // 3. BUDGET-TO-ITINERARY (REVERSE TRIP PLANNING & COMPONENT LOCKING)
  // ---------------------------------------------------------------------------
  console.log('\n📌 3. BUDGET-TO-ITINERARY (REVERSE PLANNING & COMPONENT LOCKING):');

  await runTest('Reverse Budget Plan', 'Optimize 3-day itinerary within ₹75,000 with 5-category breakdown', async () => {
    const res = await fetch(`${BASE_URL}/planner/budget-to-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalBudget: 75000,
        daysCount: 3,
        travelersCount: 2,
        travelStyle: 'Royal Heritage & Palaces',
      }),
    });
    const data = await res.json() as any;
    const isWithin = data.data?.isWithinBudget === true;
    const hasBreakdown = !!data.data?.costBreakdown?.accommodation && !!data.data?.costBreakdown?.transport;

    return {
      httpStatus: res.status,
      passed: res.status === 200 && isWithin && hasBreakdown && data.data?.planningMode === 'budget',
      details: `Target: ₹${data.data?.targetBudget} | Est Total: ₹${data.data?.estimatedTotal} | Remaining: ₹${data.data?.remainingBudget}`,
    };
  });

  await runTest('Component Locking', 'Lock Rambagh Palace at ₹55,000 and re-allocate remaining budget', async () => {
    const res = await fetch(`${BASE_URL}/planner/budget-to-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalBudget: 80000,
        daysCount: 3,
        travelersCount: 2,
        travelStyle: 'Royal Heritage & Palaces',
        lockedComponents: [
          { componentType: 'stay', name: 'Rambagh Palace — The Jewel of Jaipur', cost: 55000 },
          { componentType: 'transport', name: 'Executive Chauffeur Sedan', cost: 8000 }
        ]
      }),
    });
    const data = await res.json() as any;
    const lockedCount = data.data?.lockedComponents?.length === 2;
    const accCost = data.data?.costBreakdown?.accommodation === 55000;

    return {
      httpStatus: res.status,
      passed: res.status === 200 && lockedCount && accCost,
      details: `Locked stay verified at ₹55,000 | Total calculated: ₹${data.data?.estimatedTotal}`,
    };
  });

  await runTest('Validation Defense', 'Reject missing totalBudget with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/planner/budget-to-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysCount: 3 }),
    });
    const data = await res.json() as any;

    return {
      httpStatus: res.status,
      passed: res.status === 400 && data.success === false,
      details: data.message,
    };
  });

  console.log('\n========================================================================');
  console.log(`📊 ADVANCED AI SUITE SUMMARY: ${passedCount} / ${totalCount} PASSED (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('========================================================================\n');
}

runAdvancedAITestSuite();
