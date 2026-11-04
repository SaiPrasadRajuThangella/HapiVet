import { createApp } from './app.js';
import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { prepareDatabase } from './lib/seeding.js';

if (!config.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Use `npm run dev` locally, or set it to your MongoDB Atlas string.');
  process.exit(1);
}

await connectDb(config.MONGODB_URI);
await prepareDatabase();

const server = createApp().listen(config.PORT, () => {
  console.log(`HapiVet API on http://localhost:${config.PORT}`);
  console.log(`Customer sign-in codes are fixed to ${config.FIXED_OTP} (no SMS provider yet)`);
});

async function shutdown() {
  server.close();
  server.closeAllConnections(); // open event streams would otherwise hold the process
  await disconnectDb();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
