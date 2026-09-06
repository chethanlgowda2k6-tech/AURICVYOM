// AURICVYOM NEARBY LOCATION-BASED MULTI-DESTINATION SEARCH TEST SUITE
import 'dotenv/config';

const BASE_URL = 'http://localhost:5001/api/v1';

let passedCount = 0;
let totalCount = 0;

async function runTest(name: string, description: string, fn: () => Promise<{ passed: boolean; details?: string; httpStatus?: number }>) {
  totalCount++;
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    if (res.passed) {
      passedCount++;
      console.log(`  ✅ [${res.httpStatus || 200}] ${name}: ${description} (${duration}ms)`);
    } else {
      console.log(`  ❌ [${res.httpStatus || 'FAIL'}] ${name}: ${description} - ${res.details || 'Assertion failed'} (${duration}ms)`);
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    console.log(`  💥 [ERROR] ${name}: ${description} - Exception: ${err.message} (${duration}ms)`);
  }
}

async function runNearbyTestSuite() {
  console.log('\n========================================================================');
  console.log('📍 AURICVYOM NEARBY MULTI-DESTINATION SEARCH & PROXIMITY TEST SUITE');
  console.log('========================================================================\n');

  // 1. Validation Checks
  console.log('📌 1. INPUT VALIDATION & BAD REQUEST DEFENSE:');
  await runTest('Validation', 'Reject missing lat and lng query parameters with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/destinations/nearby`);
    const data = await res.json() as any;
    return {
      httpStatus: res.status,
      passed: res.status === 400 && data.success === false,
      details: data.message,
    };
  });

  await runTest('Validation', 'Reject invalid non-numeric coordinates with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/properties/nearby?lat=invalid&lng=xyz`);
    const data = await res.json() as any;
    return {
      httpStatus: res.status,
      passed: res.status === 400 && data.success === false,
      details: data.message,
    };
  });

  // 2. Nearby Destinations Proximity Sorting
  console.log('\n📌 2. NEARBY DESTINATIONS PROXIMITY SORTING:');
  await runTest('Proximity Sorting', 'Retrieve multiple nearby destinations sorted by ascending distance (Jaipur coords)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/nearby?lat=26.9124&lng=75.7873&radiusKm=200`);
    const data = await res.json() as any;
    const dests = data.data?.destinations || [];

    const isSorted = dests.every((d: any, idx: number) => idx === 0 || d.distanceKm >= dests[idx - 1].distanceKm);
    const hasJaipurFirst = dests[0]?.name === 'Jaipur' && dests[0]?.distanceKm === 0;
    const hasAjmer = dests.some((d: any) => d.name === 'Ajmer');

    return {
      httpStatus: res.status,
      passed: res.status === 200 && dests.length >= 2 && isSorted && hasJaipurFirst && hasAjmer,
      details: `Found ${dests.length} destinations: ${dests.map((d: any) => `${d.name} (${d.distanceKm}km)`).join(', ')}`,
    };
  });

  await runTest('South India Proximity', 'Retrieve Bengaluru & Mysuru correctly when queried with Bengaluru coordinates', async () => {
    const res = await fetch(`${BASE_URL}/destinations/nearby?lat=12.9716&lng=77.5946&radiusKm=200`);
    const data = await res.json() as any;
    const dests = data.data?.destinations || [];

    const hasBengaluruFirst = dests[0]?.name === 'Bengaluru' && dests[0]?.distanceKm === 0;
    const hasMysuru = dests.some((d: any) => d.name === 'Mysuru');

    return {
      httpStatus: res.status,
      passed: res.status === 200 && hasBengaluruFirst && hasMysuru,
      details: `Found ${dests.length} destinations: ${dests.map((d: any) => `${d.name} (${d.distanceKm}km)`).join(', ')}`,
    };
  });

  // 3. Properties Nearby with Destination Attribution
  console.log('\n📌 3. PROPERTIES NEARBY & DISTANCE ATTRIBUTION:');
  await runTest('Properties Nearby', 'Fetch nearby properties and attached destinations sorted by distance', async () => {
    const res = await fetch(`${BASE_URL}/properties/nearby?lat=26.9124&lng=75.7873&radiusKm=150`);
    const data = await res.json() as any;
    const props = data.data?.properties || [];
    const attachedDests = data.data?.nearbyDestinations || [];

    const hasRambagh = props.some((p: any) => p.name.includes('Rambagh'));
    const hasValidDist = props.every((p: any) => typeof p.distanceKm === 'number');

    return {
      httpStatus: res.status,
      passed: res.status === 200 && props.length > 0 && hasRambagh && hasValidDist && attachedDests.length > 0,
      details: `Properties returned: ${props.length} | Attached nearby destinations: ${attachedDests.length}`,
    };
  });

  // 4. Radius Expansion Fallback
  console.log('\n📌 4. RADIUS EXPANSION FALLBACK:');
  await runTest('Fallback Expansion', 'Gracefully return closest destinations when queried with very small radius (1km)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/nearby?lat=20.0000&lng=70.0000&radiusKm=1`);
    const data = await res.json() as any;
    const dests = data.data?.destinations || [];

    return {
      httpStatus: res.status,
      passed: res.status === 200 && dests.length > 0 && data.data?.isExpanded === true,
      details: `Gracefully returned ${dests.length} closest destinations with isExpanded=true`,
    };
  });

  console.log('\n========================================================================');
  console.log(`📊 NEARBY TEST SUITE SUMMARY: ${passedCount} / ${totalCount} PASSED (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('========================================================================\n');
}

runNearbyTestSuite();
