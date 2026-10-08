require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('./index');

async function clearData() {
  console.log('Clearing existing data...');
  await query('DELETE FROM notifications');
  await query('DELETE FROM disputes');
  await query('DELETE FROM ratings');
  await query('DELETE FROM booking_status_history');
  await query('DELETE FROM bookings');
  await query('DELETE FROM request_applications');
  await query('DELETE FROM service_requests');
  await query('DELETE FROM artisan_profiles');
  await query('DELETE FROM business_profiles');
  await query('DELETE FROM users');
  console.log('Existing data cleared.');
}

async function seedDatabase() {
  try {
    await clearData();
    console.log('Seeding database...');

    const categories = [
      'Electrical',
      'Plumbing',
      'Carpentry',
      'Welding',
      'Tailoring',
      'Masonry',
      'Painting',
      'General Maintenance',
    ];

    for (const category of categories) {
      await query(
        `INSERT INTO service_categories (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [category, `${category} services`]
      );
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { email: 'admin@vms.com', role: 'admin' },
      { email: 'business.open@vms.com', role: 'business' },
      { email: 'business.direct@vms.com', role: 'business' },
      { email: 'business.completed@vms.com', role: 'business' },
      { email: 'artisan.electrician@vms.com', role: 'artisan' },
      { email: 'artisan.plumber.pending@vms.com', role: 'artisan' },
      { email: 'artisan.carpenter@vms.com', role: 'artisan' },
      { email: 'artisan.welder@vms.com', role: 'artisan' },
      { email: 'artisan.incomplete@vms.com', role: 'artisan' },
    ];

    const insertedUsers = {};
    for (const user of users) {
      const result = await query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [user.email, passwordHash, user.role]
      );
      insertedUsers[user.email] = result.rows[0];
    }

    const catRows = await query('SELECT id, name FROM service_categories');
    const cats = {};
    for (const row of catRows.rows) {
      cats[row.name.toLowerCase()] = row.id;
    }

    // Business profiles
    const businessProfiles = [
      {
        user_id: insertedUsers['business.open@vms.com'].id,
        name: 'Open Request Business',
        description: 'A small retail shop looking for electrical repairs.',
        location: 'Accra Central',
        latitude: 5.6037,
        longitude: -0.1870,
        phone: '0244000001',
      },
      {
        user_id: insertedUsers['business.direct@vms.com'].id,
        name: 'Direct Booking Business',
        description: 'Office needing carpentry work.',
        location: 'East Legon',
        latitude: 5.6389,
        longitude: -0.1564,
        phone: '0244000002',
      },
      {
        user_id: insertedUsers['business.completed@vms.com'].id,
        name: 'Completed Job Business',
        description: 'Factory that needed welding repairs.',
        location: 'Tema',
        latitude: 5.6698,
        longitude: -0.0166,
        phone: '0244000003',
      },
    ];

    for (const bp of businessProfiles) {
      await query(
        `INSERT INTO business_profiles (user_id, business_name, description, location, latitude, longitude, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bp.user_id, bp.name, bp.description, bp.location, bp.latitude, bp.longitude, bp.phone]
      );
    }

    // Artisan profiles
    const artisanProfiles = [
      {
        user_id: insertedUsers['artisan.electrician@vms.com'].id,
        name: 'Kwame Mensah',
        bio: 'Certified electrician with 6 years experience in residential and commercial wiring.',
        location: 'Accra',
        latitude: 5.5500,
        longitude: -0.2000,
        phone: '0244111111',
        categories: [cats.electrical],
        verification_status: 'verified',
        years: 6,
      },
      {
        user_id: insertedUsers['artisan.plumber.pending@vms.com'].id,
        name: 'Kofi Boateng',
        bio: 'Plumber specializing in leak detection and pipe repairs.',
        location: 'Tema',
        latitude: 5.6500,
        longitude: -0.0100,
        phone: '0244222222',
        categories: [cats.plumbing],
        verification_status: 'pending',
        years: 4,
      },
      {
        user_id: insertedUsers['artisan.carpenter@vms.com'].id,
        name: 'Yaw Osei',
        bio: 'Carpenter with expertise in furniture repair and custom woodwork.',
        location: 'East Legon',
        latitude: 5.6300,
        longitude: -0.1600,
        phone: '0244333333',
        categories: [cats.carpentry],
        verification_status: 'verified',
        years: 8,
      },
      {
        user_id: insertedUsers['artisan.welder@vms.com'].id,
        name: 'Ama Serwaa',
        bio: 'Experienced welder for gates, railings, and industrial repairs.',
        location: 'Tema',
        latitude: 5.6700,
        longitude: -0.0200,
        phone: '0244444444',
        categories: [cats.welding],
        verification_status: 'verified',
        years: 5,
      },
    ];

    for (const ap of artisanProfiles) {
      await query(
        `INSERT INTO artisan_profiles (user_id, full_name, bio, location, latitude, longitude, phone, categories, verification_status, years_of_experience)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [ap.user_id, ap.name, ap.bio, ap.location, ap.latitude, ap.longitude, ap.phone, ap.categories, ap.verification_status, ap.years]
      );
    }

    // Service requests
    const requests = [
      {
        business_id: insertedUsers['business.open@vms.com'].id,
        category_id: cats.electrical,
        title: 'Shop electrical fault repair',
        description: 'Power keeps tripping in the back room. Need a certified electrician to inspect and fix.',
        location: 'Accra Central',
        latitude: 5.6037,
        longitude: -0.1870,
        timeframe: '2026-10-20',
        budget: '500',
        status: 'open',
      },
      {
        business_id: insertedUsers['business.direct@vms.com'].id,
        category_id: cats.carpentry,
        title: 'Office door frame repair',
        description: 'Three office door frames need repair after water damage.',
        location: 'East Legon',
        latitude: 5.6389,
        longitude: -0.1564,
        timeframe: '2026-10-18',
        budget: '800',
        status: 'open',
      },
    ];

    const insertedRequests = {};
    for (const req of requests) {
      const result = await query(
        `INSERT INTO service_requests (business_id, category_id, title, description, location, latitude, longitude, preferred_timeframe, budget, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [req.business_id, req.category_id, req.title, req.description, req.location, req.latitude, req.longitude, req.timeframe, req.budget, req.status]
      );
      insertedRequests[req.title] = result.rows[0];
    }

    // Pending application from electrician to open electrical request
    await query(
      `INSERT INTO request_applications (request_id, artisan_id, status, message)
       VALUES ($1, $2, 'pending', $3)`,
      [
        insertedRequests['Shop electrical fault repair'].id,
        insertedUsers['artisan.electrician@vms.com'].id,
        'I have experience with similar faults and can inspect today.',
      ]
    );

    // Approved application: business.completed@vms.com approves artisan.welder for a welding request
    const completedRequest = await query(
      `INSERT INTO service_requests (business_id, category_id, title, description, location, latitude, longitude, preferred_timeframe, budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'closed')
       RETURNING *`,
      [
        insertedUsers['business.completed@vms.com'].id,
        cats.welding,
        'Factory gate welding repair',
        'Main factory gate hinge needs welding reinforcement.',
        'Tema',
        5.6698,
        -0.0166,
        '2026-09-15',
        '1200',
      ]
    );

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO request_applications (request_id, artisan_id, status, message)
         VALUES ($1, $2, 'approved', $3)`,
        [completedRequest.rows[0].id, insertedUsers['artisan.welder@vms.com'].id, 'Available for the job.']
      );

      const bookingResult = await client.query(
        `INSERT INTO bookings (request_id, business_id, artisan_id, status, agreed_price, scheduled_date)
         VALUES ($1, $2, $3, 'completed', '1200', $4)
         RETURNING *`,
        [completedRequest.rows[0].id, insertedUsers['business.completed@vms.com'].id, insertedUsers['artisan.welder@vms.com'].id, '2026-09-15 09:00:00']
      );

      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'accepted', 'Application approved by business', insertedUsers['business.completed@vms.com'].id]
      );
      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'in_progress', 'Work started', insertedUsers['artisan.welder@vms.com'].id]
      );
      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'completed', 'Gate repaired and tested', insertedUsers['artisan.welder@vms.com'].id]
      );

      await client.query(
        `INSERT INTO ratings (booking_id, business_id, artisan_id, rating, review)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          bookingResult.rows[0].id,
          insertedUsers['business.completed@vms.com'].id,
          insertedUsers['artisan.welder@vms.com'].id,
          5,
          'Excellent work. Gate is stronger than before.',
        ]
      );
    });

    // Direct booking from business.direct to artisan.carpenter, status accepted
    await withTransaction(async (client) => {
      const bookingResult = await client.query(
        `INSERT INTO bookings (request_id, business_id, artisan_id, status, agreed_price, scheduled_date)
         VALUES ($1, $2, $3, 'accepted', '800', $4)
         RETURNING *`,
        [
          insertedRequests['Office door frame repair'].id,
          insertedUsers['business.direct@vms.com'].id,
          insertedUsers['artisan.carpenter@vms.com'].id,
          '2026-10-18 10:00:00',
        ]
      );

      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'requested', 'Direct booking created by business', insertedUsers['business.direct@vms.com'].id]
      );
      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'accepted', 'Booking accepted by artisan', insertedUsers['artisan.carpenter@vms.com'].id]
      );
    });

    // Dispute on the direct booking
    const directBooking = await query(
      'SELECT id FROM bookings WHERE business_id = $1 AND artisan_id = $2 LIMIT 1',
      [insertedUsers['business.direct@vms.com'].id, insertedUsers['artisan.carpenter@vms.com'].id]
    );

    await query(
      `INSERT INTO disputes (booking_id, raised_by, reason, status)
       VALUES ($1, $2, $3, 'open')`,
      [
        directBooking.rows[0].id,
        insertedUsers['business.direct@vms.com'].id,
        'Artisan has not confirmed the exact arrival time for the job.',
      ]
    );

    console.log('Database seeding complete.');
    console.log('Seeded users:');
    for (const [email, user] of Object.entries(insertedUsers)) {
      console.log(`  ${email} (${user.role})`);
    }
    return { success: true, seededUsers: insertedUsers };
  } catch (err) {
    console.error('Database seeding failed:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
