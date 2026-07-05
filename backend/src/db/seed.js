import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  console.log('[seed] inserting seed data ...');
  await pool.query(seedSql);
  console.log('[seed] done.');
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});
