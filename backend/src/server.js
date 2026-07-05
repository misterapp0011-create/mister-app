import http from 'http';
import { createApp } from './app.js';
import { initSockets } from './sockets/index.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function start() {
  // Fail fast if the database is unreachable.
  try {
    await pool.query('SELECT 1');
    console.log('[db] connected');
  } catch (err) {
    console.error('[db] connection failed — check DATABASE_URL in .env:', err.message);
    process.exit(1);
  }

  const app = createApp();
  const httpServer = http.createServer(app);
  initSockets(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[server] Mister API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
