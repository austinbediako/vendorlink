const express = require('express');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const DISPUTE_SELECT = `
  SELECT d.*,
         b.status AS booking_status, b.agreed_price, b.scheduled_date,
         b.public_id AS booking_public_id,
         b.business_id, b.artisan_id,
         bp.business_name, ap.full_name AS artisan_name,
         sr.title AS request_title
  FROM disputes d
  JOIN bookings b ON d.booking_id = b.id
  LEFT JOIN business_profiles bp ON b.business_id = bp.user_id
  LEFT JOIN artisan_profiles ap ON b.artisan_id = ap.user_id
  LEFT JOIN service_requests sr ON b.request_id = sr.id`;

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(`${DISPUTE_SELECT} WHERE d.id = $1`, [parseInt(req.params.id, 10)]);
    const dispute = result.rows[0];

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const isParty = req.user.id === dispute.business_id || req.user.id === dispute.artisan_id;
    if (req.user.role !== 'admin' && !isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this dispute' });
    }

    res.json({ success: true, data: { dispute } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/withdraw', authenticateToken, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM disputes WHERE id = $1', [parseInt(req.params.id, 10)]);
    const dispute = result.rows[0];

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }
    if (dispute.raised_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the person who raised this dispute can withdraw it' });
    }
    if (!['open', 'under_review'].includes(dispute.status)) {
      return res.status(400).json({ success: false, message: `This dispute is already ${dispute.status} and can't be withdrawn.` });
    }

    await query('UPDATE disputes SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2', ['withdrawn', dispute.id]);
    res.json({ success: true, message: 'Dispute withdrawn' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
