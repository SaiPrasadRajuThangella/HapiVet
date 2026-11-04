import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './errors.js';

const EXPIRY = { admin: '12h', customer: '30d' };

export const signToken = (sub, role) => jwt.sign({ role }, config.JWT_SECRET, { subject: sub, expiresIn: EXPIRY[role] });

function readToken(header) {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), config.JWT_SECRET);
    if (!payload.sub || !EXPIRY[payload.role]) return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

// 401 when not signed in (or the session ran out), 403 when signed in with the wrong role.
const requireRole = (...roles) => (req, _res, next) => {
  const claims = readToken(req.headers.authorization);
  if (!claims) return next(new HttpError(401, 'Please sign in again'));
  if (!roles.includes(claims.role)) return next(new HttpError(403, 'Not allowed'));
  req.auth = claims;
  return next();
};

export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');
export const requireSignedIn = requireRole('admin', 'customer');

// For public routes that do a little more when someone is signed in.
export const optionalAuth = (req, _res, next) => {
  req.auth = readToken(req.headers.authorization) ?? undefined;
  next();
};

// Lets whoever just booked as a guest move that booking onto the account they then sign in with.
export const signClaim = (leadId) => jwt.sign({ claim: String(leadId) }, config.JWT_SECRET, { expiresIn: '2h' });

export function readClaim(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET).claim ?? null;
  } catch {
    return null;
  }
}
