import { Router } from 'express';
import { canMove } from '../domain.js';
import { optionalAuth, requireAdmin, signClaim } from '../lib/auth.js';
import { badRequest, HttpError, notFound } from '../lib/errors.js';
import { publishLead } from '../lib/events.js';
import { leadLimiter } from '../lib/limits.js';
import { leadPatchSchema, newLeadSchema } from '../lib/validation.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';

export const leadsRouter = Router();

// Times already booked here, for the calendar. Only the times: no one's details.
leadsRouter.get('/taken', async (_req, res) => {
  res.json(await Lead.distinct('slotLock', { slotLock: { $gte: new Date() } }));
});

// A demo booking or a contact request from the website. Guests get a claim token, so signing in
// right after moves the booking onto their account.
leadsRouter.post('/', leadLimiter, optionalAuth, async (req, res) => {
  const body = newLeadSchema.parse(req.body);
  const account = req.auth?.role === 'customer' ? await User.findById(req.auth.sub) : null;
  const lead = await Lead.create({
    ...body,
    userPhone: account?.phone ?? '',
    history: [{ status: 'new', at: new Date() }],
  });
  publishLead(lead);
  res.status(201).json({ lead, ...(account ? {} : { claimToken: signClaim(lead._id) }) });
});

leadsRouter.get('/', requireAdmin, async (_req, res) => {
  res.json(await Lead.find().sort({ createdAt: -1 }));
});

leadsRouter.patch('/:id', requireAdmin, async (req, res) => {
  const { status, ...fields } = leadPatchSchema.parse(req.body);
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw notFound('That lead no longer exists');

  if (status && status !== lead.status) {
    if (!canMove(lead, status)) throw new HttpError(409, `A lead at “${lead.status}” can’t move to “${status}”`);
    if (status === 'demo-booked' && !(fields.slot ?? lead.slot)) throw badRequest('Pick the demo date and time first');
    lead.status = status;
    lead.history.push({ status, at: new Date() });
  }
  lead.set(fields);
  await lead.save();
  publishLead(lead);
  res.json(lead);
});

leadsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) throw notFound('That lead no longer exists');
  publishLead(lead);
  res.status(204).end();
});
