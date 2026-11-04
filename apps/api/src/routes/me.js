import { Router } from 'express';
import { requireCustomer } from '../lib/auth.js';
import { HttpError } from '../lib/errors.js';
import { profileSchema } from '../lib/validation.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';

export const meRouter = Router();

meRouter.use(requireCustomer, async (req, _res, next) => {
  req.user = await User.findById(req.auth.sub);
  if (!req.user) throw new HttpError(401, 'Please sign in again');
  next();
});

meRouter.get('/', (req, res) => res.json(req.user));

meRouter.patch('/', async (req, res) => {
  req.user.name = profileSchema.parse(req.body).name;
  await req.user.save();
  res.json(req.user);
});

// Demo bookings belong to the number they were booked from, or the number given on the form.
meRouter.get('/bookings', async (req, res) => {
  const { phone } = req.user;
  const bookings = await Lead.find({ type: 'demo', $or: [{ userPhone: phone }, { phone }] }).sort({ createdAt: -1 });
  res.json(bookings);
});
