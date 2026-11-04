import { Router } from 'express';
import { requireSignedIn } from '../lib/auth.js';
import { HttpError } from '../lib/errors.js';
import { ADMIN_CHANNEL, customerChannel, listen } from '../lib/events.js';
import { User } from '../models/User.js';

export const eventsRouter = Router();

// Server-sent events. A message only says "something changed"; the page then fetches through its usual route.
eventsRouter.get('/', requireSignedIn, async (req, res) => {
  let channel = ADMIN_CHANNEL;
  if (req.auth.role === 'customer') {
    const user = await User.findById(req.auth.sub);
    if (!user) throw new HttpError(401, 'Please sign in again');
    channel = customerChannel(user.phone);
  }

  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write(': connected\n\n');

  const stop = listen(channel, () => res.write('event: change\ndata: {}\n\n'));
  // Proxies close connections that go quiet.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    stop();
    clearInterval(heartbeat);
  });
});
