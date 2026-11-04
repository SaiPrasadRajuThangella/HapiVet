// What the admin panel edits and the website shows.
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// New items sort first; the seed sets 0, 1, 2... so its order holds.
const position = { type: Number, default: () => -Date.now() };
const options = { timestamps: true, versionKey: false };

export const Achievement = model('Achievement', new Schema({
  title: { type: String, required: true },
  org: { type: String, required: true },
  date: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  published: { type: Boolean, default: true },
  position,
}, options));

export const Testimonial = model('Testimonial', new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  quote: { type: String, required: true },
  metricA: { type: String, default: '' },
  metricB: { type: String, default: '' },
  published: { type: Boolean, default: true },
  position,
}, options));

export const Plan = model('Plan', new Schema({
  name: { type: String, required: true },
  price: { type: Number, default: null },
  unit: { type: String, required: true },
  blurb: { type: String, default: '' },
  features: { type: [String], default: [] },
  addon: { type: String, default: '' },
  cta: { type: String, default: 'Book a Demo' },
  popular: { type: Boolean, default: false },
  position,
}, options));

export const TeamMember = model('TeamMember', new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  alias: { type: String, default: '' },
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  position,
}, options));

// A single document.
export const Settings = model('Settings', new Schema({
  heroTitleA: String,
  heroTitleB: String,
  heroSub: String,
  contactEmail: String,
  pressEmail: String,
  address: String,
  linkedin: String,
}, options));

export const collections = { achievements: Achievement, testimonials: Testimonial, plans: Plan, team: TeamMember };
