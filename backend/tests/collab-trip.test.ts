import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';
import collabTripRoutes from '../src/routes/collabTrip.routes';
import prisma from '../src/utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', collabTripRoutes);

async function runCollabTripTests() {
  console.log('\n========================================================================');
  console.log('🤝 AURICVYOM TEAM-BASED TRIP COLLABORATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const dur = Date.now() - start;
      console.log(`  ✅ ${name} (${dur}ms)`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ ${name}: ${err.message}`);
      failed++;
    }
  }

  // Generate unique test emails
  const timestamp = Date.now();
  const user1Email = `owner1_${timestamp}@auricvyom.com`;
  const user2Email = `owner2_${timestamp}@auricvyom.com`;
  const user3Email = `member3_${timestamp}@auricvyom.com`;

  let token1: string = '';
  let user1Id: string = '';
  let token2: string = '';
  let user2Id: string = '';
  let token3: string = '';
  let user3Id: string = '';

  let tripId: string = '';
  let inviteCode: string = '';
  let pollId: string = '';
  let option1Id: string = '';
  let itineraryItemId: string = '';
  let expenseId: string = '';

  // ---------------------------------------------------------------------------
  // 1. SETUP USERS
  // ---------------------------------------------------------------------------
  console.log('📌 1. COLLABORATOR REGISTRATION & TOKENS:');

  await test('Register User 1 (Initial Co-Owner 1)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Chethan Gowda', email: user1Email, password: 'Password@123', phone: '+919876543210' });
    if (res.status !== 201 || !res.body.data?.accessToken) throw new Error(`Status ${res.status}`);
    token1 = res.body.data.accessToken;
    user1Id = res.body.data.user.id;
  });

  await test('Register User 2 (Designated Co-Owner 2)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Mohit Sharma', email: user2Email, password: 'Password@123', phone: '+919876543211' });
    if (res.status !== 201 || !res.body.data?.accessToken) throw new Error(`Status ${res.status}`);
    token2 = res.body.data.accessToken;
    user2Id = res.body.data.user.id;
  });

  await test('Register User 3 (General Member)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Aarav Patel', email: user3Email, password: 'Password@123', phone: '+919876543212' });
    if (res.status !== 201 || !res.body.data?.accessToken) throw new Error(`Status ${res.status}`);
    token3 = res.body.data.accessToken;
    user3Id = res.body.data.user.id;
  });

  // ---------------------------------------------------------------------------
  // 2. TRIP CREATION & 2 CO-OWNERS INVARIANT
  // ---------------------------------------------------------------------------
  console.log('\n📌 2. TRIP CREATION & TWO CO-OWNERS INVARIANT:');

  await test('Create Trip with designated Co-Owner (enforces 2 owners)', async () => {
    const startDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Royal Rajasthan Expedition',
        destination: 'Jaipur',
        startDate,
        endDate,
        travelersCount: 4,
        targetBudget: 150000,
        currency: 'INR',
        coOwnerEmail: user2Email
      });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    tripId = res.body.data.id;
    inviteCode = res.body.data.inviteCode;

    // Verify 2 co-owners
    const owners = res.body.data.members.filter((m: any) => m.role === 'OWNER');
    if (owners.length !== 2) throw new Error(`Expected exactly 2 co-owners, found ${owners.length}`);
    if (res.body.data.status !== 'UPCOMING') throw new Error(`Expected status UPCOMING, got ${res.body.data.status}`);
  });

  // ---------------------------------------------------------------------------
  // 3. INVITE CODE PREVIEW & JOINING
  // ---------------------------------------------------------------------------
  console.log('\n📌 3. INVITE CODE REDEMPTION & ROLE ASSIGNMENT:');

  await test('Public preview of trip via invite code', async () => {
    const res = await request(app).get(`/api/v1/trips/preview/${inviteCode}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.name !== 'Royal Rajasthan Expedition') throw new Error('Incorrect trip name');
  });

  await test('User 3 joins via invite code as MEMBER', async () => {
    const res = await request(app)
      .post('/api/v1/trips/join')
      .set('Authorization', `Bearer ${token3}`)
      .send({ inviteCode });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.body.data.member.role !== 'MEMBER') throw new Error(`Expected role MEMBER, got ${res.body.data.member.role}`);
  });

  // ---------------------------------------------------------------------------
  // 4. ROLE PERMISSIONS: POLLS & VOTING
  // ---------------------------------------------------------------------------
  console.log('\n📌 4. ROLE PERMISSIONS & POLL VOTING GATES:');

  await test('MEMBER is blocked from creating polls (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/polls`)
      .set('Authorization', `Bearer ${token3}`) // Member
      .send({
        question: 'Which palace should we visit first?',
        options: ['City Palace', 'Hawa Mahal', 'Amer Fort']
      });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('OWNER creates poll with 3 options', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/polls`)
      .set('Authorization', `Bearer ${token1}`) // Owner
      .send({
        question: 'Which palace should we visit first?',
        options: ['City Palace', 'Hawa Mahal', 'Amer Fort']
      });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    pollId = res.body.data.id;
    option1Id = res.body.data.options[0].id;
  });

  await test('All members (Owner and Member) can vote in poll', async () => {
    // Member votes
    const res3 = await request(app)
      .post(`/api/v1/trips/${tripId}/polls/${pollId}/vote`)
      .set('Authorization', `Bearer ${token3}`)
      .send({ optionId: option1Id });
    if (res3.status !== 200) throw new Error(`Member vote failed: ${res3.status}`);

    // Owner votes
    const res1 = await request(app)
      .post(`/api/v1/trips/${tripId}/polls/${pollId}/vote`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ optionId: option1Id });
    if (res1.status !== 200) throw new Error(`Owner vote failed: ${res1.status}`);

    // Check votes count on option 1
    const opt = res1.body.data.options.find((o: any) => o.id === option1Id);
    if (opt.votes.length !== 2) throw new Error(`Expected 2 votes, got ${opt.votes.length}`);
  });

  // ---------------------------------------------------------------------------
  // 5. SHARED ITINERARY & SAVED PLACES
  // ---------------------------------------------------------------------------
  console.log('\n📌 5. SHARED ITINERARY & PLACES:');

  await test('MEMBER adds itinerary item for Day 1', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${token3}`)
      .send({
        dayNumber: 1,
        title: 'Sunset at Nahargarh Fort',
        description: 'Watch the sun dip over the pink city rooftops',
        location: 'Nahargarh Fort, Jaipur',
        startTime: '17:30',
        endTime: '19:30',
        category: 'SIGHTSEEING',
        cost: 500
      });

    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    itineraryItemId = res.body.data.id;
  });

  await test('OWNER updates itinerary item time and cost', async () => {
    const res = await request(app)
      .put(`/api/v1/trips/${tripId}/itinerary/${itineraryItemId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({
        startTime: '17:00',
        cost: 650
      });

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.startTime !== '17:00' || res.body.data.cost !== 650) {
      throw new Error('Update values did not persist');
    }
  });

  await test('Save place to trip', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/places`)
      .set('Authorization', `Bearer ${token2}`)
      .send({
        name: 'Baradari Restaurant at City Palace',
        category: 'Fine Dining',
        address: 'City Palace Complex, Jalebi Chowk, Jaipur',
        rating: 4.8
      });

    if (res.status !== 201) throw new Error(`Status ${res.status}`);
  });

  // ---------------------------------------------------------------------------
  // 6. EXPENSES, SPLITTER & SOFT-DELETE AUDIT TRAIL
  // ---------------------------------------------------------------------------
  console.log('\n📌 6. GROUP EXPENSES, SETTLEMENT & SOFT-DELETE AUDIT:');

  await test('Create group expense of ₹15,000 paid by Owner 1', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        amount: 15000,
        description: 'Heritage Haveli 2-Night Stay Deposit',
        category: 'Stay'
      });

    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    expenseId = res.body.data.id;
    if (res.body.data.splits.length !== 3) throw new Error('Splits not created for all 3 members');
    if (res.body.data.splits[0].amount !== 5000) throw new Error('Split amount not equal to 5000');
  });

  await test('Compute debt settlement matrix (who owes whom)', async () => {
    const res = await request(app)
      .get(`/api/v1/trips/${tripId}/expenses/settlement`)
      .set('Authorization', `Bearer ${token3}`);

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const settlements = res.body.data.settlements;
    // User 2 owes User 1 ₹5000, User 3 owes User 1 ₹5000
    if (settlements.length < 2) throw new Error('Expected 2 settlements');
    const totalOwed = settlements.reduce((sum: number, s: any) => sum + s.amount, 0);
    if (totalOwed !== 10000) throw new Error(`Expected total owed ₹10,000, got ₹${totalOwed}`);
  });

  await test('Soft-delete expense (preserves financial audit trail)', async () => {
    const res = await request(app)
      .delete(`/api/v1/trips/${tripId}/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token3}`);

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.data.deletedAt) throw new Error('deletedAt timestamp missing on soft delete');

    // Verify record still exists in DB
    const dbRecord = await prisma.tripExpense.findUnique({ where: { id: expenseId } });
    if (!dbRecord) throw new Error('Record was hard deleted! Must be soft-deleted.');
    if (!dbRecord.deletedAt) throw new Error('deletedAt not populated in database');
  });

  // ---------------------------------------------------------------------------
  // 7. TWO CO-OWNERS INVARIANT: REMOVAL & TRANSFER
  // ---------------------------------------------------------------------------
  console.log('\n📌 7. TWO CO-OWNERS INVARIANT GATES:');

  await test('Block removing a co-owner without replacement (400 Bad Request)', async () => {
    const res = await request(app)
      .delete(`/api/v1/trips/${tripId}/members/${user2Id}`)
      .set('Authorization', `Bearer ${token1}`);

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.body.message.includes('co-owner')) throw new Error('Expected co-owner protection message');
  });

  await test('Block co-owner from leaving directly (400 Bad Request)', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${token1}`);

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('Atomic ownership transfer from User 1 to User 3 (enforces exactly 2 co-owners)', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/transfer-ownership`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ toUserId: user3Id });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${res.body.message}`);

    // Verify new owners: User 2 and User 3
    const members = await prisma.tripMember.findMany({ where: { tripId } });
    const owners = members.filter(m => m.role === 'OWNER');
    if (owners.length !== 2) throw new Error(`Expected exactly 2 owners, got ${owners.length}`);

    const u3Member = members.find(m => m.userId === user3Id);
    if (u3Member?.role !== 'OWNER') throw new Error('User 3 was not promoted to OWNER');

    const u1Member = members.find(m => m.userId === user1Id);
    if (u1Member?.role !== 'MEMBER') throw new Error('User 1 was not demoted to MEMBER');
  });

  await test('User 1 (now Member) can leave the trip cleanly', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${token1}`);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ---------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // ---------------------------------------------------------------------------
  await prisma.collabTrip.delete({ where: { id: tripId } });
  await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id, user3Id] } } });

  console.log('\n========================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runCollabTripTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
