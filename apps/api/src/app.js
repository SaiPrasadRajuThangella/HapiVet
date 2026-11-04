import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFoundRoute } from './lib/errors.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { contentRouter } from './routes/content.js';
import { eventsRouter } from './routes/events.js';
import { leadsRouter } from './routes/leads.js';
import { meRouter } from './routes/me.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Render's proxy: rate limits see the real visitor
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', contentRouter);

  app.use(notFoundRoute);
  app.use(errorHandler);
  return app;
}
