import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import * as seed from '../data/seed.js';
import { STAGES } from '../domain.js';
import { Admin } from '../models/Admin.js';
import { collections, Settings } from '../models/content.js';
import { Lead } from '../models/Lead.js';

// The environment is the source of truth for the admin login, so changing it and restarting takes effect.
async function ensureAdmin() {
  const admin = await Admin.findOne({ email: config.ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    await Admin.create({ email: config.ADMIN_EMAIL, passwordHash: await bcrypt.hash(config.ADMIN_PASSWORD, 12) });
  } else if (!(await bcrypt.compare(config.ADMIN_PASSWORD, admin.passwordHash))) {
    admin.passwordHash = await bcrypt.hash(config.ADMIN_PASSWORD, 12);
    await admin.save();
  }
}

export async function seedContent() {
  await Promise.all(Object.entries(collections).map(([name, Model]) => (
    Model.insertMany(seed[name].map((doc, position) => ({ ...doc, position })))
  )));
  await Settings.create(seed.settings);
}

export async function seedSampleLeads() {
  await Lead.create(seed.sampleLeads.map((lead) => ({
    ...lead,
    history: STAGES.slice(0, STAGES.indexOf(lead.status) + 1).map((status) => ({ status, at: lead.createdAt })),
  })));
}

// Settings only exist once a database has been filled, so deleting every testimonial won't bring them back on restart.
export async function prepareDatabase() {
  await ensureAdmin();
  await Lead.syncIndexes();
  if (await Settings.exists({})) return;
  await seedContent();
  if (config.SEED_SAMPLE_LEADS) await seedSampleLeads();
}
