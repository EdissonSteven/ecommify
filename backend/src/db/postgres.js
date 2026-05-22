'use strict';

const { Pool } = require('pg');

const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 10;

const sslConfig = process.env.POSTGRES_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

async function testPostgresConnection(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ PostgreSQL connected');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`⏳ PostgreSQL attempt ${attempt}/${retries} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

module.exports = { pool, testPostgresConnection };
