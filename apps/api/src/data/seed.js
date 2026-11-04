// What a new database starts with. Copy and team come from hapivet.com; the sample leads are invented.
const unsplash = (id, w = 1200, q = 70) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const team = [
  { name: 'Sunil Kakarla', role: 'Co-Founder, Chief Medical Officer', alias: 'Dr. K, DVM', photo: 'https://hapivet.com/assets/assets/Sunil%20Kakarla.853dd9e7973f098ba9afd73d924b8af0.jpg', bio: 'Leads clinical direction and keeps the product grounded in real veterinary workflows.' },
  { name: 'Divyesh Yeluri', role: 'Co-Founder, Chief of Product & AI', alias: '', photo: 'https://hapivet.com/assets/assets/divyesh_headshot.219720cc65adb0bd46eaf9b0f33f452a.jpeg', bio: 'Leads Agentic AI and platform design — product strategy and AI architecture.' },
  { name: 'Srikanth Sabbineni', role: 'Chief Technical Officer', alias: '', photo: 'https://hapivet.com/assets/assets/srikanth.066eec036cc40ceb6cd99ef5c0a2661f.jpg', bio: 'Owns platform architecture, security and reliability in real clinic conditions.' },
  { name: 'Dr. Raam Krishna Karanam', role: 'Chief Veterinarian Advisor', alias: '', photo: 'https://hapivet.com/assets/assets/raamkrishna%20karanam.0e9113cb32f1ee55a88a2f61ed2cd9d9.jpg', bio: 'Pressure-tests workflows and protocols against how veterinary medicine is practiced.' },
];

export const achievements = [
  {
    title: 'Launched Hapi Agentic Lab', org: 'HapiVet', date: '2026-04-02',
    summary: 'HapiVet’s applied research division, developing agentic AI architectures that go beyond veterinary medicine into automated greenhouses, data migration and surgical vision training.',
    image: unsplash('1518770660439-4636190af475', 900), link: 'https://hapivet.com/press', published: true,
  },
  {
    title: 'Shared the stage at a LangChain community meetup', org: 'LangChain · Hyderabad', date: '2026-04-20',
    summary: 'HapiVet AI spoke to the Hyderabad AI community about layering agentic AI onto existing systems without rebuilding from scratch.',
    image: unsplash('1540575467063-178a50c2df87', 900), link: 'https://www.linkedin.com/posts/knacklabs_langchain-ai-rag-activity-7451921905625829376-K5Pa', published: true,
  },
  {
    title: 'Joined Microsoft for Startups Founders Hub', org: 'Microsoft', date: '2026-02-12',
    summary: 'HapiVet AI became part of Microsoft for Startups Founders Hub, backing its AI-driven platform with the infrastructure it needs to scale.',
    image: unsplash('1451187580459-43490279c0fa', 900), link: 'https://www.linkedin.com/posts/hapivet-ai_excited-to-share-that-hapivet-ai-is-now-part-activity-7427849309511172096-6gpS', published: true,
  },
];

export const testimonials = [
  {
    name: 'Dr. David Kim, DVM', role: 'Hospital Owner, San Diego',
    quote: 'HapiVet finally gets what it’s like to run a veterinary practice. The AI handles the admin chaos so I can actually practice medicine.',
    metricA: '40%|Less documentation time', metricB: '2 hrs|Saved per day', published: true,
  },
];

export const plans = [
  { name: 'Vanilla', price: 199, unit: '/month', blurb: 'For solo veterinarians and small clinics just getting started.', popular: false, cta: 'Book a Demo',
    features: ['Appointment Booking Links', 'Inventory Management', 'Appointment Scheduling', 'Clinical AI Agent Only', 'Basic Reporting & Analytics', 'Rate-limited AI Features'], addon: 'QuickSched AI +$75/mo' },
  { name: 'Growth', price: 849, unit: '/month', blurb: 'For growing practices ready for full AI automation.', popular: true, cta: 'Book a Demo',
    features: ['Everything in Vanilla', 'Unlimited Users', 'QuickSched AI Team Scheduler', 'All AI Agents Included', 'Full Agentic AI Interface', '24/7 Live Support', 'Zero Migration Cost'] },
  { name: 'Multi-Location', price: 700, unit: '/hospital/mo', blurb: 'For clinic groups managing up to 100 hospitals.', popular: false, cta: 'Contact Sales',
    features: ['Everything in Growth', 'Multi-Location Dashboard', 'Consolidated Reporting', 'Region-wise Analytics', 'Cross-location Staff Management', 'Dedicated Success Manager'] },
  { name: 'Enterprise', price: null, unit: 'Custom', blurb: 'For large networks (100+ hospitals) needing custom solutions.', popular: false, cta: 'Contact Sales',
    features: ['Everything in Multi-Location', 'Bulk Pricing', 'Custom Development', 'API Access', 'Custom SLA', 'White-glove Migration'] },
];

export const settings = {
  heroTitleA: 'Your clinic runs itself.',
  heroTitleB: 'You focus on care.',
  heroSub: 'HapiVet AI handles your phones, writes your notes, manages your schedule, and captures every dollar — while you do what you love: healing animals.',
  contactEmail: 'support@hapivet.com',
  pressEmail: 'press@hapivet.com',
  address: '1440 Sabino Dr, Cary, North Carolina 27519',
  linkedin: 'https://www.linkedin.com/company/hapivet-ai/',
};

// Slots sit outside the calendar's open hours so these samples don't take real times off the booking page.
export const sampleLeads = [
  { type: 'demo', name: 'Dr. Maya Patel', email: 'maya@cedarvet.com', phone: '+15550100101', clinic: 'Cedar Veterinary', jobTitle: 'Hospital Owner', city: 'Austin, TX', slot: '2026-11-18T16:00:00.000Z', timeZone: 'America/Chicago', message: 'Interested in migrating from Cornerstone.', status: 'new', createdAt: '2026-10-30T14:12:00Z' },
  { type: 'demo', name: 'Tom Alvarez', email: 'tom@brightpaws.com', phone: '+15550100102', clinic: 'Bright Paws Hospital', jobTitle: 'Practice Manager', city: 'Denver, CO', slot: '2026-11-19T17:00:00.000Z', timeZone: 'America/Denver', message: 'Need a multi-location demo.', status: 'contacted', createdAt: '2026-10-28T09:40:00Z' },
  { type: 'demo', name: 'Dr. Priya Nair', email: 'priya@harborpet.com', phone: '+15550100103', clinic: 'Harbor Pet Clinic', jobTitle: 'Veterinarian', city: 'Seattle, WA', slot: '2026-11-20T17:00:00.000Z', timeZone: 'America/Los_Angeles', meetingLink: 'https://meet.google.com/abc-defg-hij', message: 'Pricing for the Vanilla plan?', status: 'demo-booked', createdAt: '2026-10-26T17:05:00Z' },
  { type: 'demo', name: 'Jason Lee', email: 'jason@summitanimal.com', phone: '+15550100104', clinic: 'Summit Animal Care', jobTitle: 'Clinic Director', city: 'Raleigh, NC', slot: '2026-11-24T15:00:00.000Z', timeZone: 'America/New_York', status: 'accepted', createdAt: '2026-10-25T11:21:00Z' },
];
