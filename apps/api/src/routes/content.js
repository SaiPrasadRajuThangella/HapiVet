import { Router } from 'express';
import { optionalAuth, requireAdmin } from '../lib/auth.js';
import { notFound } from '../lib/errors.js';
import { contentSchemas, settingsSchema } from '../lib/validation.js';
import { collections, Settings } from '../models/content.js';

export const contentRouter = Router();

contentRouter.get('/settings', async (_req, res) => {
  res.json(await Settings.findOne() ?? {});
});

contentRouter.patch('/settings', requireAdmin, async (req, res) => {
  const patch = settingsSchema.parse(req.body);
  res.json(await Settings.findOneAndUpdate({}, patch, { upsert: true, returnDocument: 'after' }));
});

// The same four routes for each collection. Visitors only see what's published; the admin panel sees everything.
Object.entries(collections).forEach(([name, Model]) => {
  const hasPublished = !!Model.schema.path('published');
  const schema = contentSchemas[name];

  contentRouter.get(`/${name}`, optionalAuth, async (req, res) => {
    const filter = hasPublished && req.auth?.role !== 'admin' ? { published: true } : {};
    res.json(await Model.find(filter).sort({ position: 1 }));
  });

  contentRouter.post(`/${name}`, requireAdmin, async (req, res) => {
    res.status(201).json(await Model.create(schema.parse(req.body)));
  });

  contentRouter.patch(`/${name}/:id`, requireAdmin, async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, schema.partial().parse(req.body), { returnDocument: 'after' });
    if (!doc) throw notFound();
    res.json(doc);
  });

  contentRouter.delete(`/${name}/:id`, requireAdmin, async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw notFound();
    res.status(204).end();
  });
});
