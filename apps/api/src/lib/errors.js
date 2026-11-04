import mongoose from 'mongoose';
import { ZodError } from 'zod';

// An error the client should see, with its HTTP status.
export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const badRequest = (message, errors) => new HttpError(400, message, errors);
export const notFound = (message = 'Not found') => new HttpError(404, message);

// First message per field, e.g. { email: 'Please enter a valid email address' }.
function zodFieldErrors(error) {
  const errors = {};
  error.issues.forEach((issue) => {
    const key = issue.path.length ? issue.path.join('.') : '_';
    errors[key] ??= issue.message;
  });
  return errors;
}

export const notFoundRoute = (req, _res, next) => next(notFound(`No route for ${req.method} ${req.path}`));

// Every error leaves as { message, errors? }, the shape the website reads.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const errors = zodFieldErrors(err);
    return res.status(400).json({ message: Object.values(errors)[0] ?? 'Invalid request', errors });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message, errors: err.errors });
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ message: `Invalid ${err.path}` });
  if (err?.code === 11000 && err.keyPattern?.slotLock) return res.status(409).json({ message: 'Someone just took this time. Please pick another.' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ message: 'The request body isn’t valid JSON' });
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on our side. Try again.' });
}
