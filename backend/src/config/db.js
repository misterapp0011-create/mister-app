import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[db] Unexpected error on idle client', err);
  process.exit(1);
});

/**
 * Run a query with automatic client checkout/release.
 * @param {string} text
 * @param {any[]} params
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (env.nodeEnv === 'development') {
    const duration = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log('[db] query', { text, duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client for running a transaction. Caller must release().
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}
