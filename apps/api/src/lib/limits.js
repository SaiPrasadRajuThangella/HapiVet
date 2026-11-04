import { rateLimit } from 'express-rate-limit';

// Slows down guessing codes and passwords, and form spam. Off in automated tests.
const limiter = (limit, minutes, message) => rateLimit({
  windowMs: minutes * 60000,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { message },
});

export const otpLimiter = limiter(20, 10, 'Too many sign-in attempts. Wait a few minutes and try again.');
export const loginLimiter = limiter(10, 15, 'Too many sign-in attempts. Wait a few minutes and try again.');
export const leadLimiter = limiter(20, 60, 'Too many requests from this connection. Try again later.');
