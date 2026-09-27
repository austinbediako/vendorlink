const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.post('/:bookingId', authenticateToken, authorizeRole(['business']), async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const { rating, review } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND business_id = $2 AND status = $3',
      [bookingId, req.user.id, 'completed']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for rating',
      });
    }

    const booking = bookingResult.rows[0];

    await query(
      `INSERT INTO ratings (booking_id, business_id, artisan_id, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (booking_id) DO UPDATE SET rating = $4, review = $5`,
      [bookingId, req.user.id, booking.artisan_id, rating, review]
    );

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
