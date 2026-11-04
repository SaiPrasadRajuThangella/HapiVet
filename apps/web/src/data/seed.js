// Seed data scraped from hapivet.com. Acts as the mock backend until the Express/Mongo API exists.
// Shape mirrors the planned Mongoose models so swapping to fetch() later is a one-file change.
import { unsplash } from '../lib/img';

export const stats = [
  { value: 4, suffix: '+ hrs', label: 'saved daily' },
  { value: 23, suffix: '%', label: 'revenue lift' },
  { value: 50, suffix: '%', label: 'less admin work' },
];

export const activeTasks = [
  { icon: 'Phone', title: 'Answering call from (555) 234-8901', detail: 'Scheduling appointment for "Max" - wellness exam' },
  { icon: 'FileText', title: 'Writing SOAP note', detail: 'Bella - Post-op checkup with Dr. Martinez' },
  { icon: 'CalendarClock', title: 'Optimizing tomorrow\'s schedule', detail: 'Moved 3 appointments to reduce wait times' },
];

export const clinicNames = [
  'Cary Animal Hospital', 'Apex Veterinary Care', 'Wake Forest Animal Clinic', 'Raleigh Pet Hospital',
  'Sterling Animal Care', 'Ashburn Vet Center', 'Rockville Animal Hospital', 'Coral Creek Pet Hospital',
  'VIP Animal Hospital', 'Grand Animal Hospital', 'Paws & Claws Veterinary', 'Sunset Pet Clinic',
  'Valley View Animal Care', 'Mountain View Vet',
];

// Descriptions and capabilities come from the agent hover cards on hapivet.com; details and stats come
// from its product pages (core-pims, ai-assistant, billing, schedquick).
export const agents = [
  {
    key: 'front', name: 'Front Desk', tag: 'Voice & scheduling', icon: 'Phone',
    image: unsplash('1565277441243-2be39689f95b', 640), alt: 'A teal telephone on a white surface',
    blurb: 'Answers calls, schedules appointments and handles client inquiries 24/7.',
    detail: 'When a client calls, their patient records appear instantly. Cancellations automatically notify waitlisted clients, filling schedule gaps without phone tag.',
    points: ['Call answering', 'Appointment booking', 'Client messaging', 'Follow-up reminders'],
    stats: [['24/7', 'Client inquiries'], ['40%', 'Fewer no-shows'], ['1 click', 'Recurring appointments']],
  },
  {
    key: 'clinical', name: 'Clinical', tag: 'Notes & care', icon: 'Stethoscope',
    image: unsplash('1700665537604-412e89a285c3', 640), alt: 'Two veterinary clinicians in blue scrubs examining a dog',
    blurb: 'Writes SOAP notes, generates treatment plans and captures medical history.',
    detail: 'Speak during or after the exam and your words become a structured SOAP note. Lab results land directly in patient records, with abnormal values flagged.',
    points: ['SOAP documentation', 'Treatment plans', 'Medical summaries', 'Lab integration'],
    stats: [['40%', 'Faster documentation'], ['2 hrs', 'Saved per vet daily'], ['90%', 'Less after-hours charting']],
  },
  {
    key: 'revenue', name: 'Revenue', tag: 'Billing & payments', icon: 'CircleDollarSign',
    image: unsplash('1786511031583-0b7540b4ab75', 640), alt: 'A person tapping a blue credit card on a payment terminal',
    blurb: 'Captures missed charges, optimizes pricing and automates billing.',
    detail: 'Complete your SOAP notes as usual and billable items are captured automatically. Review the generated estimate, send it, and funds reconcile on their own.',
    points: ['Charge capture', 'Invoice generation', 'Payment reminders', 'Revenue analytics'],
    stats: [['15%', 'Average revenue increase'], ['$0', 'Missed charges'], ['2x', 'Faster invoicing']],
  },
  {
    key: 'ops', name: 'Operations', tag: 'Staff & inventory', icon: 'Boxes',
    image: unsplash('1611072965169-e1534f6f300c', 640), alt: 'White medicine bottles lined up on a wooden shelf',
    blurb: 'Manages inventory, optimizes schedules and tracks KPIs.',
    detail: 'One click schedules the entire month, balancing coverage, preferences and labor costs. Low-stock alerts reach you before you run out.',
    points: ['Inventory alerts', 'Schedule optimization', 'Staff management', 'Performance tracking'],
    stats: [['10x', 'Faster scheduling'], ['94%', 'Preferences honored'], ['$0', 'Overtime surprises']],
  },
];

export const opsFeatures = [
  ['Staff Scheduling', 'AI-optimized shift management and coverage'],
  ['Task Assignment', 'Automated task delegation with smart reminders'],
  ['Inventory Tracking', 'Real-time stock levels with auto-reorder alerts'],
  ['Lab Order Tracking', 'Track lab orders from submission to results'],
  ['Workflow Automation', 'Custom workflows across all departments'],
  ['Multi-location Management', 'Unified dashboard for hospital groups'],
];

export const copilotFeatures = [
  ['Real-time Suggestions', 'AI suggests products, services & diagnostics based on symptoms'],
  ['One-tap Accept/Decline', 'Vet stays in control — accept or skip any suggestion'],
  ['Voice-to-SOAP Notes', 'Dictate notes, get structured documentation instantly'],
  ['Smart Charge Capture', 'Never miss a billable item with AI-powered detection'],
  ['Auto-Invoice Generation', 'Accepted items flow directly to the patient invoice'],
];

export const analyticsFeatures = [
  ['Time per Patient', 'Track exactly how long each appointment takes'],
  ['Wait Time Tracking', 'Monitor and reduce pet parent wait times'],
  ['Capacity Utilization', 'See appointment slots used vs available in real time'],
  ['Historical Trends', 'Analyze patterns for better staff scheduling'],
  ['Zero Wait Reports', 'Revenue, inventory, controlled substances — instantly'],
];

export const revenueFeatures = [
  ['Smart Estimates', 'Generate accurate estimates from diagnosis'],
  ['Flexible Payments', 'Split payments and payment plans built-in'],
  ['Declined Estimate Tracking', 'Follow up on declined estimates automatically'],
  ['Revenue Analytics', 'Deep insights into practice profitability'],
];

export const platform = [
  ['Role-Specific Assistants', 'Purpose-built AI assistants that understand the context of each team member’s role.', 'Users'],
  ['Enterprise Security', 'HIPAA-adjacent best practices with end-to-end encryption, audit logs and role-based access.', 'ShieldCheck'],
  ['Cloud-Native Infrastructure', '99.9% uptime SLA with automatic failover across regions.', 'Cloud'],
  ['Open API & Integrations', 'Connect existing tools through a comprehensive API and pre-built integrations.', 'Plug'],
  ['Real-time Processing', 'Lightning-fast AI responses with edge computing for time-sensitive decisions.', 'Zap'],
  ['Instant Report Generation', 'Reports that took 5 minutes now generate instantly. Zero wait.', 'FileBarChart'],
];

export const whyPoints = [
  ['Designed for real clinic workflows', 'Not generic software adapted for vets. Built from the ground up for veterinary medicine.'],
  ['Reduces burnout and admin overload', 'Automate the repetitive work so your team can focus on patient care.'],
  ['Scales as you grow', 'From single clinic to multi-location enterprise. One platform that grows with you.'],
  ['Modern UI, minimal training', 'Intuitive design your team will actually want to use. Productive on day one.'],
];

export const integrations = [
  { group: 'Lab & Diagnostic Providers', items: ['IDEXX Labs', 'Antech Diagnostics'] },
  { group: 'Payment Processors', items: ['Worldpay (Preferred)', 'HapiVet Payments'] },
  { group: 'PMS Data Migration', items: ['Cornerstone', 'Avimark', 'Impromed', 'eVetPractice'] },
];

export const partners = [
  ['IDEXX Labs', 'Labs'], ['Antech Diagnostics', 'Labs'], ['Worldpay', 'Preferred Payments'], ['Roo Vet', 'Staffing'], ['+50 More', 'Integrations'],
];

// Values read from the comparison table on hapivet.com (green / amber / red icons).
export const compareRows = [
  ['Agentic AI Platform', 'yes', 'no', 'no'],
  ['Multiple Specialized AI Agents', 'yes', 'no', 'partial'],
  ['Voice-to-SOAP Documentation', 'yes', 'no', 'partial'],
  ['All-in-One Platform', 'yes', 'partial', 'no'],
  ['Instant Report Generation', 'yes', 'no', 'partial'],
  ['Modern Cloud Infrastructure', 'yes', 'partial', 'yes'],
  ['Multi-location Management', 'yes', 'partial', 'no'],
  ['Open API & Integrations', 'yes', 'partial', 'partial'],
  ['Automated Workflows', 'yes', 'no', 'partial'],
];

export const onboarding = [
  { week: 'Week 1-2', title: 'Data Migration', text: 'We export your data from your current PIMS and securely migrate it to HapiVet. Full validation to ensure nothing is lost.' },
  { week: 'Week 2-3', title: 'Team Training', text: 'Role-based training for front desk staff, technicians and veterinarians. Everyone learns at their own pace.' },
  { week: 'Week 4', title: 'Go Live', text: 'Your practice runs fully on HapiVet with our team on standby for support.' },
];

export const team = [
  { _id: 't1', name: 'Sunil Kakarla', role: 'Co-Founder, Chief Medical Officer', alias: 'Dr. K, DVM', photo: 'https://hapivet.com/assets/assets/Sunil%20Kakarla.853dd9e7973f098ba9afd73d924b8af0.jpg', bio: 'Leads clinical direction and keeps the product grounded in real veterinary workflows.' },
  { _id: 't2', name: 'Divyesh Yeluri', role: 'Co-Founder, Chief of Product & AI', alias: '', photo: 'https://hapivet.com/assets/assets/divyesh_headshot.219720cc65adb0bd46eaf9b0f33f452a.jpeg', bio: 'Leads Agentic AI and platform design — product strategy and AI architecture.' },
  { _id: 't3', name: 'Srikanth Sabbineni', role: 'Chief Technical Officer', alias: '', photo: 'https://hapivet.com/assets/assets/srikanth.066eec036cc40ceb6cd99ef5c0a2661f.jpg', bio: 'Owns platform architecture, security and reliability in real clinic conditions.' },
  { _id: 't4', name: 'Dr. Raam Krishna Karanam', role: 'Chief Veterinarian Advisor', alias: '', photo: 'https://hapivet.com/assets/assets/raamkrishna%20karanam.0e9113cb32f1ee55a88a2f61ed2cd9d9.jpg', bio: 'Pressure-tests workflows and protocols against how veterinary medicine is practiced.' },
];

// ---- collections managed from the admin panel ----

// Sources: hapivet.com/press and public LinkedIn posts. LinkedIn dates are decoded from the post IDs.
export const achievements = [
  {
    _id: 'a1', title: 'Launched Hapi Agentic Lab', org: 'HapiVet', date: '2026-04-02',
    summary: 'HapiVet’s applied research division, developing agentic AI architectures that go beyond veterinary medicine into automated greenhouses, data migration and surgical vision training.',
    image: unsplash('1518770660439-4636190af475', 900), link: 'https://hapivet.com/press', published: true,
  },
  {
    _id: 'a2', title: 'Shared the stage at a LangChain community meetup', org: 'LangChain · Hyderabad', date: '2026-04-20',
    summary: 'HapiVet AI spoke to the Hyderabad AI community about layering agentic AI onto existing systems without rebuilding from scratch.',
    image: unsplash('1540575467063-178a50c2df87', 900), link: 'https://www.linkedin.com/posts/knacklabs_langchain-ai-rag-activity-7451921905625829376-K5Pa', published: true,
  },
  {
    _id: 'a3', title: 'Joined Microsoft for Startups Founders Hub', org: 'Microsoft', date: '2026-02-12',
    summary: 'HapiVet AI became part of Microsoft for Startups Founders Hub, backing its AI-driven platform with the infrastructure it needs to scale.',
    image: unsplash('1451187580459-43490279c0fa', 900), link: 'https://www.linkedin.com/posts/hapivet-ai_excited-to-share-that-hapivet-ai-is-now-part-activity-7427849309511172096-6gpS', published: true,
  },
];

export const testimonials = [
  {
    _id: 'r1', name: 'Dr. David Kim, DVM', role: 'Hospital Owner, San Diego',
    quote: 'HapiVet finally gets what it’s like to run a veterinary practice. The AI handles the admin chaos so I can actually practice medicine.',
    metricA: '40%|Less documentation time', metricB: '2 hrs|Saved per day', published: true,
  },
];

export const plans = [
  { _id: 'p1', name: 'Vanilla', price: 199, unit: '/month', blurb: 'For solo veterinarians and small clinics just getting started.', popular: false, cta: 'Book a Demo',
    features: ['Appointment Booking Links', 'Inventory Management', 'Appointment Scheduling', 'Clinical AI Agent Only', 'Basic Reporting & Analytics', 'Rate-limited AI Features'], addon: 'QuickSched AI +$75/mo' },
  { _id: 'p2', name: 'Growth', price: 849, unit: '/month', blurb: 'For growing practices ready for full AI automation.', popular: true, cta: 'Book a Demo',
    features: ['Everything in Vanilla', 'Unlimited Users', 'QuickSched AI Team Scheduler', 'All AI Agents Included', 'Full Agentic AI Interface', '24/7 Live Support', 'Zero Migration Cost'] },
  { _id: 'p3', name: 'Multi-Location', price: 700, unit: '/hospital/mo', blurb: 'For clinic groups managing up to 100 hospitals.', popular: false, cta: 'Contact Sales',
    features: ['Everything in Growth', 'Multi-Location Dashboard', 'Consolidated Reporting', 'Region-wise Analytics', 'Cross-location Staff Management', 'Dedicated Success Manager'] },
  { _id: 'p4', name: 'Enterprise', price: null, unit: 'Custom', blurb: 'For large networks (100+ hospitals) needing custom solutions.', popular: false, cta: 'Contact Sales',
    features: ['Everything in Multi-Location', 'Bulk Pricing', 'Custom Development', 'API Access', 'Custom SLA', 'White-glove Migration'] },
];

export const faqs = [
  ['Is there a long-term contract?', 'No. All plans are month-to-month with no long-term commitment. Yearly plans are billed annually but can be cancelled for a prorated refund.'],
  ['What’s included in migration?', 'Growth, Multi-Location and Enterprise plans include full data migration at no extra cost — patient records, client data, appointment history and more.'],
  ['Can I switch plans later?', 'Yes. Upgrade or downgrade at any time; changes take effect on your next billing cycle.'],
  ['What’s the 24/7 Live Support?', 'Growth and above includes 24/7 access to live Zoom support — jump on a call with our team anytime.'],
];

export const leads = [
  { _id: 'l1', name: 'Dr. Maya Patel', email: 'maya@cedarvet.com', clinic: 'Cedar Veterinary', size: '2-5 vets', message: 'Interested in migrating from Cornerstone.', status: 'new', createdAt: '2026-10-30T14:12:00Z' },
  { _id: 'l2', name: 'Tom Alvarez', email: 'tom@brightpaws.com', clinic: 'Bright Paws Hospital', size: '6-10 vets', message: 'Need a multi-location demo.', status: 'contacted', createdAt: '2026-10-28T09:40:00Z' },
  { _id: 'l3', name: 'Dr. Priya Nair', email: 'priya@harborpet.com', clinic: 'Harbor Pet Clinic', size: 'Solo', message: 'Pricing for the Vanilla plan?', status: 'demo-booked', createdAt: '2026-10-26T17:05:00Z' },
  { _id: 'l4', name: 'Jason Lee', email: 'jason@summitanimal.com', clinic: 'Summit Animal Care', size: '2-5 vets', message: '', status: 'new', createdAt: '2026-10-25T11:21:00Z' },
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
