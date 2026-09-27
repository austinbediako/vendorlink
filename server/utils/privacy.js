const { query } = require('../db');

async function hasApprovedBooking(userId1, userId2) {
  const result = await query(
    `SELECT id FROM bookings
     WHERE ((business_id = $1 AND artisan_id = $2) OR (business_id = $2 AND artisan_id = $1))
     AND status IN ('accepted', 'in_progress', 'completed')
     LIMIT 1`,
    [userId1, userId2]
  );
  return result.rows.length > 0;
}

async function hasApprovedApplicationForRequest(artisanId, requestId) {
  const result = await query(
    `SELECT id FROM request_applications
     WHERE artisan_id = $1 AND request_id = $2 AND status = 'approved'
     LIMIT 1`,
    [artisanId, requestId]
  );
  return result.rows.length > 0;
}

function stripCoordinates(rows) {
  return rows.map((row) => {
    const { latitude, longitude, ...rest } = row;
    return rest;
  });
}

module.exports = { hasApprovedBooking, hasApprovedApplicationForRequest, stripCoordinates };
