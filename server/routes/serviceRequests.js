const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { hasApprovedBooking, hasApprovedApplicationForRequest, stripCoordinates } = require('../utils/privacy');
const { withTransaction } = require('../db');

const router = express.Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'business') {
      result = await query(
        `SELECT sr.*, sc.name AS category_name
         FROM service_requests sr
         LEFT JOIN service_categories sc ON sr.category_id = sc.id
         WHERE sr.business_id = $1
         ORDER BY sr.created_at DESC`,
        [req.user.id]
      );
    } else {
      const artisan = await query(
        'SELECT categories FROM artisan_profiles WHERE user_id = $1',
        [req.user.id]
      );

      if (artisan.rows.length === 0 || !artisan.rows[0].categories || artisan.rows[0].categories.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Please complete your profile and select service categories first.',
        });
      }

      result = await query(
        `SELECT sr.id, sr.business_id, sr.category_id, sr.title, sr.description, sr.location,
                sr.preferred_timeframe, sr.budget, sr.status, sr.created_at, sr.updated_at,
                sc.name AS category_name, bp.business_name,
                EXISTS (
                  SELECT 1 FROM request_applications ra
                  WHERE ra.request_id = sr.id AND ra.artisan_id = $2
                ) AS has_applied
         FROM service_requests sr
         LEFT JOIN service_categories sc ON sr.category_id = sc.id
         LEFT JOIN business_profiles bp ON sr.business_id = bp.user_id
         WHERE sr.status = 'open' AND sr.category_id = ANY($1)
         ORDER BY sr.created_at DESC`,
        [artisan.rows[0].categories, req.user.id]
      );

      result.rows = stripCoordinates(result.rows);
    }
    res.json({ success: true, data: { requests: result.rows } });
  } catch (err) {
    next(err);
  }
});

router.get('/my-applications', authenticateToken, authorizeRole(['artisan']), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ra.id, ra.status, ra.message, ra.created_at AS applied_at,
              sr.id AS request_id, sr.title, sr.status AS request_status,
              sr.preferred_timeframe, sr.budget, sr.location,
              sc.name AS category_name, bp.business_name,
              b.id AS booking_id
       FROM request_applications ra
       JOIN service_requests sr ON ra.request_id = sr.id
       LEFT JOIN service_categories sc ON sr.category_id = sc.id
       LEFT JOIN business_profiles bp ON sr.business_id = bp.user_id
       LEFT JOIN bookings b ON b.request_id = sr.id AND b.artisan_id = $1
       WHERE ra.artisan_id = $1
       ORDER BY ra.created_at DESC`,
      [req.user.id]
    );
    const applications = result.rows.map((row) => ({
      ...row,
      location: row.status === 'approved' ? row.location : row.location?.split(',')[0]?.trim() || null,
    }));
    res.json({ success: true, data: { applications } });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM service_categories ORDER BY name');
    res.json({ success: true, data: { categories: result.rows } });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, authorizeRole(['business']), async (req, res, next) => {
  try {
    const { category_id, title, description, location, latitude, longitude, preferred_timeframe, budget } = req.body;

    const result = await query(
      `INSERT INTO service_requests (business_id, category_id, title, description, location, latitude, longitude, preferred_timeframe, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, category_id, title, description, location, latitude, longitude, preferred_timeframe, budget]
    );

    res.status(201).json({
      success: true,
      message: 'Service request created',
      data: { request: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const result = await query(
      `SELECT sr.*, sc.name AS category_name, bp.business_name, bp.user_id AS business_user_id
       FROM service_requests sr
       LEFT JOIN service_categories sc ON sr.category_id = sc.id
       LEFT JOIN business_profiles bp ON sr.business_id = bp.user_id
       WHERE sr.id = $1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const request = result.rows[0];

    const canSeeExact =
      req.user.role === 'business' && request.business_id === req.user.id
      || (req.user.role === 'artisan' && await hasApprovedApplicationForRequest(req.user.id, requestId))
      || (req.user.role === 'artisan' && await hasApprovedBooking(req.user.id, request.business_id));

    if (!canSeeExact) {
      const { latitude, longitude, ...masked } = request;
      masked.location = masked.location?.split(',')[0]?.trim() || null;
      res.json({ success: true, data: { request: masked, canSeeExactLocation: false } });
    } else {
      res.json({ success: true, data: { request, canSeeExactLocation: true } });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, authorizeRole(['business']), async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const existing = await query(
      'SELECT * FROM service_requests WHERE id = $1 AND business_id = $2',
      [requestId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    await query(
      'UPDATE service_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, requestId]
    );

    res.json({ success: true, message: 'Service request updated' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/apply', authenticateToken, authorizeRole(['artisan']), async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { message } = req.body;

    const artisan = await query(
      'SELECT categories FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (artisan.rows.length === 0 || !artisan.rows[0].categories || artisan.rows[0].categories.length === 0) {
      return res.status(403).json({ success: false, message: 'Please complete your profile first.' });
    }

    const request = await query(
      'SELECT * FROM service_requests WHERE id = $1 AND status = \'open\'',
      [requestId]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found or no longer open.' });
    }

    if (!artisan.rows[0].categories.includes(request.rows[0].category_id)) {
      return res.status(403).json({ success: false, message: 'This request is outside your service categories.' });
    }

    const existing = await query(
      'SELECT id, status FROM request_applications WHERE request_id = $1 AND artisan_id = $2',
      [requestId, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: existing.rows[0].status === 'rejected'
          ? 'Your application to this request was not accepted.'
          : 'You have already applied to this request.',
      });
    }

    await query(
      'INSERT INTO request_applications (request_id, artisan_id, message) VALUES ($1, $2, $3)',
      [requestId, req.user.id, message || null]
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/applications', authenticateToken, authorizeRole(['business']), async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);

    const request = await query(
      'SELECT * FROM service_requests WHERE id = $1 AND business_id = $2',
      [requestId, req.user.id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const result = await query(
      `SELECT ra.id, ra.status, ra.message, ra.created_at, u.id AS artisan_id, ap.public_id AS artisan_public_id,
              ap.full_name, ap.bio,
              ap.location AS artisan_location, ap.years_of_experience,
              ROUND(((COALESCE(SUM(r.rating), 0) + 10)::numeric / (COUNT(r.id) + 2)), 1) AS average_rating,
              COUNT(r.id) AS review_count
       FROM request_applications ra
       JOIN users u ON ra.artisan_id = u.id
       JOIN artisan_profiles ap ON u.id = ap.user_id
       LEFT JOIN bookings b ON b.artisan_id = u.id AND b.status = 'completed'
       LEFT JOIN ratings r ON r.booking_id = b.id
       WHERE ra.request_id = $1
       GROUP BY ra.id, u.id, ap.public_id, ap.full_name, ap.bio, ap.location, ap.years_of_experience
       ORDER BY ra.created_at DESC`,
      [requestId]
    );

    res.json({ success: true, data: { applications: result.rows } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/applications/:applicationId/approve', authenticateToken, authorizeRole(['business']), async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const applicationId = parseInt(req.params.applicationId, 10);

    const request = await query(
      'SELECT * FROM service_requests WHERE id = $1 AND business_id = $2',
      [requestId, req.user.id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const application = await query(
      'SELECT * FROM request_applications WHERE id = $1 AND request_id = $2 AND status = \'pending\'',
      [applicationId, requestId]
    );

    if (application.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or already processed' });
    }

    const artisanId = application.rows[0].artisan_id;

    const booking = await withTransaction(async (client) => {
      await client.query(
        "UPDATE request_applications SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [applicationId]
      );

      await client.query(
        "UPDATE request_applications SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE request_id = $1 AND id != $2 AND status = 'pending'",
        [requestId, applicationId]
      );

      await client.query(
        "UPDATE service_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [requestId]
      );

      const bookingResult = await client.query(
        `INSERT INTO bookings (public_id, request_id, business_id, artisan_id, status)
         VALUES ($1, $2, $3, $4, 'accepted')
         RETURNING *`,
        [`BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, requestId, req.user.id, artisanId]
      );

      await client.query(
        'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
        [bookingResult.rows[0].id, 'accepted', 'Application approved by business', req.user.id]
      );

      return bookingResult.rows[0];
    });

    res.json({ success: true, message: 'Application approved and booking created', data: { booking } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
