import { z } from 'zod';
import { STATUSES } from '../domain.js';

const required = (message, max = 160) => z.string({ error: message }).trim().min(1, message).max(max);
const optional = (max = 200) => z.string().trim().max(max);
const email = (message = 'Please enter a valid email address') => z.string({ error: message }).trim().max(160).email(message);
// http(s) only: these end up in links on the page.
const link = z.union([z.literal(''), z.string().trim().max(2000).regex(/^https?:\/\//i, 'Links must start with http:// or https://')]);

export const phoneSchema = z.string({ error: 'Please enter a valid mobile number' }).trim().regex(/^\+\d{8,18}$/, 'Please enter a valid mobile number');

export const otpRequestSchema = z.object({ phone: phoneSchema });
export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string({ error: 'Enter the 6-digit code' }).trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  claim: z.string().max(1000).optional(),
});
export const adminLoginSchema = z.object({ email: z.string().trim().toLowerCase().max(160), password: z.string().max(200) });

// Strict: the mobile number and email can't be changed from the profile page.
export const profileSchema = z.strictObject({ name: required('Please enter your name', 80).min(2, 'Please enter your name') });

const demoLeadSchema = z.object({
  type: z.literal('demo'),
  name: required('Please enter your name', 80),
  email: email(),
  phone: z.union([z.literal(''), phoneSchema]).default(''),
  clinic: required('Please enter your practice or company name'),
  jobTitle: required('Please enter your job title'),
  city: required('Please enter your city and state'),
  guests: z.array(email('Please check the guest email addresses')).max(10).default([]),
  slot: z.coerce.date({ error: 'Please pick a time' }).refine((d) => d.getTime() > Date.now(), 'That time has already passed'),
  timeZone: optional(64).default(''),
});

const contactLeadSchema = z.object({
  type: z.literal('contact'),
  name: required('Please enter your name', 80),
  email: email(),
  clinic: required('Please enter your clinic name'),
  size: optional(40).default(''),
  message: optional(2000).default(''),
});

export const newLeadSchema = z.discriminatedUnion('type', [demoLeadSchema, contactLeadSchema]);

export const leadPatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  note: optional(1000).optional(),
  slot: z.coerce.date({ error: 'Pick a valid date and time' }).optional(),
  meetingLink: link.optional(),
  lostReason: optional(200).optional(),
});

// ---- content edited from the admin panel ----
export const contentSchemas = {
  achievements: z.object({
    title: required('Title is required'),
    org: required('Organisation is required'),
    date: required('Date is required', 20),
    summary: required('Summary is required', 2000),
    image: link.optional(),
    link: link.optional(),
    published: z.boolean().optional(),
  }),
  testimonials: z.object({
    name: required('Name is required'),
    role: required('Role is required'),
    quote: required('Quote is required', 2000),
    metricA: optional(120).optional(),
    metricB: optional(120).optional(),
    published: z.boolean().optional(),
  }),
  plans: z.object({
    name: required('Plan name is required'),
    price: z.number().min(0).nullable().optional(),
    unit: required('Unit label is required', 40),
    blurb: optional(1000).optional(),
    features: z.array(optional(200)).max(40).optional(),
    addon: optional(200).optional(),
    cta: z.enum(['Book a Demo', 'Contact Sales']).optional(),
    popular: z.boolean().optional(),
  }),
  team: z.object({
    name: required('Name is required'),
    role: required('Role is required'),
    alias: optional(80).optional(),
    photo: link.optional(),
    bio: optional(1000).optional(),
  }),
};

const optionalEmail = z.union([z.literal(''), email()]);

export const settingsSchema = z.object({
  heroTitleA: optional(120).optional(),
  heroTitleB: optional(120).optional(),
  heroSub: optional(600).optional(),
  contactEmail: optionalEmail.optional(),
  pressEmail: optionalEmail.optional(),
  address: optional(200).optional(),
  linkedin: link.optional(),
});
