const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users');
    const artisansCount = await query("SELECT COUNT(*) FROM users WHERE role = 'artisan'");
    const pendingVerifications = await query(
      "SELECT COUNT(*) FROM artisan_profiles WHERE verification_status = 'pending'"
    );
    const openDisputes = await query("SELECT COUNT(*) FROM disputes WHERE status = 'open'");
    const totalBookings = await query('SELECT COUNT(*) FROM bookings');
    const completedBookings = await query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count, 10),
        totalArtisans: parseInt(artisansCount.rows[0].count, 10),
        pendingVerifications: parseInt(pendingVerifications.rows[0].count, 10),
        openDisputes: parseInt(openDisputes.rows[0].count, 10),
        totalBookings: parseInt(totalBookings.rows[0].count, 10),
        completedBookings: parseInt(completedBookings.rows[0].count, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/artisans', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const [result, categoriesResult] = await Promise.all([
      query(
        `SELECT u.id, u.email, u.created_at, u.is_active,
                ap.full_name, ap.location, ap.phone, ap.bio, ap.categories, ap.years_of_experience,
                ap.verification_status, ap.id_document_url, ap.public_id,
                EXISTS (SELECT 1 FROM artisan_photos WHERE user_id = ap.user_id) AS has_photo
         FROM users u
         JOIN artisan_profiles ap ON u.id = ap.user_id
         ORDER BY u.created_at DESC`
      ),
      query('SELECT id, name FROM service_categories'),
    ]);
    const categoryNames = new Map(categoriesResult.rows.map((c) => [c.id, c.name]));
    const artisans = result.rows.map((a) => ({
      ...a,
      category_names: (a.categories || []).map((id) => categoryNames.get(id)).filter(Boolean),
    }));
    res.json({ success: true, data: { artisans } });
  } catch (err) {
    next(err);
  }
});

router.put('/artisans/:id/verify', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const artisanId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    await query(
      `UPDATE artisan_profiles SET verification_status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      [status, artisanId]
    );

    res.json({ success: true, message: `Artisan verification updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

router.get('/disputes', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.*, bp.business_name, ap.full_name AS artisan_name
       FROM disputes d
       LEFT JOIN bookings b ON d.booking_id = b.id
       LEFT JOIN business_profiles bp ON b.business_id = bp.user_id
       LEFT JOIN artisan_profiles ap ON b.artisan_id = ap.user_id
       ORDER BY d.created_at DESC`
    );
    res.json({ success: true, data: { disputes: result.rows } });
  } catch (err) {
    next(err);
  }
});

router.put('/disputes/:id/resolve', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const disputeId = parseInt(req.params.id, 10);
    const { status, resolution_notes } = req.body;

    if (!['resolved', 'dismissed', 'under_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute status' });
    }

    await query(
      `UPDATE disputes SET status = $1, resolution_notes = $2, resolved_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [status, resolution_notes, disputeId]
    );

    res.json({ success: true, message: 'Dispute updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
