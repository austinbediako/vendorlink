const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const BOOKING_REF = "(b.public_id = $1 OR b.id::text = $1)";
const generateBookingPublicId = () => `BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'business') {
      result = await query(
        `SELECT b.*, ap.full_name AS artisan_name, ap.location AS artisan_location, sr.title AS request_title
         FROM bookings b
         LEFT JOIN artisan_profiles ap ON b.artisan_id = ap.user_id
         LEFT JOIN service_requests sr ON b.request_id = sr.id
         WHERE b.business_id = $1
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await query(
        `SELECT b.*, bp.business_name, bp.location AS business_location, sr.title AS request_title
         FROM bookings b
         LEFT JOIN business_profiles bp ON b.business_id = bp.user_id
         LEFT JOIN service_requests sr ON b.request_id = sr.id
         WHERE b.artisan_id = $1
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
    }
    res.json({ success: true, data: { bookings: result.rows } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const bookingRef = req.params.id;

    const result = await query(
      `SELECT b.*,
        bp.business_name, bp.location AS business_location,
        bp.latitude AS business_latitude, bp.longitude AS business_longitude,
        ap.full_name AS artisan_name, ap.phone AS artisan_phone,
        ap.latitude AS artisan_latitude, ap.longitude AS artisan_longitude,
        sr.title AS request_title, sr.description AS request_description
       FROM bookings b
       LEFT JOIN business_profiles bp ON b.business_id = bp.user_id
       LEFT JOIN artisan_profiles ap ON b.artisan_id = ap.user_id
       LEFT JOIN service_requests sr ON b.request_id = sr.id
       WHERE ${BOOKING_REF} AND (b.business_id = $2 OR b.artisan_id = $2)`,
      [bookingRef, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = result.rows[0];
    const showExact = ['accepted', 'in_progress', 'completed'].includes(booking.status);

    if (!showExact) {
      delete booking.business_latitude;
      delete booking.business_longitude;
      delete booking.artisan_latitude;
      delete booking.artisan_longitude;
    }

    const historyResult = await query(
      `SELECT * FROM booking_status_history WHERE booking_id = $1 ORDER BY created_at`,
      [booking.id]
    );

    const disputesResult = await query(
      `SELECT id, status, reason, raised_by, resolution_notes, created_at, resolved_at
       FROM disputes WHERE booking_id = $1 ORDER BY created_at DESC`,
      [booking.id]
    );

    res.json({
      success: true,
      data: {
        booking: result.rows[0],
        history: historyResult.rows,
        disputes: disputesResult.rows,
        showExactLocation: showExact,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { request_id, artisan_id, agreed_price, scheduled_date } = req.body;

    let businessId = req.user.id;
    let actualRequestId = request_id || null;

    if (req.user.role === 'business') {
      if (request_id) {
        const requestCheck = await query(
          'SELECT * FROM service_requests WHERE id = $1 AND business_id = $2',
          [request_id, req.user.id]
        );
        if (requestCheck.rows.length === 0) {
          return res.status(403).json({ success: false, message: 'Service request not found' });
        }
      }
    } else {
      return res.status(403).json({ success: false, message: 'Only businesses can create bookings' });
    }

    let booking;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const result = await query(
          `INSERT INTO bookings (public_id, request_id, business_id, artisan_id, status, agreed_price, scheduled_date)
           VALUES ($1, $2, $3, $4, 'requested', $5, $6)
           RETURNING *`,
          [generateBookingPublicId(), actualRequestId, businessId, artisan_id, agreed_price, scheduled_date]
        );
        booking = result.rows[0];
        break;
      } catch (err) {
        if (err.code !== '23505' || attempt === 2) throw err;
      }
    }

    await query(
      'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
      [booking.id, 'requested', 'Booking created', req.user.id]
    );

    if (actualRequestId) {
      await query(
        "UPDATE service_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [actualRequestId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Booking created',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const bookingRef = req.params.id;
    const { status, notes } = req.body;

    const validStatuses = ['requested', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const bookingResult = await query(
      `SELECT * FROM bookings b WHERE ${BOOKING_REF} AND (b.business_id = $2 OR b.artisan_id = $2)`,
      [bookingRef, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `This booking is already ${booking.status} and can no longer be changed.` });
    }

    const artisanTransitions = {
      requested: ['accepted', 'rejected'],
      accepted: ['in_progress'],
      in_progress: ['completed'],
    };

    if (req.user.role === 'artisan') {
      if (!artisanTransitions[booking.status]?.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `A ${booking.status.replace('_', ' ')} booking can't be changed to ${status.replace('_', ' ')}.`,
        });
      }
    } else if (req.user.role === 'business') {
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Not authorized to update to this status' });
      }
      if (booking.status !== 'requested') {
        return res.status(403).json({
          success: false,
          message: 'This booking has been accepted and can only be cancelled through customer service — please raise a dispute.',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update to this status' });
    }

    await query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, booking.id]
    );

    await query(
      'INSERT INTO booking_status_history (booking_id, status, notes, changed_by) VALUES ($1, $2, $3, $4)',
      [booking.id, status, notes || `Status changed to ${status}`, req.user.id]
    );

    res.json({ success: true, message: 'Booking status updated' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/disputes', authenticateToken, async (req, res, next) => {
  try {
    const bookingRef = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }

    const bookingResult = await query(
      `SELECT * FROM bookings b WHERE ${BOOKING_REF} AND (b.business_id = $2 OR b.artisan_id = $2)`,
      [bookingRef, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await query(
      'INSERT INTO disputes (booking_id, raised_by, reason) VALUES ($1, $2, $3)',
      [bookingResult.rows[0].id, req.user.id, reason]
    );

    res.status(201).json({ success: true, message: 'Dispute raised successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
