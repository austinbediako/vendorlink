const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function isArtisanProfileComplete(profile) {
  return !!(
    profile &&
    profile.full_name &&
    profile.location &&
    profile.phone &&
    profile.categories &&
    profile.categories.length > 0 &&
    profile.has_photo
  );
}

function isValidImage(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return false;
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mimeType === 'image/webp') {
    return buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

router.get('/completeness', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.json({ success: true, data: { isComplete: true } });
    }

    const result = await query(
      `SELECT ap.full_name, ap.location, ap.phone, ap.categories,
              EXISTS (SELECT 1 FROM artisan_photos ph WHERE ph.user_id = u.id) AS has_photo
       FROM users u
       LEFT JOIN artisan_profiles ap ON u.id = ap.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const profile = result.rows[0];
    res.json({ success: true, data: { isComplete: isArtisanProfileComplete(profile) } });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let profileResult;
    if (req.user.role === 'business') {
      profileResult = await query(
        `SELECT u.id, u.email, u.role, u.created_at, bp.*
         FROM users u
         LEFT JOIN business_profiles bp ON u.id = bp.user_id
         WHERE u.id = $1`,
        [req.user.id]
      );
    } else if (req.user.role === 'artisan') {
      profileResult = await query(
        `SELECT u.id, u.email, u.role, u.created_at, ap.*,
                EXISTS (SELECT 1 FROM artisan_photos ph WHERE ph.user_id = u.id) AS has_photo
         FROM users u
         LEFT JOIN artisan_profiles ap ON u.id = ap.user_id
         WHERE u.id = $1`,
        [req.user.id]
      );
    } else {
      profileResult = await query(
        'SELECT id, email, role, created_at FROM users WHERE id = $1',
        [req.user.id]
      );
    }

    res.json({ success: true, data: { profile: profileResult.rows[0] || null } });
  } catch (err) {
    next(err);
  }
});

router.put('/', authenticateToken, async (req, res, next) => {
  try {
    const updates = req.body;

    if (req.user.role === 'business') {
      await query(
        `UPDATE business_profiles
         SET business_name = $1, description = $2, location = $3, latitude = $4, longitude = $5, contact_phone = $6, website = $7, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $8`,
        [
          updates.business_name,
          updates.description,
          updates.location,
          updates.latitude,
          updates.longitude,
          updates.contact_phone,
          updates.website,
          req.user.id,
        ]
      );
    } else if (req.user.role === 'artisan') {
      await query(
        `INSERT INTO artisan_profiles
         (user_id, public_id, full_name, bio, location, latitude, longitude, phone, categories, years_of_experience)
         VALUES ($1, $10, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (user_id)
         DO UPDATE SET
           full_name = EXCLUDED.full_name,
           bio = EXCLUDED.bio,
           location = EXCLUDED.location,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           phone = EXCLUDED.phone,
           categories = EXCLUDED.categories,
           years_of_experience = EXCLUDED.years_of_experience,
           updated_at = CURRENT_TIMESTAMP`,
        [
          req.user.id,
          updates.full_name,
          updates.bio,
          updates.location,
          updates.latitude,
          updates.longitude,
          updates.phone,
          updates.categories,
          updates.years_of_experience,
          `VL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        ]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/photo',
  authenticateToken,
  express.raw({ type: () => true, limit: '1.5mb' }),
  async (req, res, next) => {
    try {
      if (req.user.role !== 'artisan') {
        return res.status(403).json({ success: false, message: 'Only artisans can upload profile photos' });
      }

      const mimeType = req.headers['content-type']?.split(';')[0];
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(mimeType) || !isValidImage(req.body, mimeType)) {
        return res.status(400).json({ success: false, message: 'Photo must be a JPEG, PNG, or WebP image.' });
      }

      if (!process.env.IMGBB_API_KEY) {
        return res.status(503).json({ success: false, message: 'Photo storage is not configured' });
      }

      const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: process.env.IMGBB_API_KEY,
          image: req.body.toString('base64'),
        }),
      });
      const imgbb = await imgbbRes.json().catch(() => null);
      if (!imgbb?.success || !imgbb.data?.url) {
        return res.status(502).json({ success: false, message: 'Photo upload failed. Please try again.' });
      }

      await query(
        `INSERT INTO artisan_photos (user_id, image_url, delete_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET image_url = EXCLUDED.image_url, delete_url = EXCLUDED.delete_url, updated_at = CURRENT_TIMESTAMP`,
        [req.user.id, imgbb.data.display_url || imgbb.data.url, imgbb.data.delete_url || null]
      );

      res.status(201).json({ success: true, message: 'Profile photo saved' });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/photo', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT image_url FROM artisan_photos WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No profile photo' });
    }
    res.redirect(result.rows[0].image_url);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
