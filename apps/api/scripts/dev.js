// `npm run dev`: one command for local development. Without MONGODB_URI it starts a local MongoDB
// (kept in apps/api/.data, so data survives restarts), then runs the API with auto-reload.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

try {
  process.loadEnvFile();
} catch {
  // No .env file
}

const LOCAL_DB_PORT = 27019;
const dbPath = fileURLToPath(new URL('../.data/db', import.meta.url));

// Keep the downloaded MongoDB in node_modules, even when started from the repo root.
process.env.MONGOMS_DOWNLOAD_DIR ??= fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server', import.meta.url));

let local = null;
let uri = process.env.MONGODB_URI;

if (!uri) {
  mkdirSync(dbPath, { recursive: true });
  local = await MongoMemoryServer.create({ instance: { dbPath, port: LOCAL_DB_PORT, storageEngine: 'wiredTiger' } });
  uri = `${local.getUri()}hapivet`;
  console.log(`Local MongoDB running at ${uri} (data in apps/api/.data)`);
}

const api = spawn(process.execPath, ['--watch', 'src/index.js'], {
  env: { ...process.env, MONGODB_URI: uri },
  stdio: 'inherit',
});

let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  api.kill();
  // Keep the files so the data is still there next time.
  await local?.stop({ doCleanup: false });
  process.exit(code);
}

api.on('exit', (code) => stop(code ?? 0));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
