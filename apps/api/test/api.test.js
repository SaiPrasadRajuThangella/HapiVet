import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

// Settings for the test run; set before the app reads its config.
Object.assign(process.env, {
  NODE_ENV: 'test',
  SEED_SAMPLE_LEADS: 'false',
  ADMIN_EMAIL: 'admin@hapivet.com',
  ADMIN_PASSWORD: 'test-password-123',
  FIXED_OTP: '123456',
  MONGOMS_DOWNLOAD_DIR: process.env.MONGOMS_DOWNLOAD_DIR ?? fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server', import.meta.url)),
});

let mongo;
let app;
let stopDb;
let Lead;
let User;
let adminToken;

const inDays = (d, hour = 15) => {
  const date = new Date(Date.now() + d * 86400000);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

const booking = (overrides = {}) => ({
  type: 'demo',
  name: 'Kavya Rao',
  email: 'kavya@orbitvet.example',
  phone: '',
  clinic: 'Orbit Vet',
  jobTitle: 'Practice Manager',
  city: 'Austin, TX',
  guests: [],
  slot: inDays(10),
  timeZone: 'America/Chicago',
  ...overrides,
});

const asAdmin = (req) => req.set('Authorization', `Bearer ${adminToken}`);
const as = (token) => (req) => req.set('Authorization', `Bearer ${token}`);

async function signIn(phone, claim) {
  const res = await request(app).post('/api/auth/verify').send({ phone, code: '123456', ...(claim ? { claim } : {}) }).expect(200);
  return res.body;
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('hapivet-test');
  const [{ createApp }, { connectDb, disconnectDb }, { prepareDatabase }, leadModel, userModel] = await Promise.all([
    import('../src/app.js'),
    import('../src/db.js'),
    import('../src/lib/seeding.js'),
    import('../src/models/Lead.js'),
    import('../src/models/User.js'),
  ]);
  Lead = leadModel.Lead;
  User = userModel.User;
  await connectDb(process.env.MONGODB_URI);
  await prepareDatabase();
  stopDb = disconnectDb;
  app = createApp();
  const res = await request(app).post('/api/auth/admin').send({ email: 'admin@hapivet.com', password: 'test-password-123' }).expect(200);
  adminToken = res.body.token;
});

after(async () => {
  await stopDb();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([Lead.deleteMany({}), User.deleteMany({})]);
});

describe('customer sign-in', () => {
  it('takes any mobile number and the fixed code, and says the code in demo mode', async () => {
    const otp = await request(app).post('/api/auth/otp').send({ phone: '+919876543210' }).expect(200);
    assert.equal(otp.body.demoCode, '123456');
    const { token, user } = await signIn('+919876543210');
    assert.ok(token);
    assert.deepEqual(user, { phone: '+919876543210', name: 'HapiVet User', email: 'user3210@example.com' });
  });

  it('refuses a wrong code and a bad number', async () => {
    const wrong = await request(app).post('/api/auth/verify').send({ phone: '+919876543210', code: '111111' }).expect(401);
    assert.match(wrong.body.message, /code/);
    assert.equal(await User.countDocuments(), 0);
    await request(app).post('/api/auth/otp').send({ phone: 'abc' }).expect(400);
  });

  it('keeps the same account and its edited name on the next sign-in', async () => {
    const first = await signIn('+919876543210');
    await as(first.token)(request(app).patch('/api/me')).send({ name: 'Sai Prasad' }).expect(200);
    const second = await signIn('+919876543210');
    assert.equal(second.user.name, 'Sai Prasad');
    assert.equal(await User.countDocuments(), 1);
  });
});

describe('profile', () => {
  it('lets the name change but nothing else', async () => {
    const { token } = await signIn('+919876543210');
    const ok = await as(token)(request(app).patch('/api/me')).send({ name: '  New Name ' }).expect(200);
    assert.equal(ok.body.name, 'New Name');
    await as(token)(request(app).patch('/api/me')).send({ name: 'X Y', email: 'new@example.com' }).expect(400);
    await as(token)(request(app).patch('/api/me')).send({ name: 'X Y', phone: '+911111111111' }).expect(400);
    const me = await as(token)(request(app).get('/api/me')).expect(200);
    assert.equal(me.body.email, 'user3210@example.com');
    assert.equal(me.body.phone, '+919876543210');
  });

  it('needs a customer token', async () => {
    await request(app).get('/api/me').expect(401);
    await asAdmin(request(app).get('/api/me')).expect(403);
  });
});

describe('booking a demo', () => {
  it('creates a new lead with its history, and links it to a signed-in customer', async () => {
    const { token } = await signIn('+919876543210');
    const res = await as(token)(request(app).post('/api/leads')).send(booking()).expect(201);
    assert.equal(res.body.lead.status, 'new');
    assert.equal(res.body.lead.userPhone, '+919876543210');
    assert.equal(res.body.lead.history[0].status, 'new');
    assert.equal(res.body.lead.slotLock, undefined);
    assert.equal(res.body.claimToken, undefined);
  });

  it('checks the fields and refuses a time in the past', async () => {
    const res = await request(app).post('/api/leads').send(booking({ clinic: '', email: 'nope' })).expect(400);
    assert.ok(res.body.errors.clinic);
    assert.ok(res.body.errors.email);
    await request(app).post('/api/leads').send(booking({ slot: inDays(-1) })).expect(400);
  });

  it('never gives the same time to two bookings, and frees it when the lead is lost', async () => {
    const slot = inDays(11);
    const first = await request(app).post('/api/leads').send(booking({ slot })).expect(201);
    const taken = await request(app).post('/api/leads').send(booking({ slot, email: 'b@orbitvet.example' })).expect(409);
    assert.match(taken.body.message, /took this time/);

    await asAdmin(request(app).patch(`/api/leads/${first.body.lead._id}`)).send({ status: 'lost' }).expect(200);
    const second = await request(app).post('/api/leads').send(booking({ slot, email: 'b@orbitvet.example' })).expect(201);

    // Reopening the first would now clash with the second.
    await asAdmin(request(app).patch(`/api/leads/${first.body.lead._id}`)).send({ status: 'new' }).expect(409);
    assert.ok(second.body.lead._id);
  });

  it('shows taken times to anyone, with no personal details', async () => {
    const slot = inDays(12);
    await request(app).post('/api/leads').send(booking({ slot })).expect(201);
    const res = await request(app).get('/api/leads/taken').expect(200);
    assert.deepEqual(res.body, [slot]);
  });

  it('accepts contact requests without a time, and they stay out of My Demo Bookings', async () => {
    const { token } = await signIn('+919876543210');
    await as(token)(request(app).post('/api/leads')).send({ type: 'contact', name: 'A B', email: 'a@b.example', clinic: 'AB Vet', size: 'Solo', message: 'Hi' }).expect(201);
    const mine = await as(token)(request(app).get('/api/me/bookings')).expect(200);
    assert.equal(mine.body.length, 0);
    const all = await asAdmin(request(app).get('/api/leads')).expect(200);
    assert.equal(all.body[0].type, 'contact');
  });
});

describe('who sees which booking', () => {
  it('shows customers their own bookings only, by account or by the number on the form', async () => {
    const a = await signIn('+919000000001');
    const b = await signIn('+919000000002');
    await as(a.token)(request(app).post('/api/leads')).send(booking({ slot: inDays(13) })).expect(201);
    await request(app).post('/api/leads').send(booking({ slot: inDays(14), phone: '+919000000001' })).expect(201);
    assert.equal((await as(a.token)(request(app).get('/api/me/bookings'))).body.length, 2);
    assert.equal((await as(b.token)(request(app).get('/api/me/bookings'))).body.length, 0);
  });

  it('moves a guest booking onto the account signed in with its claim token, once', async () => {
    const res = await request(app).post('/api/leads').send(booking({ slot: inDays(15) })).expect(201);
    const { token } = await signIn('+919000000003', res.body.claimToken);
    const mine = await as(token)(request(app).get('/api/me/bookings'));
    assert.equal(mine.body.length, 1);

    const other = await signIn('+919000000004', res.body.claimToken);
    assert.equal((await as(other.token)(request(app).get('/api/me/bookings'))).body.length, 0);
  });

  it('ignores a made-up claim token', async () => {
    await request(app).post('/api/leads').send(booking({ slot: inDays(16) })).expect(201);
    const { token } = await signIn('+919000000005', 'not-a-token');
    assert.equal((await as(token)(request(app).get('/api/me/bookings'))).body.length, 0);
  });

  it('keeps the leads list and every change to admins', async () => {
    const lead = (await request(app).post('/api/leads').send(booking({ slot: inDays(17) }))).body.lead;
    const { token } = await signIn('+919000000006');
    await request(app).get('/api/leads').expect(401);
    await as(token)(request(app).get('/api/leads')).expect(403);
    await as(token)(request(app).patch(`/api/leads/${lead._id}`)).send({ status: 'accepted' }).expect(403);
    await request(app).delete(`/api/leads/${lead._id}`).expect(401);
  });
});

describe('the lead pipeline', () => {
  const start = async (overrides) => (await request(app).post('/api/leads').send(booking(overrides)).expect(201)).body.lead;
  const move = (id, body) => asAdmin(request(app).patch(`/api/leads/${id}`)).send(body);

  it('moves one step at a time and records each one', async () => {
    const lead = await start({ slot: inDays(18) });
    for (const status of ['accepted', 'contacted', 'demo-booked', 'won']) {
      const res = await move(lead._id, { status }).expect(200);
      assert.equal(res.body.status, status);
    }
    const final = await asAdmin(request(app).get('/api/leads')).expect(200);
    assert.deepEqual(final.body[0].history.map((h) => h.status), ['new', 'accepted', 'contacted', 'demo-booked', 'won']);
  });

  it('refuses to skip steps or lose a won lead', async () => {
    const lead = await start({ slot: inDays(19) });
    await move(lead._id, { status: 'won' }).expect(409);
    await move(lead._id, { status: 'contacted' }).expect(409);
    for (const status of ['accepted', 'contacted', 'demo-booked', 'won']) await move(lead._id, { status }).expect(200);
    await move(lead._id, { status: 'lost' }).expect(409);
    await move(lead._id, { status: 'demo-booked' }).expect(200);
  });

  it('reopens a lost lead where it left off', async () => {
    const lead = await start({ slot: inDays(20) });
    await move(lead._id, { status: 'accepted' }).expect(200);
    await move(lead._id, { status: 'lost', lostReason: 'Went with another PIMS' }).expect(200);
    await move(lead._id, { status: 'new' }).expect(409);
    const res = await move(lead._id, { status: 'accepted', lostReason: '' }).expect(200);
    assert.equal(res.body.lostReason, '');
  });

  it('needs a time before a demo is booked', async () => {
    const created = await request(app).post('/api/leads').send({ type: 'contact', name: 'A B', email: 'a@b.example', clinic: 'AB Vet' }).expect(201);
    const { _id: id } = created.body.lead;
    await move(id, { status: 'accepted' }).expect(200);
    await move(id, { status: 'contacted' }).expect(200);
    const refused = await move(id, { status: 'demo-booked' }).expect(400);
    assert.match(refused.body.message, /date and time/);
    await move(id, { status: 'demo-booked', slot: inDays(21) }).expect(200);
  });

  it('only accepts http(s) meeting links', async () => {
    const lead = await start({ slot: inDays(22) });
    await move(lead._id, { meetingLink: 'javascript:alert(1)' }).expect(400);
    const ok = await move(lead._id, { meetingLink: 'https://meet.google.com/abc', note: 'See you then' }).expect(200);
    assert.equal(ok.body.note, 'See you then');
  });

  it('tells an open page straight away when its booking moves', async () => {
    const { token } = await signIn('+919000000007');
    const lead = (await as(token)(request(app).post('/api/leads')).send(booking({ slot: inDays(23) })).expect(201)).body.lead;

    const server = app.listen(0);
    const controller = new AbortController();
    try {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/api/events`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
      assert.match(res.headers.get('content-type'), /^text\/event-stream/);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      assert.match((await reader.read()).value, /connected/);
      await move(lead._id, { status: 'accepted' }).expect(200);
      assert.match((await reader.read()).value, /event: change/);
    } finally {
      controller.abort();
      server.closeAllConnections();
      server.close();
    }
  });

  it('refuses the event stream without a token', async () => {
    await request(app).get('/api/events').expect(401);
  });
});

describe('website content', () => {
  it('starts filled from the seed, in order', async () => {
    const plans = await request(app).get('/api/plans').expect(200);
    assert.deepEqual(plans.body.map((p) => p.name), ['Vanilla', 'Growth', 'Multi-Location', 'Enterprise']);
    const settings = await request(app).get('/api/settings').expect(200);
    assert.equal(settings.body.contactEmail, 'support@hapivet.com');
  });

  it('hides unpublished items from visitors but not from admins', async () => {
    const created = await asAdmin(request(app).post('/api/achievements')).send({ title: 'Draft', org: 'Org', date: '2026-11-04', summary: 'Not yet', published: false }).expect(201);
    const visitors = await request(app).get('/api/achievements').expect(200);
    assert.ok(!visitors.body.some((a) => a.title === 'Draft'));
    const admins = await asAdmin(request(app).get('/api/achievements')).expect(200);
    assert.equal(admins.body[0].title, 'Draft');
    await asAdmin(request(app).delete(`/api/achievements/${created.body._id}`)).expect(204);
  });

  it('edits only with an admin token, and validates what it stores', async () => {
    const [plan] = (await request(app).get('/api/plans')).body;
    await request(app).patch(`/api/plans/${plan._id}`).send({ price: 1 }).expect(401);
    await asAdmin(request(app).post('/api/team')).send({ name: 'No Role' }).expect(400);
    await asAdmin(request(app).post('/api/achievements')).send({ title: 'T', org: 'O', date: '2026-01-01', summary: 'S', link: 'javascript:alert(1)' }).expect(400);
    const res = await asAdmin(request(app).patch(`/api/plans/${plan._id}`)).send({ price: 205 }).expect(200);
    assert.equal(res.body.price, 205);
    await asAdmin(request(app).patch(`/api/plans/${plan._id}`)).send({ price: 199 }).expect(200);
  });

  it('answers cleanly for an unknown or malformed id', async () => {
    await asAdmin(request(app).patch('/api/plans/not-an-id')).send({ price: 1 }).expect(400);
    await asAdmin(request(app).delete('/api/plans/000000000000000000000000')).expect(404);
    await request(app).get('/api/nothing-here').expect(404);
  });

  it('saves settings for admins only', async () => {
    await request(app).patch('/api/settings').send({ heroTitleA: 'Hacked' }).expect(401);
    const res = await asAdmin(request(app).patch('/api/settings')).send({ heroTitleA: 'New title' }).expect(200);
    assert.equal(res.body.heroTitleA, 'New title');
    await asAdmin(request(app).patch('/api/settings')).send({ heroTitleA: 'Your clinic runs itself.' }).expect(200);
  });
});

describe('admin login', () => {
  it('refuses a wrong password', async () => {
    await request(app).post('/api/auth/admin').send({ email: 'admin@hapivet.com', password: 'wrong' }).expect(401);
  });

  it('resets to the sample data outside production, for admins only', async () => {
    await request(app).post('/api/admin/reset').expect(401);
    await request(app).post('/api/leads').send(booking({ slot: inDays(24) })).expect(201);
    await asAdmin(request(app).post('/api/admin/reset')).expect(200);
    const leads = await asAdmin(request(app).get('/api/leads')).expect(200);
    assert.ok(leads.body.every((l) => l.email !== 'kavya@orbitvet.example'));
    assert.equal((await request(app).get('/api/plans')).body.length, 4);
  });
});
