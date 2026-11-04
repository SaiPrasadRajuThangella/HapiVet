import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { config } from '../config.js';
import { readClaim, signToken } from '../lib/auth.js';
import { HttpError } from '../lib/errors.js';
import { publishLead } from '../lib/events.js';
import { loginLimiter, otpLimiter } from '../lib/limits.js';
import { adminLoginSchema, otpRequestSchema, otpVerifySchema } from '../lib/validation.js';
import { Admin } from '../models/Admin.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';

export const authRouter = Router();

// No SMS provider yet: every number uses the fixed code, and the page says so.
authRouter.post('/otp', otpLimiter, (req, res) => {
  otpRequestSchema.parse(req.body);
  res.json({ sent: true, demoCode: config.FIXED_OTP });
});

// Verifying a number that has no account creates one.
authRouter.post('/verify', otpLimiter, async (req, res) => {
  const { phone, code, claim } = otpVerifySchema.parse(req.body);
  if (code !== config.FIXED_OTP) throw new HttpError(401, 'That code isn’t right. Please try again.');

  const user = await User.findOne({ phone }) ?? new User({ phone });
  user.lastLoginAt = new Date();
  await user.save();

  const leadId = claim && readClaim(claim);
  if (leadId) {
    const lead = await Lead.findOneAndUpdate({ _id: leadId, userPhone: '' }, { userPhone: phone }, { returnDocument: 'after' });
    if (lead) publishLead(lead);
  }

  res.json({ token: signToken(String(user._id), 'customer'), user });
});

authRouter.post('/admin', loginLimiter, async (req, res) => {
  const { email, password } = adminLoginSchema.parse(req.body);
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, 'That email and password don’t match.');
  }
  res.json({ token: signToken(String(admin._id), 'admin'), email: admin.email });
});
