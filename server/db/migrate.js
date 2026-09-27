require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./index');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Applying ${file}...`);
    await query(fs.readFileSync(path.join(dir, file), 'utf-8'));
  }
  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
