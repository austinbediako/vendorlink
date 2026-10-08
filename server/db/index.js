const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || isProduction);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(requiresSsl
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  withTransaction,
};
