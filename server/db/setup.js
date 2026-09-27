require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./index');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    await query('DROP TABLE IF EXISTS notifications, disputes, ratings, booking_status_history, bookings, service_requests, service_categories, artisan_profiles, business_profiles, users CASCADE');
    await query(schema);
    console.log('Database setup complete.');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  }
}

setupDatabase();
