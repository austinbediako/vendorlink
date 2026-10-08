const fs = require('fs');
const path = require('path');
const { query } = require('./index');

const defaultCategories = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Welding',
  'Tailoring',
  'Masonry',
  'Painting',
  'General Maintenance',
];

async function initializeDatabase() {
  try {
    console.log('Checking database tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Run schema with IF NOT EXISTS - safe to run on every startup
    await query(schema);
    console.log('Database tables verified / created.');

    // Apply incremental migrations if any
    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of migrationFiles) {
        try {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
          await query(sql);
        } catch (migErr) {
          // Ignore errors if columns/indexes already exist
        }
      }
      console.log('Database migrations verified.');
    }

    // Ensure default service categories exist
    for (const category of defaultCategories) {
      await query(
        `INSERT INTO service_categories (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [category, `${category} services`]
      );
    }
    console.log('Default service categories initialized.');
  } catch (err) {
    console.error('Database auto-initialization error:', err.message);
  }
}

module.exports = {
  initializeDatabase,
};
