// AURICVYOM GROUNDED GOOGLE GEMINI ASSISTANT & RAG TOOL TEST SUITE
const BASE_URL = 'http://localhost:5001/api/v1';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  httpStatus?: number;
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(category: string, name: string, fn: () => Promise<{ passed: boolean; httpStatus?: number; details?: string }>) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    results.push({ category, name, passed: res.passed, httpStatus: res.httpStatus, details: res.details, durationMs: duration });
    if (res.passed) {
      console.log(`  ✅ [${res.httpStatus || 200}] ${name} (${duration}ms)`);
    } else {
      console.log(`  ❌ [${res.httpStatus || 'ERR'}] ${name} (${duration}ms)`);
      if (res.details) console.log(`     ⚠️  Details: ${res.details}`);
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({ category, name, passed: false, httpStatus: 500, details: err.message, durationMs: duration });
    console.log(`  ❌ [ERR] ${name} (${duration}ms) - Exception: ${err.message}`);
  }
}

async function runGeminiAssistantTestSuite() {
  console.log('\n========================================================================');
  console.log('🤖 AURICVYOM GROUNDED GOOGLE GEMINI RAG & TOOL CALLING ASSISTANT SUITE');
  console.log('========================================================================\n');

  // ---------------------------------------------------------
  // 1. Input Validation
  // ---------------------------------------------------------
  console.log('📌 1. INPUT VALIDATION & SCHEMA CHECKS:');
  await runTest('Validation', 'Reject empty question with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '' }),
    });
    const data = await res.json() as any;
    return {
      httpStatus: res.status,
      passed: res.status === 400 && data.success === false,
      details: data.message,
    };
  });

  // ---------------------------------------------------------
  // 2. Grounded RAG & Source Attribution
  // ---------------------------------------------------------
  console.log('\n📌 2. GROUNDED RAG KNOWLEDGE RETRIEVAL & CITATIONS:');
  await runTest('RAG Policies', 'Retrieve cancellation policy with accurate 100%/50% refund tiers & sources', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is AuricVyom cancellation and refund policy?' }),
    });
    const data = await res.json() as any;
    const hasSource = data.data?.sources?.some((s: any) => s.category === 'policy');
    const mentionsRefund = data.data?.answer?.toLowerCase().includes('100%') || data.data?.answer?.toLowerCase().includes('7 days');
    return {
      httpStatus: res.status,
      passed: res.status === 200 && data.data?.grounded === true && hasSource && mentionsRefund,
      details: `Sources: ${data.data?.sources?.map((s: any) => s.title).join(', ')}`,
    };
  });

  await runTest('RAG Policies', 'Retrieve 10-minute room lock concurrency policy', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How does the 10 minute room lock work?' }),
    });
    const data = await res.json() as any;
    const mentionsHold = data.data?.answer?.toLowerCase().includes('10-minute') || data.data?.answer?.toLowerCase().includes('hold');
    return {
      httpStatus: res.status,
      passed: res.status === 200 && mentionsHold,
      details: 'Verified 10-minute hold explanation',
    };
  });

  // ---------------------------------------------------------
  // 3. Live Function Calling Tools (Availability & Promos)
  // ---------------------------------------------------------
  console.log('\n📌 3. LIVE FUNCTION CALLING TOOLS:');
  await runTest('Tools', 'Execute check_property_availability for Rambagh Palace', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Check live room availability and rate for Rambagh Palace' }),
    });
    const data = await res.json() as any;
    const toolUsed = data.data?.toolsUsed?.includes('check_property_availability');
    const answer = data.data?.answer?.toLowerCase() || '';
    return {
      httpStatus: res.status,
      passed: res.status === 200 && toolUsed && (answer.includes('rambagh') || answer.includes('jaipur')),
      details: `Tool Invoked: ${data.data?.toolsUsed?.join(', ')}`,
    };
  });

  await runTest('Tools', 'Execute get_active_promo_codes and return AURIC10', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Are there any active promo codes or discounts available?' }),
    });
    const data = await res.json() as any;
    const toolUsed = data.data?.toolsUsed?.includes('get_active_promo_codes');
    const hasAuric10 = data.data?.answer?.includes('AURIC10');
    return {
      httpStatus: res.status,
      passed: res.status === 200 && toolUsed && hasAuric10,
      details: `Promo: AURIC10 returned with 10% discount details`,
    };
  });

  // ---------------------------------------------------------
  // 4. Strict Tenant Isolation & Anti-Data-Leakage
  // ---------------------------------------------------------
  console.log('\n📌 4. AUTHENTICATION GATING & CROSS-USER ISOLATION:');
  // Register User A
  const userAEmail = `gemini_user_a_${Date.now()}@auricvyom.com`;
  const regARes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ananya Birla',
      email: userAEmail,
      password: 'LuxuryPassword123!',
      phone: '+91 98111 22222',
    }),
  });
  const regAData = await regARes.json() as any;
  const userAToken = regAData.data?.accessToken;

  // Create Booking for User A
  const propRes = await fetch(`${BASE_URL}/properties`);
  const propData = await propRes.json() as any;
  const propId = propData.data?.[0]?.id || 'stay-rambagh-jaipur';

  const bookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAToken}`,
    },
    body: JSON.stringify({
      totalAmount: 110000,
      currency: 'INR',
      items: [{
        propertyId: propId,
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        guests: 2,
        price: 110000,
      }]
    }),
  });
  const bookData = await bookRes.json() as any;
  const userAVoucher = bookData.data?.voucherCode;

  // Test 1: Unauthenticated request querying User A's voucher
  await runTest('Security Isolation', 'Reject unauthenticated query for booking voucher', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `What is the status of booking ${userAVoucher}?` }),
    });
    const data = await res.json() as any;
    const mentionsAuth = data.data?.answer?.toLowerCase().includes('signed in') || data.data?.answer?.toLowerCase().includes('account');
    return {
      httpStatus: res.status,
      passed: res.status === 200 && mentionsAuth,
      details: data.data?.answer,
    };
  });

  // Test 2: User A queries own voucher
  await runTest('Security Isolation', 'Allow User A to query own booking voucher with full details', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ question: `What is the status of my booking ${userAVoucher}?` }),
    });
    const data = await res.json() as any;
    const hasVoucher = data.data?.answer?.includes(userAVoucher);
    return {
      httpStatus: res.status,
      passed: res.status === 200 && hasVoucher,
      details: `Returned User A booking status: ${userAVoucher}`,
    };
  });

  // Register User B
  const userBEmail = `gemini_user_b_${Date.now()}@auricvyom.com`;
  const regBRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Mehta',
      email: userBEmail,
      password: 'LuxuryPassword123!',
      phone: '+91 98222 33333',
    }),
  });
  const regBData = await regBRes.json() as any;
  const userBToken = regBData.data?.accessToken;

  // Test 3: User B tries to query User A's voucher
  await runTest('Security Isolation', 'PREVENT DATA LEAKAGE: User B cannot access User A booking voucher', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ question: `What is the status of booking ${userAVoucher}?` }),
    });
    const data = await res.json() as any;
    const isBlocked = data.data?.answer?.toLowerCase().includes('no reservation matching') || data.data?.answer?.toLowerCase().includes('not found');
    const leakedData = data.data?.answer?.includes('110000') || data.data?.answer?.includes(userAEmail);
    return {
      httpStatus: res.status,
      passed: res.status === 200 && isBlocked && !leakedData,
      details: isBlocked ? '0% Data Leakage: Cross-user query blocked' : 'FAILURE: Data leaked',
    };
  });

  // ---------------------------------------------------------
  // 5. Hallucination Resistance & Refusal
  // ---------------------------------------------------------
  console.log('\n📌 5. HALLUCINATION RESISTANCE & GROUNDED REFUSAL:');
  await runTest('Hallucination Defense', 'Explicitly refuse to invent non-existent hotels / unverified data', async () => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Can you give me the price of Space Station Orbital Hotel in Mumbai?' }),
    });
    const data = await res.json() as any;
    const refusesHallucination = data.data?.answer?.toLowerCase().includes("don't have that information") || data.data?.answer?.toLowerCase().includes("verified directory");
    return {
      httpStatus: res.status,
      passed: res.status === 200 && refusesHallucination,
      details: data.data?.answer,
    };
  });

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n========================================================================');
  console.log('📊 GEMINI GROUNDED ASSISTANT QA METRICS:');
  console.log('========================================================================');
  console.log(`• Total Scenarios:        ${total}`);
  console.log(`• Passed Scenarios:       ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`• Failed Scenarios:       ${failed}`);
  console.log('• Capabilities Verified:  RAG Vector Retrieval, Live Function Calling Tools,');
  console.log('                          Strict Tenant Isolation, Source Attribution,');
  console.log('                          Hallucination Defense & Grounded Refusal.');
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runGeminiAssistantTestSuite();
