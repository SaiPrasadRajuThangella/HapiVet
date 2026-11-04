import { Router } from 'express';
import { config } from '../config.js';
import { requireAdmin } from '../lib/auth.js';
import { HttpError } from '../lib/errors.js';
import { seedContent, seedSampleLeads } from '../lib/seeding.js';
import { ADMIN_CHANNEL, publishAll } from '../lib/events.js';
import { collections, Settings } from '../models/content.js';
import { Lead } from '../models/Lead.js';

export const adminRouter = Router();

// Back to the sample data. Wipes real leads, so it never runs on a live server.
adminRouter.post('/reset', requireAdmin, async (_req, res) => {
  if (config.isProduction) throw new HttpError(403, 'Reset is turned off on the live site');
  await Promise.all([...Object.values(collections), Settings, Lead].map((Model) => Model.deleteMany({})));
  await seedContent();
  await seedSampleLeads();
  publishAll(ADMIN_CHANNEL);
  res.json({ ok: true });
});
