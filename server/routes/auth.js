const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { authValidators } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authValidators.register, async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    if (role === 'business') {
      await query(
        'INSERT INTO business_profiles (user_id, business_name) VALUES ($1, $2)',
        [user.id, 'Unnamed Business']
      );
    } else if (role === 'artisan') {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const publicId = `VL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        try {
          await query(
            'INSERT INTO artisan_profiles (user_id, full_name, public_id) VALUES ($1, $2, $3)',
            [user.id, 'Unnamed Artisan', publicId]
          );
          break;
        } catch (err) {
          if (err.code !== '23505' || attempt === 2) throw err;
        }
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: { id: user.id, email: user.email, role: user.role }, token },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authValidators.login, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await query(
      'SELECT id, email, role, password_hash FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user.id, email: user.email, role: user.role }, token },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: { user: userResult.rows[0] },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
