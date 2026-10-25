import { createServer } from 'node:http';
import { loadConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

let server;
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`${signal} received; shutting down gracefully.`);
  const forceExit = setTimeout(() => { console.error('Graceful shutdown timed out.'); process.exit(1); }, 10000);
  forceExit.unref();
  try {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await disconnectDatabase();
    process.exitCode = 0;
  } catch (error) { console.error('Shutdown failed:', error.message); process.exitCode = 1; }
}
try {
  const config = loadConfig();
  await connectDatabase(config.MONGODB_URI);
  const app = createApp(config);
  server = createServer(app);
  server.listen(config.PORT, () => console.info(`TaskFlow API listening on port ${config.PORT} (${config.NODE_ENV})`));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error(`TaskFlow startup failed: ${error.message}`);
  process.exitCode = 1;
}
