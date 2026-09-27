const express = require('express');
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { hasApprovedBooking, stripCoordinates } = require('../utils/privacy');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, location, minRating = 0 } = req.query;

    let sql = `
      SELECT
        u.id,
        ap.full_name,
        ap.bio,
        ap.location,
        ap.phone,
        ap.public_id,
        ap.verification_status,
        ap.years_of_experience,
        ap.categories,
        EXISTS (SELECT 1 FROM artisan_photos ph WHERE ph.user_id = u.id) AS has_photo,
        ROUND(((COALESCE(SUM(r.rating), 0) + 10)::numeric / (COUNT(r.id) + 2)), 1) AS average_rating,
        COUNT(r.id) AS review_count
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      LEFT JOIN bookings b ON b.artisan_id = u.id AND b.status = 'completed'
      LEFT JOIN ratings r ON r.booking_id = b.id
      WHERE u.role = 'artisan' AND u.is_active = TRUE
    `;
    const params = [];

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND ap.location ILIKE $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND $${params.length} = ANY(ap.categories)`;
    }

    sql += `
      GROUP BY u.id, ap.public_id, ap.full_name, ap.bio, ap.location, ap.phone, ap.verification_status, ap.years_of_experience, ap.categories
      HAVING COALESCE(AVG(r.rating), 0) >= $${params.length + 1}
      ORDER BY average_rating DESC, review_count DESC
    `;
    params.push(minRating);

    const result = await query(sql, params);
    const artisans = await Promise.all(result.rows.map(async (artisan) => {
      const names = artisan.categories?.length
        ? await query('SELECT name FROM service_categories WHERE id = ANY($1)', [artisan.categories])
        : { rows: [] };
      return { ...artisan, category_names: names.rows.map((r) => r.name) };
    }));
    res.json({ success: true, data: { artisans } });
  } catch (err) {
    next(err);
  }
});

router.get('/:uid/photo', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ph.image_url
       FROM artisan_photos ph
       JOIN artisan_profiles ap ON ap.user_id = ph.user_id
       WHERE ap.public_id = $1`,
      [req.params.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No profile photo' });
    }
    res.redirect(result.rows[0].image_url);
  } catch (err) {
    next(err);
  }
});

router.get('/:uid', optionalAuth, async (req, res, next) => {
  try {
    const artisanResult = await query(
      `SELECT
        u.id,
        ap.public_id,
        ap.full_name,
        ap.bio,
        ap.location,
        ap.latitude,
        ap.longitude,
        ap.phone,
        ap.categories,
        ap.verification_status,
        ap.years_of_experience,
        EXISTS (SELECT 1 FROM artisan_photos ph WHERE ph.user_id = u.id) AS has_photo,
        ROUND(((COALESCE(SUM(r.rating), 0) + 10)::numeric / (COUNT(r.id) + 2)), 1) AS average_rating,
        COUNT(r.id) AS review_count
       FROM users u
       JOIN artisan_profiles ap ON u.id = ap.user_id
       LEFT JOIN bookings b ON b.artisan_id = u.id AND b.status = 'completed'
       LEFT JOIN ratings r ON r.booking_id = b.id
       WHERE ap.public_id = $1 AND u.role = 'artisan' AND u.is_active = TRUE
       GROUP BY u.id, ap.public_id, ap.full_name, ap.bio, ap.location, ap.latitude, ap.longitude, ap.phone, ap.categories, ap.verification_status, ap.years_of_experience`,
      [req.params.uid]
    );

    if (artisanResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artisan not found' });
    }

    const artisan = artisanResult.rows[0];

    const categoriesResult = artisan.categories?.length
      ? await query('SELECT name FROM service_categories WHERE id = ANY($1)', [artisan.categories])
      : { rows: [] };
    const categoryNames = categoriesResult.rows.map((r) => r.name);

    if (!req.user) {
      const { id, bio, latitude, longitude, phone, categories, ...preview } = artisan;
      return res.json({
        success: true,
        data: {
          artisan: { ...preview, category_names: categoryNames },
          reviews: [],
          canSeeExactLocation: false,
          locked: true,
        },
      });
    }

    let canSeeExact = false;
    if (req.user.role === 'business') {
      canSeeExact = await hasApprovedBooking(req.user.id, artisan.id);
    }

    if (!canSeeExact) {
      delete artisan.latitude;
      delete artisan.longitude;
    }
    delete artisan.categories;
    artisan.category_names = categoryNames;

    const reviewsResult = await query(
      `SELECT r.rating, r.review, r.created_at, bp.business_name
       FROM ratings r
       JOIN bookings b ON r.booking_id = b.id
       JOIN business_profiles bp ON b.business_id = bp.user_id
       WHERE r.artisan_id = $1
       ORDER BY r.created_at DESC`,
      [artisan.id]
    );

    res.json({
      success: true,
      data: { artisan, reviews: reviewsResult.rows, canSeeExactLocation: canSeeExact, locked: false },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
